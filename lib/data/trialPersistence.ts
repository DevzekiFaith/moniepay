import fs from "node:fs";
import path from "node:path";

export interface TrialState {
  createdAt: string;
  trialEndsAt: string;
  subscriptionStatus: string;
  updatedAt: string;
}

interface MultiUserTrialStore {
  defaultTrial?: TrialState;
  users?: Record<string, TrialState>;
}

const TRIAL_STATE_FILE = path.join(process.cwd(), "prisma", "trial_state.json");

/**
 * Baseline for demo trader Mama Chidi (user_owner_01).
 * 3 days have elapsed since Day 2 (4 days elapsed total), so 3 days remain (Day 5 of 7).
 */
function getDemoTrialBaseline(): TrialState {
  const now = Date.now();
  const createdAt = new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString();
  const trialEndsAt = new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString();

  return {
    createdAt,
    trialEndsAt,
    subscriptionStatus: "trialing",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fresh 7-day trial baseline for newly registered shops and other users.
 */
function getFreshUserTrialBaseline(signupDate?: Date | string): TrialState {
  const start = signupDate ? new Date(signupDate).getTime() : Date.now();
  const createdAt = new Date(start).toISOString();
  const trialEndsAt = new Date(start + 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    createdAt,
    trialEndsAt,
    subscriptionStatus: "trialing",
    updatedAt: new Date().toISOString(),
  };
}

function readRawTrialStore(): MultiUserTrialStore {
  try {
    if (fs.existsSync(TRIAL_STATE_FILE)) {
      const raw = fs.readFileSync(TRIAL_STATE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      // Support legacy single-object format or multi-user map
      if (parsed?.trialEndsAt && parsed?.createdAt) {
        return {
          defaultTrial: parsed,
          users: {
            user_owner_01: parsed,
            "demo@monielite.app": parsed,
          },
        };
      }
      return parsed || {};
    }
  } catch (err) {
    console.warn("Could not read trial_state.json:", err);
  }
  return {};
}

/**
 * Retrieve persistent trial dates for a specific user ID or demo user.
 */
export function getPersistedTrialDates(userId?: string, createdAt?: Date | string | null): TrialState {
  const store = readRawTrialStore();
  const normalizedId = userId ? userId.toLowerCase().trim() : "user_owner_01";
  const isDemoUser =
    normalizedId === "user_owner_01" ||
    normalizedId.includes("demo") ||
    normalizedId.includes("mamachidi");

  if (store.users && store.users[normalizedId]) {
    return store.users[normalizedId];
  }

  // If this is the demo account, initialize the 4-days-elapsed baseline
  if (isDemoUser) {
    const demoBaseline = store.defaultTrial || getDemoTrialBaseline();
    savePersistedTrialDates(demoBaseline, normalizedId);
    return demoBaseline;
  }

  // For any other distinct user, generate their personalized trial based on their actual createdAt
  const freshTrial = getFreshUserTrialBaseline(createdAt || undefined);
  savePersistedTrialDates(freshTrial, normalizedId);
  return freshTrial;
}

/**
 * Save persistent trial dates for a specific user or global demo.
 */
export function savePersistedTrialDates(state: Partial<TrialState>, userId?: string): TrialState {
  try {
    const store = readRawTrialStore();
    const normalizedId = userId ? userId.toLowerCase().trim() : "user_owner_01";
    const existing =
      (store.users && store.users[normalizedId]) ||
      (normalizedId === "user_owner_01" ? getDemoTrialBaseline() : getFreshUserTrialBaseline());

    const updated: TrialState = {
      createdAt: state.createdAt || existing.createdAt,
      trialEndsAt: state.trialEndsAt || existing.trialEndsAt,
      subscriptionStatus: state.subscriptionStatus || existing.subscriptionStatus || "trialing",
      updatedAt: new Date().toISOString(),
    };

    const newStore: MultiUserTrialStore = {
      ...store,
      defaultTrial: normalizedId === "user_owner_01" ? updated : store.defaultTrial || updated,
      users: {
        ...(store.users || {}),
        [normalizedId]: updated,
      },
    };

    const dir = path.dirname(TRIAL_STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(TRIAL_STATE_FILE, JSON.stringify(newStore, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.warn("Could not save trial_state.json:", err);
    return getDemoTrialBaseline();
  }
}
