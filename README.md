# WatchCircle

WatchCircle is a social watchlist app for tracking what to watch and sharing recommendations with different friend groups. The stack is Node.js + Express with ES Modules, MongoDB using the native driver, and a React frontend built with hooks and `fetch`.

## Authors

- Kenil Jitendrakumar Patel
- Sukanya Sudhir Shete

## Class

- Course: CS5610 Web Development
- Class Link: https://johnguerra.co/classes/webDevelopment_online_spring_2026/
- Assignment: Project 3 - Full stack application with Node + Express + Mongo + React (hooks)

## Quick Links

- Live Hosted Website (Demo) - https://watchcircle.onrender.com/
- Design Document - https://drive.google.com/file/d/1BC6Qryak-WyGMpp0_gVBvKiwsk94-qGG/view?usp=sharing
- Video Explanation on YouTube - https://www.youtube.com/watch?v=qEF9-_xR8Dg
- How to use the application (Instructions) - https://drive.google.com/file/d/1OZGBf_XhjFS4FD5gfKVYOzN83N8vLhz_/view?usp=drive_link
- Presentation - https://docs.google.com/presentation/d/1k9unoVO2NlIMM2E2nWpopD_O5GlKHUXTrtKYBVdeOJU/edit?usp=sharing
- Usability Report - https://drive.google.com/file/d/1cs1iYYr9rtBxb7-d3PA6gO-XgoVj7NwG/view?usp=drive_link

## Project Objective

Build a client-side rendered web application that helps users:

- manage a personal watchlist across movies, shows, and anime
- create social groups for different circles
- share group-specific recommendations with notes and ratings
- browse updates without losing recommendations inside chats

## Test Credentials

The database is pre-seeded with demo records so the app can be tested immediately.

Seeded Data (Ready to Test) available on this profile -
email: admin@watchcircle.dev , password: 123456

## Tech Stack

- Backend: Node.js, Express, MongoDB native driver
- Frontend: React, Hooks, Vite, PropTypes
- Authentication: Passport Local + `express-session`
- Tooling: ESLint, Prettier

## Repository Structure

- `backend/`: Express server, Mongo connection, API routes
- `frontend/`: React application and component-scoped CSS

### Backend Structure

- `backend/src/server.js`: starts the Express app
- `backend/src/app.js`: global middleware, Passport session setup, route mounting
- `backend/src/db.js`: Mongo connection, collection access, setup helpers
- `backend/src/passport.js`: Passport Local strategy and session serialization
- `backend/src/routes/`: auth, groups, media, watchlist, and health routes
- `backend/src/utils/`: small helpers for auth hashing and group sanitizing

### Frontend Structure

- `frontend/src/App.jsx`: top-level state, modal flow, data loading, navigation
- `frontend/src/api/watchcircleApi.js`: all `fetch` calls in one file
- `frontend/src/components/NavBar/`: top navigation and profile controls
- `frontend/src/components/GroupSidebar/`: group list, join form, create-group entry point
- `frontend/src/components/GroupDetailPanel/`: selected group view and recommendation cards
- `frontend/src/components/WatchlistPage/`: watchlist dashboard, filters, cards, stats
- `frontend/src/components/*Modal/`: create/edit/detail forms and spotlight dialogs
- `frontend/src/components/MediaSearchField/`: shared OMDb title search block used by both add flows

## Instructions to Build

### Pre-requisite

- Node.js 18+
- npm 9+
- MongoDB Atlas or local MongoDB instance

Recommended: use MongoDB Atlas from the start so deployment later is just environment-variable setup.

```
git clone <this-repo-url>

npm install
```

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGO_URI` in `backend/.env`.
3. Set `SESSION_SECRET` in `backend/.env`.
4. Set `OMDB_API_KEY` in `backend/.env` if you want title search and IMDb autofill.
5. Optional: set `MONGO_DB_NAME` only if the database name is not already included in the URI.
6. Run `npm install` from the repository root.
7. Initialize MongoDB with `npm --workspace backend run setup-db`.
8. Start the app with `npm run dev`.

### Linting and Formatting

```
npm run lint
npm run format
```

### Authentication

- Authentication uses Passport Local with `express-session`.
- The backend keeps the login session in the `connect.sid` cookie.
- Protected routes read the logged-in user from the session instead of trusting `userId` fields from the frontend.
- Signup logs the user in immediately after account creation.

### MongoDB Setup

- The backend now uses a single database module in `backend/src/db.js`.
- On setup, it creates the `groups` and `watchlist` collections if they do not already exist.
- It also creates indexes for the fields we will query first: `groupName`, `createdAt`, `title`, `category`, `platform`, `status`, and `updatedAt`.
- The backend will not start unless MongoDB is configured and reachable.
- Atlas and local MongoDB use the same backend code path.

### Recommended Database Path

- Use MongoDB Atlas for production and deployment readiness.
- Keep all database configuration in environment variables only.
- The backend accepts a local URI like mongodb://127.0.0.1:27017/watchcircle.
- The backend also accepts an Atlas URI like mongodb+srv://.../watchcircle?....
- If the URI already contains the database name, MONGO_DB_NAME can stay empty.
- The backend creates the groups and watchlist collections on setup and adds the first indexes automatically.

## Screenshot

### Login Page

<img width="1115" height="585" alt="image" src="https://github.com/user-attachments/assets/3384ada5-6ab4-48a2-a167-32b6ee076d02" />

### Watchlist Page

<img width="1121" height="649" alt="image" src="https://github.com/user-attachments/assets/6060d6e4-7eb7-44ee-a10a-f0d32a1b3c5b" />

### Groups Page

<img width="1120" height="560" alt="image" src="https://github.com/user-attachments/assets/d98c249e-8ced-46cd-a18b-1f7abeace51a" />

### Group Settings Dialog

<img width="1112" height="643" alt="image" src="https://github.com/user-attachments/assets/71e11d48-c688-4e9f-9173-745a75a47039" />

### Create Group Dialog

<img width="1106" height="618" alt="image" src="https://github.com/user-attachments/assets/ee495cb9-b060-41a1-88c7-76e2951b493c" />

### Add recommendation Dialog

<img width="1108" height="620" alt="image" src="https://github.com/user-attachments/assets/b2b85e97-819e-46dc-a521-7b1004d0cb27" />

## License

MIT License
