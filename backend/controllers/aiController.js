const domainClassifier = require('../services/domainClassifier');
const ragService = require('../services/ragService');
const aiService = require('../services/aiService');

/**
 * Public Conversational AI Endpoint Handler
 * POST /api/ai/chat
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, conversation_id, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message field is required.'
      });
    }

    const conversationId = conversation_id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userQuery = message.trim();

    // 1. Domain & Safety Classification
    const classification = domainClassifier.classify(userQuery, history);

    if (!classification.isAllowed) {
      return res.status(200).json({
        success: true,
        answer: classification.refusalReason,
        sources: [],
        suggested_actions: [
          { label: 'File Digital FIR', action: 'NAVIGATE', target: '/citizen/register-fir' },
          { label: 'Find Police Station', action: 'NAVIGATE', target: '/admin/locations' }
        ],
        conversation_id: conversationId,
        answer_type: classification.category === 'HARMFUL_CRIMINAL_HELP' ? 'SAFETY_REFUSAL' : 'DOMAIN_REJECTION'
      });
    }

    // 2. Legal Knowledge Retrieval (RAG)
    const ragPassages = ragService.searchLegalKnowledge(userQuery, 4);

    // 3. AI Grounded Response Generation
    const aiResult = await aiService.generateGroundedAnswer({
      userMessage: userQuery,
      history,
      ragPassages,
      language: classification.language
    });

    return res.status(200).json({
      success: true,
      answer: aiResult.answer,
      sources: aiResult.sources || [],
      suggested_actions: aiResult.suggested_actions || [],
      conversation_id: conversationId,
      answer_type: aiResult.answer_type || 'LEGAL_INFORMATION'
    });
  } catch (error) {
    console.error('[AIController] Error handling chat request:', error);
    return res.status(500).json({
      success: false,
      message: 'CrimePilot AI system encountered an internal processing error. Please try again.',
      error: error.message
    });
  }
};
