# 🎟️ Mini Event Handler

A modern full-stack **Event Management Application** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.  
The platform enables users to create events, explore available events, and RSVP — with **strict capacity enforcement and concurrency safety**.

---

## ✨ Highlights

- 🔐 Secure authentication with JWT
- 📅 Full event lifecycle management
- 🧑‍🤝‍🧑 Real-time RSVP handling with capacity control
- ⚙️ MongoDB atomic operations for concurrency safety
- 🎨 Responsive modern UI with Tailwind CSS
- 🌐 Production-ready deployment

---

## 🚀 Features

### 🔐 Authentication
- User sign-up & login
- JWT-based session management
- Password hashing using **bcrypt**
- Protected API routes

### 📅 Event Management
- Create events with:
  - Title & description
  - Event image
  - Location
  - Date & time
  - Capacity limit
- Event creator permissions:
  - Edit events
  - Delete events
- Personal dashboard for managing created events

### 🧑‍🤝‍🧑 RSVP System
- Real-time attendee count
- Duplicate RSVP prevention
- Strict event capacity enforcement
- Safe handling of concurrent RSVP requests

---

## 🛠️ Technical Strategy: Handling Concurrency & Capacity

To solve the challenge of "overbooking" when multiple users attempt to RSVP simultaneously for the last spot, this application utilizes **Atomic MongoDB Operations**.

Instead of a "Read-Check-Write" pattern (which is vulnerable to race conditions), we use `findOneAndUpdate` with a query condition that enforces integrity at the database level.

**Code implementation (`backend/routes/events.js`):**

```javascript
const event = await Event.findOneAndUpdate(
    { 
        _id: req.params.id, 
        $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] } 
    },
    { $addToSet: { attendees: req.user.id } },
    { new: true }
);
```

*   **`$expr` with `$lt`**: This condition ensures the update *only* runs if the current number of `attendees` is less than `capacity`.
*   **`$addToSet`**: Ensures the user ID is added only if it doesn't already exist (preventing duplicates).
*   **Atomic execution**: MongoDB executes this as a single atomic unit. If 10 requests come in for 1 spot, only the first one to hit the lock will succeed; the others will fail to match the condition and return `null`, effectively preventing overbooking without complex application-level locking.

---

## 📦 Local Setup Instructions

Follow these steps to run the application locally.

### Prerequisites
*   Node.js (v14+)
*   MongoDB Instance (Local or Atlas)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd MiniEventHandler
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the server:
```bash
npm start
```
*The server will run on `http://localhost:5000`*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the React application:
```bash
npm run dev
```
*The application will be accessible at `http://localhost:5173`*

---

## 🌐 Deployment

*   **Frontend**: Deployed on Netlify.
*   **Backend**: Deployed on Render.

