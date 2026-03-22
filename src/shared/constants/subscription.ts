export const PLAN_LIMITS = {
  free: {
    maxTasks: 20,
    maxHabits: 5,
    maxGoals: 3,
    maxNotes: 10,
    hasAiAssistant: false,
    hasAdvancedAnalytics: false,
  },
  pro: {
    maxTasks: Infinity,
    maxHabits: Infinity,
    maxGoals: Infinity,
    maxNotes: Infinity,
    hasAiAssistant: true,
    hasAdvancedAnalytics: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
