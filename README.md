# SAFELLE — Safety Simplified 

> Your safest route home. A comprehensive women's safety platform with real-time incident mapping, safe route navigation, and emergency SOS alerts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, Formik + Yup |
| **Maps** | Leaflet.js, React-Leaflet, leaflet.heat, OpenStreetMap, OSRM routing |
| **Backend** | Node.js, Express.js, MongoDB + Mongoose |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Real-time** | Socket.io |
| **Charts** | Recharts |
| **SMS** | Twilio |
| **Email** | Nodemailer |
| **Storage** | Cloudinary + Multer |

## Features

- **Live Incident Map** — Real-time heatmap of safety incidents with filtering
- **Safe Route Navigation** — AI-scored routes using OSRM with safety comparison
- **SOS Emergency Alerts** — 3-second hold-to-activate SOS with SMS to trusted contacts
- **Incident Reporting** — Report safety incidents with location, severity, and photos
- **Admin Dashboard** — Analytics, incident verification, user management
- **Real-time Updates** — Socket.io for live incident and SOS notifications

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Twilio account for SMS
- (Optional) Cloudinary account for image uploads

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

**Backend** — Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:5173`) |
| `TWILIO_ACCOUNT_SID` | Twilio SID (optional) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token (optional) |
| `TWILIO_PHONE` | Twilio phone number (optional) |
| `EMAIL_USER` | Email sender address (optional) |
| `EMAIL_PASS` | Email app password (optional) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name (optional) |
| `CLOUDINARY_API_KEY` | Cloudinary key (optional) |
| `CLOUDINARY_API_SECRET` | Cloudinary secret (optional) |

**Frontend** — Copy `frontend/.env.example` to `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: `admin@safelle.app` / `Admin@123`
- **User**: `test@safelle.app` / `Test@123`
- **20 sample incidents** around New Delhi

### 4. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/reset-password` | — | Reset password |
| POST | `/api/auth/send-otp` | — | Send OTP via SMS |
| POST | `/api/auth/verify-otp` | — | Verify OTP |
| GET | `/api/user/me` | JWT | Get profile |
| PUT | `/api/user/me` | JWT | Update profile |
| PUT | `/api/user/password` | JWT | Change password |
| POST | `/api/user/upload-avatar` | JWT | Upload avatar |
| GET | `/api/incidents` | — | Get incidents (geo query) |
| POST | `/api/incidents` | JWT | Report incident |
| GET | `/api/incidents/:id` | — | Get incident details |
| POST | `/api/sos` | JWT | Trigger SOS |
| GET | `/api/sos/my` | JWT | SOS history |
| GET | `/api/routes/safe` | JWT | Get safe route |
| GET | `/api/admin/incidents` | Admin | All incidents (paginated) |
| PUT | `/api/admin/incident/:id` | Admin | Verify/reject incident |
| DELETE | `/api/admin/incident/:id` | Admin | Delete incident |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users | 

## Free APIs Used (No Keys Required)

- **Map Tiles**: CartoDB dark tiles / OpenStreetMap
- **Geocoding**: Nominatim (OpenStreetMap)
- **Routing**: OSRM public server
- **No paid API keys** required to run the app

## License

MIT
