const Query = require("../models/queryModel");
const sanitizeHtml = require('sanitize-html');
const asyncHandler = require("../utils/asyncHandler");
const Event = require("../models/eventModel");
const { Organizer, User } = require("../models/userModel");
const transporter = require("../config/nodeMailer");

function sanitizeInput(str) {
  if (!str) return '';
  return sanitizeHtml(String(str), { allowedTags: [], allowedAttributes: {} }).trim();
}

exports.sendFeedback = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  if (!eventId) {
    return res.status(400).json({ message: "Missing event id" });
  }

  const subject = sanitizeInput(req.body.subject);
  const message = sanitizeInput(req.body.message);
  const senderName = sanitizeInput(
    req.body.senderName || (req.user && req.user.userName) || "Anonymous"
  );
  const senderEmail = sanitizeInput(
    req.body.senderEmail || (req.user && req.user.email) || ""
  );

  if (!subject || !message) {
    return res
      .status(400)
      .json({ message: "Subject and message are required" });
  }

  const event = await Event.findById(eventId).lean();
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const queryDoc = new Query({
    senderId: req.user?.id || req.user?._id,
    senderName,
    senderEmail,
    eventId,
    organizerId: event.organizer || undefined,
    subject,
    message,
    status: "pending",
  });

  await queryDoc.save();

  return res.status(201).json({
    message: "Feedback submitted successfully",
    queryId: queryDoc._id,
  });
});


exports.getYourQueries = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if(!userId) return res.status(401).json({ message: 'Not authenticated' });

  const queries = await Query.find({ senderId: userId }).sort({ sentAt: -1 }).lean();
  return res.status(200).json({ message: 'Queries fetched', queries });
})

exports.getQueriesForEvent = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if(!userId) return res.status(401).json({ message: 'Not authenticated' });

  const eventId = req.params.eventId;
  const event = await Event.findById(eventId).lean();
  if(!event) return res.status(404).json({ message: 'Event not found' });

  if(event.organizer.toString() !== userId){
    return res.status(403).json({ message: "Forbidden: you don't own this event" });
  }

  const queries = await Query.find({eventId}).sort({sentAt: -1}).lean();
  return res.status(200).json({ message: 'Queries fetched', queries });
})

exports.updateQueryStatus = asyncHandler(async (req,res) => {
  const {id} = req.params;
  const {status} = req.body;
  const userId = req.user?.id || req.user?._id;
  if(!userId) return res.status(401).json({ message: 'Not authenticated' });

  const query = await Query.findById(id);
  if(!query) return res.status(404).json({ message: 'Query not found' });

  if(query.eventId) {
    const event = await Event.findById(query.eventId).lean();
    if(!event) return res.status(404).json({ message: 'Event not found' });
    if(event.organizer.toString() !== userId){
      return res.status(403).json({ message: "Forbidden: you don't own this event" });
    }
  }
  else{
    if (query.organizerId && query.organizerId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  
  if(!["pending", "resolved"].includes(status)){
    return res.status(400).json({ message: 'Invalid status' });
  }

  query.status = status;
  await query.save();

  return res.status(200).json({ message: 'Status updated', query });
});
