import {
  BodyPart,
  DaysPerWeek,
  Experience,
  FilterSelection,
  Exercise,
  Gender,
  GeneratedProgram,
  Goal,
  Location,
  ProgramDay,
  ProgramExercise,
} from "./types";
import { getExercisesForBodyPartAtLocation } from "./exercises";

// ---------------------------------------------------------------------------
// Sets / reps / rest schemes — driven by Goal, applied per exercise based on
// whether it is a compound ("ท่าหลัก") or isolation ("ท่าเสริม") movement.
// ---------------------------------------------------------------------------

interface RepScheme {
  sets: number;
  reps: string;
  restSec: number;
}

interface GoalScheme {
  main: RepScheme;
  accessory: RepScheme;
}

const GOAL_SCHEMES: Record<Goal, GoalScheme> = {
  strength: {
    main: { sets: 4, reps: "5-6", restSec: 120 },
    accessory: { sets: 3, reps: "8-10", restSec: 90 },
  },
  muscle: {
    main: { sets: 4, reps: "8-10", restSec: 90 },
    accessory: { sets: 3, reps: "10-12", restSec: 60 },
  },
  fatloss: {
    main: { sets: 3, reps: "12-15", restSec: 45 },
    accessory: { sets: 3, reps: "15-20", restSec: 30 },
  },
  general: {
    main: { sets: 3, reps: "10-12", restSec: 60 },
    accessory: { sets: 3, reps: "12-15", restSec: 45 },
  },
};

/** Adjusts the number of *sets* slightly by experience (min 2, max 5). */
const SET_ADJUST_BY_EXPERIENCE: Record<Experience, number> = {
  beginner: -1,
  intermediate: 0,
  advanced: 1,
};

/** Extra exercises added on top of the day's body-part count, by experience. */
const EXTRA_EXERCISES_BY_EXPERIENCE: Record<Experience, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/**
 * Priority order used to reorder each body part's candidate exercise queue
 * for beginners only (see buildBeginnerQueue). Lower index = picked first.
 * Intermediate and advanced lifters get no reordering — the plain
 * compound-first, seeded-shuffle order applies, per ACSM guidance that
 * novices specifically (not all lifters) benefit from starting on
 * machine/guided/simple movements before free-weight barbell compounds.
 * This never removes an exercise from anyone — see lib/exercises.ts header
 * comment for the skillLevel classification reference and reasoning.
 */
const SKILL_PRIORITY: Record<Exercise["skillLevel"], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/**
 * Gender is used only as a modest emphasis knob — it never removes any
 * exercise or body part from anyone's program. Every exercise stays
 * available to every gender. When a day's split already includes one of
 * these emphasized body parts, that day gets one extra exercise slot and
 * a mild preference for picking from that body part during selection.
 * This mirrors a common, optional customization offered by many fitness
 * apps (e.g. more glute/core volume vs. more chest/back/arm volume) and
 * is meant as a starting preference, not a rule about what anyone "should"
 * train.
 */
const GENDER_EMPHASIS: Record<Gender, BodyPart[]> = {
  female: ["glutes", "core"],
  male: ["chest", "back", "biceps", "triceps"],
  unspecified: [],
};

// ---------------------------------------------------------------------------
// Weekly split templates — keyed by days-per-week. Each entry defines the
// ordered list of training days, the split-name shown in the tab, and which
// body parts that day trains (in priority order for exercise selection).
//
// Body-part assignment follows the standard Push/Pull/Legs convention:
// Push = chest + shoulders + TRICEPS (elbow-extension muscles used in all
// pushing movements); Pull = back + BICEPS (elbow-flexion muscles used in
// all pulling movements). Biceps never appear on a Push day and triceps
// never appear on a Pull day. Sources: push-pull-legs split guides from
// Aston University (aston.ac.uk/sport/news/tips/fitness-exercise/push-pull-legs),
// Healthline (healthline.com/nutrition/push-pull-workout), and StrengthLog
// (strengthlog.com/push-pull-legs-split) — all describe Push day as
// chest/shoulders/triceps and Pull day as back/biceps.
// ---------------------------------------------------------------------------

interface DayTemplate {
  splitNameTh: string;
  bodyParts: BodyPart[];
}

