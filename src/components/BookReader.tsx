import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { book, technicalTerms } from '../data/book';
import { ConceptModal } from './ConceptModal';
import { AIAssistant } from './AIAssistant';
import { ChapterNews } from './ChapterNews';
import { ConceptMap } from './ConceptMap';

export function BookReader() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [selectedConcept, setSelectedConcept] = useState<{ term: string; context: string } | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const chapter = currentChapterIndex >= 0 ? book.chapters[currentChapterIndex] : null;

  // A simple function to replace technical terms with clickable spans
  const renderContent = (content: string) => {
    // Sort terms by length descending to match longer terms first
    const sortedTerms = [...technicalTerms].sort((a, b) => b.length - a.length);
    
    // Create a regex pattern
    const pattern = new RegExp(`(\\\\b${sortedTerms.join('|')}\\\\b)`, 'gi');
    
    const parts = content.split(pattern);
    
    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();
      const isTerm = sortedTerms.some(term => term.toLowerCase() === lowerPart);
      
      if (isTerm) {
        return (
          <span
            key={index}
            onClick={() => handleTermClick(part, content)}
            className="cursor-pointer text-[#4A90E2] font-semibold hover:underline decoration-2 underline-offset-4 decoration-[#FFA500] transition-all"
            title="Click for AI Explanation"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleTermClick = (term: string, fullContext: string) => {
    // Extract a snippet around the term for context
    const termIndex = fullContext.toLowerCase().indexOf(term.toLowerCase());
    const start = Math.max(0, termIndex - 150);
    const end = Math.min(fullContext.length, termIndex + term.length + 150);
    const contextSnippet = fullContext.substring(start, end);
    
    setSelectedConcept({ term, context: `...${contextSnippet}...` });
  };

  const handleNext = () => {
    if (currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > -1) {
      setCurrentChapterIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#333333] font-serif selection:bg-[#FFA500]/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#1A1A1A] text-white rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-sans font-bold text-lg tracking-tight text-[#1A1A1A] hidden sm:block">
              {book.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 font-sans text-sm font-medium text-gray-500">
            {currentChapterIndex === -1 ? (
              <span>Table of Contents</span>
            ) : (
              <span>Chapter {currentChapterIndex + 1} of {book.chapters.length}</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[680px] mx-auto px-6 py-16 md:py-24">
        {currentChapterIndex === -1 ? (
          <motion.div
            key="toc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="prose prose-lg prose-slate max-w-none"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-12 leading-tight tracking-tight text-center">
              Table of Contents
            </h1>
            <div className="space-y-4 max-w-md mx-auto font-sans">
              {book.chapters.map((chap, idx) => (
                <div 
                  key={chap.id}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-5 rounded-2xl border border-gray-100 hover:border-[#4A90E2] hover:bg-blue-50/30 cursor-pointer transition-all group flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#4A90E2] transition-colors m-0">
                    {chap.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#4A90E2] transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : chapter ? (() => {
          const blocks = chapter.content.split('\n\n').filter(b => b.trim().length > 0);
          const firstParagraphIndex = blocks.findIndex(b => {
            const t = b.trim();
            const isQuote = t.startsWith('"') || t.startsWith('“');
            const isHeading = !isQuote && t.length < 80 && !t.match(/[.!?]$/);
            return !isQuote && !isHeading;
          });

          return (
            <motion.article
              key={currentChapterIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="prose prose-lg prose-slate max-w-none"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-12 leading-tight tracking-tight">
                {chapter.title}
              </h1>
              
              <div className="space-y-4 text-lg md:text-xl leading-[1.8] text-[#333333]">
                {blocks.map((block, idx) => {
                  const trimmedText = block.trim();
                  const isQuote = trimmedText.startsWith('"') || trimmedText.startsWith('“');
                  const isHeading = !isQuote && trimmedText.length < 80 && !trimmedText.match(/[.!?]$/);
                  const isFirstParagraph = idx === firstParagraphIndex;

                  if (isHeading) {
                    return (
                      <div key={idx} className="pt-10 pb-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] font-sans tracking-tight flex items-center space-x-4">
                          <span className="w-8 h-1 bg-[#4A90E2] rounded-full inline-block flex-shrink-0"></span>
                          <span>{renderContent(trimmedText)}</span>
                        </h3>
                      </div>
                    );
                  }

                  if (isQuote) {
                    return (
                      <motion.blockquote 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={idx} 
                        className="my-12 relative"
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#4A90E2] to-[#FFA500] rounded-full"></div>
                        <div className="pl-8 py-2 pr-6 text-gray-700 font-serif text-xl md:text-2xl leading-relaxed italic">
                          {renderContent(trimmedText)}
                        </div>
                      </motion.blockquote>
                    );
                  }

                  return (
                    <p key={idx} className={`mb-8 text-lg md:text-xl leading-[1.9] text-gray-800 ${isFirstParagraph ? 'first-letter:text-6xl first-letter:font-bold first-letter:text-[#1A1A1A] first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-2' : ''}`}>
                      {renderContent(trimmedText)}
                    </p>
                  );
                })}
              </div>

              {/* Dynamic Concept Map */}
              <ConceptMap chapter={chapter} />

              {/* Real-World News Connector */}
              <ChapterNews chapter={chapter} />
            </motion.article>
          );
        })() : null}

        {/* Navigation */}
        <div className="mt-24 pt-8 border-t border-gray-200 flex items-center justify-between font-sans">
          <button
            onClick={handlePrev}
            disabled={currentChapterIndex === -1}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Previous</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentChapterIndex === book.chapters.length - 1}
            className="flex items-center space-x-2 px-6 py-2 rounded-full bg-[#1A1A1A] text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="font-medium">Next Chapter</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Concept Modal */}
      {selectedConcept && (
        <ConceptModal
          isOpen={!!selectedConcept}
          onClose={() => setSelectedConcept(null)}
          concept={selectedConcept.term}
          context={selectedConcept.context}
        />
      )}

      {/* AI Assistant FAB */}
      <AnimatePresence>
        {currentChapterIndex >= 0 && !isAssistantOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsAssistantOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 bg-[#4A90E2] text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center justify-center"
            title="Open AI Reading Assistant"
          >
            <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Assistant Sidebar */}
      <AIAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        chapter={chapter}
      />
    </div>
  );
}
