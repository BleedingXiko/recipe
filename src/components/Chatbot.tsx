import React, { useState, useEffect } from 'react';
import openRouterApi from '../../netlify/functions/openrouter.js';

interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

interface ChatbotProps {
  recipe: { title: string; content: string };
  apiKey: string; 
}

const Chatbot: React.FC<ChatbotProps> = ({ apiKey, recipe }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Set welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'system',
          content: `You are a helpful recipe assistant for the recipe "${recipe.title}". Use the provided recipe details to answer questions accurately.`
        },
        {
          role: 'assistant',
          content: `Hi there! I'm your recipe assistant for "${recipe.title}". Ask me any questions about ingredients, substitutions, or cooking steps!`
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
          content: `You are a helpful recipe assistant for "${recipe.title}". Here is the recipe context:
          ${recipe.content}
          
          Answer the user's questions about this recipe using the provided context.`
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
          model: 'google/gemini-2.0-flash-exp:free',
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
        { content: 'Error connecting to chatbot. Please try again.', role: 'system' },
      ]);
    }
    setIsLoading(false);
  };
  

  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:bg-blue-600 transition-colors z-50"
        onClick={() => setIsOpen(true)}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95%] sm:w-[90%] max-w-xs sm:max-w-md max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-50">
      <style>{chatbotStyles}</style>
      <div className="bg-blue-500 p-3 flex justify-between items-center">
        <h3 className="text-white font-semibold text-base">Recipe Assistant</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-blue-200 transition-colors p-1"
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
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-200 transition-colors p-1"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-[60vh] sm:h-96">
          <div className="chatbot-messages flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">
                Ask any questions about this recipe!
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[90%] text-sm sm:text-base ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center p-2">
                <div className="animate-pulse text-gray-500 text-sm">Thinking...</div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                className="chatbot-input flex-1 p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                placeholder="Ask about this recipe..."
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                className="px-3 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
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

// Add custom CSS style for placeholder and mobile improvements
const chatbotStyles = `
  .chatbot-input::placeholder {
    color: #9CA3AF; /* gray-400 color for placeholder */
  }
  
  @media (max-width: 640px) {
    .chatbot-messages::-webkit-scrollbar {
      width: 3px;
    }
    
    .chatbot-messages::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 3px;
    }
    
    .chatbot-input {
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }
`;