const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');

// Use in-memory database or test database
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediafile_test');
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123',
  };

  let token;

  beforeAll(async () => {
    // Clean up test user if exists
    await User.deleteOne({ email: testUser.email });
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
      token = res.body.token;
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should reject weak password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'weak@test.com', password: '123' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject non-existent email', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password' })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });
});

describe('Health Check', () => {
  it('should return ok status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
  });
});
