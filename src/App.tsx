import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, MessageSquare, Menu } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import { startNewChat, type ChatSession, isGeminiError } from './lib/gemini';

interface Message {
  text: string;
  isBot: boolean;
}

interface Chat {
  id: string;
  messages: Message[];
  createdAt: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const MAX_RETRIES = 3;

  useEffect(() => {
    startNewChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChatSession = async () => {
    try {
      chatSessionRef.current = startNewChat();
      const newChatId = crypto.randomUUID();
      const newChat: Chat = {
        id: newChatId,
        messages: [],
        createdAt: new Date()
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      setMessages([]);
      setError(null);
      setIsSidebarOpen(false); // Close sidebar when starting new chat
    } catch (error) {
      console.error('Chat başlatılırken hata oluştu:', error);
      setError('Sohbet başlatılamadı. Lütfen sayfayı yenileyin.');
    }
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (chatId === currentChatId) {
      startNewChatSession();
    }
  };

  const switchChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setIsSidebarOpen(false); // Close sidebar when switching chats
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chatSessionRef.current) {
      setMessages(prev => [...prev, { 
        text: "Sohbet oturumu başlatılamadı. Sayfayı yenilemeyi deneyin.",
        isBot: true 
      }]);
      return;
    }

    const newMessage = { text: message, isBot: false };
    setMessages(prev => [...prev, newMessage]);
    updateChatHistory(currentChatId, [...messages, newMessage]);
    setIsLoading(true);
    setError(null);

    const attemptSendMessage = async (retryCount: number): Promise<string> => {
      try {
        const result = await chatSessionRef.current?.sendMessage(message);
        
        if (!result?.response) {
          throw new Error('API yanıtı geçersiz');
        }

        const response = await result.response.text();
        
        if (!response) {
          throw new Error('Boş yanıt alındı');
        }

        setRetryCount(0);
        return response;

      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Yeniden deneme ${retryCount + 1}/${MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return attemptSendMessage(retryCount + 1);
        }
        throw error;
      }
    };

    try {
      const response = await attemptSendMessage(retryCount);
      const botMessage = { text: response, isBot: true };
      setMessages(prev => [...prev, botMessage]);
      updateChatHistory(currentChatId, [...messages, newMessage, botMessage]);
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error);
      
      let errorMessage = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
      
      if (isGeminiError(error)) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        if (error.message.includes('API yanıtı geçersiz')) {
          errorMessage = "API yanıtı alınamadı. Lütfen tekrar deneyin.";
        } else if (error.message.includes('Boş yanıt')) {
          errorMessage = "AI asistanı yanıt veremedi. Lütfen sorunuzu farklı bir şekilde sorun.";
        }
      }
      
      setError(errorMessage);
      const errorBotMessage = { text: errorMessage, isBot: true };
      setMessages(prev => [...prev, errorBotMessage]);
      updateChatHistory(currentChatId, [...messages, newMessage, errorBotMessage]);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatHistory = (chatId: string, updatedMessages: Message[]) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: updatedMessages }
        : chat
    ));
  };

  return (
    <div className="min-h-screen shopping-pattern flex">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={switchChat}
        onNewChat={startNewChatSession}
        onDeleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <ShoppingBag className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-semibold text-gray-800">AI Alışveriş Asistanı</h1>
          </div>
        </header>

        <div className="chat-container flex flex-col">
          <main className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto py-4">
              <div className="max-w-3xl mx-auto px-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-orange-500 opacity-50" />
                      <p className="text-lg">Alışveriş hakkında bir soru sorun veya yardım isteyin</p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message.text}
                      isBot={message.isBot}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          </main>

          <div className="border-t bg-white">
            <div className="max-w-3xl mx-auto p-4">
              <ChatInput 
                onSend={handleSendMessage} 
                disabled={isLoading} 
                placeholder="Ürünler hakkında soru sorun..."
              />
              {isLoading && (
                <div className="text-sm text-gray-500 mt-2">
                  AI asistanı yanıt yazıyor...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;