import React, { useEffect, useState } from 'react';
import { CoupleProfile, Quest } from '../types';
import { generateDailyQuest } from '../services/geminiService';
import { saveQuest, getSavedQuest, saveProfile } from '../services/storageService';
import { CheckCircle, RefreshCcw, Star, Flame, Award } from 'lucide-react';

interface Props {
  profile: CoupleProfile;
  setProfile: (p: CoupleProfile) => void;
}

export const Dashboard: React.FC<Props> = ({ profile, setProfile }) => {
  const [dailyQuest, setDailyQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuest = async (forceRefresh = false) => {
    const today = new Date().toISOString().split('T')[0];
    const saved = getSavedQuest();

    if (!forceRefresh && saved && saved.dateGenerated === today) {
      setDailyQuest(saved);
    } else {
      setLoading(true);
      try {
        const generated = await generateDailyQuest(profile.partner1Name, profile.partner2Name);
        const newQuest: Quest = {
          ...generated,
          id: crypto.randomUUID(),
          isCompleted: false,
          dateGenerated: today
        };
        setDailyQuest(newQuest);
        saveQuest(newQuest);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const completeQuest = () => {
    if (!dailyQuest || dailyQuest.isCompleted) return;

    const updatedQuest = { ...dailyQuest, isCompleted: true };
    setDailyQuest(updatedQuest);
    saveQuest(updatedQuest);

    const updatedProfile = { ...profile, xp: profile.xp + dailyQuest.xpReward };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const daysTogether = Math.floor((new Date().getTime() - new Date(profile.anniversaryDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi, {profile.partner1Name} & {profile.partner2Name}</h1>
          <p className="text-gray-500 text-sm">Day {daysTogether} of your journey</p>
        </div>
        <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
          <Star className="w-4 h-4 fill-current" />
          <span>{profile.xp} XP</span>
        </div>
      </header>

      {/* Daily Quest Card */}
      <section className="relative overflow-hidden bg-gradient-to-r from-rose-500 to-orange-400 rounded-3xl p-6 text-white shadow-lg shadow-rose-200">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Flame className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium tracking-wider uppercase">
              Daily Quest
            </span>
            {loading ? (
              <RefreshCcw className="w-5 h-5 animate-spin" />
            ) : (
              <button onClick={() => loadQuest(true)} className="p-1 hover:bg-white/10 rounded-full transition">
                 <RefreshCcw className="w-5 h-5 opacity-70" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <p className="animate-pulse">Consulting Cupid...</p>
            </div>
          ) : dailyQuest ? (
            <>
              <h2 className="text-2xl font-bold mb-2">{dailyQuest.title}</h2>
              <p className="text-rose-50 mb-6 leading-relaxed">{dailyQuest.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center text-sm font-medium bg-black/10 px-3 py-1 rounded-full">
                  <Award className="w-4 h-4 mr-1" /> +{dailyQuest.xpReward} XP
                </span>
                
                <button 
                  onClick={completeQuest}
                  disabled={dailyQuest.isCompleted}
                  className={`flex items-center px-6 py-2 rounded-xl font-bold transition-all transform active:scale-95 ${
                    dailyQuest.isCompleted 
                    ? 'bg-white text-green-600 cursor-default' 
                    : 'bg-white text-rose-600 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  {dailyQuest.isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Done!
                    </>
                  ) : 'Complete'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Quick Stats or Widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
             <span className="text-lg font-bold">📅</span>
           </div>
           <h3 className="font-semibold text-gray-800">Next Milestone</h3>
           <p className="text-xs text-gray-500 mt-1">Check the timeline</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
             <span className="text-lg font-bold">💬</span>
           </div>
           <h3 className="font-semibold text-gray-800">Daily Topic</h3>
           <p className="text-xs text-gray-500 mt-1">In the AI Planner</p>
        </div>
      </div>
      
      <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100">
        <h3 className="font-semibold text-teal-800 mb-2">Did you know?</h3>
        <p className="text-sm text-teal-600">
          Couples who try new things together release oxytocin, the "cuddle hormone", strengthening their bond. That's why your daily quests matter!
        </p>
      </div>

    </div>
  );
};