const SPLIT_TEMPLATES: Record<DaysPerWeek, DayTemplate[]> = {
  3: [
    { splitNameTh: "Full Body A", bodyParts: ["legs", "chest", "back", "shoulders", "core"] },
    { splitNameTh: "Full Body B", bodyParts: ["back", "legs", "chest", "biceps", "triceps", "glutes"] },
    { splitNameTh: "Full Body C", bodyParts: ["chest", "shoulders", "legs", "back", "core", "calves"] },
  ],
  4: [
    { splitNameTh: "Upper A", bodyParts: ["chest", "back", "shoulders", "biceps", "triceps"] },
    { splitNameTh: "Lower A", bodyParts: ["legs", "glutes", "calves", "core"] },
    { splitNameTh: "Upper B", bodyParts: ["back", "chest", "shoulders", "biceps", "triceps"] },
    { splitNameTh: "Lower B", bodyParts: ["legs", "glutes", "core", "calves"] },
  ],
  5: [
    { splitNameTh: "Push", bodyParts: ["chest", "shoulders", "triceps"] },
    { splitNameTh: "Pull", bodyParts: ["back", "biceps", "core"] },
    { splitNameTh: "Legs", bodyParts: ["legs", "glutes", "calves"] },
    { splitNameTh: "Upper", bodyParts: ["chest", "back", "shoulders", "biceps", "triceps"] },
    { splitNameTh: "Lower", bodyParts: ["legs", "glutes", "core", "calves"] },
  ],
  6: [
    { splitNameTh: "Push A", bodyParts: ["chest", "shoulders", "triceps"] },
    { splitNameTh: "Pull A", bodyParts: ["back", "biceps", "core"] },
    { splitNameTh: "Legs A", bodyParts: ["legs", "glutes", "calves"] },
    { splitNameTh: "Push B", bodyParts: ["chest", "shoulders", "triceps"] },
    { splitNameTh: "Pull B", bodyParts: ["back", "biceps", "core"] },
    { splitNameTh: "Legs B", bodyParts: ["legs", "glutes", "calves", "core"] },
  ],
};

export const BODY_PART_LABEL_TH: Record<BodyPart, string> = {
  chest: "หน้าอก",
  back: "หลัง",
  legs: "ขา",
  shoulders: "ไหล่",
  biceps: "ลูกหนู (ต้นแขนหน้า)",
  triceps: "หลังแขน (ต้นแขนหลัง)",
  core: "แกนกลางลำตัว",
  glutes: "สะโพก/ก้น",
  calves: "น่อง",
};

const WEEKDAY_LABELS_TH = [
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
  "วันอาทิตย์",
];

/** Picks which weekdays a given days-per-week program should land on. */
const WEEKDAY_INDEXES_BY_DAYS: Record<DaysPerWeek, number[]> = {
  3: [0, 2, 4], // Mon / Wed / Fri
  4: [0, 1, 3, 4], // Mon / Tue / Thu / Fri
  5: [0, 1, 2, 3, 4], // Mon-Fri
  6: [0, 1, 2, 3, 4, 5], // Mon-Sat
};

export function getWeekdayLabel(daysPerWeek: DaysPerWeek, dayIndex: number): string {
  const indexes = WEEKDAY_INDEXES_BY_DAYS[daysPerWeek];
  const weekdayIndex = indexes[dayIndex] ?? dayIndex;
  return WEEKDAY_LABELS_TH[weekdayIndex] ?? `วันที่ ${dayIndex + 1}`;
}

// ---------------------------------------------------------------------------
// Deterministic seeded shuffle — same filter selection always produces the
// same generated program (stable across reloads), while still varying the
// specific exercises picked between e.g. Full Body A / B / C.
// ---------------------------------------------------------------------------

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const random = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Builds the beginner candidate queue for one body part's pool: skill level
 * is the PRIMARY sort key (beginner-tier exercises always come before
 * intermediate/advanced ones, regardless of compound/isolation), with
 * compound-before-isolation only as a tiebreaker *within* the same skill
 * tier. This matters because a body part can have only one compound option
 * and it can happen to be advanced (e.g. Ab Wheel Rollout is the only
 * compound "core" exercise) — a naive "compounds first, then reorder by
 * skill within each half" scheme would still surface that advanced compound
 * ahead of a perfectly good beginner isolation option (e.g. Plank). Sorting
 * by skill first avoids that. Array.prototype.sort is stable in all modern
 * JS engines, so the seeded-shuffle ordering within each tier is preserved.
 */
