const { check } = require("express-validator");

const createEventValidation = [
     check('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string'),
    
    check('location')
        .notEmpty().withMessage('Location is required')
        .isString().withMessage('Location must be a string'),
    
    check('description')
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),

    check('organizer')
        .optional()
        .isMongoId().withMessage('Organizer must be a valid MongoDB ID'),

    check('imageURL')
        .optional()
        .isURL().withMessage('Image URL must be a valid URL'),

    check('postedAt')
        .optional()
        .isISO8601().toDate().withMessage('Posted date must be a valid date'),
]

module.exports = {createEventValidation};