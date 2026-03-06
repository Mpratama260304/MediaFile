const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../src/index');
const User = require('../src/models/User');
const File = require('../src/models/File');
const Folder = require('../src/models/Folder');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediafile_test');
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('File API', () => {
  let token;
  let userId;
  let folderId;
  let fileId;
  const testEmail = `filetest${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'File Test User',
        email: testEmail,
        password: 'TestPass123',
      });
    token = res.body.token;
    userId = res.body.user._id;
  });

  afterAll(async () => {
    // Clean up
    await File.deleteMany({ user: userId });
    await Folder.deleteMany({ user: userId });
    await User.deleteOne({ email: testEmail });

    // Clean up uploaded test files
    const userDir = path.join(process.env.UPLOAD_DIR || './uploads', userId);
    if (fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true, force: true });
    }
  });

  describe('Folders', () => {
    it('should create a folder', async () => {
      const res = await request(app)
        .post('/api/folders')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Folder' })
        .expect(201);

      expect(res.body.folder.name).toBe('Test Folder');
      folderId = res.body.folder._id;
    });

    it('should list folders', async () => {
      const res = await request(app)
        .get('/api/folders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.folders.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject duplicate folder name in same parent', async () => {
      await request(app)
        .post('/api/folders')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Folder' })
        .expect(400);
    });

    it('should rename a folder', async () => {
      const res = await request(app)
        .patch(`/api/folders/${folderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Renamed Folder' })
        .expect(200);

      expect(res.body.folder.name).toBe('Renamed Folder');
    });
  });

  describe('File Upload', () => {
    it('should upload a file', async () => {
      // Create a test file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Hello, this is a test file for upload.');

      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', testFilePath)
        .expect(201);

      expect(res.body.file).toHaveProperty('originalName', 'test-file.txt');
      expect(res.body.file).toHaveProperty('shareLink');
      fileId = res.body.file._id;

      // Clean up test file
      fs.unlinkSync(testFilePath);
    });

    it('should list user files', async () => {
      const res = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.files.length).toBeGreaterThanOrEqual(1);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should get a single file', async () => {
      const res = await request(app)
        .get(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.file._id).toBe(fileId);
    });

    it('should toggle file sharing', async () => {
      const res = await request(app)
        .patch(`/api/files/${fileId}/share`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.file.isPublic).toBe(true);
    });

    it('should move file to folder', async () => {
      const res = await request(app)
        .patch(`/api/files/${fileId}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({ folderId })
        .expect(200);

      expect(res.body.file.folder).toBe(folderId);
    });

    it('should download a file', async () => {
      await request(app)
        .get(`/api/files/${fileId}/download`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('File Deletion', () => {
    it('should delete a file', async () => {
      await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 for deleted file', async () => {
      await request(app)
        .get(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Folder Deletion', () => {
    it('should delete a folder', async () => {
      await request(app)
        .delete(`/api/folders/${folderId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
