
import { CoupleProfile, Quest } from "../types";

/**
 * In a production app, this service would interact with a real backend 
 * (Firebase, Supabase, or a custom REST API). 
 * For this prototype, we simulate network latency and shared cloud storage.
 */

const CLOUD_SIM_KEY = 'pairup_cloud_store';

interface CloudStore {
  [coupleId: string]: {
    profile: CoupleProfile;
    quests: Quest[];
    updatedAt: string;
  }
}

const getCloudData = (): CloudStore => {
  const data = localStorage.getItem(CLOUD_SIM_KEY);
  return data ? JSON.parse(data) : {};
};

const saveCloudData = (data: CloudStore) => {
  localStorage.setItem(CLOUD_SIM_KEY, JSON.stringify(data));
};

export const syncWithCloud = async (profile: CoupleProfile, quests: Quest[]): Promise<{ profile: CoupleProfile, quests: Quest[] }> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const store = getCloudData();
  const existing = store[profile.coupleId];

  if (!existing) {
    // First time syncing this couple ID
    store[profile.coupleId] = {
      profile: { ...profile, lastSyncedAt: new Date().toISOString() },
      quests,
      updatedAt: new Date().toISOString()
    };
    saveCloudData(store);
    return { profile: store[profile.coupleId].profile, quests };
  }

  // Basic Conflict Resolution: Server (CloudStore) wins if newer, but we merge XP
  // In a real app, this would be much more robust (CRDTs or timestamps)
  const mergedProfile: CoupleProfile = {
    ...existing.profile,
    xp: Math.max(existing.profile.xp, profile.xp), // Take highest XP
    lastSyncedAt: new Date().toISOString()
  };

  // Sync Quests: Merge lists based on IDs
  const questMap = new Map<string, Quest>();
  existing.quests.forEach(q => questMap.set(q.id, q));
  quests.forEach(q => {
    const existingQ = questMap.get(q.id);
    if (!existingQ || (q.isCompleted && !existingQ.isCompleted)) {
      questMap.set(q.id, q);
    }
  });

  const mergedQuests = Array.from(questMap.values());

  // Update Cloud
  store[profile.coupleId] = {
    profile: mergedProfile,
    quests: mergedQuests,
    updatedAt: new Date().toISOString()
  };
  saveCloudData(store);

  return { profile: mergedProfile, quests: mergedQuests };
};

export const joinCouple = async (coupleId: string): Promise<{ profile: CoupleProfile, quests: Quest[] } | null> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const store = getCloudData();
  const data = store[coupleId];
  if (!data) return null;
  return { profile: data.profile, quests: data.quests };
};

export const generateCoupleId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
