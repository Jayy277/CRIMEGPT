const express = require('express');
const { handleChat } = require('../controllers/aiController');

const router = express.Router();

// Public Conversational AI Chat Endpoint (No login required for Phase 1 public legal information)
router.post('/chat', handleChat);

module.exports = router;
