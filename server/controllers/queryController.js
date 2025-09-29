const QueryModel = require("mongoose");

exports.sendQuery = async (req, res, next) => {
  try {
    const { senderId, subject, message, sentAt, status } = req.body;
    const query = await QueryModel({ senderId, subject, message, sentAt, status });
    await query.save();
    return res.status(201).json({ message: "Query Accepted" });
  } catch (error) {
    next(error);
  }
};

exports.getYourQuery = async (req, res, next) => {
  try{
    const userId = req.user?.id;
    if(!userId) return res.status(401).json({ message: 'Not authenticated' });
    const queries = await QueryModel.find({ senderId: userId}).lean();
    return res.status(200).json({ message: 'Queries fetched', queries });
  }
  catch(error){
    next(error);
  }
};
