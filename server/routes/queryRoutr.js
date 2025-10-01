const express = require('express');

const queryRouter = express.Router();
const queryController = require('../controllers/queryController');
const { optionalAuth, authenticateAccessToken, requireUserType } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5,              
  message: 'Too many feedback submissions, please try again later',
});

queryRouter.post('/event/:id/Feedback', feedbackLimiter, optionalAuth, queryController.sendFeedback);
queryRouter.get('/my', authenticateAccessToken, queryController.getYourQueries);
queryRouter.get('/event/:eventId', authenticateAccessToken, requireUserType('organiser'), queryController.getQueriesForEvent);
queryController.patch('/:id/status', authenticateAccessToken, requireUserType('organiser'), queryController.updateQueryStatus);

module.exports = queryRouter;