const express = require('express');
const eventController = require('../controllers/eventController');
const { createEventValidation } = require('../validators/eventValidator');
const validateRequest = require('../middlewares/validateRequest');
const csrf = require('csurf');
const { authenticateAccessToken, requireUserType, optionalAuth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const csrfProtection = csrf({ cookie: true});
const eventRouter = express.Router();

//user
eventRouter.get('/', eventController.getAllEvents);
eventRouter.get('/user/:userId/liked', authenticateAccessToken, eventController.getLikedEvents);
eventRouter.get('/:id', optionalAuth, eventController.getEventById);

//organizer
eventRouter.post('/', csrfProtection, authenticateAccessToken, requireUserType('organizer'), createEventValidation, validateRequest, eventController.createEvent);
eventRouter.patch('/:id', csrfProtection, authenticateAccessToken, requireUserType('organizer'), eventController.updateEvent);
eventRouter.delete('/:id', csrfProtection, authenticateAccessToken, requireUserType('organizer'), eventController.deleteEvent);
eventRouter.post('/upload-image', csrfProtection, authenticateAccessToken, requireUserType("organizer"), upload.single("image"), eventController.uploadEventImage);
eventRouter.patch("/:id/stats", csrfProtection, authenticateAccessToken, requireUserType("organizer"), eventController.updateEventStats);

//user
eventRouter.post('/:id/like', csrfProtection, authenticateAccessToken, eventController.likeEvent);

module.exports = eventRouter;