import React, { useState, useEffect, useRef } from 'react';
import { contentData, categoriesMap } from './data';

// Speech Synthesis Service
const speak = (text, slow = false) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = slow ? 0.5 : 0.9;
  window.speechSynthesis.speak(utterance);
};

function App() {
  const [activeCategory, setActiveCategory] = useState('Básico');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [slowMode, setSlowMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // AI Chat State
  const initialBotMsg = {
    role: 'bot',
    text: 'Hello! Welcome to EnglishFlow.',
    tip: 'Dica do Mentor: Tente dizer "Hello" ou "Hi" para começar a conversa!',
    time: new Date().toLocaleTimeString()
  };
  const [chatMessages, setChatMessages] = useState([initialBotMsg]);
  const chatEndRef = useRef(null);

  // Inactivity Timer State
  const timerRef = useRef(null);

  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setChatMessages([initialBotMsg]);
    }, 60000); // 1 minute
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [chatMessages, activeCategory, searchTerm, isRecording]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
        setIsRecording(false);
      };

      rec.onerror = () => {
        setIsRecording(false);
        setFeedback('Erro ao ouvir. Tente novamente.');
      };

      setRecognition(rec);
    }
  }, [activeCategory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleUserSpeech = (transcript) => {
    resetInactivityTimer();
    if (activeCategory === 'Conversar') {
      const userMsg = { role: 'user', text: transcript, time: new Date().toLocaleTimeString() };
      setChatMessages(prev => [...prev, userMsg]);

      setTimeout(() => {
        const botResponse = getBotResponse(transcript.toLowerCase(), transcript);
        const botMsg = {
          role: 'bot',
          text: botResponse.text,
          tip: botResponse.tip,
          time: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, botMsg]);
        speak(botResponse.text, slowMode);
      }, 1000);
    } else {
      setFeedback(`Você disse: ${transcript}`);
    }
  };

  const getBotResponse = (input, originalText) => {
    // Name Recognition Logic
    if (input.includes('my name is') || input.includes('i am ')) {
      const parts = input.split(/my name is|i am/i);
      if (parts.length > 1) {
        const userName = parts[1].trim().split(' ')[0].replace(/[^a-zA-Z]/g, '');
        if (userName) {
          return {
            text: `Nice to meet you, ${userName.charAt(0).toUpperCase() + userName.slice(1)}! How can I help you today?`,
            tip: `Dica: Você pode me perguntar 'How is the weather?' (Rau is dâ ué-dhêr?)`
          };
        }
      }
    }

    const responses = [
      {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        answers: [
          { text: "Hello! How are you today?", tip: "Dica: Responda 'I am fine' (Ái ém fáin) ou 'I am good' (Ái ém gud)." },
          { text: "Hi! It's nice to see you. How are you doing?", tip: "Dica: Diga 'I am great, thank you' (Ái ém grêit, ténc iú)." }
        ]
      },
      // ... (rest of responses remains same)
      {
        patterns: ['how are you', 'how you doing', 'how about you'],
        answers: [
          { text: "I am doing great, thanks for asking! And you?", tip: "Dica: Responda 'I am fine' (Ái ém fáin) ou 'I am okay' (Ái ém ôu-kêi)." },
          { text: "I'm excellent! Ready to practice more? How are you?", tip: "Dica: Diga 'I am ready' (Ái ém ré-di) e conte como você está." }
        ]
      },
      {
        patterns: ['i am fine', 'i am good', 'i am well', 'im fine', 'im good', 'fine', 'good'],
        answers: [
          { text: "That's wonderful! What would you like to talk about today?", tip: "Dica: Responda 'I want to talk about food' (Ái uónt tu tólc a-báut fud)." },
          { text: "Nice! Do you have any plans for today?", tip: "Dica: Responda 'I am studying English' (Ái ém istã-dy-ing ínglish)." }
        ]
      },
      {
        patterns: ['weather', 'sunny', 'rainy', 'cold', 'hot'],
        answers: [
          { text: "I see! Do you like this weather?", tip: "Dica: Responda 'Yes, I do' (Iés, ái dú) ou 'No, I don't' (Nôu, ái dôunt)." },
          { text: "The weather is always a good topic! What's your favorite season?", tip: "Dica: Responda 'I like summer' (Ái láic sã-mêr) ou 'I like winter' (Ái láic uín-têr)." }
        ]
      },
      {
        patterns: ['food', 'hungry', 'eat', 'dinner', 'lunch', 'breakfast'],
        answers: [
          { text: "Yummy! What is your favorite food?", tip: "Dica: Responda 'My favorite food is pizza' (Mái fêi-vo-rit fud is pí-tzâ)." },
          { text: "I love talking about food! Do you like to cook?", tip: "Dica: Responda 'Yes, I like to cook' (Iés, ái láic tu cúc)." }
        ]
      },
      {
        patterns: ['travel', 'trip', 'place', 'visit', 'country'],
        answers: [
          { text: "Traveling is so much fun! Where would you like to go?", tip: "Dica: Responda 'I want to go to the beach' (Ái uónt tu góu tu dâ bítch)." },
          { text: "I love new places! Have you ever been to another country?", tip: "Dica: Responda 'Yes, I have' (Iés, ái rév) ou 'No, I haven't' (Nôu, ái rê-vent)." }
        ]
      },
      {
        patterns: ['name'],
        answers: [
          { text: "My name is EnglishFlow AI. What is your name?", tip: "Dica: Responda 'My name is...' (Mái nêim is...) e diga seu nome." }
        ]
      },
      {
        patterns: ['thank', 'thanks'],
        answers: [
          { text: "You are very welcome! What else is on your mind?", tip: "Dica: Responda 'I want to speak more' (Ái uónt tu spíc mór)." },
          { text: "My pleasure! Are you enjoying our conversation?", tip: "Dica: Responda 'Yes, I am' (Iés, ái ém)." }
        ]
      }
    ];

    for (const group of responses) {
      if (group.patterns.some(p => input.includes(p))) {
        const randomIndex = Math.floor(Math.random() * group.answers.length);
        return group.answers[randomIndex];
      }
    }

    // Dynamic Suggestion Fallback
    const suggestions = [
      `I'm not sure I understood "${originalText}". Did you mean "How are you?"`,
      `I didn't catch that. Try saying "Tell me about food" or "What is your name?"`,
      `Sorry, I'm still learning! You can try asking "How is the weather?" or just say "Hi".`
    ];
    const tips = [
      "Dica: Responda 'How are you?' (Rau ár iú?)",
      "Dica: Responda 'My name is...' (Mái nêim is...)",
      "Dica: Tente dizer 'Hello' (Rêlou) para recomeçar!"
    ];

    const idx = Math.floor(Math.random() * suggestions.length);
    return {
      text: suggestions[idx],
      tip: tips[idx]
    };
  };

  const startListening = () => {
    resetInactivityTimer();
    if (recognition) {
      setIsRecording(true);
      setFeedback('Ouvindo...');
      recognition.start();
    } else {
      setFeedback('Reconhecimento de voz não suportado.');
    }
  };

  const filteredData = activeCategory !== 'Conversar' ? contentData[activeCategory].filter(item =>
    item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.translation.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="container" style={{ paddingBottom: '140px' }}>
      <header>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.2rem', fontSize: '2.5rem' }}>EnglishFlow</h1>
        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>Aprenda inglês por som - Conversa Infinita com IA</p>

        {activeCategory !== 'Conversar' && (
          <div style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
            <input
              type="text"
              placeholder="🔍 Buscar palavra ou frase..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                resetInactivityTimer();
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '25px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--surface)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
        )}
      </header>

      <div className="category-tabs">
        {Object.keys(categoriesMap).map(cat => (
          <div
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat);
              setSearchTerm('');
              resetInactivityTimer();
            }}
          >
            {categoriesMap[cat]}
          </div>
        ))}
      </div>

      {activeCategory === 'Conversar' ? (
        <div className="chat-container">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              <div className="chat-text">{msg.text}</div>
              {msg.tip && <div className="mentor-tip">{msg.tip}</div>}
              <div className="chat-time">{msg.time}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      ) : (
        <div className="card-grid">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="visual-card"
              onClick={() => {
                speak(item.english, slowMode);
                resetInactivityTimer();
              }}
            >
              <div className="label">{item.english}</div>
              <div className="phonetic">{item.phonetic}</div>
              <div className="translation">{item.translation}</div>
            </div>
          ))}
        </div>
      )}

      <div className="action-bar">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '0.7rem', opacity: 0.7 }}>MODO LENTO</label>
          <button
            className={`btn-circle secondary ${slowMode ? 'active-slow' : ''}`}
            onClick={() => {
              setSlowMode(!slowMode);
              resetInactivityTimer();
            }}
          >
            {slowMode ? '🐢' : '🐇'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            className={`btn-circle ${isRecording ? 'recording' : ''}`}
            onClick={startListening}
          >
            {isRecording ? '⏺️' : '🎤'}
          </button>
          <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
            {activeCategory === 'Conversar' ? 'Fale com a IA' : (feedback || 'Pratique sua fala')}
          </span>
        </div>
      </div>

      <footer style={{
        marginTop: '3rem',
        padding: '2rem',
        textAlign: 'center',
        opacity: 0.5,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: '0.9rem'
      }}>
        <p>Desenvolvido por <strong>Marino Maikon</strong></p>
        <p>&copy; {new Date().getFullYear()} EnglishFlow AI - Todos os direitos reservados</p>
      </footer>

      <style>{`
        .chat-container {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          height: 60vh;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          padding: 30px;
          maxWidth: 900px; /* Increased width */
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          overflow-y: auto;
          text-align: left;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }
        .chat-bubble {
          padding: 16px 24px;
          border-radius: 25px;
          margin-bottom: 25px;
          max-width: 75%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          position: relative;
          line-height: 1.5;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-bubble.user {
          align-self: flex-end;
          background: linear-gradient(135deg, var(--primary), #9c4dcc);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.bot {
          align-self: flex-start;
          background: #252525;
          color: white;
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .chat-text {
          font-size: 1.2rem;
          font-weight: 500;
        }
        .mentor-tip {
          background: rgba(3, 218, 198, 0.12);
          color: #03dac6;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          margin-top: 15px;
          border-left: 5px solid var(--secondary);
          font-style: italic;
          box-shadow: inset 0 0 10px rgba(0,255,255,0.05);
        }
        .chat-time {
          font-size: 0.7rem;
          opacity: 0.4;
          margin-top: 10px;
          text-align: right;
        }
        .visual-card {
          min-height: 100px;
          justify-content: center;
          background: var(--surface);
          border-radius: 20px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .visual-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }
        .search-input:focus { border-color: var(--primary) !important; box-shadow: 0 0 10px rgba(187, 134, 252, 0.2); }
        .active-slow { box-shadow: 0 0 15px var(--secondary); }
        .chat-container::-webkit-scrollbar { width: 6px; }
        .chat-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default App;
