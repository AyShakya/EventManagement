const { Query } = require("mongoose");

exports.sendQuery = async (req, res, next) => {
  const { senderId, subject, message, sentAt, status } = req.body;
  const query = await Query({senderId, subject, message, sentAt, status});
  await query.save();
  return res.status(201).json({message: "Query Accepted"});
};

exports.getYourQuery = async (req,res,next) => {
    //TO Show queries with status on user's account, we have to store query ids in user model and populate from their
}
