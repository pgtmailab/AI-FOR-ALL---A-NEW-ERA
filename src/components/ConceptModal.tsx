import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { explainConcept, generateConceptDiagram } from '../services/ai';

interface ConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept: string;
  context: string;
}

export function ConceptModal({ isOpen, onClose, concept, context }: ConceptModalProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [loadingDiagram, setLoadingDiagram] = useState(false);

  useEffect(() => {
    if (isOpen && concept) {
      setExplanation(null);
      setDiagramUrl(null);
      
      setLoadingExplanation(true);
      explainConcept(concept, context).then((res) => {
        setExplanation(res);
        setLoadingExplanation(false);
      });

      setLoadingDiagram(true);
      generateConceptDiagram(concept).then((res) => {
        setDiagramUrl(res);
        setLoadingDiagram(false);
      });
    }
  }, [isOpen, concept, context]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 font-sans">
              Concept: <span className="text-[#4A90E2]">{concept}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8 font-sans">
            {/* Diagram Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Visual Diagram</h3>
              <div className="flex items-center justify-center w-full overflow-hidden bg-gray-50 rounded-xl min-h-[200px] border border-gray-100">
                {loadingDiagram ? (
                  <div className="flex flex-col items-center text-gray-400">
                    <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                    <span className="text-sm">Generating diagram...</span>
                  </div>
                ) : diagramUrl ? (
                  <img src={diagramUrl} alt={`Diagram of ${concept}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Diagram unavailable</span>
                  </div>
                )}
              </div>
            </div>

            {/* Explanation Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">AI Explanation</h3>
              {loadingExplanation ? (
                <div className="flex items-center text-gray-500">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Analyzing concept in context...</span>
                </div>
              ) : explanation ? (
                <div className="prose prose-blue max-w-none text-gray-700">
                  <Markdown>{explanation}</Markdown>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
