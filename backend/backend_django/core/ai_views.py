import os
import json
import re
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

class AIChatView(APIView):
    permission_classes = []  # Public access for Phase 1

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.knowledge_base = []
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        try:
            # Look for knowledge directory in backend/knowledge
            base_dir = getattr(settings, 'BASE_DIR', os.path.dirname(os.path.dirname(__file__)))
            knowledge_dir = os.path.abspath(os.path.join(base_dir, '..', 'knowledge'))
            
            if not os.path.exists(knowledge_dir):
                knowledge_dir = os.path.abspath(os.path.join(base_dir, 'knowledge'))

            if os.path.exists(knowledge_dir):
                for fname in os.listdir(knowledge_dir):
                    if fname.endswith('.json'):
                        fpath = os.path.join(knowledge_dir, fname)
                        with open(fpath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                self.knowledge_base.extend(data)
        except Exception as e:
            print(f"[Django AIChatView] Knowledge base load error: {e}")

    def _detect_language(self, text):
        # Gujarati range
        if re.search(r'[\u0A80-\u0AFF]', text):
            return 'gu'
        # Hindi Devanagari range
        if re.search(r'[\u0900-\u097F]', text):
            return 'hi'
        # Hinglish check
        hinglish_words = {'kya', 'karna', 'chahiye', 'mera', 'meri', 'ho', 'gaya', 'hai', 'kaise', 'karun', 'chori'}
        tokens = set(text.lower().split())
        if len(tokens.intersection(hinglish_words)) >= 2:
            return 'hi'
        return 'en'

    def _classify_query(self, text, history):
        text_lower = text.lower().strip()
        lang = self._detect_language(text)

        # Harmful keywords
        harmful_kw = [
          'how to steal without getting caught', 'how to evade police', 'how to hide evidence',
          'how to destroy evidence', 'how to commit crime', 'how to hack bank account',
          'avoid getting caught', 'avoid getting caught after theft'
        ]
        for kw in harmful_kw:
            if kw in text_lower:
                return {
                    'category': 'HARMFUL_CRIMINAL_HELP',
                    'is_allowed': False,
                    'language': lang,
                    'reason': 'I cannot provide assistance or instructions for committing crimes, evading law enforcement, or destroying evidence. If you need legal reporting advice, I can explain standard legal procedures.'
                }

        # Off topic keywords
        off_topic_kw = [
          'bubble sort', 'java', 'python code', 'algorithm', 'write code', 'recipe',
          'cake', 'pizza', 'cricket score', 'movie review', 'capital of france', 'reactjs'
        ]
        for kw in off_topic_kw:
            if kw in text_lower:
                return {
                    'category': 'OFF_TOPIC',
                    'is_allowed': False,
                    'language': lang,
                    'reason': "I'm CrimePilot AI, specialized in crime, Indian criminal law, FIR procedures, public safety and CrimePilot services. Please ask me a question related to these areas."
                }

        # Valid domain keywords
        valid_kw = [
          'fir', 'crime', 'law', 'police', 'station', 'stolen', 'theft', 'steal', 'stole', 'robbery',
          'scam', 'fraud', 'cyber', 'bns', 'bnss', 'bsa', 'ipc', 'crpc', 'it act', 'threat', 'extortion',
          'blackmail', 'assault', 'kidnapping', 'murder', 'stalking', 'harassment', 'hacked', 'bail',
          'arrest', 'warrant', 'evidence', 'cctv', 'statement', 'complaint', 'cybercrime', '1930', 'safety',
          'chori', 'dhokhadhadi', 'shikayat', 'thana', 'phone', 'mobile', 'bike', 'car', 'vehicle',
          'चोरी', 'पुलिस', 'शिकायत', 'थाना', 'फोन', 'मोबाइल', 'धोखाधड़ी', 'क्या करें', 'एफआईआर',
          'ચોરી', 'પોલીસ', 'ફરિયાદ', 'સાયબર', 'ધમકી', 'ગૂનો', 'ફોન', 'મોબાઈલ', 'હવે શું કરવું'
        ]
        if any(kw in text_lower for kw in valid_kw):
            return {'category': 'VALID_CRIMEPILOT_QUERY', 'is_allowed': True, 'language': lang, 'reason': None}

        # Contextual check
        if history and len(history) > 0:
            follow_ups = ['punishment', 'law', 'section', 'explain', 'simple', 'what else', 'jail', 'fine']
            if any(f in text_lower for f in follow_ups):
                return {'category': 'VALID_CRIMEPILOT_QUERY', 'is_allowed': True, 'language': lang, 'reason': None}

        situational = ['publish my', 'private photos', 'threaten', 'broke my', 'stole my', 'lost my', 'scammed me', 'happened today']
        if any(s in text_lower for s in situational):
            return {'category': 'VALID_CRIMEPILOT_QUERY', 'is_allowed': True, 'language': lang, 'reason': None}

        return {
            'category': 'OFF_TOPIC',
            'is_allowed': False,
            'language': lang,
            'reason': "I'm CrimePilot AI, specialized in crime, Indian criminal law, FIR procedures, public safety and CrimePilot services. Please ask me a question related to these areas."
        }

    def _search_rag(self, query, top_k=4):
        query_lower = query.lower().strip()
        tokens = [t for t in query_lower.split() if len(t) > 2]
        scored = []

        for item in self.knowledge_base:
            score = 0
            sec = item.get('section', '').lower()
            act = item.get('act', '').lower()
            title = item.get('title', '').lower()
            desc = item.get('description', '').lower()
            keywords = [k.lower() for k in item.get('keywords', [])]

            if sec and sec in query_lower:
                score += 50
            if act and act in query_lower:
                score += 20

            for kw in keywords:
                if kw in query_lower:
                    score += 30
                else:
                    for tok in tokens:
                        if tok in kw:
                            score += 10

            for tok in tokens:
                if tok in title:
                    score += 15
                if tok in desc:
                    score += 5

            if score > 0:
                scored.append({**item, 'score': score})

        scored.sort(key=lambda x: x['score'], reverse=True)
        return scored[:top_k]

    def _build_suggested_actions(self, text):
        text_lower = text.lower()
        actions = []
        if any(w in text_lower for w in ['fir', 'stolen', 'theft', 'report', 'scam']):
            actions.append({'label': 'File Digital FIR', 'action': 'NAVIGATE', 'target': '/citizen/register-fir'})
        if any(w in text_lower for w in ['station', 'police', 'where', 'location']):
            actions.append({'label': 'Find Police Station', 'action': 'NAVIGATE', 'target': '/admin/locations'})
        if any(w in text_lower for w in ['track', 'status', 'case']):
            actions.append({'label': 'Track FIR Status', 'action': 'NAVIGATE', 'target': '/citizen/track-fir'})

        if not actions:
            actions = [
                {'label': 'File Digital FIR', 'action': 'NAVIGATE', 'target': '/citizen/register-fir'},
                {'label': 'Find Police Station', 'action': 'NAVIGATE', 'target': '/admin/locations'}
            ]
        return actions

    def post(self, request):
        message = request.data.get('message', '')
        conversation_id = request.data.get('conversation_id') or f"conv_{int(os.times().user * 1000)}_{random.randint(100, 999)}"
        history = request.data.get('history', [])

        if not message or not str(message).strip():
            return Response({'success': False, 'message': 'Message field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user_query = str(message).strip()
        classification = self._classify_query(user_query, history)

        if not classification['is_allowed']:
            return Response({
                'success': True,
                'answer': classification['reason'],
                'sources': [],
                'suggested_actions': [
                    {'label': 'File Digital FIR', 'action': 'NAVIGATE', 'target': '/citizen/register-fir'},
                    {'label': 'Find Police Station', 'action': 'NAVIGATE', 'target': '/admin/locations'}
                ],
                'conversation_id': conversation_id,
                'answer_type': 'SAFETY_REFUSAL' if classification['category'] == 'HARMFUL_CRIMINAL_HELP' else 'DOMAIN_REJECTION'
            })

        # Check real-time stats query
        text_lower = user_query.lower()
        if 'how many' in text_lower and ('today' in text_lower or 'statistics' in text_lower or 'stats' in text_lower):
            answer_text = (
                "**REAL-TIME STATISTICS NOT CONNECTED**\n\n"
                "Live real-time crime statistics for today are not accessible via the public AI assistant.\n\n"
                "**IMPORTANT INFORMATION:**\n"
                "- Real-time crime metrics, pattern trends, and hotspot counts are strictly restricted to authorized Police and Analyst Portals (/analyst/dashboard).\n"
                "- If you need to report a recent incident or file a complaint, please use the CrimePilot Digital FIR Portal.\n\n"
                "**DISCLAIMER:**\nCrimePilot AI does not fabricate real-time statistical figures when live data sources are not connected."
            )
            return Response({
                'success': True,
                'answer': answer_text,
                'sources': [],
                'suggested_actions': self._build_suggested_actions(user_query),
                'conversation_id': conversation_id,
                'answer_type': 'REALTIME_STATS_UNAVAILABLE'
            })

        # Grounded RAG search
        rag_passages = self._search_rag(user_query, top_k=4)
        lang = classification['language']
        sources = [{'act': p['act'], 'section': p.get('section'), 'title': p['title'], 'source_url': p.get('source_url', 'https://www.mha.gov.in')} for p in rag_passages]

        if not rag_passages:
            if lang == 'hi':
                answer_text = "**त्वरित उत्तर (QUICK ANSWER)**\nमैं CrimePilot AI हूँ। आपकी क्वेरी के लिए विशिष्ट धारा उपलब्ध नहीं है।\n\n**आप क्या कर सकते हैं (WHAT YOU CAN DO)**\n1. निकटतम पुलिस स्टेशन या डायल 112 पर संपर्क करें।\n2. CrimePilot पोर्टल पर डिजिटल FIR दर्ज करें।\n\n**अस्वीकरण (DISCLAIMER)**\nयह केवल सामान्य कानूनी जानकारी है।"
            elif lang == 'gu':
                answer_text = "**ઝડપી જવાબ (QUICK ANSWER)**\nહું CrimePilot AI છું. તમારી ક્વેરી માટે ચોક્કસ કલમ મળી નથી.\n\n**તમે શું કરી શકો (WHAT YOU CAN DO)**\n1. નજીકના પોલીસ સ્ટેશન અથવા ૧૧૨ નો સંપર્ક કરો.\n2. CrimePilot પોર્ટલ પર FIR નોંધાવો.\n\n**અસ્વીકાર (DISCLAIMER)**\nઆ માત્ર સામાન્ય કાનૂની માહિતી છે."
            else:
                answer_text = "**QUICK ANSWER**\nI'm CrimePilot AI. While I don't have a specific legal section match for this query, I can guide you on standard FIR and police reporting procedures.\n\n**WHAT YOU CAN DO**\n1. Contact your local Police Station or emergency helpline (112 / 1930 for cyber fraud).\n2. Register a complaint or Digital FIR on the CrimePilot portal.\n3. Preserve all receipts, messages, or physical/digital evidence.\n\n**DISCLAIMER**\nGeneral legal information only. Exact procedures depend on applicable law and facts."
        else:
            p0 = rag_passages[0]
            sec_info = f"**Applicable Act:** {p0['act']}\n**Relevant Provision:** {p0.get('section', '')} - {p0['title']}\n**Legal Summary:** {p0['description']}"
            if p0.get('punishment') and p0['punishment'] != 'N/A':
                sec_info += f"\n**Punishment / Consequence:** {p0['punishment']}"

            if len(rag_passages) > 1:
                sec_info += "\n\n**Additional Provisions:**\n" + "\n".join([f"• {p['act']} {p.get('section', '')} ({p['title']}): {p['description']}" for p in rag_passages[1:]])

            if lang == 'hi':
                answer_text = f"**त्वरित उत्तर (QUICK ANSWER)**\n{p0['title']} के संबंध में कानूनी जानकारी निम्नलिखित है:\n\n**कानूनी जानकारी (LEGAL INFORMATION)**\n{sec_info}\n\n**आप क्या कर सकते हैं (WHAT YOU CAN DO)**\n1. तुरंत निकटतम पुलिस स्टेशन में रिपोर्ट दर्ज कराएं या e-FIR का उपयोग करें।\n2. यदि वित्तीय धोखाधड़ी है, तो तुरंत 1930 पर कॉल करें।\n3. साक्ष्य (स्क्रीनशॉट, दस्तावेज, रसीदें) सुरक्षित रखें।\n\n**अस्वीकरण (DISCLAIMER)**\nयह केवल सामान्य कानूनी जानकारी है।"
            elif lang == 'gu':
                answer_text = f"**ઝડપી જવાબ (QUICK ANSWER)**\n{p0['title']} અંગેની કાનૂની વિગતો નીચે મુજબ છે:\n\n**કાનૂની માહિતી (LEGAL INFORMATION)**\n{sec_info}\n\n**તમે શું કરી શકો (WHAT YOU CAN DO)**\n1. તાત્કાલિક નજીકના પોલીસ સ્ટેશન અથવા e-FIR નો ઉપયોગ કરો.\n2. જો સાયબર ફ્રોડ હોય તો ૧૯૩૦ પર સંપર્ક કરો.\n3. તમામ પુરાવા (સ્ક્રીનશૉટ્સ, રસીદો) સાચવો.\n\n**અસ્વીકાર (DISCLAIMER)**\nઆ માત્ર સામાન્ય કાનૂની માહિતી છે."
            else:
                answer_text = f"**QUICK ANSWER**\nI'm sorry you're dealing with this situation. Here is the relevant legal guidance and procedures for your query:\n\n**LEGAL INFORMATION**\n{sec_info}\n\n**WHAT YOU CAN DO**\n1. Report the matter promptly to your local Police Station or register a Digital FIR on CrimePilot.\n2. If this involves financial/cyber fraud, call the National Cyber Crime Helpline (1930) immediately within the Golden Hour.\n3. Preserve all digital or physical evidence (SMS, CCTV, transaction IDs, photos).\n4. Obtain a copy or reference ID of your complaint for official tracking.\n\n**DISCLAIMER**\nGeneral legal information only. Exact legal consequences and procedures depend on the specific facts and applicable law."

        return Response({
            'success': True,
            'answer': answer_text,
            'sources': sources,
            'suggested_actions': self._build_suggested_actions(user_query),
            'conversation_id': conversation_id,
            'answer_type': 'LEGAL_INFORMATION'
        })
