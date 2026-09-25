import React from 'react';
import { X, Info, ShieldAlert } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const ExplainModal: React.FC = () => {
  const { explainModal, closeExplainModal } = useCityPulse();

  if (!explainModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2318]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-[#D2DEC9] rounded-2xl shadow-2xl overflow-hidden text-[#1A2318]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2DEC9] bg-[#F4F8F2]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#5E7352]/10 text-[#5E7352] border border-[#5E7352]/20">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A2318] tracking-wide">
                {explainModal.title}
              </h3>
              <p className="text-xs text-[#52604D] font-mono">Civic Intelligence Metric Explanation</p>
            </div>
          </div>
          <button
            onClick={closeExplainModal}
            className="p-1.5 rounded-lg text-[#52604D] hover:text-[#1A2318] hover:bg-[#E4ECE0] transition"
            aria-label="Close explanation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] text-[#1A2318] text-sm leading-relaxed">
            <p className="font-semibold text-[#5E7352] mb-1">Plain Language Summary:</p>
            <p>{explainModal.summary}</p>
          </div>

          {explainModal.detailedPoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-[#52604D] font-semibold">Key Insights</h4>
              <ul className="space-y-2 text-sm text-[#1A2318]">
                {explainModal.detailedPoints.map((point, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5E7352] mt-2 shrink-0"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer box */}
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#FDF8E8] border border-[#F5E6B3] text-[#7A5B0B] text-xs">
            <ShieldAlert className="w-5 h-5 shrink-0 text-[#B8860B] mt-0.5" />
            <div>
              <span className="font-semibold block text-[#7A5B0B]">Civic Data Standard:</span>
              {explainModal.disclaimer || "Signals observed simultaneously represent statistical correlation or spatial overlap, not direct causation. Data feeds update continuously."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D2DEC9] bg-[#F4F8F2] flex justify-end">
          <button
            onClick={closeExplainModal}
            className="px-5 py-2 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] text-white font-semibold text-sm transition shadow-md"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
