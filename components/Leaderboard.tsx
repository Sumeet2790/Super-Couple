
import React, { useMemo } from 'react';
import { CoupleProfile } from '../types';
import { Trophy, Medal } from 'lucide-react';

interface Props {
  profile: CoupleProfile;
}

export const Leaderboard: React.FC<Props> = ({ profile }) => {
  const stats = useMemo(() => {
    const start = new Date(profile.anniversaryDate);
    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysTogether = Math.max(0, Math.floor((today.getTime() - start.getTime()) / msPerDay));

    // Simple milestone estimation for scoring: ~1 per year + ~1 per 100 days
    const years = Math.floor(daysTogether / 365);
    const milestonesReached = years + Math.floor(daysTogether / 100); 

    // Score Formula
    // XP from Quests (already in profile.xp)
    // + 10 points per day together (Longevity Bonus)
    // + 250 points per estimated major milestone
    const timeScore = daysTogether * 10;
    const milestoneScore = milestonesReached * 250;
    const totalScore = profile.xp + timeScore + milestoneScore;

    return { daysTogether, milestonesReached, totalScore, timeScore, milestoneScore };
  }, [profile]);

  const ranking = useMemo(() => {
    const fakeCouples = [
        { name: "Marshall & Lily", score: 12500 },
        { name: "Jim & Pam", score: 9800 },
        { name: "Monica & Chandler", score: 8900 },
        { name: "Ross & Rachel", score: 7500 },
        { name: "Alice & Bob", score: 5400 },
        { name: "David & Patrick", score: 4200 },
        { name: "Leslie & Ben", score: 11200 },
        { name: "Cam & Mitch", score: 6700 },
    ];
    
    const all = [
        ...fakeCouples,
        { name: `${profile.partner1Name} & ${profile.partner2Name}`, score: stats.totalScore, isMe: true }
    ];

    return all.sort((a, b) => b.score - a.score).map((c, i) => ({ ...c, rank: i + 1 }));
  }, [stats.totalScore, profile]);

  const myRank = ranking.find(r => r.isMe);

  return (
    <div className="pb-24 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Couple Rankings</h2>
        <p className="text-gray-500 text-sm">See where you stand among other lovebirds!</p>
      </header>

      {/* User Stats Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-32 h-32 text-white" />
         </div>
         <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-indigo-100 text-sm font-medium">Current Rank</p>
                    <h3 className="text-4xl font-bold">#{myRank?.rank}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                    <Trophy className="w-6 h-6 text-yellow-300 fill-current" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-black/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <div>
                    <div className="text-[10px] text-indigo-100 mb-1 uppercase tracking-wider">Quest XP</div>
                    <div className="font-bold">{profile.xp}</div>
                </div>
                <div className="border-x border-white/10">
                    <div className="text-[10px] text-indigo-100 mb-1 uppercase tracking-wider">Days Bonus</div>
                    <div className="font-bold">{stats.timeScore}</div>
                </div>
                <div>
                    <div className="text-[10px] text-indigo-100 mb-1 uppercase tracking-wider">Milestones</div>
                    <div className="font-bold">{stats.milestoneScore}</div>
                </div>
            </div>
            <div className="mt-4 flex justify-between items-end border-t border-white/10 pt-3">
                <span className="text-xs font-medium text-indigo-200 uppercase tracking-widest">Total Score</span>
                <div className="text-2xl font-bold leading-none">{stats.totalScore.toLocaleString()}</div>
            </div>
         </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {ranking.map((couple) => (
            <div 
                key={couple.name} 
                className={`flex items-center p-4 rounded-2xl border transition-all ${
                    couple.isMe 
                    ? 'bg-white border-rose-200 shadow-md transform scale-[1.02] z-10' 
                    : 'bg-white border-gray-100'
                }`}
            >
                <div className="w-8 font-bold text-gray-400 text-center flex-shrink-0">
                    {couple.rank <= 3 ? (
                        <Medal className={`w-6 h-6 mx-auto ${
                            couple.rank === 1 ? 'text-yellow-400' : 
                            couple.rank === 2 ? 'text-gray-400' : 
                            'text-amber-600'
                        }`} />
                    ) : (
                        <span className="text-sm">{couple.rank}</span>
                    )}
                </div>
                <div className={`w-10 h-10 rounded-full mx-3 flex items-center justify-center flex-shrink-0 ${
                    couple.isMe ? 'bg-rose-100 text-rose-600' : 'bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-600'
                }`}>
                    <span className="text-sm font-bold">{couple.name.charAt(0)}</span>
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className={`font-semibold truncate text-sm ${couple.isMe ? 'text-gray-900' : 'text-gray-700'}`}>
                        {couple.name}
                        {couple.isMe && <span className="ml-2 text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>}
                    </h4>
                </div>
                <div className="font-bold text-indigo-600 text-sm whitespace-nowrap">
                    {couple.score.toLocaleString()}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
