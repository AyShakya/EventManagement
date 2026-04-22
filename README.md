# EventEase - Full-Stack Event Management Platform

EventEase is a full-stack event management website for discovering events, browsing event details, sharing feedback, and letting organizers create and manage events from a role-based dashboard.

It is built as a monorepo with a React frontend and a Node.js/Express backend, using MongoDB, JWT authentication, secure cookies, CSRF protection, Cloudinary image uploads, and email-based account flows.

## Live Demo

- Frontend: https://event-management-brown-iota.vercel.app/
- Backend API: https://eventmanagement-e3om.onrender.com

## What The Website Does

### Public Experience

- Landing page with featured events and a search entry point.
- Events listing page with search, filter, sort, and pagination.
- Event detail page with image preview, date, time, location, price, likes, views, and event recap data when available.
- Copy-link action for quickly sharing an event page.
- External registration link support when an organizer provides a form URL.

### User Features

- Register, log in, verify email, and reset password using OTP.
- Browse events and open full event details.
- Like and unlike events.
- View liked events inside the user dashboard.
- Send feedback on an event.
- View personal dashboard data such as liked count and submitted queries.

### Organizer Features

- Separate organizer login flow.
- Organizer dashboard with event and query summaries.
- Create new events.
- Edit and delete events.
- Upload event images through Cloudinary.
- Review event queries and update their status.
- View organizer stats such as total events, attendees, and queries.

### Security and Authentication

- Access and refresh token based authentication.
- Tokens stored in HTTP-only cookies.
- Refresh token rotation and automatic session restoration on page load.
- CSRF-protected state-changing requests.
- Rate limiting on auth, verification, reset, and feedback endpoints.
- Helmet, CORS, and server-side validation to reduce common web risks.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Axios
- React Hook Form
- Tailwind CSS
- React Toastify

### Backend

- Node.js
- Express
- MongoDB and Mongoose
- JWT authentication
- bcrypt password hashing
- csurf for CSRF protection
- express-rate-limit
- Helmet
- Multer for uploads
- Nodemailer for email delivery

### Services

- MongoDB Atlas for data storage
- Cloudinary for event images
- SMTP email service for verification and password reset
- Vercel for frontend hosting
- Render for backend hosting

## Project Structure

```text
EventManagement/
├── client/frontend   # React + Vite frontend
└── server            # Express API and database logic
```

## Main Pages

- `/` Home
- `/events` Event listing
- `/events/:id` Event detail
- `/login` User or organizer login
- `/register` Registration
- `/reset-pass-otp` Request password reset code
- `/reset-password` Reset password
- `/verify-email` Email verification
- `/user` User dashboard
- `/user/liked` Liked events
- `/user/queries` Submitted queries
- `/organizer` Organizer dashboard
- `/organizer/events` Organizer event manager
- `/organizer/events/create` Create event
- `/organizer/events/:id/edit` Edit event
- `/organizer/events/:id/queries` Event queries
- `/organizer/events/:id/stats` Event stats

## API Overview

- `/api/auth` Registration, login, refresh, logout, verification, and password reset
- `/api/event` Event listing, single event, likes, uploads, and event updates
- `/api/query` Feedback and organizer query management
- `/api/user` User profile data, stats, liked events, and queries
- `/api/organizer` Organizer profile data, stats, and managed events

## Setup

### Prerequisites

- Node.js 18+ recommended
- MongoDB connection string
- SMTP credentials for email delivery
- Cloudinary credentials for image uploads

### Frontend

```bash
cd client/frontend
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm start
```

### Environment Variables

Backend environment variables used by the app include:

- `MONGO_URI`
- `JWT_SECRET`
- `SERVER_URL`
- `CLIENT_URL`
- `SENDER_EMAIL`
- `SMTP_USER`
- `SMTP_PASS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `COOKIE_DOMAIN` optional
- `ACCESS_TOKEN_EXPIRES_MIN` optional
- `REFRESH_TOKEN_EXPIRES_DAYS` optional
- `MAX_REFRESH_TOKENS` optional

The frontend can also use:

- `VITE_API_BASE_URL`

## Deployment Notes

- Frontend is deployed separately on Vercel.
- Backend is deployed separately on Render.
- The backend is configured for secure cross-origin requests from the frontend domain.
- The API uses secure cookies and CSRF protection in production.

## Resume Highlights

- Role-based event platform with separate user and organizer experiences.
- Secure auth flow with refresh tokens, CSRF protection, and protected routes.
- Cloud image uploads and email workflows integrated end to end.
- Searchable, filterable event discovery experience with dashboards and management tools.
