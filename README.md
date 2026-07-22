# safety999

Safety999 is a public safety reporting application with an Express backend and a vanilla JavaScript frontend.

## Setup

- Backend: `cd backend && npm install && npm start`
- Frontend: open `frontend/pages/index.html` in a browser or host it with a local server.

## Backend config

- `backend/.env` should contain:
  - `PORT=5001`
  - `MONGODB_URI=mongodb://localhost:27017/public-safety`
  - `ADMIN_EMAIL=admin@admin.com`
  - `ADMIN_PASSWORD=admin123`
  - `JWT_SECRET=your_jwt_secret_key_here`
