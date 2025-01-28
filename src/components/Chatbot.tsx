import React, { useState } from 'react';
import Api from '../../netlify/functions/openrouter.js'

interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

interface ChatbotProps {
  recipe: { title: string; content: string };
}



const Chatbot: React.FC<ChatbotProps> = ({ recipe }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { content: input, role: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `Recipe Context: ${recipe.title}
      ${recipe.description}
      User Question: ${input}
      Answer the question while maintaining recipe context:`;

      const response = await Api;

      const data = await response.json();
      const botMessage = data.body || 'No response from chatbot.';
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
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-500 rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:bg-blue-600 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out">
      <div className="bg-blue-500 p-4 flex justify-between items-center">
        <h3 className="text-white font-semibold">Recipe Assistant</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            {isMinimized ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-96">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center p-3">
                <div className="animate-pulse text-gray-500">Thinking...</div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ask about this recipe..."
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
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