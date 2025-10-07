const {User, Organizer} = require('../models/userModel');
const bcrypt = require('bcrypt');

async function registerUser(userName, email, password, userType) {
  const normalizeEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizeEmail });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  let user;
  if(userType === "user"){
    user = new User({ userName, email, password: hashedPassword });
  }
  else if(userType === "organizer"){
    let organizerName = userName;
    user = new Organizer({ organizerName, email, password: hashedPassword });
  }
  else{
    throw new Error("Invalid user type");
  }
  await user.save();
  
  return { id: user._id, userName: user.userName || user.organizerName, email: user.email, userType };
}

async function loginUser(email, password) {
  const normalizeEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email:normalizeEmail }).select('+password');
  if (!user) {
    throw new Error("Invalid Email");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Password");
  }
  const safeUser = {
    id: user._id,
    userName: user.userName,
    email: user.email,
    userType: 'user',
  };
  return { safeUser, userDoc: user };
}

async function loginOrganizer(email, password){
  const normalizeEmail = String(email).trim().toLowerCase();
  const organizer = await Organizer.findOne({ email:normalizeEmail}).select('+password');
  if(!organizer){
    throw new Error("Invalid Email");
  }
  const isMatch = await bcrypt.compare(password, organizer.password);
  if(!isMatch){
    throw new Error("Invalid Password");
  }
  const safeOrganizer = {
    id: organizer._id,
    organizerName: organizer.organizerName,
    email: organizer.email,
    userType: 'organizer',
  }
  return {safeOrganizer, organizerDoc: organizer};
}

module.exports = { registerUser, loginUser, loginOrganizer };
