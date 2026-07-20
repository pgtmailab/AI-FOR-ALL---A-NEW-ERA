import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Network, Loader2, X } from 'lucide-react';
import { generateConceptMap } from '../services/ai';
import { Chapter, technicalTerms } from '../data/book';
import { motion, AnimatePresence } from 'motion/react';

interface ConceptMapProps {
  chapter: Chapter;
}

export function ConceptMap({ chapter }: ConceptMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{ nodes: any[], links: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setData(null);
    setIsOpen(false);
  }, [chapter.id]);

  useEffect(() => {
    if (!isOpen || !data || !svgRef.current) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current);
    
    svg.selectAll("*").remove();

    svg.attr("viewBox", [0, 0, width, height].join(" "));

    // Colors
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Define arrow markers for links
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#999")
      .style("stroke", "none");

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    const linkLabel = svg.append("g")
      .selectAll("text")
      .data(data.links)
      .join("text")
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .attr("text-anchor", "middle")
      .text((d: any) => d.label);

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d: any) => color(d.group))
      .call(drag(simulation));

    const label = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .attr("dx", 15)
      .attr("dy", 4)
      .text((d: any) => d.id);

    node.append("title")
      .text((d: any) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 5);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };

  }, [isOpen, data]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!data) {
      setIsLoading(true);
      const result = await generateConceptMap(chapter.title, chapter.content, technicalTerms);
      if (result && result.nodes && result.links) {
        setData(result);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mt-8 mb-8 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-indigo-600">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Dynamic Concept Map</h3>
              <p className="text-sm text-gray-500">Visualize how key concepts connect in this chapter</p>
            </div>
          </div>
          <button
            onClick={handleOpen}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm whitespace-nowrap"
          >
            View Concept Map
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Network className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">Concept Map: {chapter.title}</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 relative bg-slate-50 overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                    <p className="font-medium">Analyzing chapter and generating concept map...</p>
                  </div>
                ) : data ? (
                  <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <p>Failed to generate concept map.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
