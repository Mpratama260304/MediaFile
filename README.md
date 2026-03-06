# MediaFile - File Storage & Sharing Application

A modern, full-stack file storage and sharing web application built with **Node.js**, **Express**, **React**, and **MongoDB**. Upload files up to 10 GB, organize them in folders, and share with anyone via links.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)

## Features

### User Features
- **File Upload** — Drag-and-drop or click to upload, supporting files up to 10 GB
- **Chunked Upload** — Large files are automatically split into chunks for reliable uploads
- **Progress Bar** — Real-time upload progress tracking
- **Folder Organization** — Create folders and subfolders to organize files
- **File Search** — Full-text search across all uploaded files
- **File Sharing** — Generate public share links for any file
- **File Management** — View, download, move, and delete files
- **User Profile** — Manage profile and change password
- **Storage Tracking** — Track storage usage with visual progress bar

### Admin Features
- **Dashboard** — System overview with stats (total users, files, storage, downloads)
- **User Management** — View, activate/deactivate, and delete users
- **File Management** — View and delete any user's files
- **File Type Distribution** — Breakdown of files by category

### Security
- **JWT Authentication** — Secure token-based auth with proper session management
- **Password Hashing** — bcrypt with 12 salt rounds
- **Rate Limiting** — Anti-brute-force on login (10 attempts/15 min) and general API limiting
- **Input Validation** — Server-side validation with express-validator
- **File Type Filtering** — Only allowed MIME types can be uploaded
- **Helmet** — Security headers enabled
- **CORS** — Configured for production domains

### Supported File Types
| Category | Formats |
|----------|---------|
| Images | JPG, PNG, GIF, WebP, SVG, BMP, TIFF |
| Videos | MP4, WebM, MOV, AVI, MKV, MPEG |
| Audio | MP3, WAV, OGG, FLAC, AAC |
| Documents | PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, CSV |
| Archives | ZIP, RAR, 7Z, GZ, TAR |
| Other | JSON, XML |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Upload | Multer (disk storage + chunked uploads) |
| Testing | Jest, Supertest, Cypress |

## Project Structure

```
MediaFile/
├── server/                    # Backend API
│   ├── src/
│   │   ├── index.js           # Express server entry point
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── fileTypes.js   # Allowed MIME types
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── fileController.js
│   │   │   ├── folderController.js
│   │   │   ├── userController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT auth & admin guard
│   │   │   ├── upload.js      # Multer configuration
│   │   │   └── rateLimiter.js # Rate limiting
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── File.js
│   │   │   └── Folder.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── files.js
│   │       ├── folders.js
│   │       ├── users.js
│   │       └── admin.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── files.test.js
│   └── uploads/               # File storage directory
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/axios.js       # Axios instance with interceptors
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── FileCard.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FolderCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Pagination.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Upload.jsx
│   │       ├── FolderView.jsx
│   │       ├── Profile.jsx
│   │       ├── Settings.jsx
│   │       ├── SharedFile.jsx
│   │       └── admin/
│   │           ├── AdminDashboard.jsx
│   │           ├── ManageUsers.jsx
│   │           └── ManageFiles.jsx
│   └── cypress/
│       └── e2e/app.cy.js
│
├── DEPLOYMENT.md              # cPanel deployment guide
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start Development

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

### Default Admin Account
- **Email:** admin@mediafile.com
- **Password:** Admin@12345

> Change these credentials immediately after first login.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file |
| POST | `/api/files/upload/chunk` | Upload file chunk |
| GET | `/api/files` | List user files |
| GET | `/api/files/:id` | Get file details |
| GET | `/api/files/:id/download` | Download file |
| PATCH | `/api/files/:id/share` | Toggle file sharing |
| PATCH | `/api/files/:id/move` | Move file to folder |
| DELETE | `/api/files/:id` | Delete file |
| GET | `/api/files/shared/:link` | Get shared file info |
| GET | `/api/files/shared/:link/download` | Download shared file |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/folders` | Create folder |
| GET | `/api/folders` | List folders |
| PATCH | `/api/folders/:id` | Rename folder |
| DELETE | `/api/folders/:id` | Delete folder |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/users/profile` | Update profile |
| PATCH | `/api/users/password` | Change password |
| GET | `/api/users/storage` | Get storage info |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/:id/toggle` | Toggle user status |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/files` | List all files |
| DELETE | `/api/admin/files/:id` | Delete any file |

## Testing

```bash
# Backend unit tests
cd server && npm test

# Frontend E2E tests
cd client && npx cypress open
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full cPanel deployment instructions.

## License

MIT