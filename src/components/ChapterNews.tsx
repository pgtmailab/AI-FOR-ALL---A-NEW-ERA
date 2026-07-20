import React, { useState, useEffect } from 'react';
import { Globe, ExternalLink, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { getChapterNews } from '../services/ai';
import { Chapter } from '../data/book';

interface ChapterNewsProps {
  chapter: Chapter;
}

export function ChapterNews({ chapter }: ChapterNewsProps) {
  const [news, setNews] = useState<{ text: string; sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Reset when chapter changes
  useEffect(() => {
    setNews(null);
    setHasLoaded(false);
  }, [chapter.id]);

  const handleFetchNews = async () => {
    setIsLoading(true);
    const result = await getChapterNews(chapter.title, chapter.content);
    setNews(result);
    setIsLoading(false);
    setHasLoaded(true);
  };

  return (
    <div className="mt-16 p-6 sm:p-8 bg-blue-50/50 border border-blue-100 rounded-2xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 text-[#4A90E2]">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Real-World Connections</h3>
            <p className="text-sm text-gray-500">See how this chapter's concepts apply in today's news</p>
          </div>
        </div>
        {!hasLoaded && !isLoading && (
          <button
            onClick={handleFetchNews}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#4A90E2] hover:text-[#4A90E2] transition-colors shadow-sm whitespace-nowrap"
          >
            Find Recent News
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center space-x-3 text-gray-500 py-8 justify-center bg-white/50 rounded-xl border border-gray-100">
          <Loader2 className="w-5 h-5 animate-spin text-[#4A90E2]" />
          <span className="font-medium">Searching the web for recent developments...</span>
        </div>
      )}

      {hasLoaded && news && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-[#4A90E2] bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <Markdown>{news.text}</Markdown>
          </div>
          
          {news.sources && news.sources.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Sources & Further Reading</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {news.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#4A90E2] hover:shadow-md transition-all group"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-[#4A90E2] flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#4A90E2] line-clamp-2">
                      {source.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
