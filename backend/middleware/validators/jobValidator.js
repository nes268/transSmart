const { body } = require("express-validator");

exports.createJobValidation = [
  body("pickupLocation")
    .notEmpty()
    .withMessage("Pickup location is required"),

  body("deliveryLocation")
    .notEmpty()
    .withMessage("Delivery location is required"),

  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  body("description")
    .notEmpty()
    .withMessage("Job description is required"),
];
