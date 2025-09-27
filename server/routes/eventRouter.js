const express = require('express');
const eventController = require('../controllers/eventController');
const { createEventValidation } = require('../validators/eventValidator');
const validateRequest = require('../middlewares/validateRequest');
const csrf = require('csurf');
const { authenticateAccessToken } = require('../middlewares/authMiddleware');

const csrfProtection = csrf({ cookie: true});
const eventRouter = express.Router();

eventRouter.get('/', eventController.getAllEvents);
eventRouter.get('/:id', eventController.getEventById);
eventRouter.get('/user/:userId/liked', authenticateAccessToken, eventController.getLikedEvents);

eventRouter.post('/', csrfProtection, authenticateAccessToken, requireUserType('organiser'), createEventValidation, validateRequest, eventController.createEvent);
eventRouter.patch('/:id', csrfProtection, authenticateAccessToken, requireUserType('organiser'), eventController.updateEvent);
eventRouter.delete('/:id', csrfProtection, authenticateAccessToken, requireUserType('organiser'), eventController.deleteEvent);
eventRouter.post('/:id/like', csrfProtection, authenticateAccessToken, eventController.likeEvent);

module.exports = eventRouter;