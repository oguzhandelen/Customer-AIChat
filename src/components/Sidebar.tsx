import React from 'react';
import { Plus, X, MessageSquare, Trash2 } from 'lucide-react';

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
  onDeleteChat: (chatId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-2 py-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative rounded-lg mb-1 ${
                    chat.id === currentChatId
                      ? 'bg-orange-50'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className="w-full text-left px-3 py-2 flex items-center gap-2"
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
                  <button
                    onClick={() => onDeleteChat(chat.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Sohbeti sil"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};