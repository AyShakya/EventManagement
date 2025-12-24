CoffeeEvents — Full-Stack Event Management Platform

CoffeeEvents is a production-ready full-stack event management platform where users can discover, like, and give feedback on events, while organizers can create and manage events with analytics, images, and dashboards.

The application is built with modern web technologies, follows industry-grade security practices, and is deployed using cloud-native infrastructure.
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Live URLs

Frontend (Vercel):
 https://event-management-brown-iota.vercel.app/

Backend API (Render):
 https://eventmanagement-e3om.onrender.com
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Architecture Overview

This is a monorepo containing:

    EventManagement/
    ├── client/frontend        # Frontend (React + Vite)
    └── server/                # Backend (Node.js + Express)


- Frontend and backend are deployed independently

- Authentication is handled using HTTP-only cookies

- Cross-domain communication is secured using CORS + CSRF
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Tech Stack

🔹 Frontend

  • React.js – UI library
  
  • Vite – Fast build tool
  
  • React Router DOM – Client-side routing
  
  • Axios – API communication
  
  • Tailwind CSS – Utility-first styling
  
  • Context API – Global auth state

🔹 Backend

  • Node.js – Runtime
  
  • Express.js – Web framework
  
  • MongoDB Atlas – Cloud database
  
  • Mongoose – ODM
  
  • JWT – Authentication tokens
  
  • HTTP-only Cookies – Secure auth storage
  
  • CSRF Protection (csurf) – Request validation
  
  • Helmet – Security headers
  
  • Express Rate Limit – API protection
  
  • Morgan – Logging (dev only)

🔹 Cloud & Services

  • Render – Backend hosting
  
  • Vercel – Frontend hosting
  
  • MongoDB Atlas – Database
  
  • Cloudinary – Image uploads
  
  • Brevo (SMTP) – Email delivery

Authentication & Security

This project uses industry-grade security practices:

 • JWT authentication with access & refresh tokens

 • Tokens stored in HTTP-only cookies

 • Refresh token rotation

 • CSRF protection using double-submit cookie pattern

 • Secure CORS configuration (supports Vercel preview domains)

 • Rate limiting against abuse

 • Password hashing with bcrypt

 • Email verification & password reset via OTP
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Core Features

 User
  
  • Register & login
  
  • Browse events
  
  • Like / unlike events
  
  • View liked events
  
  • Submit feedback for events
  
  • Persistent login across refresh

🎤 Organizer

  • Organizer login
  
  • Create, update, and manage events
  
  • Upload event images (Cloudinary)
  
  • View event stats & engagement
  
  • Manage user queries & feedback

 Media

  • Secure image uploads
  
  • Cloudinary storage
  
  • Optimized image delivery

 Email

  • Email verification
  
  • Password reset via OTP
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Deployment

  Backend (Render)
  
  └──Root Directory: server
  
  └──Build Command: npm install
  
  └──Start Command: node server.js
  
  └──Free plan (cold starts after inactivity)
  
  Frontend (Vercel)
  
  └──Root Directory: frontend
  
  └──Framework: Vite
  
  └──Build Command: npm run build
  
  └──Output Directory: dist
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Production Considerations

  Backend may sleep on inactivity (Render free tier)
  
  First request after idle may take ~30–60 seconds
  
  All data is persisted safely in MongoDB Atlas
  
  Frontend remains always live via Vercel CDN
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Key Learnings & Highlights

  • Cross-domain authentication with cookies
  
  • CSRF handling in SPAs
  
  • CORS configuration for Vercel preview domains
  
  • Linux vs Windows case-sensitivity issues
  
  • Monorepo deployment strategy
  
  • Real-world production debugging
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Future Improvements (Optional)

  • Background job queue (email retries)
  
  • WebSockets for real-time update
  
  • Admin moderation panel
  
  • Custom domain setup
  
  • Performance monitoring & alerts
____________________________________________________________________________________________________________________________________________________________________________________________________________________________
 Possible Underlying Issues:
  • Refresh Token Not Implemented correctly: Reason can be one of these.
          - Refresh endpoint called too frequently
          - Frontend retry loop
          - Axios interceptor misconfigured
          - Refresh token rotation implemented incorrectly
____________________________________________________________________________________________________________________________________________________________________________________________________________________________

Author

Built and deployed as a real-world full-stack learning project, focused on understanding production practices, security considerations, and clean architecture—while accepting there’s still plenty to improve.
