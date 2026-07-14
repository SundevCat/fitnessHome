// ---------------------------------------------------------------------------
// Core union types
// ---------------------------------------------------------------------------

export type Goal = "strength" | "muscle" | "fatloss" | "general";

export type Experience = "beginner" | "intermediate" | "advanced";

export type DaysPerWeek = 3 | 4 | 5 | 6;

export type Location = "gym" | "home_dumbbell" | "home_bodyweight" | "outdoor";

/** Used only to give a modest, non-exclusive emphasis on certain muscle
 * groups (see lib/generator.ts GENDER_EMPHASIS). It never removes any
 * exercise from anyone — every exercise stays available to every gender. */
export type Gender = "male" | "female" | "unspecified";

// Biceps and triceps are separate body parts (not a combined "arms") so
// that Push/Pull day assignment is anatomically correct: a "Push" day
// should only pull triceps work, a "Pull" day only biceps work — see
// lib/generator.ts SPLIT_TEMPLATES and the reference notes there.
export type BodyPart =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "core"
  | "glutes"
  | "calves";

export type EquipmentTag =
  | "machine"
  | "barbell"
  | "dumbbell"
  | "cable"
  | "bodyweight"
  | "band"
  | "bench"
  /** Needs a fixed bar to hang/pull from (pull-up bar). Available at gyms
   * and most outdoor calisthenics parks; NOT assumed present at home. */
  | "pullup_bar"
  /** Needs parallel dip bars / a dip station. Gyms and many outdoor parks
   * have these; not assumed at home. */
  | "dip_bars"
  /** A common household item used as a prop — a sturdy chair, step, low
   * table, or wall. Not "equipment" someone needs to buy, so it's allowed
   * even under the strict "no equipment at home" location. */
  | "prop"
  /** A literal jump rope. Cheap and common, but still a specific item you
   * need to own — not assumed present with zero equipment. */
  | "jump_rope"
  /** An ab wheel / ab roller device — specialty equipment, not assumed
   * present with zero equipment. */
  | "ab_wheel";

/**
 * How much technical skill / balance / injury-risk-if-poor-form an exercise
 * demands, independent of whether it's a compound or isolation movement.
 * Used only to *prioritize* (never exclude) exercises for beginners — see
 * lib/generator.ts for how "beginner" experience reorders each body part's
 * candidate queue toward lower-skill movements first, per ACSM/NSCA guidance
 * that novice lifters should start with machine, guided, or bodyweight
 * movements before progressing to free-weight barbell compound lifts that
 * demand more stabilization and technique (e.g. back squat, deadlift,
 * bent-over row, overhead press). See lib/exercises.ts header comment for
 * the classification reference and full reasoning.
 */
export type SkillLevel = "beginner" | "intermediate" | "advanced";

// ---------------------------------------------------------------------------
// Exercise database entities
// ---------------------------------------------------------------------------

export interface Exercise {
  id: string;
  nameTh: string;
  nameEn: string;
  bodyPart: BodyPart;
  equipment: EquipmentTag[];
  isCompound: boolean;
  skillLevel: SkillLevel;
  icon: BodyPart;
  /** ทางเลือกไม่มีเครื่อง — alternative exercise in Thai when the primary
   * piece of equipment is unavailable (e.g. gym missing that machine). */
  alternativeTh: string;
  /** Optional coaching cue / form tip in Thai. */
  cue?: string;
  /** Optional step-by-step how-to instructions in Thai, shown as an
   * expandable "วิธีทำละเอียด" detail in the exercise card. Translated from
   * the reference dataset's (hasaneyldrm/exercises-dataset) English
   * instruction_steps where a photo match exists; hand-written for the 4
   * exercises with no dataset match (back-superman, shoulders-pike-pushup,
   * glutes-donkey-kick, glutes-step-up). See scripts/fetch-exercise-photos.mjs
   * and agent.md for the source mapping. */
  stepsTh?: string[];
}

export interface ProgramExercise extends Exercise {
  sets: number;
  reps: string;
  restSec: number;
}

export interface ProgramDay {
  dayIndex: number;
  titleTh: string;
  focusTh: string;
  exercises: ProgramExercise[];
}

export interface GeneratedProgram {
  goal: Goal;
  experience: Experience;
  daysPerWeek: DaysPerWeek;
  location: Location;
  gender: Gender;
  days: ProgramDay[];
  notesTh: string[];
}

export interface FilterSelection {
  goal: Goal;
  experience: Experience;
  daysPerWeek: DaysPerWeek;
  location: Location;
  gender: Gender;
}
