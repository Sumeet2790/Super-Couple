import { CoupleProfile, Quest } from "../types";

const PROFILE_KEY = 'pairup_profile';
const QUEST_KEY = 'pairup_daily_quest';

export const getProfile = (): CoupleProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: CoupleProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getSavedQuest = (): Quest | null => {
  const data = localStorage.getItem(QUEST_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveQuest = (quest: Quest) => {
  localStorage.setItem(QUEST_KEY, JSON.stringify(quest));
};
