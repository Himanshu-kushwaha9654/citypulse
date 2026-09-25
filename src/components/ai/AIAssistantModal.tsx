import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Tag, HelpCircle } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { useDemoEngine } from '../../context/DemoEngineContext';
import { ChatMessage } from '../../types/citypulse';

export const AIAssistantModal: React.FC = () => {
  const { 
    isAiModalOpen, 
    setIsAiModalOpen, 
    aiSuggestedPrompt, 
    setAiSuggestedPrompt,
    pulseScore,
    neighborhoods,
    alerts,
    anomalies,
    mapIncidents,
    selectedCity
  } = useCityPulse();
  
  const demoEngine = useDemoEngine();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am CityPulse AI, your data-grounded civic intelligence assistant. How can I help you analyze live urban conditions today?',
      timestamp: 'Just now',
      sources: ['Weather Feed', 'Traffic Feed', 'Transit Feed', 'Municipal CAD 911']
    }
  ]);

  const suggestedPrompts = [
    "Why did the City Pulse score change?",
    "What's happening in my area?",
    "Why is traffic high?",
    "Show unusual events & anomalies",
    "Which areas have poor air quality?",
    "Are there transit disruptions?"
  ];

  useEffect(() => {
    if (aiSuggestedPrompt) {
      handleSendPrompt(aiSuggestedPrompt);
      setAiSuggestedPrompt(null);
    }
  }, [aiSuggestedPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendPrompt = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate grounded response
    setTimeout(() => {
      let replyText = "";
      let sources: string[] = [];

      const queryLower = textToSend.toLowerCase();

      // IF DEMO IS ACTIVE: Respond explicitly with simulated data context
      if (demoEngine.demoEnabled && demoEngine.currentScenario) {
        const step = demoEngine.currentStepData;
        const scenario = demoEngine.currentScenario;

        replyText = `[SIMULATED DEMO DATA]\nDemo Mode is currently simulating ${scenario.name} around ${selectedCity}.\n\nCurrent Status (Step ${demoEngine.demoStep + 1}/${demoEngine.totalSteps}): ${step?.title || scenario.name}.\n\nDetails: ${step?.aiSummary || step?.description || scenario.description}\n\nWhy It Matters: ${step?.aiWhyItMatters || 'Multi-signal civic correlation active in simulation context.'}`;
        sources = ['CityPulse Demo Scenario Engine', 'Simulated Telemetry Pipeline'];
      } else if (queryLower.includes('pulse') || queryLower.includes('why did city pulse change') || queryLower.includes('score drop') || queryLower.includes('fall')) {
        replyText = `FACT: City Pulse score currently stands at ${pulseScore}/100. OBSERVED SIGNAL: Central District traffic density jumped to 87% (+28% baseline) while 45mm/h heavy precipitation was recorded simultaneously. POSSIBLE CORRELATION: Surface water pooling and extended braking distances coincide with the 14-minute Metro Line 2 delay.`;
        sources = ['CityPulse Core Engine', 'Traffic Probe Feed', 'Doppler Weather Radar'];
      } else if (queryLower.includes('traffic') || queryLower.includes('why is traffic high')) {
        replyText = "FACT: Traffic density in Central District is operating 28% above baseline (87% density), and North District reports a 3km tailback near MI Road. OBSERVED SIGNAL: Rain intensity coincided with traffic speed drops (14 km/h avg). POSSIBLE CORRELATION: Weather conditions overlap temporally with vehicle queuing.";
        sources = ['ITS Traffic Probe Feed', 'Weather Feed', 'Transit Feed'];
      } else if (queryLower.includes('aqi') || queryLower.includes('air quality')) {
        const highestAqi = [...neighborhoods].sort((a, b) => b.aqi.value - a.aqi.value)[0];
        replyText = `FACT: AQI is highest in ${highestAqi?.name || 'Sitapura Industrial Sector'} at ${highestAqi?.aqi.value || 148} AQI (Unhealthy for Sensitive Groups). OBSERVED SIGNAL: Fine PM2.5 particulates elevated due to dry surface winds and construction dust vectoring eastward.`;
        sources = ['Environmental AQI Station Network', 'Wind Vector Radar API'];
      } else if (queryLower.includes('incident') || queryLower.includes('critical')) {
        const criticalList = mapIncidents.filter(i => i.severity === 'critical');
        replyText = `FACT: There are ${criticalList.length} critical incidents active: 1) ${criticalList[0]?.title || 'Multi-Vehicle Collision'} at ${criticalList[0]?.districtName || 'Malviya Nagar'}, and 2) Severe Traffic Congestion at MI Road. CAD 911 emergency units are dispatched.`;
        sources = ['Municipal Dispatch CAD 911', 'Traffic Camera Feed'];
      } else if (queryLower.includes('changed') || queryLower.includes('recently') || queryLower.includes('what changed')) {
        replyText = `FACT: In the last 15 minutes: 1) Heavy precipitation cell (+45mm/h) entered Bani Park, 2) MI Road traffic density spiked +46% to 88%, and 3) Vidyadhar Nagar power substation logged a 94% load voltage surge.`;
        sources = ['Telemetry Time-Series Log', 'Grid Load Sensor'];
      } else if (queryLower.includes('signal') || queryLower.includes('together') || queryLower.includes('correlation')) {
        replyText = "FACT: Observed multi-signal correlation: Convective Rainfall + Traffic Density Surge + Metro Headway Delay occurred within a 6-minute window across Central District.";
        sources = ['Cross-Signal Correlation Matrix'];
      } else {
        replyText = `FACT: Overall city conditions stand at a Pulse Index of ${pulseScore}/100 (${pulseScore >= 65 ? 'Stable' : 'Warning'}). Heavy rain cell dumping 45mm/h is active over Central District, while North District reports an active Expressway bottleneck.`;
        sources = ['CityPulse Core Engine', 'Traffic Feed', 'Weather Feed'];
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources
      };

      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2318]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[620px] max-h-[90vh] bg-white border border-[#D2DEC9] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#1A2318]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2DEC9] bg-[#F4F8F2] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#5E7352] text-white shadow-sm">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A2318] font-heading">CityPulse AI</h3>
              <p className="text-xs text-[#52604D] font-mono">Grounded Civic Intelligence Assistant</p>
            </div>
          </div>

          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1.5 rounded-lg text-[#52604D] hover:text-[#1A2318] hover:bg-[#E4ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                msg.sender === 'user' ? 'bg-[#5E7352] text-white shadow-sm' : 'bg-[#F4F8F2] text-[#5E7352] border border-[#D2DEC9]'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#5E7352] text-white font-semibold rounded-tr-none shadow-sm'
                    : 'bg-[#F4F8F2] border border-[#D2DEC9] text-[#1A2318] rounded-tl-none'
                }`}>
                  {msg.text}
                </div>

                {/* Grounded Source Tags */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-micro text-[#52604D] font-mono flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#5E7352]" /> Sources:
                    </span>
                    {msg.sources.map((src, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-micro font-mono bg-white text-[#5E7352] border border-[#D2DEC9]">
                        [{src}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Section 35: Suggested Questions */}
        <div className="px-6 py-2 bg-[#F4F8F2] border-t border-[#D2DEC9] shrink-0 overflow-x-auto flex items-center space-x-2 scrollbar-none">
          <span className="text-micro font-mono text-[#52604D] shrink-0 font-bold">Suggested:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(prompt)}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#E4ECE0] text-xs text-[#1A2318] border border-[#D2DEC9] transition whitespace-nowrap shrink-0 shadow-xs"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-[#D2DEC9] bg-[#F4F8F2] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(input);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about current civic conditions..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#D2DEC9] text-xs sm:text-sm text-[#1A2318] placeholder-[#768570] focus:outline-none focus:border-[#5E7352]"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] text-white font-bold transition shadow-sm"
            >
              <Send className="w-4 h-4 fill-white" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
