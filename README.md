
# EventHandelling — Backend

This repository is the backend for the EventHandelling full-stack app. It provides authentication, event creation/management, image upload (Cloudinary), and RSVP (join/leave) functionality.

**Prerequisites**
- Node.js (v16+ recommended)
- npm
- MongoDB (Atlas or local)

**Environment**
Create a `.env` file in `backend/` with the following variables:

- `MONGO_URL` — MongoDB connection string
- `JWT_SECRET` — secret used to sign authentication tokens
- `CLOUDINARY_URL` — Cloudinary URL for image uploads

Example `.env` (do NOT commit):

MONGO_URL=your_mongo_connection_string
JWT_SECRET=some_long_random_secret
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name>

**Run locally**
1. Backend

```bash
cd backend
npm install
# create .env as above
npm start
```

The backend listens on port `3000` and mounts the API at `/event/api/v1`.

2. Frontend (development)

```bash
cd frontend
npm install
npm run dev
```

The frontend uses Vite and runs by default on `http://localhost:5173`.

**API base URL**
- `http://localhost:3000/event/api/v1`

**Technical Explanation — RSVP capacity & concurrency handling**

Problem: multiple users may try to RSVP (join) the same event at the same time. Without careful handling, the event could exceed its `capacity` due to race conditions.

Solution implemented: atomic conditional update using MongoDB `findOneAndUpdate`.

How it works (code-level summary):
- The `joinEvent` controller uses a single atomic update that includes the conditions and the update payload.
- Query conditions include both `_id: id` and `currentCount: { $lt: getEvent.capacity }` and `attendees: { $ne: req.user.userId }`.
- The update uses `$inc: { currentCount: 1 }` and `$addToSet: { attendees: req.user.userId }`.

This single `findOneAndUpdate` operation is executed atomically by MongoDB. The operation will only succeed if the document still satisfies the conditions at the moment the update is applied (i.e., currentCount is strictly less than capacity and the user is not already in the `attendees` array). If the document no longer satisfies the conditions (e.g., another concurrent request filled the last slot), the update returns `null` and the controller responds with a 400 error: "Event is full or already joined".

Why this is safe:
- Atomicity: MongoDB applies the query + update as a single atomic operation on the matched document, preventing lost-updates for concurrent join attempts.
- Idempotence for attendees: `$addToSet` prevents duplicate entries in the `attendees` array if the same user attempts to join twice.

Edge cases and alternatives:
- This approach avoids the complexity of distributed locks and performs well with a single MongoDB replica set. For multi-document transactions or cross-collection invariants, MongoDB transactions could be used.
- If absolute strictness is required in a highly contended environment, consider using MongoDB transactions (with replica set) or an external locking service (Redis Redlock) to coordinate reservations.

Also implemented: `leaveEvent` uses `findOneAndUpdate` with a condition that the user is currently in `attendees` and then applies `$pull` and `$inc: { currentCount: -1 }` in a single atomic update.

**Features implemented**

- Authentication: register, login, HTTP-only cookie JWT handling (`src/controllers/auth.controller.js`, `src/middlewares/auth.middleware.js`).
- Event CRUD: create, read (single & list), update, delete (`src/controllers/event.controller.js`).
- RSVP: join/leave events with capacity checks and atomic updates.
- Image upload integration via Cloudinary using `multer-storage-cloudinary` (`src/lib/cloudinary.js`, `src/lib/multer.js`).
- Protected routes: only authenticated users can create/update/delete events or RSVP.
- Frontend (Vite + React): pages/components for listing events, creating/editing events, viewing event details, login/register, and seeing created/applied events (`frontend/src/pages`, `frontend/src/components`).

**Notes**
- CORS is configured to allow `http://localhost:5173` and the Vercel frontend origin; cookies are sent with `credentials: true`.
- The backend uses `express.json()` and cookie parsing; tokens are issued as HTTP-only cookies by the `generateToken` utility.

If you want, I can also:
- Add a `backend/.env.example` file automatically.
- Update the top-level README to include links and a short developer guide for running both services together.
