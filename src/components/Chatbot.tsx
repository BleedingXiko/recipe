import React, { useState, useEffect, useRef } from 'react';
// Remove direct import that might cause issues
// import openRouterApi from '../../netlify/functions/openrouter.js';

interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

interface ChatbotProps {
  recipe: { title: string; content: string };
  apiKey: string; 
}

// Helper function to format text with markdown-like syntax
const formatMessage = (text: string): string => {
  // Bold text
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic text
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Lists
  formattedText = formattedText.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
  formattedText = formattedText.replace(/<li>(.*?)<\/li>/gs, '<ul>$&</ul>');
  
  // Line breaks
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  // Fix duplicate ul tags from multi-line lists
  formattedText = formattedText.replace(/<\/ul>\s*<ul>/g, '');
  
  return formattedText;
};

const Chatbot: React.FC<ChatbotProps> = ({ apiKey, recipe }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const chatButtonRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);

  // Set welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'system',
          content: `You are an expert culinary assistant for the recipe "${recipe.title}". Provide accurate guidance but be concise. Answer simple questions directly without unnecessary explanations. Only provide detailed information when specifically asked. Be friendly and helpful.`
        },
        {
          role: 'assistant',
          content: `Hi! I'm your recipe assistant for "${recipe.title}". Ask me anything about this recipe!`
        }
      ]);
    }
  }, [isOpen, messages.length, recipe.title]);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const newMessage: Message = { content: input, role: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      // Create conversation context with all previous messages except the system message
      const conversationMessages = messages.filter(msg => msg.role !== 'system');
      
      // Add the system message first, then include all conversation history
      const apiMessages = [
        {
          role: 'system',
          content: `You are an expert culinary assistant for "${recipe.title}". 
          
Recipe context:
${recipe.content}

Important guidelines:
1. Be concise - give direct answers to simple questions
2. Provide details ONLY when specifically requested
3. Base all answers strictly on the recipe context
4. For substitutions or modifications, give practical options briefly
5. Avoid lengthy explanations unless the user explicitly asks for them

Match your response length to the complexity of the question. Simple questions deserve simple answers.`
        },
        ...conversationMessages,
        { role: 'user', content: input }
      ];
      
      const response = await fetch('/.netlify/functions/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3-30b-a3b:free',
          messages: apiMessages,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      const botMessage = data.choices?.[0]?.message?.content || 'No response from chatbot.';
      setMessages((prev) => [...prev, { content: botMessage, role: 'assistant' }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { content: 'Error connecting to chatbot. Please try again.', role: 'assistant' },
      ]);
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <div 
        ref={chatButtonRef}
        className="chat-button fixed bottom-6 right-6 w-12 h-12 sm:w-14 sm:h-14 bg-accent rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-colors z-50 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      ref={chatWidgetRef}
      className="chatbot-widget fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95%] sm:w-[90%] max-w-xs sm:max-w-md max-h-[90vh] rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-50"
    >
      <style>{chatbotStyles}</style>
      <div className="chatbot-header p-3 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <h3 className="font-semibold text-base">Recipe Assistant</h3>
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="hover:opacity-80 transition-colors p-1"
          >
            {isMinimized ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="hover:opacity-80 transition-colors p-1"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-[60vh] sm:h-96">
          <div className="chatbot-messages flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-center py-4 text-sm opacity-70">
                Ask any questions about this recipe!
              </div>
            )}
            {messages
              .filter(message => message.role !== 'system')
              .map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg max-w-[90%] text-sm sm:text-base ${
                    message.role === 'user'
                      ? 'ml-auto user-message'
                      : 'assistant-message'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                >
                </div>
              ))}
            {isLoading && (
              <div className="flex justify-center p-2">
                <div className="animate-pulse text-sm opacity-70">Thinking...</div>
              </div>
            )}
          </div>

          <div className="p-3 chatbot-input-container">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                className="chatbot-input flex-1 p-2 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Ask about this recipe..."
                disabled={isLoading}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend();
                }}
                className="px-3 py-2 text-sm sm:text-base rounded-lg transition-colors send-button"
                disabled={isLoading || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

// Add custom CSS style for placeholder and mobile improvements, using theme variables
const chatbotStyles = `
  .chatbot-widget {
    background-color: var(--secondary);
    color: var(--text);
  }
  
  .chatbot-header {
    background-color: var(--primary);
    color: var(--text);
  }
  
  .chatbot-messages {
    background-color: var(--background);
  }
  
  .user-message {
    background-color: var(--accent);
    color: white;
  }
  
  .assistant-message {
    background-color: var(--primary);
    color: var(--text);
  }
  
  .system-message {
    background-color: var(--secondary);
    color: var(--text);
    font-style: italic;
  }
  
  .chatbot-input-container {
    border-top: 1px solid var(--primary);
    background-color: var(--secondary);
  }
  
  .chatbot-input {
    background-color: var(--background);
    color: var(--text);
    border: 1px solid var(--primary);
  }
  
  .chatbot-input::placeholder {
    color: var(--text);
    opacity: 0.6;
  }
  
  .send-button {
    background-color: var(--accent);
    color: white;
  }
  
  .send-button:hover {
    opacity: 0.9;
  }
  
  .send-button:disabled {
    opacity: 0.5;
  }
  
  @media (max-width: 640px) {
    .chatbot-messages::-webkit-scrollbar {
      width: 3px;
    }
    
    .chatbot-messages::-webkit-scrollbar-thumb {
      background-color: var(--accent);
      opacity: 0.5;
      border-radius: 3px;
    }
    
    .chatbot-input {
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }
`;