function buildBeginnerQueue(pool: Exercise[], seed: number): Exercise[] {
  const shuffled = seededShuffle(pool, seed);
  return [...shuffled].sort((a, b) => {
    const skillDiff = SKILL_PRIORITY[a.skillLevel] - SKILL_PRIORITY[b.skillLevel];
    if (skillDiff !== 0) return skillDiff;
    if (a.isCompound !== b.isCompound) return a.isCompound ? -1 : 1;
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Exercise selection for a single training day.
// ---------------------------------------------------------------------------

function selectExercisesForDay(
  bodyParts: BodyPart[],
  location: Location,
  experience: Experience,
  targetCount: number,
  seed: number,
  emphasisBodyParts: BodyPart[] = []
): Exercise[] {
  // Build a candidate queue of exercises per body part. For intermediate/
  // advanced lifters: compound movements first, then isolations (both
  // seeded-shuffled), unaffected by skillLevel. For beginners: skillLevel
  // is the primary ordering key instead — see buildBeginnerQueue.
  const queues = new Map<BodyPart, Exercise[]>();
  bodyParts.forEach((bodyPart, i) => {
    const pool = getExercisesForBodyPartAtLocation(bodyPart, location);
    if (experience === "beginner") {
      queues.set(bodyPart, buildBeginnerQueue(pool, seed + hashString(bodyPart) + i));
      return;
    }
    const compounds = seededShuffle(
      pool.filter((e) => e.isCompound),
      seed + hashString(bodyPart) + i
    );
    const isolations = seededShuffle(
      pool.filter((e) => !e.isCompound),
      seed + hashString(bodyPart) + i + 1
    );
    queues.set(bodyPart, [...compounds, ...isolations]);
  });

  // Body parts visited once per round-robin pass. Emphasized body parts
  // (that are part of this day's split) get inserted a second time so
  // they're picked roughly twice as often as the round-robin repeats —
  // this only adds extra volume for that muscle group, it never removes
  // any other body part from the day.
  const baseOrder = seededShuffle(bodyParts, seed);
  const emphasisInDay = emphasisBodyParts.filter((bp) => bodyParts.includes(bp));
  const bodyPartOrder = [...baseOrder, ...emphasisInDay];

  const selected: Exercise[] = [];
  const usedIds = new Set<string>();

  let round = 0;
  while (selected.length < targetCount && round < 4) {
    let addedThisRound = false;
    for (const bodyPart of bodyPartOrder) {
      if (selected.length >= targetCount) break;
      const queue = queues.get(bodyPart) ?? [];
      const next = queue.find((e) => !usedIds.has(e.id));
      if (next) {
        selected.push(next);
        usedIds.add(next.id);
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break;
    round++;
  }

  return selected;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildProgramExercise(
  exercise: Exercise,
  goal: Goal,
  experience: Experience
): ProgramExercise {
  const scheme = GOAL_SCHEMES[goal];
  const base = exercise.isCompound ? scheme.main : scheme.accessory;
  const sets = clamp(base.sets + SET_ADJUST_BY_EXPERIENCE[experience], 2, 5);
  return {
    ...exercise,
    sets,
    reps: base.reps,
    restSec: base.restSec,
  };
}

// ---------------------------------------------------------------------------
// Notes — general coaching guidance shown alongside the generated program.
// ---------------------------------------------------------------------------

function buildNotes(filters: FilterSelection): string[] {
  const notes: string[] = [
    "วอร์มอัพ 5-10 นาทีก่อนเริ่มทุกครั้ง เช่น คาร์ดิโอเบาๆ และยืดเหยียดแบบไดนามิก เพื่อลดความเสี่ยงบาดเจ็บ",
    "ใช้หลัก Progressive Overload — เพิ่มน้ำหนัก จำนวนครั้ง หรือลดเวลาพักลงทีละน้อยเมื่อร่างกายทำได้สบายขึ้น",
    "นอนหลับ 7-9 ชั่วโมงต่อคืน เพราะกล้ามเนื้อฟื้นตัวและเติบโตระหว่างการพักผ่อน ไม่ใช่ระหว่างออกกำลังกาย",
    "ดื่มน้ำให้เพียงพอและเว้นวันพักระหว่างสัปดาห์ให้ร่างกายได้ฟื้นตัวเต็มที่",
  ];

  if (filters.goal === "fatloss") {
    notes.push("ควบคู่กับการคุมอาหารแบบขาดดุลแคลอรี่เล็กน้อย (Caloric Deficit) เพื่อผลลัพธ์ที่ดีที่สุด");
  }
  if (filters.goal === "strength") {
    notes.push("เน้นฟอร์มที่ถูกต้องก่อนเพิ่มน้ำหนัก และพักระหว่างเซตให้เต็มที่เพื่อแรงเต็มในเซตถัดไป");
  }
  if (filters.goal === "muscle") {
    notes.push("กินโปรตีนให้เพียงพอ (~1.6-2.2 กรัม/น้ำหนักตัว 1 กก.) เพื่อสนับสนุนการสร้างกล้ามเนื้อ");
  }
  if (filters.location === "home_bodyweight" || filters.location === "outdoor") {
    notes.push("เพิ่มความหนักได้ด้วยการช้าจังหวะการเคลื่อนไหว เพิ่มจำนวนครั้ง หรือลดเวลาพัก แทนการเพิ่มน้ำหนัก");
  }
  if (filters.location === "home_dumbbell") {
    notes.push("โปรแกรมนี้ใช้แค่ดัมเบล ม้านั่ง (ถ้ามี) และของใช้ในบ้านเท่านั้น ไม่รวมยางยืด/บาร์โหน/ล้อ/เชือกกระโดด");
  }
  if (filters.experience === "beginner") {
    notes.push("ช่วง 2-3 สัปดาห์แรกให้เน้นเรียนรู้ฟอร์มท่าที่ถูกต้องมากกว่าน้ำหนักหรือความหนัก");
    notes.push("โปรแกรมนี้จัดลำดับให้ท่าที่ควบคุมง่ายกว่า (เครื่อง/ดัมเบล/บอดี้เวทพื้นฐาน) ขึ้นก่อนท่าบาร์เบลอิสระที่ต้องใช้ทักษะสูง เช่น บาร์เบลสควอท เดดลิฟต์ เพื่อให้ฝึกฟอร์มได้มั่นใจก่อน — ถ้าอยากลองท่าบาร์เบลอิสระเร็วขึ้นก็ทำได้ตามความพร้อม");
  }
  if (filters.gender === "female") {
    notes.push("โปรแกรมนี้เน้นน้ำหนักเพิ่มเล็กน้อยที่สะโพก/ก้นและแกนกลางลำตัว แต่ทุกท่าในฐานข้อมูลยังใช้ฝึกได้เหมือนกันทุกเพศ ปรับสัดส่วนได้ตามที่ชอบ");
  }
  if (filters.gender === "male") {
    notes.push("โปรแกรมนี้เน้นน้ำหนักเพิ่มเล็กน้อยที่อก/หลัง/แขน แต่ทุกท่าในฐานข้อมูลยังใช้ฝึกได้เหมือนกันทุกเพศ ปรับสัดส่วนได้ตามที่ชอบ");
  }

  return notes;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function generateProgram(filters: FilterSelection): GeneratedProgram {
  const { goal, experience, daysPerWeek, location, gender } = filters;
  const templates = SPLIT_TEMPLATES[daysPerWeek];
  const emphasisBodyParts = GENDER_EMPHASIS[gender];

  const baseSeed = hashString(`${goal}-${experience}-${daysPerWeek}-${location}-${gender}`);

  const days: ProgramDay[] = templates.map((template, dayIndex) => {
    const hasEmphasis = emphasisBodyParts.some((bp) => template.bodyParts.includes(bp));
    const targetCount = clamp(
      template.bodyParts.length + EXTRA_EXERCISES_BY_EXPERIENCE[experience] + (hasEmphasis ? 1 : 0),
      4,
      8
    );
    const daySeed = baseSeed + hashString(template.splitNameTh) + dayIndex * 97;
    const exercises = selectExercisesForDay(
      template.bodyParts,
      location,
      experience,
      targetCount,
      daySeed,
      emphasisBodyParts
    ).map((exercise) => buildProgramExercise(exercise, goal, experience));

    const focusTh = template.bodyParts.map((bp) => BODY_PART_LABEL_TH[bp]).join(" · ");

    return {
      dayIndex,
      titleTh: `${getWeekdayLabel(daysPerWeek, dayIndex)} · ${template.splitNameTh}`,
      focusTh,
      exercises,
    };
  });

  return {
    goal,
    experience,
    daysPerWeek,
    location,
    gender,
    days,
    notesTh: buildNotes(filters),
  };
}
