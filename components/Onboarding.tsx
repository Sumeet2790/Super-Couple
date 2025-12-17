
import React, { useState } from 'react';
import { CoupleProfile } from '../types';
import { Heart, Users, Link, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { generateCoupleId, joinCouple } from '../services/syncService';
import { saveQuest } from '../services/storageService';

interface Props {
  onComplete: (profile: CoupleProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');
  const [step, setStep] = useState(1);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [date, setDate] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartNew = () => {
    setMode('create');
    setStep(1);
  };

  const handleJoinExisting = () => {
    setMode('join');
    setStep(1);
  };

  const handleCreateCouple = () => {
    if (step === 1 && p1 && p2) setStep(2);
    else if (step === 2 && date) {
      onComplete({
        partner1Name: p1,
        partner2Name: p2,
        anniversaryDate: date,
        onboarded: true,
        xp: 0,
        coupleId: generateCoupleId()
      });
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    const result = await joinCouple(inviteCode.toUpperCase());
    if (result) {
      // Sync local quest if any
      if (result.quests.length > 0) {
        saveQuest(result.quests[result.quests.length - 1]);
      }
      onComplete(result.profile);
    } else {
      setError('Couple code not found. Please check and try again.');
    }
    setLoading(false);
  };

  if (mode === 'initial') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-100 to-teal-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-rose-500 p-4 rounded-full shadow-lg shadow-rose-200">
              <Heart className="w-8 h-8 text-white fill-current animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PairUp</h1>
          <p className="text-gray-500 mb-8">Better together. Start your journey.</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleStartNew}
              className="w-full flex items-center justify-between p-5 bg-rose-50 border border-rose-100 rounded-2xl group hover:bg-rose-100 transition"
            >
              <div className="flex items-center text-left">
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white mr-4">
                  <Heart size={20} />
                </div>
                <div>
                  <div className="font-bold text-rose-900">New Journey</div>
                  <div className="text-xs text-rose-600">Start a fresh profile for us</div>
                </div>
              </div>
              <ChevronRight className="text-rose-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleJoinExisting}
              className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl group hover:border-gray-200 transition"
            >
              <div className="flex items-center text-left">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mr-4">
                  <Users size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Join Partner</div>
                  <div className="text-xs text-gray-500">My partner already made a profile</div>
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-100 to-teal-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <button onClick={() => setMode('initial')} className="flex items-center text-gray-400 hover:text-gray-600 mb-6 text-sm font-medium">
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        {mode === 'create' ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{step === 1 ? "Partner Names" : "The Beginning"}</h2>
            <p className="text-gray-500 mb-8">{step === 1 ? "Who are the lucky two?" : "When did your love story start?"}</p>

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" value={p1} onChange={e => setP1(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner's Name</label>
                  <input type="text" value={p2} onChange={e => setP2(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" placeholder="Name" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anniversary Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
              </div>
            )}

            <button 
              onClick={handleCreateCouple}
              disabled={step === 1 ? (!p1 || !p2) : !date}
              className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {step === 1 ? 'Next' : 'Create Profile'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Devices</h2>
            <p className="text-gray-500 mb-8">Enter the 6-digit code shown on your partner's profile settings.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
              <input 
                type="text" 
                maxLength={6}
                value={inviteCode} 
                onChange={e => setInviteCode(e.target.value.toUpperCase())} 
                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center text-3xl font-mono tracking-widest focus:ring-2 focus:ring-rose-400 outline-none uppercase" 
                placeholder="XXXXXX" 
              />
              {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
            </div>

            <button 
              onClick={handleJoin}
              disabled={inviteCode.length < 6 || loading}
              className="w-full mt-8 bg-rose-500 text-white py-4 rounded-xl font-semibold hover:bg-rose-600 transition flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Link size={20} className="mr-2" />}
              Connect Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};
