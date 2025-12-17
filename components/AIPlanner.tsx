import React, { useState } from 'react';
import { DateIdea } from '../types';
import { generateDateIdeas, generateConversationStarter } from '../services/geminiService';
import { Sparkles, MessageCircle, MapPin, DollarSign, Clock, Loader2 } from 'lucide-react';

export const AIPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dates' | 'chat'>('dates');
  const [context, setContext] = useState('');
  const [ideas, setIdeas] = useState<DateIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [qLoading, setQLoading] = useState(false);

  const handleGenerateDates = async () => {
    if (!context.trim()) return;
    setLoading(true);
    setIdeas([]);
    const results = await generateDateIdeas(context);
    setIdeas(results);
    setLoading(false);
  };

  const handleNewQuestion = async () => {
    setQLoading(true);
    const q = await generateConversationStarter();
    setQuestion(q);
    setQLoading(false);
  };

  return (
    <div className="pb-24 space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-gray-900">Cupid's Corner</h2>
        <p className="text-gray-500 text-sm">Spark something new.</p>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl">
        <button 
          onClick={() => setActiveTab('dates')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'dates' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Date Ideas
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Deep Talk
        </button>
      </div>

      {activeTab === 'dates' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">What's the vibe?</label>
            <textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Rainy Sunday, adventurous outdoors, cheap but fun, fancy anniversary dinner..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none text-sm min-h-[80px]"
            />
            <button 
              onClick={handleGenerateDates}
              disabled={loading || !context.trim()}
              className="mt-3 w-full bg-rose-500 text-white py-2.5 rounded-xl font-medium hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center transition"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Plan Date</>}
            </button>
          </div>

          <div className="space-y-4">
            {ideas.map((idea, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <h3 className="font-bold text-gray-800 text-lg mb-2">{idea.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{idea.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-md">
                    <DollarSign className="w-3 h-3 mr-1" /> {idea.estimatedCost}
                  </span>
                  <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 mr-1" /> {idea.duration}
                  </span>
                </div>
              </div>
            ))}
            {!loading && ideas.length === 0 && (
              <div className="text-center py-10 opacity-40">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Enter a vibe above to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-fade-in">
           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl shadow-indigo-200 text-center relative w-full overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <MessageCircle className="w-10 h-10 mx-auto mb-4 opacity-80" />
              <p className="text-xl font-serif italic leading-relaxed">
                "{question || 'Press the button below to spark a meaningful conversation.'}"
              </p>
           </div>
           
           <button 
             onClick={handleNewQuestion}
             disabled={qLoading}
             className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-800 active:scale-95 transition flex items-center"
           >
             {qLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'New Question'}
           </button>
        </div>
      )}

    </div>
  );
};
