#!/usr/bin/env node
/**
 * Downloads real exercise animation GIFs for this project's exercise database.
 *
 * Source: hasaneyldrm/exercises-dataset (GitHub)
 * https://github.com/hasaneyldrm/exercises-dataset
 *
 * License: "Educational and non-commercial purposes only... You may use
 * this dataset for personal projects, research, and learning. You may not
 * use this dataset or its media for any commercial application or product."
 * This project is a personal, non-commercial planner, so this use is
 * within the stated license. Do not use these downloaded images in any
 * commercial product.
 *
 * What this script does:
 *   1. Downloads data/exercises.json from the dataset (1,324 exercises).
 *   2. Matches each exercise in lib/exercises.ts against the dataset — either
 *      a pinned exact name (`exactNameMatch`), a deliberate skip (`skip`),
 *      or fuzzy scoring by name + category + target muscle + equipment.
 *   3. Downloads the matched animation GIF into public/exercises/{id}.gif.
 *   4. Prints a matched / unmatched / skipped report so you can sanity-check
 *      which dataset exercise each of ours got matched to.
 *
 * Exercises that don't get a confident match simply won't have a file in
 * public/exercises/ — the app already falls back to the hand-drawn SVG
 * icon for any exercise whose photo is missing (see
 * components/ExercisePhoto.tsx), so it's always safe to (re-)run this.
 *
 * HISTORY: this dataset's exercises.json is ~1,300 entries and this
 * sandbox can only fetch a small truncated slice of it directly, so the
 * fuzzy matcher was originally tuned mostly blind. The user then
 * downloaded the full JSON locally and shared it, which made it possible
 * to run the real matching logic and exhaustively search the complete
 * dataset instead of guessing. That surfaced two categories of exercise:
 *   - `exactNameMatch`: the dataset DOES have a correct entry, pinned
 *     directly by name instead of relying on fuzzy scoring.
 *   - Exercises with NO good match anywhere in the dataset — for these,
 *     see lib/exercises.ts: the exercise itself was swapped for a close,
 *     verified-real equivalent (new id, same body part, same or noted-
 *     different equipment) wherever a reasonable one existed. A few
 *     (Superman Hold, Pike Push-up, Donkey Kick, Step-up) still have no
 *     real equivalent and keep `skip: true` — they always show the SVG
 *     icon rather than force a wrong match.
 * None of this was visually re-verified (this sandbox still can't
 * download/view GIF bytes) — it's confirmed by name + equipment + target
 * muscle all lining up, which is about as certain as text matching gets.
 * Always read the "OK ... <- ..." log lines after running; if a match
 * still looks wrong, delete that public/exercises/{id}.gif file and the
 * app will fall back to the SVG icon for it.
 *
 * Usage:
 *   node scripts/fetch-exercise-photos.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "exercises");

const DATA_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json";
const RAW_BASE =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";

// ---------------------------------------------------------------------------
// Maps our own EquipmentTag (lib/types.ts) to the dataset's "equipment"
// string values. Confirmed directly against a full local copy of the
// dataset (1,324 entries): "body weight", "cable", "leverage machine",
// "smith machine", "resistance band", "band", "barbell", "dumbbell",
// "assisted", "medicine ball", "wheel roller", "rope", "weighted",
// "stability ball", "roller", "kettlebell".
// ---------------------------------------------------------------------------
const DATASET_EQUIPMENT_BY_TAG = {
  machine: ["leverage machine", "smith machine", "sled machine"],
  barbell: ["barbell", "olympic barbell", "ez barbell", "trap bar"],
  dumbbell: ["dumbbell"],
  cable: ["cable"],
  bodyweight: ["body weight", "assisted"],
  band: ["resistance band", "band"],
  bench: [],
  pullup_bar: ["body weight"],
  dip_bars: ["body weight"],
  prop: ["body weight"],
  jump_rope: ["rope"],
  ab_wheel: ["wheel roller"],
};

// ---------------------------------------------------------------------------
// The exercises from lib/exercises.ts, with a search query (their English
// name), the dataset "category" values, "target" muscle values, "equipment"
// (our own EquipmentTag), and optional tuning knobs:
//   - exactNameMatch: skip fuzzy scoring entirely and use this dataset
//     `name` value directly (case-insensitive). Verified against the full
//     dataset.
//   - skip: true — no confident match exists in the dataset at all (verified
//     by exhaustive keyword search against the full dataset); always falls
//     back to the SVG icon. See `skipReason`.
//   - excludeKeywords / preferKeywords: nudge fuzzy scoring for exercises
//     that aren't pinned or skipped.
// Keep this list in sync if lib/exercises.ts changes.
// ---------------------------------------------------------------------------

const MATCH_TARGETS = [
  // chest
  { id: "chest-barbell-bench-press", query: "Barbell Bench Press", categories: ["chest"], targets: ["pectorals"], equipment: "barbell" },
  { id: "chest-dumbbell-bench-press", query: "Dumbbell Bench Press", categories: ["chest"], targets: ["pectorals"], equipment: "dumbbell" },
  { id: "chest-machine-chest-press", query: "Machine Chest Press", categories: ["chest"], targets: ["pectorals"], equipment: "machine" },
  { id: "chest-pushup", query: "Push-up", categories: ["chest"], targets: ["pectorals"], equipment: "bodyweight" },
  { id: "chest-decline-pushup", query: "Decline Push-up", categories: ["chest"], targets: ["pectorals"], equipment: "prop" },
  { id: "chest-cable-fly", query: "Cable Fly Chest", categories: ["chest"], targets: ["pectorals"], equipment: "cable" },
  { id: "chest-dumbbell-fly", query: "Dumbbell Fly", categories: ["chest"], targets: ["pectorals"], equipment: "dumbbell" },
  { id: "chest-incline-dumbbell-press", query: "Incline Dumbbell Bench Press", categories: ["chest"], targets: ["pectorals"], equipment: "dumbbell" },
  { id: "chest-dips", query: "Chest Dip", categories: ["chest", "upper arms"], targets: ["pectorals"], equipment: "dip_bars" },

  // back
  { id: "back-deadlift", query: "Barbell Deadlift", categories: ["back", "upper legs"], targets: ["glutes", "spine", "lats"], equipment: "barbell" },
  { id: "back-lat-pulldown", query: "Lat Pulldown", categories: ["back"], targets: ["lats"], equipment: "cable" },
  { id: "back-pullup", query: "Pull-up", categories: ["back"], targets: ["lats"], equipment: "pullup_bar" },
  { id: "back-bent-over-row", query: "Bent Over Barbell Row", categories: ["back"], targets: ["lats", "spine"], equipment: "barbell" },
  { id: "back-dumbbell-row", query: "Single Arm Dumbbell Row", categories: ["back"], targets: ["lats", "spine"], equipment: "dumbbell" },
  { id: "back-seated-cable-row", query: "Seated Cable Row", categories: ["back"], targets: ["lats", "spine"], equipment: "cable" },
  // Was "back-face-pull" — swapped in lib/exercises.ts because no "face
  // pull" entry exists anywhere in the dataset. Pinned to the verified
  // real replacement exercise.
  { id: "back-band-rear-delt-row", query: "Band Standing Rear Delt Row", categories: ["back", "shoulders"], targets: ["delts", "traps"], equipment: "band", exactNameMatch: "band standing rear delt row" },
  // Skipped — the only "superman" entry in the dataset is "superman
  // push-up" (a chest push-up variant), not a prone back-extension hold.
  // A "Hyperextension" entry exists but its instructions require a
  // hyperextension bench/apparatus despite being tagged "body weight" —
  // using it would break this exercise's zero-equipment promise, so it
  // was NOT swapped; kept as-is with no photo.
  { id: "back-superman", query: "Superman", categories: ["back", "waist"], targets: ["spine"], equipment: "bodyweight", skip: true, skipReason: "only 'superman push-up' exists (different exercise); the one 'hyperextension' entry needs a bench despite its equipment tag, so it isn't a true bodyweight substitute" },
  // Was "back-prone-ytw-raise" — swapped in lib/exercises.ts because no
  // Y-T-W raise or bodyweight equivalent exists in the dataset. Pinned to
  // the verified real replacement (equipment changed to band).
  { id: "back-band-reverse-fly", query: "Band Reverse Fly", categories: ["back", "shoulders"], targets: ["delts", "traps"], equipment: "band", exactNameMatch: "band reverse fly" },

  // legs
  { id: "legs-barbell-squat", query: "Barbell Full Squat", categories: ["upper legs"], targets: ["quads", "glutes"], equipment: "barbell" },
  { id: "legs-leg-press", query: "Leg Press", categories: ["upper legs"], targets: ["quads"], equipment: "machine" },
  { id: "legs-goblet-squat", query: "Goblet Squat", categories: ["upper legs"], targets: ["quads", "glutes"], equipment: "dumbbell" },
  { id: "legs-bulgarian-split-squat", query: "Bulgarian Split Squat", categories: ["upper legs"], targets: ["quads", "glutes"], equipment: "prop" },
  // Was "legs-bodyweight-squat" — swapped in lib/exercises.ts because
  // every plain bodyweight "squat" entry in the dataset turned out to be
  // a variant (jump, pistol, curtsy, sissy...). Pinned to a real
  // supported-squat entry (equipment changed to prop).
  { id: "legs-potty-squat-support", query: "Potty Squat With Support", categories: ["upper legs"], targets: ["glutes", "quads"], equipment: "prop", exactNameMatch: "potty squat with support" },
  { id: "legs-leg-extension", query: "Leg Extension", categories: ["upper legs"], targets: ["quads"], equipment: "machine" },
  { id: "legs-leg-curl", query: "Leg Curl", categories: ["upper legs"], targets: ["hamstrings"], equipment: "machine" },
  { id: "legs-walking-lunge", query: "Walking Lunge", categories: ["upper legs"], targets: ["quads", "glutes"], equipment: "bodyweight", preferKeywords: ["lunge"] },
  { id: "legs-romanian-deadlift", query: "Dumbbell Romanian Deadlift", categories: ["upper legs", "back"], targets: ["hamstrings", "glutes"], equipment: "dumbbell" },

  // shoulders
  { id: "shoulders-overhead-press", query: "Barbell Overhead Press", categories: ["shoulders"], targets: ["delts"], equipment: "barbell" },
  { id: "shoulders-dumbbell-press", query: "Dumbbell Shoulder Press", categories: ["shoulders"], targets: ["delts"], equipment: "dumbbell" },
  // Re-pinned — the original pin ("lever shoulder press", id 0603) was
  // verified correct by name/equipment/target against a local snapshot of
  // the dataset, but two live downloads both returned a landmine
  // squat/press clip instead — almost certainly a mislabeled gif_url on
  // that specific dataset entry (upstream data bug), not a matching-logic
  // bug (a pinned exactNameMatch can only download whatever gif_url that
  // entry has, so if this entry is wrong, the fix has to be pinning a
  // different equivalent). Re-pinned to id 0765 "smith seated shoulder
  // press" instead — equipment "smith machine" (still covered by our
  // "machine" tag), target "delts", and its instructions text reads as a
  // coherent, correctly-labeled seated machine shoulder press.
  { id: "shoulders-machine-press", query: "Machine Shoulder Press", categories: ["shoulders"], targets: ["delts"], equipment: "machine", exactNameMatch: "smith seated shoulder press" },
  { id: "shoulders-lateral-raise", query: "Dumbbell Lateral Raise", categories: ["shoulders"], targets: ["delts"], equipment: "dumbbell" },
  // Pinned — confirmed against the full dataset: id 0977, equipment "band",
  // target "delts".
  { id: "shoulders-band-lateral-raise", query: "Standing Band Lateral Raise", categories: ["shoulders"], targets: ["delts"], equipment: "band", exactNameMatch: "band front lateral raise" },
  // Skipped — dataset only has "exercise ball pike push up" (needs a
  // stability ball) and "pike-to-cobra push-up" (a different combined
  // movement); no plain bodyweight pike push-up.
  { id: "shoulders-pike-pushup", query: "Pike Push-up", categories: ["shoulders", "chest"], targets: ["delts"], equipment: "bodyweight", skip: true, skipReason: "only a stability-ball variant and a different combined movement exist; no plain bodyweight pike push-up" },
  // Pinned — confirmed against the full dataset: id 0378, equipment
  // "dumbbell", target "delts".
  { id: "shoulders-rear-delt-fly", query: "Standing Rear Delt Fly", categories: ["shoulders"], targets: ["delts"], equipment: "dumbbell", exactNameMatch: "dumbbell rear fly" },
  // Pinned — confirmed against the full dataset: id 0178, equipment
  // "cable", target "delts".
  { id: "shoulders-cable-lateral-raise", query: "Cable Lateral Raise", categories: ["shoulders"], targets: ["delts"], equipment: "cable", exactNameMatch: "cable lateral raise" },

  // biceps (Pull-day only — see lib/generator.ts)
  { id: "biceps-barbell-curl", query: "Barbell Curl", categories: ["upper arms"], targets: ["biceps"], equipment: "barbell" },
  { id: "biceps-dumbbell-curl", query: "Dumbbell Bicep Curl", categories: ["upper arms"], targets: ["biceps"], equipment: "dumbbell" },
  { id: "biceps-hammer-curl", query: "Hammer Curl", categories: ["upper arms", "lower arms"], targets: ["biceps", "forearms"], equipment: "dumbbell" },
  { id: "biceps-band-curl", query: "Band Curl", categories: ["upper arms"], targets: ["biceps"], equipment: "band" },
  // Was "biceps-self-resistance-curl" (a technique this project invented)
  // — swapped in lib/exercises.ts for a real dataset exercise with the
  // same equipment (bodyweight).
  { id: "biceps-side-lying-curl", query: "Bodyweight Side Lying Biceps Curl", categories: ["upper arms"], targets: ["biceps"], equipment: "bodyweight", exactNameMatch: "bodyweight side lying biceps curl" },

  // triceps (Push-day only — see lib/generator.ts)
  { id: "triceps-cable-pushdown", query: "Cable Tricep Pushdown", categories: ["upper arms"], targets: ["triceps"], equipment: "cable" },
  { id: "triceps-bench-dips", query: "Bench Dip Tricep", categories: ["upper arms"], targets: ["triceps"], equipment: "prop" },
  // Pinned — confirmed against the full dataset, equipment "dumbbell",
  // target "triceps". More literally "overhead" than the fuzzy scorer's
  // previous pick ("dumbbell decline triceps extension", a different
  // variant).
  { id: "triceps-overhead-extension", query: "Overhead Triceps Extension", categories: ["upper arms"], targets: ["triceps"], equipment: "dumbbell", exactNameMatch: "dumbbell seated reverse grip one arm overhead tricep extension" },
  { id: "triceps-diamond-pushup", query: "Diamond Push-up", categories: ["upper arms", "chest"], targets: ["triceps"], equipment: "bodyweight" },

  // core
  { id: "core-plank", query: "Plank", categories: ["waist"], targets: ["abs"], equipment: "bodyweight" },
  { id: "core-cable-crunch", query: "Cable Crunch", categories: ["waist"], targets: ["abs"], equipment: "cable" },
  { id: "core-hanging-leg-raise", query: "Hanging Leg Raise", categories: ["waist"], targets: ["abs"], equipment: "pullup_bar" },
  { id: "core-russian-twist", query: "Russian Twist", categories: ["waist"], targets: ["abs"], equipment: "bodyweight" },
  { id: "core-ab-wheel", query: "Ab Wheel Rollout", categories: ["waist"], targets: ["abs"], equipment: "ab_wheel" },
  { id: "core-mountain-climber", query: "Mountain Climber", categories: ["waist", "cardio"], targets: ["abs"], equipment: "bodyweight" },
  { id: "core-dead-bug", query: "Dead Bug", categories: ["waist"], targets: ["abs"], equipment: "bodyweight" },

  // glutes
  { id: "glutes-hip-thrust", query: "Barbell Hip Thrust", categories: ["upper legs"], targets: ["glutes"], equipment: "barbell" },
  // Pinned — confirmed against the full dataset: "low glute bridge on
  // floor" (body weight, glutes) is a plain basic bridge, more accurate
  // than the fuzzy scorer's previous pick ("glute bridge march", a harder
  // alternating-leg variant).
  { id: "glutes-glute-bridge", query: "Glute Bridge", categories: ["upper legs", "waist"], targets: ["glutes"], equipment: "bodyweight", exactNameMatch: "low glute bridge on floor" },
  // Was "glutes-cable-kickback" — swapped in lib/exercises.ts because
  // every "kickback" entry in the dataset targets triceps, not glutes.
  // Pinned to the verified real replacement (same equipment: cable).
  { id: "glutes-cable-hip-extension", query: "Cable Standing Hip Extension", categories: ["upper legs"], targets: ["glutes"], equipment: "cable", exactNameMatch: "cable standing hip extension" },
  // Skipped — searched the full dataset for "donkey": every result is a
  // calf raise ("donkey calf raise"), there is no glute donkey kick.
  { id: "glutes-donkey-kick", query: "Donkey Kick", categories: ["upper legs"], targets: ["glutes"], equipment: "bodyweight", skip: true, skipReason: "every 'donkey' entry in the dataset is a calf raise; no glute donkey kick exists" },
  // Skipped — every "step-up" entry in the dataset needs a dumbbell,
  // barbell, or band; none is the plain bodyweight/prop (chair or step)
  // version this exercise represents.
  { id: "glutes-step-up", query: "Step-up", categories: ["upper legs"], targets: ["glutes", "quads"], equipment: "prop", skip: true, skipReason: "every step-up entry requires loaded equipment (dumbbell/barbell/band); no plain bodyweight step-up exists" },
  // Was "glutes-sumo-squat" — swapped in lib/exercises.ts because the only
  // "sumo" squat entry is Smith-machine-loaded. Pinned to the verified
  // real replacement (same equipment: bodyweight).
  { id: "glutes-curtsy-squat", query: "Curtsy Squat", categories: ["upper legs"], targets: ["glutes"], equipment: "bodyweight", exactNameMatch: "curtsey squat" },

  // calves
  { id: "calves-standing-raise", query: "Standing Calf Raise", categories: ["lower legs"], targets: ["calves"], equipment: "machine" },
  { id: "calves-dumbbell-raise", query: "Dumbbell Standing Calf Raise", categories: ["lower legs"], targets: ["calves"], equipment: "dumbbell" },
  { id: "calves-bodyweight-raise", query: "Standing Calf Raise Bodyweight", categories: ["lower legs"], targets: ["calves"], equipment: "bodyweight" },
  { id: "calves-seated-raise", query: "Seated Calf Raise", categories: ["lower legs"], targets: ["calves"], equipment: "machine" },
  { id: "calves-jump-rope", query: "Jump Rope", categories: ["cardio", "lower legs"], targets: ["calves"], equipment: "jump_rope" },
];

// ---------------------------------------------------------------------------
// Fuzzy matching helpers
// ---------------------------------------------------------------------------

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[-/()]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(str) {
  return new Set(normalize(str).split(" ").filter(Boolean));
}

function diceScore(a, b) {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let overlap = 0;
  for (const token of setA) {
    if (setB.has(token)) overlap++;
  }
  return (2 * overlap) / (setA.size + setB.size);
}

function scoreCandidate(target, candidate) {
  let score = diceScore(target.query, candidate.name);
  if (target.categories.includes(candidate.category)) {
    score += 0.2;
  }
  if (target.targets && candidate.target && target.targets.includes(candidate.target)) {
    score += 0.2;
  }
  if (normalize(candidate.name) === normalize(target.query)) {
    score += 0.3;
  }

  if (target.equipment) {
    const accepted = DATASET_EQUIPMENT_BY_TAG[target.equipment] ?? [];
    const candEquip = (candidate.equipment || "").toLowerCase().trim();
    if (accepted.length > 0 && candEquip) {
      if (accepted.includes(candEquip)) {
        score += 0.25;
      } else {
        score -= 0.35;
      }
    }
  }

  if (target.excludeKeywords) {
    const nameNorm = normalize(candidate.name);
    for (const kw of target.excludeKeywords) {
      if (nameNorm.includes(normalize(kw))) {
        score -= 0.4;
        break;
      }
    }
  }

  if (target.preferKeywords) {
    const nameNorm = normalize(candidate.name);
    for (const kw of target.preferKeywords) {
      if (nameNorm.includes(normalize(kw))) {
        score += 0.15;
        break;
      }
    }
  }

  return score;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const MATCH_THRESHOLD = 0.42;

async function main() {
  console.log(`Fetching exercise dataset from:\n  ${DATA_URL}\n`);
  const res = await fetch(DATA_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch dataset: HTTP ${res.status}`);
  }
  const dataset = await res.json();
  console.log(`Loaded ${dataset.length} exercises from the dataset.\n`);

  await mkdir(OUT_DIR, { recursive: true });

  const usedDatasetIds = new Set();
  const matched = [];
  const unmatched = [];
  const skipped = MATCH_TARGETS.filter((t) => t.skip);

  for (const target of MATCH_TARGETS) {
    if (target.skip) continue; // always falls back to the SVG icon — see skipReason above

    let best = null;
    let bestScore = 0;

    if (target.exactNameMatch) {
      const wanted = normalize(target.exactNameMatch);
      const pinned = dataset.find(
        (c) => !usedDatasetIds.has(c.id) && normalize(c.name) === wanted
      );
      if (pinned) {
        best = pinned;
        bestScore = 99; // pinned matches are reported with a distinct score
      }
    } else {
      for (const candidate of dataset) {
        if (usedDatasetIds.has(candidate.id)) continue;
        const score = scoreCandidate(target, candidate);
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
    }

    if (best && (bestScore >= MATCH_THRESHOLD || target.exactNameMatch)) {
      usedDatasetIds.add(best.id);
      matched.push({ target, candidate: best, score: bestScore });
    } else {
      unmatched.push(target);
    }
  }

  console.log(`Matched ${matched.length}/${MATCH_TARGETS.length - skipped.length} attempted exercises. Downloading animation GIFs...\n`);

  let downloaded = 0;
  let failed = 0;

  for (const { target, candidate, score } of matched) {
    const imageUrl = RAW_BASE + candidate.gif_url;
    const destPath = path.join(OUT_DIR, `${target.id}.gif`);
    try {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      await writeFile(destPath, buffer);
      downloaded++;
      const scoreLabel = score === 99 ? "pinned" : score.toFixed(2);
      console.log(
        `  OK   ${target.id.padEnd(34)} <- "${candidate.name}" (equipment: ${candidate.equipment ?? "?"}, target: ${candidate.target ?? "?"}, score ${scoreLabel})`
      );
    } catch (err) {
      failed++;
      console.log(`  FAIL ${target.id.padEnd(34)} <- "${candidate.name}" (${err.message})`);
    }
  }

  console.log("\n---------------------------------------------");
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed:     ${failed}`);
  console.log(`Unmatched:  ${unmatched.length}`);
  console.log(`Skipped:    ${skipped.length} (no confident match exists in the dataset — see skipReason)`);
  if (unmatched.length > 0) {
    console.log("\nExercises with no confident match (SVG icon will be shown instead):");
    for (const t of unmatched) {
      console.log(`  - ${t.id} ("${t.query}")`);
    }
  }
  if (skipped.length > 0) {
    console.log("\nExercises with matching intentionally disabled (SVG icon shown instead):");
    for (const t of skipped) {
      console.log(`  - ${t.id}: ${t.skipReason ?? "no reason given"}`);
    }
  }
  console.log("\nCheck the \"OK\" lines above against the exercise names AND equipment — if any");
  console.log("match looks wrong, delete that file from public/exercises/ and the app will");
  console.log("fall back to its SVG icon.");
  console.log("\nDone. Run `npm run dev` and check the program page.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
