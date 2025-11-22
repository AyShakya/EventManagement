const express = require('express');

const queryRouter = express.Router();
const queryController = require('../controllers/queryController');
const { optionalAuth, authenticateAccessToken, requireUserType } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true});

const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5,              
  message: 'Too many feedback submissions, please try again later',
});

queryRouter.post('/event/:id/feedback', feedbackLimiter, csrfProtection, authenticateAccessToken, requireUserType('user'), queryController.sendFeedback);
queryRouter.get('/my', authenticateAccessToken, queryController.getYourQueries);
queryRouter.get('/event/:eventId', authenticateAccessToken, requireUserType('organizer'), queryController.getQueriesForEvent);
queryRouter.patch('/:id/status', csrfProtection, authenticateAccessToken, requireUserType('organizer'), queryController.updateQueryStatus);

module.exports = queryRouter;