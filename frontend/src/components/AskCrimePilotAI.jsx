import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const AskCrimePilotAI = () => {
  const navigate = useNavigate();

  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello, I'm CrimePilot AI.\n\nI can help you understand Indian criminal law, FIR procedures, cybercrime, public safety and CrimePilot services.\n\nHow can I assist you today?",
      sources: [],
      suggested_actions: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const quickQuestions = [
    'How do I file an FIR?',
    'Report Cybercrime',
    'What should I do after vehicle theft?',
    'Explain BNS',
    'Find Police Station'
  ];

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query || !query.trim() || loading) return;

    const userText = query.trim();
    setInput('');
    setError(null);

    // Append user message
    const updatedMessages = [
      ...messages,
      { sender: 'user', text: userText }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Build history payload for multi-turn context
      const historyPayload = updatedMessages
        .filter(m => m.sender === 'user' || m.sender === 'ai')
        .map(m => ({ sender: m.sender, text: m.text }));

      const res = await axiosInstance.post('/ai/chat', {
        message: userText,
        conversation_id: conversationId,
        history: historyPayload
      });

      if (res.data && res.data.success) {
        if (res.data.conversation_id) {
          setConversationId(res.data.conversation_id);
        }

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.answer,
            sources: res.data.sources || [],
            suggested_actions: res.data.suggested_actions || [],
            answer_type: res.data.answer_type
          }
        ]);
      } else {
        setError(res.data?.message || 'Failed to receive response from CrimePilot AI.');
      }
    } catch (err) {
      console.error('Error communicating with CrimePilot AI:', err);
      setError('Connection timeout or network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setConversationId('');
    setMessages([
      {
        sender: 'ai',
        text: "Hello, I'm CrimePilot AI.\n\nI can help you understand Indian criminal law, FIR procedures, cybercrime, public safety and CrimePilot services.\n\nHow can I assist you today?",
        sources: [],
        suggested_actions: []
      }
    ]);
    setError(null);
  };

  // Simple Markdown & Line formatting helper
  const renderMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {lines.map((line, idx) => {
          let lineContent = line;

          // Bold formatting **text**
          const parts = lineContent.split(/(\*\*.*?\*\*)/g);
          const formattedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} style={{ color: '#00D9FF' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          // Section Header line check
          if (line.startsWith('**') && line.endsWith('**') && line.length < 50) {
            return (
              <h4 key={idx} style={{ color: '#00D9FF', margin: '8px 0 2px 0', fontSize: '13px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
                {line.replace(/\*\*/g, '')}
              </h4>
            );
          }

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} style={{ paddingLeft: '12px', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#00D9FF' }}>•</span>
                <span>{formattedParts}</span>
              </div>
            );
          }

          if (/^\d+\./.test(line.trim())) {
            return (
              <div key={idx} style={{ paddingLeft: '12px', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#00D9FF', fontWeight: 'bold' }}>{line.trim().split('.')[0]}.</span>
                <span>{formattedParts}</span>
              </div>
            );
          }

          return <div key={idx}>{formattedParts}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      background: '#0B1220',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: '480px'
    }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 217, 255, 0.15)',
        paddingBottom: '16px'
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em' }}>
              CRIMEPILOT AI
            </h3>
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              ● AI ONLINE
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#9AA4B2', margin: '4px 0 0 0' }}>
            Crime & Indian Criminal Law Assistant (BNS, BNSS, BSA & FIR Guidance)
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          title="Reset Conversation"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#9AA4B2',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9AA4B2'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          🔄 New Chat
        </button>
      </div>

      {/* Messages Stream Container */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          maxHeight: '380px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          paddingRight: '8px'
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: msg.sender === 'user' ? '#00D9FF' : '#94a3b8' }}>
                {msg.sender === 'user' ? 'You' : 'CrimePilot AI'}
              </span>
            </div>

            <div style={{
              backgroundColor: msg.sender === 'user' ? 'rgba(0, 217, 255, 0.08)' : '#121B2D',
              border: `1px solid ${msg.sender === 'user' ? 'rgba(0, 217, 255, 0.4)' : 'rgba(0, 217, 255, 0.15)'}`,
              borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              padding: '14px 16px',
              color: '#e2e8f0',
              fontSize: '13px',
              textAlign: 'left',
              lineHeight: '1.5'
            }}>
              {renderMessageContent(msg.text)}

              {/* Source badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(0, 217, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', letterSpacing: '0.05em' }}>VERIFIED SOURCES:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {msg.sources.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '10px',
                          color: '#00D9FF',
                          background: 'rgba(0, 217, 255, 0.05)',
                          border: '1px solid rgba(0, 217, 255, 0.2)',
                          borderRadius: '4px',
                          padding: '2px 6px'
                        }}
                      >
                        ⚖️ {src.act} {src.section ? `(${src.section})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action Buttons */}
              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {msg.suggested_actions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      type="button"
                      onClick={() => navigate(act.target)}
                      style={{
                        backgroundColor: '#00D9FF',
                        color: '#0B1220',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'transform 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      <span>➔</span> {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px' }}>
            <div style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(0, 217, 255, 0.2)',
              borderLeftColor: '#00D9FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '12px', color: '#9AA4B2', fontStyle: 'italic' }}>
              CrimePilot AI is searching legal knowledge base & generating response...
            </span>
          </div>
        )}

        {error && (
          <div style={{
            alignSelf: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              style={{ background: 'none', border: 'underline', color: '#FFF', cursor: 'pointer', fontSize: '11px' }}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(0, 217, 255, 0.1)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold' }}>SUGGESTED QUESTIONS:</span>
          {quickQuestions.map((qText, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => handleSendMessage(qText)}
              disabled={loading}
              style={{
                background: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                color: '#FFF',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)'; }}
            >
              {qText}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Ask about crime, law, FIR or public safety..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: '#121B2D',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#FFF',
              outline: 'none',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: loading || !input.trim() ? '#1e293b' : '#00D9FF',
              color: loading || !input.trim() ? '#64748b' : '#0B1220',
              fontWeight: 'bold',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'ANALYZING...' : 'SEND'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default AskCrimePilotAI;
