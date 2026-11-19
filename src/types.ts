export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type Exercise = {
  id: string;
  name: string;
  muscle: MuscleGroup;
};

export type PlanEntry = {
  exerciseId: string;
  sets: number;
  reps: number;
};

export type TabId = 'create-exercise' | 'swp';
