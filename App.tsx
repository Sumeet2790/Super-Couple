
import React, { useState, useEffect, useCallback } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Milestones } from './components/Milestones';
import { AIPlanner } from './components/AIPlanner';
import { Leaderboard } from './components/Leaderboard';
import { AppView, CoupleProfile } from './types';
import { getProfile, saveProfile, getSavedQuest, saveQuest } from './services/storageService';
import { syncWithCloud } from './services/syncService';
import { Home, CalendarDays, Sparkles, User, Trophy, RefreshCw, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      setProfile(saved);
      // Auto-sync on load
      performSync(saved);
    }
    setLoading(false);
  }, []);

  const performSync = useCallback(async (currentProfile: CoupleProfile) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const currentQuest = getSavedQuest();
      const quests = currentQuest ? [currentQuest] : [];
      const result = await syncWithCloud(currentProfile, quests);
      
      setProfile(result.profile);
      saveProfile(result.profile);
      
      if (result.quests.length > 0) {
        saveQuest(result.quests[result.quests.length - 1]);
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const handleOnboardingComplete = (newProfile: CoupleProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
    performSync(newProfile);
  };

  const updateProfile = (p: CoupleProfile) => {
    setProfile(p);
    saveProfile(p);
    // Debounce or immediate sync on critical updates
    performSync(p);
  };

  const copyCode = () => {
    if (profile?.coupleId) {
      navigator.clipboard.writeText(profile.coupleId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return null;

  if (!profile || !profile.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderView = () => {
    switch(currentView) {
      case AppView.DASHBOARD:
        return <Dashboard profile={profile} setProfile={updateProfile} />;
      case AppView.MILESTONES:
        return <Milestones profile={profile} />;
      case AppView.LEADERBOARD:
        return <Leaderboard profile={profile} />;
      case AppView.AI_PLANNER:
        return <AIPlanner />;
      case AppView.PROFILE:
        return (
          <div className="pb-24 space-y-6">
             <header className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <button 
                  onClick={() => performSync(profile)}
                  className={`p-2 rounded-full hover:bg-gray-100 transition ${isSyncing ? 'animate-spin text-rose-500' : 'text-gray-400'}`}
                >
                  <RefreshCw size={20} />
                </button>
             </header>

             {/* Profile Card */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
               <div className="flex items-center space-x-4 mb-6">
                 <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-2xl">👩‍❤️‍👨</div>
                 <div>
                   <h3 className="font-bold text-lg">{profile.partner1Name} & {profile.partner2Name}</h3>
                   <p className="text-gray-500 text-sm">Anniversary: {profile.anniversaryDate}</p>
                 </div>
               </div>

               {/* Sync Code Box */}
               <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6">
                 <p className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">Invite your partner</p>
                 <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-rose-600 tracking-widest">{profile.coupleId}</span>
                    <button 
                      onClick={copyCode}
                      className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm text-xs font-semibold text-rose-600 border border-rose-100 hover:bg-rose-50 transition"
                    >
                      {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                 </div>
                 <p className="text-[10px] text-rose-400 mt-2">Share this code with your partner to sync your timeline and points.</p>
               </div>
               
               <button 
                 onClick={() => {
                   if(confirm('Are you sure you want to reset data? This cannot be undone.')) {
                     localStorage.clear();
                     window.location.reload();
                   }
                 }}
                 className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition"
               >
                 Sign Out & Reset
               </button>
             </div>

             <div className="bg-gray-100 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-400">
                  Last Synced: {profile.lastSyncedAt ? new Date(profile.lastSyncedAt).toLocaleTimeString() : 'Never'}
                </p>
             </div>
          </div>
        );
      default:
        return <Dashboard profile={profile} setProfile={updateProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      <main className="p-6 h-full overflow-y-auto min-h-screen">
        {renderView()}
      </main>

      {/* Syncing Indicator Overlay (Subtle) */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-[60] bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-rose-100 flex items-center space-x-2">
           <RefreshCw size={12} className="animate-spin text-rose-500" />
           <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Syncing</span>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-lg bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe pt-2 px-2 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <NavButton 
          icon={<Home size={22} />} 
          label="Home" 
          active={currentView === AppView.DASHBOARD} 
          onClick={() => setCurrentView(AppView.DASHBOARD)} 
        />
        <NavButton 
          icon={<Trophy size={22} />} 
          label="Rank" 
          active={currentView === AppView.LEADERBOARD} 
          onClick={() => setCurrentView(AppView.LEADERBOARD)} 
        />
        <div className="relative -top-6 mx-1">
          <button 
            onClick={() => setCurrentView(AppView.AI_PLANNER)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200 transition-transform active:scale-95 ${currentView === AppView.AI_PLANNER ? 'bg-rose-600 ring-4 ring-rose-100' : 'bg-rose-500'}`}
          >
            <Sparkles size={24} />
          </button>
        </div>
        <NavButton 
          icon={<CalendarDays size={22} />} 
          label="Timeline" 
          active={currentView === AppView.MILESTONES} 
          onClick={() => setCurrentView(AppView.MILESTONES)} 
        />
        <NavButton 
          icon={<User size={22} />} 
          label="Profile" 
          active={currentView === AppView.PROFILE} 
          onClick={() => setCurrentView(AppView.PROFILE)} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-14 py-2 transition-colors ${active ? 'text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

export default App;
