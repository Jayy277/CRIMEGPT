class DomainClassifier {
  constructor() {
    // Keywords for domain recognition (English, Hindi, Gujarati, Hinglish)
    this.validDomainKeywords = [
      'fir', 'crime', 'law', 'police', 'station', 'stolen', 'theft', 'steal', 'stole', 'robbery',
      'scam', 'fraud', 'cyber', 'online fraud', 'bns', 'bnss', 'bsa', 'ipc', 'crpc', 'it act',
      'threat', 'threatening', 'extortion', 'blackmail', 'assault', 'fight', 'beaten',
      'kidnapping', 'abduction', 'murder', 'stalking', 'harassment', 'hacked', 'password',
      'bail', 'arrest', 'warrant', 'court', 'evidence', 'cctv', 'statement', 'complaint',
      'cybercrime', '1930', 'helpline', 'safety', 'victim', 'suspect', 'crimepilot',
      'phone', 'mobile', 'bike', 'car', 'vehicle', 'money', 'bank', 'card', 'atm',
      // Hindi / Hinglish keywords
      'chori', 'dhokhadhadi', 'shikayat', 'thana', 'chori thai', 'police station',
      'mera', 'meri', 'kya karun', 'kya karna', 'chahiye', 'chori ho gaya', 'phone chori',
      'चोरी', 'पुलिस', 'शिकायत', 'थाना', 'फोन', 'मोबाइल', 'धोखाधड़ी', 'क्या करें', 'एफआईआर', 'सुरक्षा', 'साइबर', 'रुपये',
      // Gujarati keywords
      'ચોરી', 'પોલીસ', 'ફરિયાદ', 'સાયબર', 'ધમકી', 'ગૂનો', 'ફોન', 'મોબાઈલ', 'હવે શું કરવું', 'ચોરાઈ', 'ચોરાઇ', 'પૈસા', 'બાઇક'
    ];

    // Harmful / Evasion indicators
    this.harmfulKeywords = [
      'how to steal without getting caught',
      'how to evade police',
      'how to hide evidence',
      'how to destroy evidence',
      'how to commit crime',
      'how to hack bank account',
      'help me rob',
      'avoid getting caught',
      'avoid getting caught after theft',
      'how can i avoid getting caught'
    ];

    // Clear off-topic indicators (programming, cooking, sports, general knowledge outside law)
    this.offTopicKeywords = [
      'bubble sort', 'java', 'python code', 'algorithm', 'write code', 'recipe',
      'cake', 'pizza', 'cricket score', 'movie review', 'capital of france', 'translate this text to french',
      'solve quadratic equation', 'reactjs tutorial'
    ];
  }

  /**
   * Detect language: 'hi' (Hindi), 'gu' (Gujarati), or 'en' (English)
   */
  detectLanguage(text) {
    // Gujarati Unicode range: 0A80–0AFF
    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    if (gujaratiRegex.test(text)) {
      return 'gu';
    }

    // Devanagari (Hindi) Unicode range: 0900–097F
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
      return 'hi';
    }

    // Hinglish indicators
    const hinglishWords = ['kya', 'karna', 'chahiye', 'mera', 'meri', 'ho', 'gaya', 'hai', 'kaise', 'karun', 'chori'];
    const textLower = text.toLowerCase();
    const tokenCount = textLower.split(/\s+/).filter(w => hinglishWords.includes(w)).length;
    if (tokenCount >= 2) {
      return 'hi';
    }

    return 'en';
  }

  /**
   * Classify user query intent and domain safety
   * @param {string} text 
   * @param {Array} history 
   * @returns {Object} { category, isAllowed, language, refusalReason }
   */
  classify(text, history = []) {
    const textLower = (text || '').toLowerCase().trim();
    const language = this.detectLanguage(text);

    // 1. Check for harmful / evasion intent FIRST
    for (const kw of this.harmfulKeywords) {
      if (textLower.includes(kw)) {
        return {
          category: 'HARMFUL_CRIMINAL_HELP',
          isAllowed: false,
          language,
          refusalReason: 'I cannot provide assistance or instructions for committing crimes, evading law enforcement, or destroying evidence. If you need legal reporting advice, I can explain standard legal procedures.'
        };
      }
    }

    // 2. Check for explicit off-topic programming/general queries
    for (const kw of this.offTopicKeywords) {
      if (textLower.includes(kw)) {
        return {
          category: 'OFF_TOPIC',
          isAllowed: false,
          language,
          refusalReason: "I'm CrimePilot AI, specialized in crime, Indian criminal law, FIR procedures, public safety and CrimePilot services. Please ask me a question related to these areas."
        };
      }
    }

    // 3. Check for valid domain match (or context match if history exists)
    let isDomainMatch = false;
    for (const kw of this.validDomainKeywords) {
      if (textLower.includes(kw)) {
        isDomainMatch = true;
        break;
      }
    }

    // 4. Contextual follow-up check: If user asks "What punishment may apply?" or "Explain in simple English", check history!
    if (!isDomainMatch && history && history.length > 0) {
      const followUpPhrases = ['punishment', 'law', 'section', 'explain', 'simple', 'what else', 'how long', 'jail', 'fine', 'mean', 'clarify', 'more info', 'punishment may apply'];
      const isFollowUp = followUpPhrases.some(p => textLower.includes(p));
      if (isFollowUp) {
        isDomainMatch = true;
      }
    }

    // 5. Contextual implicit situational queries
    const situationalPhrases = ['publish my', 'private photos', 'threaten', 'broke my', 'stole my', 'lost my', 'scammed me', 'took my', 'attacked me', 'happened today'];
    if (!isDomainMatch && situationalPhrases.some(p => textLower.includes(p))) {
      isDomainMatch = true;
    }

    if (!isDomainMatch) {
      // General off-topic response for unrecognized domains
      return {
        category: 'OFF_TOPIC',
        isAllowed: false,
        language,
        refusalReason: "I'm CrimePilot AI, specialized in crime, Indian criminal law, FIR procedures, public safety and CrimePilot services. Please ask me a question related to these areas."
      };
    }

    return {
      category: 'VALID_CRIMEPILOT_QUERY',
      isAllowed: true,
      language,
      refusalReason: null
    };
  }
}

const domainClassifier = new DomainClassifier();
module.exports = domainClassifier;
