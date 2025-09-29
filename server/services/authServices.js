const {User, Organiser} = require('../models/userModel');
const bcrypt = require('bcrypt');

async function registerUser(userName, email, password, userType = 'user') {
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
  else{
    user = new Organiser({ userName, email, password: hashedPassword });
  }
  await user.save();
  
  return { id: user._id, userName: user.userName || user.organiserName, email: user.email, userType };
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

async function loginOrganiser(email, password){
  const normalizeEmail = String(email).trim().toLowerCase();
  const organiser = await Organiser.findOne({ email:normalizeEmail}).select('+password');
  if(!organiser){
    throw new Error("Invalid Email");
  }
  const isMatch = await bcrypt.compare(password, organiser.password);
  if(!isMatch){
    throw new Error("Invalid Password");
  }
  const safeOrganiser = {
    id: organiser._id,
    organiserName: organiser.organiserName,
    email: organiser.email,
    userType: 'organiser',
  }
  return {safeOrganiser, organiserDoc: organiser};
}

module.exports = { registerUser, loginUser, loginOrganiser };
