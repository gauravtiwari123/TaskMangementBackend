const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, mobileNum, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email }, { mobileNum }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, 'secretKey', { expiresIn: '1h' });
    req.session.token = token;
    res.cookie('token', token, { httpOnly: true });

    res.status(200).json({ message: 'Login successful',token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async(req,res) =>{
  try {
    const users = await User.find({ deletedAt: null, isActive:true },{id:1,name:1});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
}

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('token');
    
    res.status(200).json({ message: 'User logged out successfully' });
  });
};
