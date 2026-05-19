# MERN Note Making App

A simple note-taking project built with MongoDB Atlas, Express, React, and Node.js.

## Features

- Create notes
- Edit notes
- Delete notes
- MongoDB Atlas connection via environment variable

## Setup

1. Open the folder in VS Code.
2. Create a MongoDB Atlas cluster and get the connection string.
3. Add a `.env` file inside `backend/` with:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your_jwt_secret_here
```

4. Run the installer and start the app:

```bash
npm install
npm run install-all
npm run dev
```

5. Open the React app at `http://localhost:5173`.

## Backend API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`
