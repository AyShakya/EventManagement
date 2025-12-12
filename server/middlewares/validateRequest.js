const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const formattedErrors = result.array().map(err => ({
    field: err.param,          
    message: err.msg,          
    // value: err.value,
    // location: err.location,
  }));

  return res.status(400).json({
    type: "validation",
    errors: formattedErrors,
  });
}

module.exports = validateRequest;
