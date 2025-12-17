import React, { useMemo } from 'react';
import { CoupleProfile, Milestone } from '../types';
import { Calendar, Heart, GlassWater, Clock } from 'lucide-react';

interface Props {
  profile: CoupleProfile;
}

export const Milestones: React.FC<Props> = ({ profile }) => {
  const milestones = useMemo(() => {
    const start = new Date(profile.anniversaryDate);
    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Helper to add days
    const addDays = (date: Date, days: number) => new Date(date.getTime() + days * msPerDay);
    
    // Helper to add months
    const addMonths = (date: Date, months: number) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    };
    
    // Helper to add years
    const addYears = (date: Date, years: number) => {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() + years);
        return d;
    };

    const list: Milestone[] = [];

    // Standard anniversaries
    for (let i = 1; i <= 10; i++) {
      list.push({
        id: `yr-${i}`,
        title: `${i} Year Anniversary`,
        date: addYears(start, i).toISOString().split('T')[0],
        description: "A whole year around the sun together!",
        isAchieved: addYears(start, i) <= today,
        icon: 'heart'
      });
    }

    // Day milestones
    [100, 500, 1000, 2000, 5000, 10000].forEach(days => {
      list.push({
        id: `day-${days}`,
        title: `${days} Days Together`,
        date: addDays(start, days).toISOString().split('T')[0],
        description: "Count the days, make the days count.",
        isAchieved: addDays(start, days) <= today,
        icon: 'clock'
      });
    });

    // Sort by date
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [profile.anniversaryDate]);

  // Find next milestone index
  const nextMilestoneIndex = milestones.findIndex(m => !m.isAchieved);
  
  // Get a window of milestones: some past, mostly future
  const relevantMilestones = milestones.slice(Math.max(0, nextMilestoneIndex - 2), nextMilestoneIndex + 5);

  return (
    <div className="pb-24 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Our Timeline</h2>
        <p className="text-gray-500 text-sm">Every moment counts.</p>
      </header>

      <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pl-8 py-2">
        {relevantMilestones.map((m, idx) => {
          const isNext = !m.isAchieved && (idx === 0 || relevantMilestones[idx-1]?.isAchieved);
          const dateObj = new Date(m.date);
          const isPast = m.isAchieved;

          return (
            <div key={m.id} className={`relative ${isPast ? 'opacity-60' : 'opacity-100'}`}>
              {/* Timeline Dot */}
              <div 
                className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                  isPast ? 'bg-gray-400' : isNext ? 'bg-rose-500 animate-pulse' : 'bg-rose-200'
                }`}
              >
                {isNext && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>

              {/* Card */}
              <div className={`p-4 rounded-xl border ${isNext ? 'bg-white border-rose-200 shadow-lg shadow-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold ${isNext ? 'text-gray-900' : 'text-gray-600'}`}>
                    {m.title}
                  </h3>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${isNext ? 'bg-rose-100 text-rose-700' : 'bg-gray-200 text-gray-600'}`}>
                    {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{m.description}</p>
                
                {isNext && (
                   <div className="mt-3 text-xs font-semibold text-rose-600 flex items-center">
                     <Clock className="w-3 h-3 mr-1" /> 
                     Coming up in {Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mt-6">
        <div className="flex items-center mb-2">
            <GlassWater className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="font-semibold text-indigo-900">Anniversary</h3>
        </div>
        <p className="text-indigo-700 text-sm">
            Mark your calendar for <span className="font-bold">{new Date(profile.anniversaryDate).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}</span>! That's your special day.
        </p>
      </div>
    </div>
  );
};
