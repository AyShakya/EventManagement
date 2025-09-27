const expressValidator = require('express-validator');

function validateRequest(req, res, next){
    const errors = expressValidator.validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

module.exports = validateRequest;