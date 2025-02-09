import React from 'react';
import { Plus, X, MessageSquare } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
}

interface Chat {
  id: string;
  messages: Message[];
  createdAt: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Sohbet</span>
            </button>
            <button
              onClick={onClose}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-2 py-4">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 ${
                    chat.id === currentChatId
                      ? 'bg-orange-50 text-orange-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <div className="flex-1 truncate">
                    <span className="text-sm">
                      {chat.messages[0]?.text.slice(0, 30) || 'Yeni Sohbet'}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {new Date(chat.createdAt).toLocaleDateString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};