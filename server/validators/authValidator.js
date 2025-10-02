const { check } = require("express-validator");

const registerValidation = [
    check('userName')
    .trim()
    .notEmpty()
    .withMessage('User name is required')
    .isLength({ min: 3 })
    .withMessage('User name must be at least 3 characters long'),

    check('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

    check('password')
    .isLength({min: 4})
    .withMessage("Password should be atleast 4 characters long")
    // .isLength({min: 8})
    // .withMessage("Password should be atleast 8 characters long")
    // .matches(/[A-Z]/)
    // .withMessage("Password should contain atleast one uppercase letter")
    // .matches(/[a-z]/)
    .withMessage("Password should contain atleast one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain atleast one number")
    // .matches(/[!@#$%^&*(),.?":{}|<>]/)
    // .withMessage("Password should contain atleast one special character")
    .trim(),

    check('userType')
    .trim()
    .notEmpty()
    .withMessage('userType is required'),
]

const loginValidation = [
    check('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

    check('password').notEmpty().withMessage('Password is required').trim(),
]

const resetPasswordValidation = [
    check('newPassword')
    .isLength({min: 4})
    .withMessage("Password should be atleast 4 characters long")
    // .isLength({min: 8})
    // .withMessage("Password should be atleast 8 characters long")
    // .matches(/[A-Z]/)
    // .withMessage("Password should contain atleast one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain atleast one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain atleast one number")
    // .matches(/[!@#$%^&*(),.?":{}|<>]/)
    // .withMessage("Password should contain atleast one special character")
    .trim(),
]

module.exports = { registerValidation, loginValidation, resetPasswordValidation };