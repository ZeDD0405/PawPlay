const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const bcrypt = require('bcryptjs');

// Signup (Register) Route
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;
  console.log(req.body)

  // Validation: check all fields
  if (!username || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Validation: check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  // Validation: check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ msg: 'User already exists' });
  }

  // Hash the password and save user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
  });

  try {
    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);


  // Validation: check for email and password
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Send success message and user details
    res.json({ msg: 'Login successful', user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;