# 🎬 Watch Party — Watch Together. Stay Together.

A full-stack, real-time Watch Party web application built with **React**, **Node.js**, **Express**, **Socket.IO**, **MongoDB Atlas**, and **WebRTC**. 

Watch videos in sync with friends, hang out on peer-to-peer video calls, chat in real time, share your screen, and host private watching rooms.

---

## 🌟 Key Features

- 🔐 **Secure User Authentication**: User registration, bcrypt password hashing, and JWT token session management.
- 🍿 **Watch Party Rooms**: Create private rooms with custom/sample video URLs, unique Room IDs, and shareable invite links.
- ⚡ **Synchronized Video Playback**: Real-time play, pause, and seek event synchronization across all participants with feedback loop prevention.
- 📹 **Mesh WebRTC Video Calling**: Live peer-to-peer audio and video calls directly inside the watch room using Google STUN servers.
- 🖥️ **Screen Sharing**: Dynamic track replacement using `getDisplayMedia()` to broadcast your display to room members.
- 💬 **Real-time Room Chat**: Room-scoped chat messaging with username tags, system join/leave alerts, auto-scroll, and timestamps.
- 👥 **Participant Presence System**: Live participant cards displaying host badges, online status, mic state, camera state, and screen sharing badges.
- 👑 **Host Controls**: Dedicated host playback priority, invite link copy, and full party termination controls.
- ⏺️ **Session Recording**: Host-only browser session recording powered by the MediaRecorder API with local WebM downloading.
- 🎨 **Modern Dark UI**: Glassmorphic dark theme, responsive grid/flexbox layout, smooth CSS micro-animations, and accessible controls.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router v6
- **Real-time**: Socket.IO Client v4
- **Media**: Native Browser WebRTC (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`, `MediaRecorder`)
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS custom design system with dark theme & glassmorphic tokens

### Backend
- **Runtime**: Node.js & Express.js
- **Real-time Engine**: Socket.IO v4 (HTTP Server integration)
- **Database**: MongoDB Atlas with Mongoose ORM
- **Security**: JSON Web Tokens (JWT), `bcryptjs`, CORS middleware, `dotenv`

---

## 📂 Project Structure

```
watch-party/
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── ParticipantList.jsx
│   │   │   ├── VideoCall.jsx
│   │   │   ├── CallControls.jsx
│   │   │   ├── PartyHeader.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateParty.jsx
│   │   │   ├── JoinParty.jsx
│   │   │   └── WatchParty.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   └── useWebRTC.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── partyController.js
│   ├── models/
│   │   ├── User.js
│   │   └── WatchParty.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── partyRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB Atlas**: Active connection string or local MongoDB instance

---

## 🚀 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.i1c80h3.mongodb.net/watchparty?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏃 How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ssatpute878-oss/watch-party.git
   cd watch-party
   ```

2. **Install all dependencies** (Root, Server, Client):
   ```bash
   npm run install:all
   ```

3. **Configure Environment Files**:
   - Create `server/.env` based on `server/.env.example`.
   - Create `client/.env` based on `client/.env.example`.

4. **Start Application Concurrently**:
   ```bash
   npm run dev
   ```
   - Express & Socket.IO server: `http://localhost:5000`
   - Vite React client: `http://localhost:5173`

---

## 📖 How to Use

1. Navigate to `http://localhost:5173`.
2. Click **Register** to create an account (`User A`).
3. Log in and navigate to your **Dashboard**.
4. Click **Create Watch Party**, enter a title and video URL (or select a sample preset video).
5. Click **Launch Watch Party**. You will be redirected to your private room `/party/<roomId>`.
6. Click **Copy Invite Link** in the top header.
7. Open a second browser window (or incognito window), register/login as `User B`, and paste the copied URL.
8. Both users will automatically appear in the **Participant List** and **Video Call Grid**.
9. Host (`User A`) hits **Play**, **Pause**, or **Seek** — `User B`'s player synchronizes instantly!
10. Send messages in **Chat**, toggle your **Microphone** or **Camera**, or click **Share Screen**.

---

## 🧪 Testing Instructions (Two Browser Sessions)

1. **Window 1 (User A - Host)**: Log in -> Create Room -> Enter Room.
2. **Window 2 (User B - Guest)**: Log in -> Join via Room ID / Link.
3. Verify presence: Check participant count badge reads `2 Active Users`.
4. Playback Sync Test: User A plays video -> User B video starts. User A seeks to `02:00` -> User B jumps to `02:00`.
5. WebRTC Test: Turn on camera on both windows -> verify both camera streams appear in video call grid.
6. Controls Test: Mute mic on User B -> verify muted microphone badge updates live on User A's screen.
7. Screen Share Test: User B clicks `Share Screen` -> User A sees User B's display stream. Stop screen share -> camera restores automatically.

---

## 📡 WebRTC Architecture & Limitations

This application utilizes a **Full Mesh WebRTC Topology**:
- Each peer establishes direct peer-to-peer `RTCPeerConnection` objects to every other participant.
- Google STUN servers (`stun:stun.l.google.com:19302`) are used for ICE candidate discovery and NAT traversal.
- **Recommended Room Size**: Up to **4–6 participants** per room for optimal bandwidth and CPU performance.

---

## 🔮 Future Improvements

- 🌐 Selective Forwarding Unit (SFU) media server integration (e.g. Mediasoup or LiveKit) for large scale rooms (50+ participants).
- 💬 Persistent chat database logging.
- 🔔 Friend requests & invitation notifications.
- 🎨 Customizable room background themes & emoji reaction floats.
