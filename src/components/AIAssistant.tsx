import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Sparkles, Send, Loader2, BookOpen } from 'lucide-react';
import Markdown from 'react-markdown';
import { summarizeChapter, askChapterQuestion } from '../services/ai';
import { Chapter } from '../data/book';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIAssistant({ isOpen, onClose, chapter }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset messages when chapter changes
  useEffect(() => {
    setMessages([]);
  }, [chapter?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSummarize = async () => {
    if (!chapter) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: 'Please summarize this chapter.' };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    const summary = await summarizeChapter(chapter.title, chapter.content);
    
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: summary || 'Failed to generate summary.' };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chapter || isLoading) return;

    const question = input.trim();
    setInput('');
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    const answer = await askChapterQuestion(question, chapter.title, chapter.content);
    
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: answer || 'Failed to answer question.' };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-2 text-[#4A90E2]">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-semibold font-sans">AI Reading Assistant</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 font-sans">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 text-gray-500">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#4A90E2]">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How can I help you read?</h3>
                    <p className="text-sm max-w-[250px]">
                      I can summarize the current chapter or answer any questions you have about the text.
                    </p>
                  </div>
                  <div className="flex flex-col space-y-3 w-full max-w-[200px]">
                    <button
                      onClick={handleSummarize}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#4A90E2] hover:text-[#4A90E2] transition-colors shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Summarize Chapter</span>
                    </button>
                    <button
                      onClick={() => document.getElementById('ai-chat-input')?.focus()}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#4A90E2] hover:text-[#4A90E2] transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-[#1A1A1A] text-white rounded-tr-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-sm">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm prose-blue max-w-none prose-p:leading-relaxed">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  id="ai-chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about this chapter..."
                  disabled={isLoading || !chapter}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/20 focus:border-[#4A90E2] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !chapter}
                  className="px-4 py-2 text-white bg-[#4A90E2] rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2 font-medium shadow-sm hover:bg-blue-600"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask AI</span>
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
