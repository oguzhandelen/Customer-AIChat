import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot }) => {
  // Bot mesajlarını satırlara ayır
  const formatBotMessage = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {line}
      </p>
    ));
  };

  return (
    <div className={`flex gap-3 ${isBot ? 'bg-orange-50' : ''} p-4 rounded-lg`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot ? 'bg-orange-500' : 'bg-gray-600'
      }`}>
        {isBot ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1">
        {isBot ? formatBotMessage(message) : <p>{message}</p>}
      </div>
    </div>
  );
};