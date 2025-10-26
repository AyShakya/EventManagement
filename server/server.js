require("dotenv").config();

//Imports/Modules
const cookieParser = require("cookie-parser");
const express = require("express");
const connectDB = require("./config/mongodb");
const helmet = require("helmet");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const authRouter = require("./routes/authRouter");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hsts = require("helmet").hsts;
const eventRouter = require("./routes/eventRouter");
const queryRouter = require("./routes/queryRouter");
const { pruneExpiredTokens } = require("./services/authTokenService");
const morgan = require("morgan");
const mongoose = require("mongoose");

//Env Check
const REQUIRED_ENVS = [
  "MONGO_URI",
  "JWT_SECRET",
  "SENDER_EMAIL",
  "SMTP_USER",
  "SMTP_PASS",
  "CLIENT_URL",
];
const missing = REQUIRED_ENVS.filter((k) => !process.env[k]);
if (process.env.NODE_ENV === "production" && missing.length > 0) {
  console.error("Missing required env vars:", missing);
  process.exit(1);
}

//Const Creation
const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

//Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too Many requests from this IP, please try again later",
});

//CSRF Protection
const csrfProtection = csrf({ cookie: true });

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

//Logging
if (!isProd) {
  app.use(morgan("dev"));
}

// CORS: whitelist approach
// const clientOrigin = process.env.CLIENT_URL;
// const additionalOrigins = (process.env.ADDITIONAL_CLIENT_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
// const allowedOrigins = new Set([clientOrigin, ...additionalOrigins]);
// app.use(cors({
//   origin: (origin, callback) => {
//     // allow requests with no origin (mobile apps, curl)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.has(origin)) return callback(null, true);
//     return callback(new Error('CORS policy: origin not allowed'), false);
//   },
//   credentials: true,
// }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    credentials: true,
  })
);
app.set("trust proxy", 1);

//Security Headers
app.use(helmet());
if (isProd) {
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
      },
    })
  );

  //HSTS
  app.use(
    hsts({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    })
  );
} else {
  app.use(helmet.contentSecurityPolicy({ useDefaults: true }));
}

//Sanitize Input
app.use(mongoSanitize());
app.use(xss());

//Global Rate Limiter
app.use(limiter);

(async function start() {
  let server;
  let pruneIntervalId;
  try {
    await connectDB();
    pruneExpiredTokens().catch((err) =>
      console.error("[pruneExpiredTokens] startup error", err)
    );

    pruneIntervalId = setInterval(() => {
      pruneExpiredTokens().catch((err) =>
        console.error("[pruneExpiredTokens] error", err)
      );
    }, 24 * 60 * 60 * 1000);

    //Routes
    app.get("/", (req, res, next) => {
      res.send("Hello from Express server!");
    });
    app.get("/api/csrf-token", csrfProtection, (req, res) => {
      res.json({ csrfToken: req.csrfToken() });
    });

    //Paths
    app.use("/api/auth", authRouter);
    app.use("/api/event", eventRouter);
    app.use("/api/query", queryRouter);

    //Error Handler
    app.use(errorHandler);

    //Start Server
    server = app.listen(PORT, () => {
      console.log(
        `Server is running on ${process.env.CLIENT_URL} and Port: ${PORT}`
      );
    });

    //Graceful Shutdown
    let shuttingDown = false;
    const shutdown = async (signal) => {
      if (shuttingDown) {
        console.log(`Shutdown already in progress (signal: ${signal})`);
        return;
      }
      shuttingDown = true;
      try {
        console.info(`Received ${signal}, shutting down gracefully...`);
        if (server){
          server.close((err) => {
            if (err) {
              console.error("Error while closing HTTP server", err);
            } else {
              console.log("HTTP server closed");
            }
          });
        }

        //Clear Interval
        if(pruneIntervalId){
          clearInterval(pruneIntervalId);
          console.log("Cleared pruneExpiredTokens interval");
        }

        try{
          await mongoose.connection.close(false);
          console.log("MongoDB connection closed");
        } catch (err) {
          console.error("Error while closing MongoDB connection", err);
        }

        // give some time then exit
        setTimeout(() => process.exit(0), 1000).unref();

      } catch (error) {
        console.error("Error during shutdown", error);
        process.exit(1);
      }

      setTimeout(() => {
        console.error("Graceful shutdown timed out, forcing exit");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    //Global Error Handler
    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at Promise", p, "reason:", reason);
    })
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception thrown:", err);
    })
      
  } catch (error) {
    console.error("Failed to start server:", error);
    try {
      if(pruneIntervalId) clearInterval(pruneIntervalId);
      if(server) server.close();
    } catch (_) {
    }
    process.exit(1);
  }
})();
