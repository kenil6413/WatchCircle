# WatchCircle

WatchCircle is a social watchlist app for tracking what to watch and sharing recommendations with different friend groups. The stack is Node.js + Express with ES Modules, MongoDB using the native driver, and a React frontend built with hooks and `fetch`.

## Authors

- Kenil Patel
- Sukanya Sudhir Shete

## Class Link

- Add the official class page URL here before submission.

## Project Objective

Build a client-side rendered web application that helps users:

- manage a personal watchlist across movies, shows, and anime
- create social groups for different circles
- share group-specific recommendations with notes and ratings
- browse updates without losing recommendations inside chats

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

1. Recommended: use MongoDB Atlas from the start so deployment later is just environment-variable setup.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set `MONGO_URI` in `backend/.env`.
4. Set `SESSION_SECRET` in `backend/.env`.
5. Set `OMDB_API_KEY` in `backend/.env` if you want title search and IMDb autofill.
6. Optional: set `MONGO_DB_NAME` only if the database name is not already included in the URI.
7. Run `npm install` from the repository root.
8. Initialize MongoDB with `npm --workspace backend run setup-db`.
9. Start the app with `npm run dev`.

## Authentication

- Authentication uses Passport Local with `express-session`.
- The backend keeps the login session in the `connect.sid` cookie.
- Protected routes read the logged-in user from the session instead of trusting `userId` fields from the frontend.
- Signup logs the user in immediately after account creation.

## Recommended Database Path

- Use MongoDB Atlas for production and deployment readiness.
- Keep all database configuration in environment variables only.
- The backend accepts a local URI like `mongodb://127.0.0.1:27017/watchcircle`.
- The backend also accepts an Atlas URI like `mongodb+srv://.../watchcircle?...`.
- If the URI already contains the database name, `MONGO_DB_NAME` can stay empty.
- The backend creates the `groups` and `watchlist` collections on setup and adds the first indexes automatically.

## MongoDB Setup

- The backend now uses a single database module in `backend/src/db.js`.
- On setup, it creates the `groups` and `watchlist` collections if they do not already exist.
- It also creates indexes for the fields we will query first: `groupName`, `createdAt`, `title`, `category`, `platform`, `status`, and `updatedAt`.
- The backend will not start unless MongoDB is configured and reachable.
- Atlas and local MongoDB use the same backend code path.

## Screenshot

Add the final application screenshot here before submission.

## Notes

- The frontend uses `fetch`, not Axios.
- The backend uses the native MongoDB driver, not Mongoose.
- No CORS package is used; local development relies on the Vite proxy.

## License

MIT
