# MediaFile - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [cPanel Deployment](#cpanel-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** v18+ installed
- **MongoDB** v6+ (local or cloud like MongoDB Atlas)
- **npm** v9+
- **cPanel** hosting with Node.js app support

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-username/MediaFile.git
cd MediaFile
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your settings (MongoDB URI, JWT secret, etc.)
```

### 4. Start development servers

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

### 5. Default Admin Account

On first startup, a default admin account is created:
- **Email:** admin@mediafile.com
- **Password:** Admin@12345

> ⚠️ Change these credentials immediately after first login.

---

## cPanel Deployment

### Step 1: Build the Frontend

```bash
cd client
npm run build
```

This creates a `dist/` folder with the production build.

### Step 2: Prepare Files for Upload

Upload the following to your cPanel hosting:
```
server/
├── src/
├── package.json
├── .env           (configured for production)
client/
├── dist/          (production build only)
```

### Step 3: Set Up Node.js App in cPanel

1. Log in to your **cPanel** dashboard
2. Navigate to **Software** → **Setup Node.js App**
3. Click **Create Application**
4. Configure the app:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `server` (your server directory)
   - **Application URL:** your domain or subdomain
   - **Application startup file:** `src/index.js`
5. Click **Create**

### Step 4: Install Dependencies in cPanel

1. In the Node.js app settings, click **Run NPM Install**
2. Or use the cPanel Terminal:
   ```bash
   cd ~/server
   npm install --production
   ```

### Step 5: Configure Environment Variables

In cPanel Terminal or through File Manager, edit the `server/.env` file:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mediafile
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10737418240
CLIENT_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
```

### Step 6: Set Up MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your server's IP address
5. Get the connection string and update `MONGO_URI` in `.env`

**Option B: Local MongoDB on VPS**
```bash
# Install MongoDB
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 7: Configure the Upload Directory

```bash
cd ~/server
mkdir -p uploads
chmod 755 uploads
```

### Step 8: Start/Restart the Application

In cPanel → Setup Node.js App → Click **Restart** on your application.

### Step 9: Set Up SSL (HTTPS)

1. In cPanel → **Security** → **SSL/TLS**
2. Install a Let's Encrypt certificate or upload your own
3. Enable **Force HTTPS** redirect

---

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/mediafile` |
| `JWT_SECRET` | Secret key for JWT tokens | **Must be changed!** |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `UPLOAD_DIR` | Directory for file uploads | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10737418240` (10 GB) |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | Default admin email | `admin@mediafile.com` |
| `ADMIN_PASSWORD` | Default admin password | **Must be changed!** |

---

## Database Setup

### MongoDB Collections

The application automatically creates these collections:
- **users** - User accounts and profiles
- **files** - File metadata and storage info
- **folders** - Folder hierarchy

### Indexes

The following indexes are created automatically:
- `files.originalName` - Text index for search
- `files.user + files.folder` - Compound index for file listing
- `files.shareLink` - Index for shared file lookups
- `folders.user + folders.parent` - Compound index for folder navigation

---

## Troubleshooting

### Application won't start
- Check Node.js version: `node --version` (must be 18+)
- Verify MongoDB connection string in `.env`
- Check logs: `cat ~/.npm/_logs/*.log`

### File uploads failing
- Check upload directory permissions: `ls -la uploads/`
- Verify `MAX_FILE_SIZE` in `.env`
- Check available disk space: `df -h`

### CORS errors
- Ensure `CLIENT_URL` in `.env` matches your frontend URL
- Include the protocol: `https://yourdomain.com`

### Database connection issues
- Verify MongoDB is running: `mongosh`
- Check IP whitelist in MongoDB Atlas
- Ensure connection string format is correct

### Large file upload timeouts
- Increase cPanel/server timeout settings
- Files over 5 MB automatically use chunked upload
- Check server memory: `free -m`
