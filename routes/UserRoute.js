const express = require('express');
const { createUser, loginUser,getUsers, logoutUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', createUser);
router.get('/users', authMiddleware, getUsers);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;
