const dotenv = require('dotenv');
dotenv.config();

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
    this.modelName = process.env.AI_MODEL || 'gemini-2.0-flash';
  }

  /**
   * Generate conversational grounded response using Gemini API or local Grounded RAG Fallback
   */
  async generateGroundedAnswer({ userMessage, history = [], ragPassages = [], language = 'en' }) {
    const textLower = userMessage.toLowerCase();

    // Check for real-time statistics request
    const isRealTimeStatsQuery = textLower.includes('how many') && (textLower.includes('today') || textLower.includes('happened today') || textLower.includes('statistics') || textLower.includes('stats'));

    if (isRealTimeStatsQuery) {
      const statsResponse = this.generateRealTimeStatsDisclaimer(language);
      return {
        answer: statsResponse,
        sources: [],
        suggested_actions: [
          { label: 'File Digital FIR', action: 'NAVIGATE', target: '/citizen/register-fir' },
          { label: 'Find Police Station', action: 'NAVIGATE', target: '/admin/locations' }
        ],
        answer_type: 'REALTIME_STATS_UNAVAILABLE'
      };
    }

    // 1. Format retrieved legal context
    const contextText = ragPassages.map((p, idx) => {
      return `[Source ${idx + 1}]: ${p.act} - ${p.section || ''} (${p.title}): ${p.description} (Punishment/Procedure: ${p.punishment || 'N/A'})`;
    }).join('\n\n');

    // 2. Prepare sources list
    const sources = ragPassages.map(p => ({
      act: p.act,
      section: p.section,
      title: p.title,
      source_url: p.source_url || 'https://www.mha.gov.in'
    }));

    // 3. Prepare recommended CrimePilot actions based on retrieved topics
    const suggestedActions = this.buildSuggestedActions(userMessage, ragPassages);

    // 4. Try Gemini API if API key is configured
    if (this.apiKey) {
      try {
        const aiAnswer = await this.callGeminiAPI({ userMessage, history, contextText, language });
        if (aiAnswer) {
          return {
            answer: aiAnswer,
            sources,
            suggested_actions: suggestedActions,
            answer_type: 'LEGAL_INFORMATION'
          };
        }
      } catch (err) {
        console.warn('[AIService] Gemini API call failed or key invalid, using Grounded RAG Generator fallback:', err.message);
      }
    }

    // 5. Fallback Grounded Generator (Offline / No Key Mode)
    const fallbackAnswer = this.generateLocalGroundedAnswer(userMessage, ragPassages, language);
    return {
      answer: fallbackAnswer,
      sources,
      suggested_actions: suggestedActions,
      answer_type: 'LEGAL_INFORMATION'
    };
  }

  generateRealTimeStatsDisclaimer(language) {
    if (language === 'hi') {
      return `**लाइव आंकड़े उपलब्ध नहीं हैं (REAL-TIME DATA NOT CONNECTED)**\n\nसार्वजनिक AI सहायक वर्तमान में आज के लाइव या वास्तविक समय के अपराध आंकड़ों से जुड़ा नहीं है।\n\n**महत्वपूर्ण जानकारी:**\n- वास्तविक समय के अपराध आंकड़े और विश्लेषण केवल अधिकृत पुलिस और विश्लेषक डैशबोर्ड (/analyst/dashboard) पर उपलब्ध हैं।\n- यदि आपको किसी हालिया घटना की रिपोर्ट दर्ज करनी है, तो कृपया CrimePilot पर डिजिटल FIR दर्ज करें।\n\n**अस्वीकरण:**\nAI लाइव मामलों के आंकड़े मनगढ़ंत नहीं करता है।`;
    }
    if (language === 'gu') {
      return `**લાઈવ આંકડા ઉપલબ્ધ નથી (REAL-TIME DATA NOT CONNECTED)**\n\nજાહેર AI સહાયક હાલમાં આજના વાસ્તવિક સમયના ગુનાના આંકડા સાથે જોડાયેલ નથી.\n\n**મહત્વપૂર્ણ માહિતી:**\n- વાસ્તવિક સમયના આંકડા માત્ર અધિકૃત પોલીસ અને એનાલિસ્ટ ડેશબોર્ડ (/analyst/dashboard) પર ઉપલબ્ધ છે.\n- જો તમારે નવી ઘટના અંગે ફરિયાદ કરવી હોય, તો કૃપા કરીને CrimePilot પર ડિજિટલ FIR નોંધાવો.\n\n**અસ્વીકાર:**\nAI લાઈવ ગુનાના આંકડા મનસ્વી રીતે બનાવતું નથી.`;
    }
    return `**REAL-TIME STATISTICS NOT CONNECTED**\n\nLive real-time crime statistics for today are not accessible via the public AI assistant.\n\n**IMPORTANT INFORMATION:**\n- Real-time crime metrics, pattern trends, and hotspot counts are strictly restricted to authorized Police and Analyst Portals (/analyst/dashboard).\n- If you need to report a recent incident or file a complaint, please use the CrimePilot Digital FIR Portal.\n\n**DISCLAIMER:**\nCrimePilot AI does not fabricate real-time statistical figures when live data sources are not connected.`;
  }

  /**
   * Call Google Gemini API REST endpoint
   */
  async callGeminiAPI({ userMessage, history, contextText, language }) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const langInstruction = language === 'hi'
      ? 'Respond in clear Hindi (Devanagari script), keeping legal section numbers and Act titles intact.'
      : language === 'gu'
      ? 'Respond in clear Gujarati script, keeping legal section numbers and Act titles intact.'
      : 'Respond in clear English.';

    const systemPrompt = `You are CrimePilot AI, a specialized legal & public safety assistant for Indian criminal law (BNS 2023, BNSS 2023, BSA 2023, IT Act 2000), FIR procedures, and CrimePilot services.
${langInstruction}

RULES:
1. Ground your answer in the provided Verified Legal Context. Do NOT invent fake legal sections, punishments, or real-time crime stats.
2. Structure your answer using headings:
   - QUICK ANSWER
   - LEGAL INFORMATION (Act & Section if verified in context)
   - WHAT YOU CAN DO (Numbered steps)
   - SOURCES
   - DISCLAIMER (General legal information only. Exact consequences depend on facts and law.)
3. Be professional, citizen-friendly, and empathetic.

VERIFIED LEGAL CONTEXT:
${contextText || 'No specific legal section retrieved. Provide general guidance and direct user to official channels.'}`;

    // Format chat history for Gemini API
    const contents = [];
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I am CrimePilot AI. How can I assist you with Indian law or FIR procedures?' }] });

    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText;
  }

  /**
   * Local Grounded RAG Generator fallback when API key is not present or offline
   */
  generateLocalGroundedAnswer(userMessage, ragPassages, language) {
    if (!ragPassages || ragPassages.length === 0) {
      if (language === 'hi') {
        return `**त्वरित उत्तर (QUICK ANSWER)**\nमैं CrimePilot AI हूँ। आपकी क्वेरी के लिए विशिष्ट धारा उपलब्ध नहीं है।\n\n**आप क्या कर सकते हैं (WHAT YOU CAN DO)**\n1. निकटतम पुलिस स्टेशन या डायल 112 पर संपर्क करें।\n2. CrimePilot पोर्टल पर डिजिटल FIR दर्ज करें।\n\n**अस्वीकरण (DISCLAIMER)**\nयह केवल सामान्य कानूनी जानकारी है।`;
      }
      if (language === 'gu') {
        return `**ઝડપી જવાબ (QUICK ANSWER)**\nહું CrimePilot AI છું. તમારી ક્વેરી માટે ચોક્કસ કલમ મળી નથી.\n\n**તમે શું કરી શકો (WHAT YOU CAN DO)**\n1. નજીકના પોલીસ સ્ટેશન અથવા ૧૧૨ નો સંપર્ક કરો.\n2. CrimePilot પોર્ટલ પર FIR નોંધાવો.\n\n**અસ્વીકાર (DISCLAIMER)**\nઆ માત્ર સામાન્ય કાનૂની માહિતી છે.`;
      }
      return `**QUICK ANSWER**\nI'm CrimePilot AI. While I don't have a specific legal section match for this query, I can guide you on standard FIR and police reporting procedures.\n\n**WHAT YOU CAN DO**\n1. Contact your local Police Station or emergency helpline (112 / 1930 for cyber fraud).\n2. Register a complaint or Digital FIR on the CrimePilot portal.\n3. Preserve all receipts, messages, or physical/digital evidence.\n\n**DISCLAIMER**\nGeneral legal information only. Exact procedures depend on applicable law and facts.`;
    }

    const primaryPassage = ragPassages[0];
    const secondaryPassages = ragPassages.slice(1);

    let legalInfoBlock = `**Applicable Act:** ${primaryPassage.act}\n**Relevant Provision:** ${primaryPassage.section} - ${primaryPassage.title}\n**Legal Summary:** ${primaryPassage.description}`;
    if (primaryPassage.punishment && primaryPassage.punishment !== 'N/A') {
      legalInfoBlock += `\n**Punishment / Consequence:** ${primaryPassage.punishment}`;
    }

    if (secondaryPassages.length > 0) {
      legalInfoBlock += `\n\n**Additional Provisions:**\n` + secondaryPassages.map(p => `• ${p.act} ${p.section || ''} (${p.title}): ${p.description}`).join('\n');
    }

    if (language === 'hi') {
      return `**त्वरित उत्तर (QUICK ANSWER)**\n${primaryPassage.title} के संबंध में कानूनी जानकारी निम्नलिखित है:\n\n**कानूनी जानकारी (LEGAL INFORMATION)**\n${legalInfoBlock}\n\n**आप क्या कर सकते हैं (WHAT YOU CAN DO)**\n1. तुरंत निकटतम पुलिस स्टेशन में रिपोर्ट दर्ज कराएं या e-FIR का उपयोग करें।\n2. यदि वित्तीय धोखाधड़ी है, तो तुरंत 1930 पर कॉल करें।\n3. साक्ष्य (स्क्रीनशॉट, दस्तावेज, रसीदें) सुरक्षित रखें।\n\n**अस्वीकरण (DISCLAIMER)**\nयह केवल सामान्य कानूनी जानकारी है। विशिष्ट कानूनी सलाह के लिए विधिक विशेषज्ञ से परामर्श लें।`;
    }

    if (language === 'gu') {
      return `**ઝડપી જવાબ (QUICK ANSWER)**\n${primaryPassage.title} અંગેની કાનૂની વિગતો નીચે મુજબ છે:\n\n**કાનૂની માહિતી (LEGAL INFORMATION)**\n${legalInfoBlock}\n\n**તમે શું કરી શકો (WHAT YOU CAN DO)**\n1. તાત્કાલિક નજીકના પોલીસ સ્ટેશન અથવા e-FIR નો ઉપયોગ કરો.\n2. જો સાયબર ફ્રોડ હોય તો ૧૯૩૦ પર સંપર્ક કરો.\n3. તમામ પુરાવા (સ્ક્રીનશૉટ્સ, રસીદો) સાચવો.\n\n**અસ્વીકાર (DISCLAIMER)**\nઆ માત્ર સામાન્ય કાનૂની માહિતી છે.`;
    }

    return `**QUICK ANSWER**\nI'm sorry you're dealing with this situation. Here is the relevant legal guidance and procedures for your query:\n\n**LEGAL INFORMATION**\n${legalInfoBlock}\n\n**WHAT YOU CAN DO**\n1. Report the matter promptly to your local Police Station or register a Digital FIR on CrimePilot.\n2. If this involves financial/cyber fraud, call the National Cyber Crime Helpline (1930) immediately within the Golden Hour.\n3. Preserve all digital or physical evidence (SMS, CCTV, transaction IDs, photos).\n4. Obtain a copy or reference ID of your complaint for official tracking.\n\n**DISCLAIMER**\nGeneral legal information only. Exact legal consequences and procedures depend on the specific facts and applicable law.`;
  }

  /**
   * Build recommended CrimePilot frontend actions based on context
   */
  buildSuggestedActions(userMessage, ragPassages) {
    const textLower = userMessage.toLowerCase();
    const actions = [];

    if (textLower.includes('fir') || textLower.includes('stolen') || textLower.includes('theft') || textLower.includes('report') || textLower.includes('scam')) {
      actions.push({ label: 'File Digital FIR', action: 'NAVIGATE', target: '/citizen/register-fir' });
    }

    if (textLower.includes('station') || textLower.includes('police') || textLower.includes('where') || textLower.includes('location')) {
      actions.push({ label: 'Find Police Station', action: 'NAVIGATE', target: '/admin/locations' });
    }

    if (textLower.includes('track') || textLower.includes('status') || textLower.includes('case')) {
      actions.push({ label: 'Track FIR Status', action: 'NAVIGATE', target: '/citizen/track-fir' });
    }

    if (actions.length === 0) {
      actions.push({ label: 'File Digital FIR', action: 'NAVIGATE', target: '/citizen/register-fir' });
      actions.push({ label: 'Find Police Station', action: 'NAVIGATE', target: '/admin/locations' });
    }

    return actions;
  }
}

const aiService = new AIService();
module.exports = aiService;
