const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

const JWT_SECRET = "your_jwt_secret_key";

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded;
    next();
  });
}

// Update Profile Name
router.put('/edit-name', verifyToken, async (req, res) => {
  const { firstName, lastName } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();

    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update Profile Image
router.put('/edit-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profileImage = req.file.path;
    await user.save();

    res.json({ message: "Profile image updated" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
