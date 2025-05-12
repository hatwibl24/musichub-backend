# MusicHub Backend

A robust backend server for the MusicHub music streaming platform built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- File upload with Cloudinary integration
- CRUD operations for songs, albums, and playlists
- User profile management
- Following system
- Feed functionality

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Cloudinary for file storage
- JWT for authentication
- CORS enabled

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Start the server:
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- POST `/api/users/follow/:id` - Follow user
- POST `/api/users/unfollow/:id` - Unfollow user

### Songs
- POST `/api/songs` - Upload new song
- GET `/api/songs` - Get all songs
- GET `/api/songs/:id` - Get specific song
- DELETE `/api/songs/:id` - Delete song

### Playlists
- POST `/api/playlists` - Create new playlist
- GET `/api/playlists` - Get user playlists
- PUT `/api/playlists/:id` - Update playlist
- DELETE `/api/playlists/:id` - Delete playlist
- POST `/api/playlists/:id/songs` - Add song to playlist
- DELETE `/api/playlists/:id/songs/:songId` - Remove song from playlist

## Deployment

This backend is configured for deployment on Render.com. Make sure to:

1. Set up all environment variables in Render dashboard
2. Use the following build command: `npm install`
3. Use the following start command: `npm start`
4. Set the Node.js version to 18.x or higher 