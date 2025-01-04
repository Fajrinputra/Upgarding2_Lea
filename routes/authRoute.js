const express = require('express');
const { register, Login } = require('../controllers/authController');

const authRouter = express.Router();

authRouter.post('/auth/register', register);
authRouter.post('/auth/login', Login);

module.exports = authRouter;