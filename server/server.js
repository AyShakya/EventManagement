require('dotenv').config();

//Imports/Modules
const cookieParser = require('cookie-parser');
const express = require('express');
const connectDB  = require('./config/mongodb');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const authRouter = require('./routes/authRouter');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const eventRouter = require('./routes/eventRouter');

//Const Creation
const app = express();
const PORT = process.env.PORT || 5000;
const limiter = rateLimit({
  windowMs: 60*1000,
  max: 100,
  message: "Too Many requests from this IP, please try again later"
})
const csrfProtection = csrf({ cookie: true});
//Function/Middlewares/package usage
connectDB();
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
}));
app.set('trust proxy', 1);
app.use(limiter);
// app.use(helmet({
//   contentSecurityPolicy: false,
//   xDownloadOptions: false
// }));


//Path/Routes
app.get('/', (req, res, next) => {
    res.send('Hello from Express server!');
});
app.get('/api/csrf-token', csrfProtection, (req,res,next) => {
  res.json({csrfToken: req.csrfToken()});
});

app.use('/api/auth', authRouter);
app.use('/api/event', eventRouter);


//Footer/Ending
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.CLIENT_URL}`);
});