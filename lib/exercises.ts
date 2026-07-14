import { BodyPart, EquipmentTag, Exercise, Location } from "./types";

// ---------------------------------------------------------------------------
// Static exercise database.
//
// This module is intentionally structured as pure data + pure functions so
// that it can later be swapped for a MongoDB-backed data layer (e.g. an
// async `getExercises()` that queries a collection) without touching the
// generator logic in `lib/generator.ts`, which only depends on the
// `Exercise` shape and the helper functions exported below.
//
// Classification reference: body-part / muscle-group and equipment
// assignments follow the conventions used by ExRx.net's exercise directory
// (exrx.net/Lists/Directory — an exercise-science reference site operating
// since 1999) and standard Push/Pull/Legs split literature (chest+
// shoulders+triceps on Push, back+biceps on Pull — see e.g.
// aston.ac.uk/sport/news/tips/fitness-exercise/push-pull-legs and
// strengthlog.com/push-pull-legs-split). See lib/generator.ts for how the
// splits use these body parts.
//
// skillLevel classification reference: ACSM ("Selecting and Effectively
// Using Free Weights", acsm.org) and NSCA exercise-technique guidance both
// note that free-weight barbell compound lifts demand more balance,
// stabilizer strength, and technical coaching than machine, cable, band, or
// simple bodyweight movements, and recommend novices start with the latter.
// Rule of thumb applied here:
//   - beginner: machine exercises (fixed guided path), band exercises (low
//     external load, safe failure mode), and bodyweight/dumbbell isolation
//     movements with minimal balance or technique demand.
//   - intermediate: dumbbell or cable compound movements needing moderate
//     stabilization, and bodyweight moves needing more coordination/balance
//     or relative strength (e.g. pull-up, walking lunge, diamond push-up,
//     single-leg/crossing-leg squat variants).
//   - advanced: free-weight barbell COMPOUND lifts (back squat, deadlift,
//     bent-over row, overhead press, bench press, barbell hip thrust) plus
//     a few non-barbell moves with outsized injury risk or skill demand for
//     a true beginner (ab wheel rollout, hanging leg raise, Bulgarian split
//     squat, dip-bar chest dips). Barbell CURLS are the exception — they're
//     single-joint elbow flexion with no balance demand, so they stay
//     beginner despite using a barbell.
// skillLevel only ever *reorders priority* for beginners in the generator
// (see lib/generator.ts) — it never removes an exercise from anyone.
//
// Equipment tagging rules (important — keeps location filtering honest):
//   - A tag is only included if the exercise genuinely cannot be done
//     without that item. Two tags means BOTH are required together (e.g.
//     "dumbbell" + "bench"), never "either/or" — interchangeable variants
//     get their own separate exercise entry instead.
//   - "bodyweight" means literally zero equipment: no bar, no bench, no
//     purchased item of any kind.
//   - "prop" means a common household item (a chair, step, low table,
//     wall) — not something you need to buy, so it's still allowed under
//     the strict "no equipment at home" location.
//   - "pullup_bar" / "dip_bars" are fixed apparatus assumed present at
//     gyms and most outdoor calisthenics parks, but NOT assumed at home
//     (even a "home with dumbbells" setup — owning dumbbells doesn't
//     imply owning a pull-up bar).
//   - "jump_rope" / "ab_wheel" are cheap but specific purchased items —
//     not assumed present unless the location is a gym.
//
// PHOTO-MATCHING SUBSTITUTIONS (see scripts/fetch-exercise-photos.mjs and
// agent.md for full history): several exercises were swapped for a very
// close equivalent because the reference photo/GIF dataset
// (hasaneyldrm/exercises-dataset) had no clip at all for the original pick,
// confirmed by exhaustively searching a full local copy of that dataset —
// not guessed. Each swap keeps the same body part and (with two noted
// exceptions) the same equipment tag, so it doesn't change what a location
// requires:
//   - Face Pull -> Band Standing Rear Delt Row (same equipment: band)
//   - Prone Y-T-W Raise -> Band Reverse Fly (equipment changed: bodyweight
//     -> band, since no bodyweight-only reverse-fly-type movement exists
//     in the dataset at all)
//   - Bodyweight Squat -> Potty Squat With Support (equipment changed:
//     bodyweight -> prop, i.e. holding a chair/wall for balance — still
//     allowed under the strict "no equipment at home" location)
//   - Self-Resistance Curl -> Bodyweight Side-Lying Biceps Curl (same
//     equipment: bodyweight; this is a real dataset exercise replacing a
//     technique this project invented to fill a gap)
//   - Cable Glute Kickback -> Cable Standing Hip Extension (same
//     equipment: cable; essentially the same movement pattern)
//   - Sumo Squat -> Curtsy Squat (same equipment: bodyweight)
// Superman Hold was considered for a swap to "Hyperextension", but that
// dataset entry's instructions require a hyperextension bench/apparatus
// despite being tagged "body weight" equipment — using it would have
// broken the "zero equipment" promise this exercise exists to serve, so
// Superman Hold was kept as-is (no photo; SVG icon shown instead), same as
// Pike Push-up, Donkey Kick, and Step-up, which also have no real
// equivalent in the dataset.
// ---------------------------------------------------------------------------

export const EXERCISES: Exercise[] = [
  // ------------------------------------------------------------- CHEST ----
  {
    id: "chest-barbell-bench-press",
    nameTh: "บาร์เบลเบนช์เพรส",
    nameEn: "Barbell Bench Press",
    bodyPart: "chest",
    equipment: ["barbell", "bench"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "chest",
    alternativeTh: "วิดพื้น (Push-up) แบบเน้นช้าและควบคุมจังหวะ",
    cue: "หัวไหล่แนบม้านั่ง ดันบาร์ขึ้นเป็นเส้นตรง",
    stepsTh: [
      "นอนราบบนม้านั่ง เท้าเหยียบพื้นมั่นคง หลังแนบม้านั่ง",
      "จับบาร์เบลด้วยมือคว่ำ กว้างกว่าหัวไหล่เล็กน้อย",
      "ยกบาร์เบลออกจากขาตั้ง ยกเหนืออกโดยเหยียดแขนตรง",
      "ค่อยๆ หย่อนบาร์เบลลงมาที่อก หุบข้อศอกเข้าหาลำตัว",
      "ค้างไว้ครู่หนึ่งเมื่อบาร์เบลแตะอก แล้วดันกลับขึ้นจนแขนเหยียดตรง",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-dumbbell-bench-press",
    nameTh: "ดัมเบลเบนช์เพรส",
    nameEn: "Dumbbell Bench Press",
    bodyPart: "chest",
    equipment: ["dumbbell", "bench"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "chest",
    alternativeTh: "วิดพื้นกว้าง (Wide Push-up)",
    cue: "ควบคุมจังหวะลงช้า หยุดเบาๆ ที่จุดต่ำสุด",
    stepsTh: [
      "นอนราบบนม้านั่ง เท้าเหยียบพื้น หลังแนบม้านั่ง",
      "ถือดัมเบลข้างละลูก ฝ่ามือหันไปด้านหน้า ยกแขนเหนืออก",
      "ค่อยๆ หย่อนดัมเบลลงข้างอก งอข้อศอกทำมุมประมาณ 90 องศา",
      "ค้างไว้ครู่หนึ่ง แล้วดันดัมเบลกลับขึ้นจนแขนเหยียดตรง",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-machine-chest-press",
    nameTh: "เชสต์เพรส (เครื่อง)",
    nameEn: "Machine Chest Press",
    bodyPart: "chest",
    equipment: ["machine"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "chest",
    alternativeTh: "วิดพื้นมาตรฐาน (Standard Push-up)",
    cue: "ปรับเบาะให้ด้ามจับอยู่ระดับหน้าอก",
    stepsTh: [
      "ปรับความสูงเบาะนั่งแล้วนั่งพิงพนักให้หลังแนบสนิท",
      "จับด้ามจับด้วยมือคว่ำ ตั้งข้อศอกทำมุม 90 องศา",
      "ดันด้ามจับไปข้างหน้าจนแขนเหยียดตรง หายใจออกขณะดัน",
      "ค้างไว้ครู่หนึ่ง แล้วค่อยๆ กลับสู่ท่าเริ่มต้น หายใจเข้าขณะถอย",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-pushup",
    nameTh: "วิดพื้น",
    nameEn: "Push-up",
    bodyPart: "chest",
    equipment: ["bodyweight"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "chest",
    alternativeTh: "วิดพื้นแบบเข่าแตะพื้น (Knee Push-up)",
    cue: "ลำตัวตรงเป็นเส้นเดียวตลอดการเคลื่อนไหว",
    stepsTh: [
      "เริ่มในท่าแพลงก์สูง มือกว้างกว่าหัวไหล่เล็กน้อย เท้าชิดกัน",
      "เกร็งแกนกลางลำตัว งอข้อศอกหย่อนตัวลงโดยรักษาลำตัวตรง",
      "ค้างไว้ครู่หนึ่งเมื่ออกเกือบแตะพื้น แล้วดันตัวกลับขึ้นจนแขนเหยียดตรง",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-decline-pushup",
    nameTh: "วิดพื้นยกเท้าสูง",
    nameEn: "Decline Push-up",
    bodyPart: "chest",
    equipment: ["prop"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "chest",
    alternativeTh: "วิดพื้นมาตรฐานบนพื้นราบ (Push-up)",
    cue: "วางเท้าบนเก้าอี้หรือขั้นบันได มือกว้างกว่าหัวไหล่เล็กน้อย",
    stepsTh: [
      "วางมือบนพื้นกว้างกว่าหัวไหล่เล็กน้อย ยกเท้าพาดบนพื้นผิวที่มั่นคง",
      "รักษาลำตัวเป็นเส้นตรงจากศีรษะถึงเท้า เกร็งแกนกลางลำตัว",
      "หย่อนอกลงพื้นโดยงอข้อศอก หุบข้อศอกเข้าหาลำตัว",
      "ดันฝ่ามือดันตัวขึ้นจนแขนเหยียดตรง",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-cable-fly",
    nameTh: "เคเบิลฟลาย",
    nameEn: "Cable Fly",
    bodyPart: "chest",
    equipment: ["cable"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "chest",
    alternativeTh: "ดัมเบลฟลายบนม้านั่ง",
    cue: "แขนงอเล็กน้อยตลอดการเคลื่อนไหว โฟกัสหน้าอกบีบเข้าหากัน",
    stepsTh: [
      "ปรับสายเคเบิลให้อยู่ในตำแหน่งเอียงลง",
      "ยืนหันหลังให้เครื่อง เท้ากว้างเท่าหัวไหล่",
      "จับด้ามจับ ฝ่ามือหันไปด้านหน้า เหยียดแขนตรงไปข้างหน้า",
      "งอข้อศอกเล็กน้อย กางแขนออกด้านข้างอย่างควบคุม",
      "ค้างไว้ครู่หนึ่งเมื่อแขนกางสุด แล้วค่อยๆ กลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-dumbbell-fly",
    nameTh: "ดัมเบลฟลาย",
    nameEn: "Dumbbell Fly",
    bodyPart: "chest",
    equipment: ["dumbbell", "bench"],
    isCompound: false,
    skillLevel: "intermediate",
    icon: "chest",
    alternativeTh: "วิดพื้นแบบมือชิด (Diamond Push-up)",
    cue: "กางแขนช้าๆ ไม่ล็อกข้อศอกสุด",
    stepsTh: [
      "นอนราบบนม้านั่ง ถือดัมเบลข้างละลูก ฝ่ามือหันเข้าหากัน",
      "เหยียดแขนตรงขึ้นเหนืออก งอข้อศอกเล็กน้อย",
      "กางแขนออกด้านข้างเป็นแนวโค้งกว้างจนรู้สึกตึงที่หน้าอก",
      "ค้างไว้ครู่หนึ่ง แล้วดึงดัมเบลกลับขึ้นสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-incline-dumbbell-press",
    nameTh: "ดัมเบลเพรสท่าเอียง",
    nameEn: "Incline Dumbbell Press",
    bodyPart: "chest",
    equipment: ["dumbbell", "bench"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "chest",
    alternativeTh: "วิดพื้นยกขาสูง (Decline Push-up)",
    cue: "ปรับม้านั่งเอียง 30-45 องศา",
    stepsTh: [
      "ตั้งม้านั่งปรับเอียงทำมุมประมาณ 45 องศา",
      "นั่งบนม้านั่ง เท้าเหยียบพื้น หลังแนบม้านั่งแน่น",
      "ถือดัมเบลข้างละลูก ฝ่ามือหันไปด้านหน้า ยกขึ้นระดับไหล่",
      "ค่อยๆ หย่อนดัมเบลลงข้างอก งอข้อศอกทำมุม 90 องศา",
      "ดันดัมเบลกลับขึ้นจนแขนเหยียดตรง",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "chest-dips",
    nameTh: "ดิพส์ (หน้าอก)",
    nameEn: "Chest Dips",
    bodyPart: "chest",
    equipment: ["dip_bars"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "chest",
    alternativeTh: "วิดพื้นกว้างเน้นช่วงล่างหน้าอก",
    cue: "โน้มตัวไปข้างหน้าเล็กน้อยเพื่อเน้นหน้าอก",
    stepsTh: [
      "อยู่บนราวคู่ขนาน แขนเหยียดตรง ลำตัวตั้งตรง",
      "หย่อนตัวลงโดยงอข้อศอกจนไหล่ต่ำกว่าข้อศอก",
      "ดันตัวกลับขึ้นจนแขนเหยียดตรง",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },

  // -------------------------------------------------------------- BACK ----
  {
    id: "back-deadlift",
    nameTh: "เดดลิฟต์",
    nameEn: "Deadlift",
    bodyPart: "back",
    equipment: ["barbell"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "back",
    alternativeTh: "ดัมเบลโรมาเนียนเดดลิฟต์",
    cue: "หลังตรง สะโพกดันไปด้านหลังก่อนย่อเข่า",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ บาร์เบลวางอยู่บนพื้นด้านหน้า",
      "งอเข่าและก้มสะโพกลงจับบาร์เบลด้วยมือคว่ำ กว้างกว่าหัวไหล่เล็กน้อย",
      "รักษาหลังตรง อกยกขึ้น ดันพื้นด้วยส้นเท้ายกบาร์เบลขึ้นโดยเหยียดสะโพกและเข่า",
      "เมื่อยืนตรง เกร็งก้นและแกนกลางลำตัว",
      "ลดบาร์เบลกลับลงพื้นโดยงอสะโพกและเข่า รักษาหลังตรงตลอด",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "back-lat-pulldown",
    nameTh: "แลตพูลดาวน์",
    nameEn: "Lat Pulldown",
    bodyPart: "back",
    equipment: ["cable"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "back",
    alternativeTh: "ดึงข้อ (Pull-up) หรือใช้ยางยืดช่วย",
    cue: "ดึงบาร์มาที่หน้าอกบน สะบักหุบเข้าหากัน",
    stepsTh: [
      "ปรับความสูงเบาะนั่งให้ต้นขาขนานพื้น เท้าวางราบ",
      "จับบาร์ lat ด้วยมือคว่ำ กว้างกว่าหัวไหล่เล็กน้อย",
      "นั่งลงและเอนตัวไปด้านหลังเล็กน้อย อกยกขึ้น หลังตรง",
      "ดึงบาร์ลงมาที่อก บีบสะบักเข้าหากัน",
      "ค้างไว้ครู่หนึ่งที่จุดต่ำสุด แล้วค่อยๆ ปล่อยบาร์กลับขึ้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "back-pullup",
    nameTh: "ดึงข้อ",
    nameEn: "Pull-up",
    bodyPart: "back",
    equipment: ["pullup_bar"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "back",
    alternativeTh: "ดึงข้อแบบ Negative (ปล่อยตัวลงช้าๆ) หรือถ้าไม่มีบาร์เลย ให้ทำ Superman แทน",
    cue: "เริ่มจากห้อยตัวตรง ดึงคางเหนือบาร์",
    stepsTh: [
      "ห้อยตัวจากบาร์โหนตัว ฝ่ามือหันออกจากตัว แขนเหยียดตรง",
      "เกร็งแกนกลางลำตัว บีบสะบักเข้าหากัน",
      "ดึงตัวขึ้นหาบาร์โดยงอข้อศอก ให้อกเข้าใกล้บาร์",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ หย่อนตัวลงกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "back-bent-over-row",
    nameTh: "บาร์เบลโรว์ก้มตัว",
    nameEn: "Bent-Over Barbell Row",
    bodyPart: "back",
    equipment: ["barbell"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "back",
    alternativeTh: "ดัมเบลโรว์ข้างเดียวพาดม้านั่ง",
    cue: "ก้มตัวประมาณ 45 องศา หลังตรงตลอด",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ เข่างอเล็กน้อย",
      "ก้มตัวไปข้างหน้าที่สะโพก รักษาหลังตรง อกยกขึ้น",
      "จับบาร์เบลด้วยมือคว่ำ กว้างกว่าหัวไหล่เล็กน้อย",
      "ดึงบาร์เบลขึ้นหาอกส่วนล่าง โดยดึงสะบักเข้าหากันและเกร็งกล้ามเนื้อหลัง",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ หย่อนบาร์เบลกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "back-dumbbell-row",
    nameTh: "ดัมเบลโรว์",
    nameEn: "Single-Arm Dumbbell Row",
    bodyPart: "back",
    equipment: ["dumbbell", "bench"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "back",
    alternativeTh: "ซูเปอร์แมน (Superman Hold)",
    cue: "ดึงศอกชิดลำตัว บีบสะบัก",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ถือดัมเบลข้างเดียว ฝ่ามือหันเข้าหาลำตัว",
      "งอเข่าเล็กน้อยและก้มตัวไปข้างหน้าที่สะโพก รักษาหลังตรง เกร็งแกนกลางลำตัว",
      "ปล่อยดัมเบลห้อยลงตรงๆ แขนเหยียดสุด",
      "ดึงดัมเบลขึ้นหาอก หุบข้อศอกเข้าหาลำตัวและบีบสะบักเข้าหากัน",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ หย่อนดัมเบลกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ แล้วสลับข้าง",
    ],
  },
  {
    id: "back-seated-cable-row",
    nameTh: "เคเบิลโรว์นั่ง",
    nameEn: "Seated Cable Row",
    bodyPart: "back",
    equipment: ["cable"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "back",
    alternativeTh: "ดัมเบลโรว์สองข้างก้มตัว",
    cue: "ดึงมาที่หน้าท้อง อกยืดตรง ไม่โยกตัว",
    stepsTh: [
      "นั่งที่เครื่องเคเบิลโรว์ เท้าวางราบบนแท่นวางเท้า เข่างอเล็กน้อย",
      "จับด้ามจับด้วยมือคว่ำ หลังตรง ไหล่ผ่อนคลาย",
      "ดึงด้ามจับเข้าหาลำตัว บีบสะบักเข้าหากัน",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ปล่อยด้ามจับกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    // Swapped from "Band Face Pull" — the dataset has no "face pull" entry
    // at all (searched exhaustively). This is the closest real match:
    // same equipment (band), same target muscles (rear delts, traps).
    id: "back-band-rear-delt-row",
    nameTh: "ยางยืดโรว์เดลต์หลัง",
    nameEn: "Band Standing Rear Delt Row",
    bodyPart: "back",
    equipment: ["band"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "back",
    alternativeTh: "ก้มตัวโรว์มือเปล่า เกร็งสะบักเข้าหากัน (ไม่ต้องใช้ยาง)",
    cue: "เหยียบยางยืดให้แน่น ก้มตัวเล็กน้อย ดึงข้อศอกขึ้นเข้าหาลำตัวระดับสูง เกร็งสะบักเข้าหากัน",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ เหยียบยางยืดไว้ใต้เท้า",
      "จับด้ามจับยางยืด ฝ่ามือหันเข้าหากัน แขนเหยียดตรงไปข้างหน้า",
      "งอเข่าเล็กน้อยและก้มตัวไปข้างหน้าที่สะโพก รักษาหลังตรง",
      "ดึงยางยืดเข้าหาอก บีบสะบักเข้าหากัน",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ คลายแรงดึงกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "back-superman",
    nameTh: "ซูเปอร์แมน",
    nameEn: "Superman Hold",
    bodyPart: "back",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "back",
    alternativeTh: "แพลงก์หลัง (Reverse Plank)",
    cue: "ยกแขนขาขึ้นพร้อมกัน ค้างไว้แล้วควบคุมจังหวะ",
    stepsTh: [
      "นอนคว่ำบนพื้น เหยียดแขนตรงไปข้างหน้า ขาเหยียดตรง",
      "เกร็งแกนกลางลำตัวและก้น",
      "ยกแขน อก และขาขึ้นจากพื้นพร้อมกัน ให้ร่างกายโค้งเป็นรูปตัวยูคว่ำ",
      "ค้างไว้ 2-3 วินาทีที่จุดสูงสุด บีบกล้ามเนื้อหลังส่วนล่าง",
      "ค่อยๆ ลดแขนและขาลงกลับสู่ท่าเริ่มต้นอย่างควบคุม",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    // Swapped from "Prone Y-T-W Raise" — no Y-T-W raise or equivalent
    // bodyweight prone raise exists in the dataset. This needs a band
    // (equipment changed from bodyweight -> band) but targets the same
    // muscles (rear delts, upper back) with a very similar movement.
    id: "back-band-reverse-fly",
    nameTh: "ยางยืดรีเวิร์สฟลาย",
    nameEn: "Band Reverse Fly",
    bodyPart: "back",
    equipment: ["band"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "back",
    alternativeTh: "ซูเปอร์แมนโฮลด์ ไม่ต้องใช้อุปกรณ์เลย (Superman Hold)",
    cue: "ผูกยางยืดกับจุดยึดระดับอก ยืนหันหลังให้จุดยึด แขนตรงกางออกด้านข้าง บีบสะบักเข้าหากัน",
    stepsTh: [
      "ผูกยางยืดกับจุดยึดที่มั่นคงระดับอก",
      "ยืนเท้ากว้างเท่าหัวไหล่ จับยางยืดด้วยสองมือไว้ด้านหน้าลำตัว",
      "เหยียดแขนตรง ยกแขนกางออกด้านข้างจนขนานพื้น",
      "บีบสะบักเข้าหากันที่จุดสูงสุดของการเคลื่อนไหว",
      "ค่อยๆ ลดแขนกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },

  // -------------------------------------------------------------- LEGS ----
  {
    id: "legs-barbell-squat",
    nameTh: "บาร์เบลสควอท",
    nameEn: "Barbell Back Squat",
    bodyPart: "legs",
    equipment: ["barbell"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "legs",
    alternativeTh: "สควอทน้ำหนักตัว (Bodyweight Squat) แบบช้าและลึก",
    cue: "เข่าไปทางเดียวกับปลายเท้า อกตั้งตรง",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ปลายเท้าชี้ออกเล็กน้อย",
      "แบกบาร์เบลไว้บนหลังส่วนบน พาดบนกล้ามเนื้อทราปีเซียสหรือเดลต์ด้านหลัง",
      "เกร็งแกนกลางลำตัว อกยกขึ้น เริ่มหย่อนตัวลง",
      "งอเข่าและสะโพก ดันสะโพกไปด้านหลังและลงเหมือนนั่งเก้าอี้",
      "ลดตัวลงจนต้นขาขนานพื้นหรือต่ำกว่าเล็กน้อย รักษาเข่าให้อยู่แนวเดียวกับปลายเท้า",
      "ดันพื้นด้วยส้นเท้ายืนขึ้น เหยียดสะโพกและเข่า",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "legs-leg-press",
    nameTh: "เลกเพรส",
    nameEn: "Leg Press",
    bodyPart: "legs",
    equipment: ["machine"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "legs",
    alternativeTh: "สควอทแยกขา (Split Squat)",
    cue: "อย่าล็อกเข่าสุดช่วงบน",
    stepsTh: [
      "ปรับเบาะนั่งและแท่นวางเท้าของเครื่องให้อยู่ในตำแหน่งที่ต้องการ",
      "นั่งบนเครื่อง หลังพิงพนัก เท้าวางบนแท่นวางเท้า",
      "วางมือบนที่จับหรือด้านข้างเครื่องเพื่อความมั่นคง",
      "ดันเท้ากับแท่นวางเท้า เหยียดขาจนเกือบตรง อย่าล็อกเข่าสุด",
      "ค้างไว้ครู่หนึ่ง แล้วค่อยๆ งอเข่ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "legs-goblet-squat",
    nameTh: "กอบเล็ตสควอท",
    nameEn: "Goblet Squat",
    bodyPart: "legs",
    equipment: ["dumbbell"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "legs",
    alternativeTh: "สควอทน้ำหนักตัวจังหวะช้า (Tempo Squat)",
    cue: "กอดดัมเบลแนบอก ลงลึกจนต้นขาขนานพื้น",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ถือดัมเบลในแนวตั้งแนบอกด้วยสองมือ",
      "อกยกขึ้น เกร็งแกนกลางลำตัว ลดตัวลงในท่าสควอทโดยดันสะโพกไปด้านหลังและงอเข่า",
      "ลดตัวลงจนต้นขาขนานพื้น หรือต่ำที่สุดเท่าที่ทำได้สบายๆ",
      "ค้างไว้ครู่หนึ่งที่จุดต่ำสุด แล้วดันพื้นด้วยส้นเท้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "legs-bulgarian-split-squat",
    nameTh: "บัลแกเรียนสปลิทสควอท",
    nameEn: "Bulgarian Split Squat",
    bodyPart: "legs",
    equipment: ["prop"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "legs",
    alternativeTh: "ลันจ์อยู่กับที่ไม่ยกเท้าหลัง (Stationary Lunge)",
    cue: "วางเท้าหลังบนเก้าอี้หรือม้านั่ง ย่อลงตรงๆ",
    stepsTh: [
      "ยืนหันหลังให้จุดพยุง (เก้าอี้หรือม้านั่ง) เท้ากว้างเท่าหัวไหล่",
      "ยื่นขาข้างหนึ่งไปด้านหลัง วางหลังเท้าพาดบนจุดพยุงด้านหลัง",
      "งอขาหน้าหย่อนตัวลงในท่าลันจ์ อกยกขึ้น เข่าหน้าอยู่แนวเดียวกับปลายเท้า",
      "ดันพื้นด้วยส้นเท้าหน้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ แล้วสลับขา",
    ],
  },
  {
    // Swapped from "Bodyweight Squat" — every plain bodyweight "squat"
    // entry in the dataset turned out to be a variant (jump, pistol,
    // curtsy, sissy...); this one ("Potty Squat With Support") is the
    // closest to the original intent — a controlled, supported basic
    // squat, ideal for beginners. Equipment changed from bodyweight ->
    // prop (holding a chair/wall for balance), which is still allowed
    // under the strict "no equipment at home" location.
    id: "legs-potty-squat-support",
    nameTh: "สควอทเกาะพยุงตัว",
    nameEn: "Potty Squat With Support",
    bodyPart: "legs",
    equipment: ["prop"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "legs",
    alternativeTh: "สควอทน้ำหนักตัวไม่เกาะอะไรเลย (Bodyweight Squat)",
    cue: "จับเก้าอี้หรือกำแพงพยุงตัว ย่อสะโพกลงต่ำ ปลายเท้าชี้ออกเล็กน้อย",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ปลายเท้าชี้ออกเล็กน้อย",
      "จับจุดพยุงที่มั่นคง เช่น เก้าอี้หรือกำแพง เพื่อช่วยทรงตัว",
      "หย่อนตัวลงในท่าสควอทโดยงอเข่าและดันสะโพกไปด้านหลัง",
      "อกยกขึ้นและหลังตรงตลอดการเคลื่อนไหว",
      "ค้างไว้ครู่หนึ่งที่จุดต่ำสุด แล้วดันพื้นด้วยส้นเท้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "legs-leg-extension",
    nameTh: "เลกเอ็กซ์เทนชัน",
    nameEn: "Leg Extension",
    bodyPart: "legs",
    equipment: ["machine"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "legs",
    alternativeTh: "สควอทช่วงบนสั้น (1/4 Squat) เน้นเกร็งต้นขา",
    cue: "เหยียดเข่าสุดแล้วเกร็งค้าง 1 วินาที",
    stepsTh: [
      "ปรับความสูงเบาะนั่งและพนักพิงให้พอดีกับร่างกาย",
      "นั่งบนเครื่อง หลังพิงพนัก เท้าวางบนแท่นรองเท้า",
      "จับที่จับหรือด้านข้างเครื่องเพื่อความมั่นคง",
      "เหยียดขาไปข้างหน้าโดยยืดเข่าตรง ยกน้ำหนักขึ้น",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดน้ำหนักกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "legs-leg-curl",
    nameTh: "เลกเคิร์ล",
    nameEn: "Leg Curl",
    bodyPart: "legs",
    equipment: ["machine"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "legs",
    alternativeTh: "นอร์ดิกแฮมสตริงเคิร์ล (Nordic Curl แบบช่วย)",
    cue: "งอเข่าดึงส้นเท้าเข้าหาก้น ควบคุมจังหวะปล่อย",
    stepsTh: [
      "ปรับเครื่องให้พอดีกับร่างกายและเลือกน้ำหนักที่ต้องการ",
      "คุกเข่าบนเครื่องโดยหันหน้าลง เข่าวางบนเบาะ เท้าล็อกใต้แท่นรองเท้า",
      "จับที่จับหรือด้านข้างเครื่องเพื่อความมั่นคง",
      "รักษาลำตัวช่วงบนนิ่ง หายใจออกและงอเข่าดึงขาขึ้นหาก้น",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด บีบกล้ามเนื้อต้นขาหลัง",
      "หายใจเข้าและค่อยๆ ลดขาลงกลับสู่ท่าเริ่มต้นจนเข่าเหยียดสุด",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "legs-walking-lunge",
    nameTh: "ลันจ์เดินก้าว",
    nameEn: "Walking Lunge",
    bodyPart: "legs",
    equipment: ["bodyweight"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "legs",
    alternativeTh: "ลันจ์อยู่กับที่สลับขา",
    cue: "ก้าวยาวพอให้เข่าหน้าตั้งฉากกับพื้น",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่",
      "ก้าวขาขวาไปข้างหน้า หย่อนตัวลงในท่าลันจ์",
      "รักษาลำตัวส่วนบนตั้งตรง เข่าหน้าอยู่แนวเดียวกับข้อเท้า",
      "ดันพื้นด้วยเท้าขวาและก้าวเท้าซ้ายไปข้างหน้าสู่ท่าลันจ์ด้วยขาซ้าย",
      "สลับขาต่อเนื่องเดินไปข้างหน้าด้วยจังหวะที่ควบคุมและสม่ำเสมอ",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "legs-romanian-deadlift",
    nameTh: "ดัมเบลโรมาเนียนเดดลิฟต์",
    nameEn: "Dumbbell Romanian Deadlift",
    bodyPart: "legs",
    equipment: ["dumbbell"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "legs",
    alternativeTh: "ยกขาหลังโน้มตัว (Single-Leg Hip Hinge) ไม่ใช้น้ำหนัก",
    cue: "สะโพกดันไปข้างหลัง หลังตรง รู้สึกตึงต้นขาหลัง",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ถือดัมเบลข้างละลูกด้วยมือคว่ำ",
      "รักษาหลังตรงและเกร็งแกนกลางลำตัว ก้มสะโพกลดดัมเบลลงหาพื้น เข่างอเล็กน้อย",
      "ลดดัมเบลลงจนรู้สึกตึงที่ต้นขาหลัง แล้วดันพื้นด้วยส้นเท้าและเกร็งก้นกลับสู่ท่ายืน",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },

  // --------------------------------------------------------- SHOULDERS ----
  {
    id: "shoulders-overhead-press",
    nameTh: "โอเวอร์เฮดเพรส",
    nameEn: "Barbell Overhead Press",
    bodyPart: "shoulders",
    equipment: ["barbell"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "shoulders",
    alternativeTh: "ไพค์พุชอัพ (Pike Push-up)",
    cue: "แกนกลางลำตัวเกร็ง อย่าแอ่นหลัง",
    stepsTh: [
      "นั่งบนม้านั่ง หลังตรง เท้าวางราบบนพื้น",
      "จับบาร์เบลด้วยมือคว่ำ กว้างกว่าหัวไหล่เล็กน้อย",
      "ยกบาร์เบลออกจากขาตั้งมาที่ระดับไหล่ ข้อศอกงอ ฝ่ามือหันไปด้านหน้า",
      "ดันบาร์เบลขึ้นเหนือศีรษะโดยเหยียดแขนตรง",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดบาร์เบลกลับสู่ระดับไหล่",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "shoulders-dumbbell-press",
    nameTh: "ดัมเบลโอเวอร์เฮดเพรส",
    nameEn: "Dumbbell Shoulder Press",
    bodyPart: "shoulders",
    equipment: ["dumbbell"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "shoulders",
    alternativeTh: "ไพค์พุชอัพยกขาสูง",
    cue: "ดันดัมเบลขึ้นเป็นเส้นตรงเหนือหัวไหล่",
    stepsTh: [
      "นั่งบนม้านั่ง ถือดัมเบลข้างละลูกวางบนต้นขา",
      "ยกดัมเบลขึ้นระดับไหล่ ฝ่ามือหันไปด้านหน้า",
      "ดันดัมเบลขึ้นจนแขนเหยียดตรงเหนือศีรษะ",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดดัมเบลกลับสู่ระดับไหล่",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "shoulders-machine-press",
    nameTh: "ช้อลเดอร์เพรส (เครื่อง)",
    nameEn: "Machine Shoulder Press",
    bodyPart: "shoulders",
    equipment: ["machine"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "shoulders",
    alternativeTh: "ไพค์พุชอัพ",
    cue: "หลังพิงเบาะตลอดการเคลื่อนไหว",
    stepsTh: [
      "ปรับความสูงเบาะนั่งให้ด้ามจับอยู่ระดับไหล่",
      "นั่งบนเครื่อง หลังพิงเบาะ เท้าวางราบบนพื้น",
      "จับด้ามจับด้วยมือคว่ำ ยกออกจากจุดล็อก เหยียดแขนตรง",
      "ลดด้ามจับลงมาระดับไหล่ งอข้อศอกเล็กน้อย",
      "ดันด้ามจับขึ้นเหนือศีรษะจนแขนเหยียดตรง",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดด้ามจับกลับสู่ระดับไหล่",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "shoulders-lateral-raise",
    nameTh: "ดัมเบลยกข้าง",
    nameEn: "Dumbbell Lateral Raise",
    bodyPart: "shoulders",
    equipment: ["dumbbell"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "shoulders",
    alternativeTh: "ยางยืดยกข้าง (Band Lateral Raise)",
    cue: "ยกแขนถึงระดับไหล่ ศอกงอเล็กน้อย ไม่เหวี่ยง",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ถือดัมเบลข้างละลูก ฝ่ามือหันเข้าหาลำตัว",
      "รักษาหลังตรงและเกร็งแกนกลางลำตัว",
      "ยกแขนออกด้านข้างจนขนานพื้น งอข้อศอกเล็กน้อย",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดแขนกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "shoulders-band-lateral-raise",
    nameTh: "ยางยืดยกข้าง",
    nameEn: "Band Lateral Raise",
    bodyPart: "shoulders",
    equipment: ["band"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "shoulders",
    alternativeTh: "ยกข้างช้าๆ ไม่มีอุปกรณ์ ค้างบนสุด 2 วินาที (Empty-hand Raise)",
    cue: "ควบคุมแรงต้านจากยางตลอดจังหวะ",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ จับยางยืดไว้หน้าต้นขา ฝ่ามือหันลง",
      "เหยียดแขนตรง ยกยางยืดขึ้นด้านหน้าจนแขนขนานพื้น",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดยางยืดกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "shoulders-pike-pushup",
    nameTh: "ไพค์พุชอัพ",
    nameEn: "Pike Push-up",
    bodyPart: "shoulders",
    equipment: ["bodyweight"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "shoulders",
    alternativeTh: "ไพค์พุชอัพวางเท้าบนพื้นราบ",
    cue: "ยกสะโพกสูงคล้ายรูปตัว V หัวชี้ลงพื้น",
    stepsTh: [
      "เริ่มในท่าแพลงก์ ดันสะโพกขึ้นสูงให้ลำตัวเป็นรูปตัววีคว่ำ คล้ายท่าสุนัขก้มหน้า",
      "มือวางกว้างเท่าหัวไหล่ เท้าเดินเข้าใกล้มือจนสะโพกยกสูง",
      "งอข้อศอกหย่อนศีรษะลงหาพื้นระหว่างมือทั้งสองข้าง",
      "ค้างไว้ครู่หนึ่งเมื่อศีรษะใกล้พื้น แล้วดันตัวกลับขึ้นจนแขนเหยียดตรง",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "shoulders-rear-delt-fly",
    nameTh: "รีเดลต์ฟลาย",
    nameEn: "Rear Delt Fly",
    bodyPart: "shoulders",
    equipment: ["dumbbell"],
    isCompound: false,
    skillLevel: "intermediate",
    icon: "shoulders",
    alternativeTh: "เฟซพูลด้วยยางยืด",
    cue: "ก้มตัวเล็กน้อย กางแขนบีบสะบัก",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ถือดัมเบลข้างละลูก",
      "งอเข่าเล็กน้อยและก้มตัวไปข้างหน้าที่สะโพก รักษาหลังตรง",
      "เหยียดแขนลงตรงๆ ฝ่ามือหันเข้าหากัน",
      "งอข้อศอกเล็กน้อย ยกแขนออกด้านข้างและบีบสะบักเข้าหากัน",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดแขนกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "shoulders-cable-lateral-raise",
    nameTh: "เคเบิลยกข้าง",
    nameEn: "Cable Lateral Raise",
    bodyPart: "shoulders",
    equipment: ["cable"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "shoulders",
    alternativeTh: "ดัมเบลยกข้างทีละแขน",
    cue: "ดึงแรงตึงสม่ำเสมอตลอดช่วงการเคลื่อนไหว",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ จับด้ามจับเคเบิลด้วยมือคว่ำ",
      "เหยียดแขนตรง เกร็งแกนกลางลำตัว",
      "ยกแขนออกด้านข้างจนขนานพื้น",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดแขนกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },

  // ------------------------------------------------------------ BICEPS ----
  // Pull-day only, per Push/Pull/Legs convention (back + biceps).
  {
    id: "biceps-barbell-curl",
    nameTh: "บาร์เบลเคิร์ล",
    nameEn: "Barbell Bicep Curl",
    bodyPart: "biceps",
    equipment: ["barbell"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "biceps",
    alternativeTh: "ดัมเบลเคิร์ลสลับข้าง",
    cue: "ศอกแนบลำตัว ไม่แกว่งตัวช่วย",
    stepsTh: [
      "ยืนตัวตรง เท้ากว้างเท่าหัวไหล่ จับบาร์เบลด้วยมือหงาย ฝ่ามือหันไปด้านหน้า",
      "หุบข้อศอกเข้าหาลำตัว หายใจออกขณะเคิร์ลน้ำหนักขึ้นพร้อมเกร็งกล้ามเนื้อต้นแขนหน้า",
      "เคิร์ลบาร์ขึ้นจนกล้ามเนื้อต้นแขนหน้าเกร็งสุดและบาร์อยู่ระดับไหล่",
      "ค้างไว้ครู่หนึ่ง บีบกล้ามเนื้อต้นแขนหน้า",
      "หายใจเข้าและค่อยๆ ลดบาร์กลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "biceps-dumbbell-curl",
    nameTh: "ดัมเบลเคิร์ล",
    nameEn: "Dumbbell Bicep Curl",
    bodyPart: "biceps",
    equipment: ["dumbbell"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "biceps",
    alternativeTh: "เคิร์ลด้วยยางยืด (Band Curl)",
    cue: "บิดข้อมือเล็กน้อยช่วงบนสุดเพื่อเกร็งกล้าม",
    stepsTh: [
      "นั่งบนม้านั่ง เท้าวางราบบนพื้น ถือดัมเบลข้างละลูก ฝ่ามือหงายขึ้น",
      "รักษาหลังตรงและหุบข้อศอกเข้าหาลำตัว",
      "หายใจออกและเคิร์ลดัมเบลขึ้นหาไหล่ เกร็งกล้ามเนื้อต้นแขนหน้า",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วหายใจเข้าและค่อยๆ ลดดัมเบลกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "biceps-hammer-curl",
    nameTh: "แฮมเมอร์เคิร์ล",
    nameEn: "Hammer Curl",
    bodyPart: "biceps",
    equipment: ["dumbbell"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "biceps",
    alternativeTh: "เคิร์ลด้วยยางยืดจับแนวตั้ง",
    cue: "จับดัมเบลแนวตั้งตลอดการเคลื่อนไหว",
    stepsTh: [
      "ยืนตัวตรง ถือดัมเบลข้างละลูก ฝ่ามือหันเข้าหาลำตัว",
      "หุบข้อศอกเข้าหาลำตัวตลอดการเคลื่อนไหว นี่คือท่าเริ่มต้น",
      "หายใจออกและเคิร์ลน้ำหนักขึ้นโดยต้นแขนนิ่ง เกร็งกล้ามเนื้อต้นแขนหน้า",
      "เคิร์ลขึ้นจนกล้ามเนื้อต้นแขนหน้าเกร็งสุดและดัมเบลอยู่ระดับไหล่",
      "ค้างไว้ครู่หนึ่ง บีบกล้ามเนื้อต้นแขนหน้า",
      "หายใจเข้าและค่อยๆ ลดดัมเบลกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่แนะนำ",
    ],
  },
  {
    id: "biceps-band-curl",
    nameTh: "ยางยืดเคิร์ล",
    nameEn: "Band Bicep Curl",
    bodyPart: "biceps",
    equipment: ["band"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "biceps",
    alternativeTh: "เคิร์ลแบบต้านแรงตัวเอง (ไม่ต้องใช้ยาง)",
    cue: "เหยียบยางให้แน่น ควบคุมจังหวะขึ้นลง",
    stepsTh: [
      "นั่งบนม้านั่งหรือเก้าอี้ ขาแยกออก เท้าวางราบบนพื้น",
      "ถือปลายยางยืดข้างหนึ่ง เหยียบอีกปลายด้วยเท้าข้างเดียวกัน",
      "เอนตัวไปข้างหน้าเล็กน้อย วางข้อศอกพิงด้านในต้นขาเหนือเข่า",
      "ฝ่ามือหงายขึ้น ค่อยๆ เคิร์ลมือขึ้นหาไหล่ โดยต้นแขนนิ่ง",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดมือกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ แล้วสลับข้าง",
    ],
  },
  {
    // Swapped from "Self-Resistance Curl" (a technique this project
    // invented to fill a zero-equipment biceps gap) — this is a real
    // dataset exercise instead, same equipment (bodyweight).
    id: "biceps-side-lying-curl",
    nameTh: "เคิร์ลนอนตะแคง",
    nameEn: "Bodyweight Side-Lying Biceps Curl",
    bodyPart: "biceps",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "intermediate",
    icon: "biceps",
    alternativeTh: "เคิร์ลต้านแรงตัวเอง ใช้มืออีกข้างกดต้านที่ข้อมือ (ถ้านอนไม่สะดวก)",
    cue: "นอนตะแคง แขนที่ฝึกแนบลำตัว งอศอกยกท่อนแขนขึ้นต้านแรงโน้มถ่วง ควบคุมจังหวะ",
    stepsTh: [
      "นอนตะแคง ขาเหยียดตรง ศีรษะพักบนแขน",
      "แนบต้นแขนที่ฝึกไว้กับลำตัว งอข้อศอกเคิร์ลปลายแขนขึ้นหาไหล่",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดปลายแขนกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },

  // ----------------------------------------------------------- TRICEPS ----
  // Push-day only, per Push/Pull/Legs convention (chest + shoulders + triceps).
  {
    id: "triceps-cable-pushdown",
    nameTh: "เคเบิลทริเซปพุชดาวน์",
    nameEn: "Cable Tricep Pushdown",
    bodyPart: "triceps",
    equipment: ["cable"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "triceps",
    alternativeTh: "ดิพส์ระหว่างเก้าอี้ (Bench Dips)",
    cue: "ศอกแนบลำตัว เหยียดแขนสุดแล้วเกร็งค้าง",
    stepsTh: [
      "ติดตั้งบาร์ตรงกับรอกสูงของเครื่องเคเบิล",
      "ยืนหันหน้าเข้าเครื่อง เท้ากว้างเท่าหัวไหล่ เข่างอเล็กน้อย",
      "จับบาร์ด้วยมือคว่ำ มือกว้างเท่าหัวไหล่ หุบข้อศอกชิดลำตัว",
      "หายใจออกและดันบาร์ลงจนแขนเหยียดตรง",
      "ค้างไว้ครู่หนึ่ง แล้วหายใจเข้าและค่อยๆ ดึงบาร์กลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "triceps-bench-dips",
    nameTh: "ดิพส์ (ต้นแขนหลัง)",
    nameEn: "Bench Dips",
    bodyPart: "triceps",
    equipment: ["prop"],
    isCompound: false,
    skillLevel: "intermediate",
    icon: "triceps",
    alternativeTh: "วิดพื้นมือชิด (Diamond Push-up) — ไม่ต้องใช้เก้าอี้",
    cue: "ย่อศอกไปด้านหลังตรงๆ ไม่กางออก ใช้ขอบเก้าอี้หรือม้านั่งรองมือ",
    stepsTh: [
      "นั่งบนม้านั่ง มือจับขอบม้านั่ง นิ้วชี้ไปข้างหน้า",
      "เลื่อนก้นออกจากม้านั่ง รับน้ำหนักด้วยมือ",
      "งอข้อศอกหย่อนตัวลงจนต้นแขนขนานพื้น",
      "ดันตัวกลับขึ้นสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "triceps-overhead-extension",
    nameTh: "ดัมเบลทริเซปเอ็กซ์เทนชัน",
    nameEn: "Overhead Tricep Extension",
    bodyPart: "triceps",
    equipment: ["dumbbell"],
    isCompound: false,
    skillLevel: "intermediate",
    icon: "triceps",
    alternativeTh: "วิดพื้นมือชิดจังหวะช้า",
    cue: "ศอกชี้ตรงขึ้นเพดาน ลดน้ำหนักลงข้างหลังหัวช้าๆ",
    stepsTh: [
      "นั่งบนม้านั่ง หลังตรง เท้าวางราบบนพื้น",
      "ถือดัมเบลด้วยมือหงาย เหยียดแขนตรงขึ้นเหนือศีรษะ",
      "ลดดัมเบลลงด้านหลังศีรษะโดยงอข้อศอก ต้นแขนนิ่ง",
      "ค้างไว้ครู่หนึ่ง แล้วเหยียดแขนกลับขึ้นสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ แล้วสลับข้าง",
    ],
  },
  {
    id: "triceps-diamond-pushup",
    nameTh: "วิดพื้นมือชิด",
    nameEn: "Diamond Push-up",
    bodyPart: "triceps",
    equipment: ["bodyweight"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "triceps",
    alternativeTh: "วิดพื้นมือชิดแบบเข่าแตะพื้น",
    cue: "มือชิดกันเป็นรูปสามเหลี่ยมใต้หน้าอก",
    stepsTh: [
      "เริ่มในท่าแพลงก์สูง มือชิดกันเป็นรูปสี่เหลี่ยมข้าวหลามตัดด้วยนิ้วโป้งและนิ้วชี้",
      "รักษาลำตัวเป็นเส้นตรงจากศีรษะถึงเท้า เกร็งแกนกลางลำตัวและก้น",
      "หย่อนอกลงหารูปที่มือทำไว้ หุบข้อศอกเข้าหาลำตัว",
      "ค้างไว้ครู่หนึ่งที่จุดต่ำสุด แล้วดันตัวกลับขึ้นสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },

  // -------------------------------------------------------------- CORE ----
  {
    id: "core-plank",
    nameTh: "แพลงก์",
    nameEn: "Plank",
    bodyPart: "core",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "core",
    alternativeTh: "แพลงก์เข่าแตะพื้น (Knee Plank)",
    cue: "ลำตัวตรงเป็นเส้นเดียว ไม่ยกสะโพกสูง",
    stepsTh: [
      "เริ่มในท่าแพลงก์สูง มือตรงใต้ไหล่ ลำตัวเป็นเส้นตรงจากศีรษะถึงเท้า",
      "เกร็งแกนกลางลำตัวและบีบก้นเพื่อรักษาความมั่นคง",
      "ลดตัวลงพักบนแขนท่อนล่างทีละข้าง รักษาลำตัวเป็นเส้นตรงตลอด",
      "ค้างท่านี้ตามเวลาที่ต้องการ โดยเกร็งแกนกลางลำตัวและก้นตลอด",
      "ดันแขนท่อนล่างยกตัวกลับขึ้นสู่ท่าแพลงก์สูงเพื่อกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "core-cable-crunch",
    nameTh: "เคเบิลครันช์",
    nameEn: "Cable Crunch",
    bodyPart: "core",
    equipment: ["cable"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "core",
    alternativeTh: "ครันช์น้ำหนักตัว (Bodyweight Crunch)",
    cue: "งอตัวจากช่วงเอว ไม่ดึงคอ",
    stepsTh: [
      "ติดที่จับเชือกกับรอกสูง คุกเข่าหันหลังให้เครื่อง",
      "จับที่จับเชือกด้วยสองมือ วางไว้ด้านหลังศีรษะ กางข้อศอกออกด้านข้าง",
      "รักษาสะโพกนิ่ง งอเอวครันช์ลำตัวลงหาต้นขา",
      "ค้างไว้ครู่หนึ่งที่จุดต่ำสุด แล้วค่อยๆ กลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "core-hanging-leg-raise",
    nameTh: "ห้อยตัวยกขา",
    nameEn: "Hanging Leg Raise",
    bodyPart: "core",
    equipment: ["pullup_bar"],
    isCompound: false,
    skillLevel: "advanced",
    icon: "core",
    alternativeTh: "ยกขาเข่างอนอนหงาย (Lying Knee Raise) — ไม่ต้องใช้บาร์",
    cue: "ยกขาโดยไม่แกว่งลำตัว ควบคุมจังหวะลง",
    stepsTh: [
      "ห้อยตัวจากบาร์โหนตัว แขนเหยียดตรง ฝ่ามือหันออกจากตัว",
      "เกร็งแกนกลางลำตัวและยกขาขึ้นด้านหน้า เหยียดขาตรง",
      "ยกขึ้นต่อจนขาขนานพื้นหรือสูงที่สุดเท่าที่ทำได้สบายๆ",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดขากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "core-russian-twist",
    nameTh: "รัสเซียนทวิสต์",
    nameEn: "Russian Twist",
    bodyPart: "core",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "core",
    alternativeTh: "รัสเซียนทวิสต์ช้าลง เน้นควบคุมแทนความเร็ว",
    cue: "เอนตัวไปข้างหลังเล็กน้อย หมุนลำตัวจากแกนกลาง",
    stepsTh: [
      "นั่งบนพื้น เข่างอ เท้าวางราบบนพื้น",
      "เอนตัวไปด้านหลังเล็กน้อย รักษาหลังตรงและเกร็งแกนกลางลำตัว",
      "ประกบมือไว้หน้าอก หรือถือน้ำหนักถ้าต้องการ",
      "ยกเท้าลอยจากพื้น ทรงตัวด้วยกระดูกก้น",
      "บิดลำตัวไปทางขวา แล้วบิดกลับไปทางซ้าย",
      "สลับข้างต่อเนื่องตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "core-ab-wheel",
    nameTh: "แอบวีล โรลเอาต์",
    nameEn: "Ab Wheel Rollout",
    bodyPart: "core",
    equipment: ["ab_wheel"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "core",
    alternativeTh: "แพลงก์เคลื่อนที่ (Plank Walkout) — ไม่ต้องใช้แอบวีล",
    cue: "เกร็งหน้าท้องตลอด อย่าปล่อยให้หลังแอ่น",
    stepsTh: [
      "คุกเข่าบนพื้น วางล้อโรลเลอร์ไว้ด้านหน้า",
      "วางมือบนที่จับล้อโรลเลอร์ เหยียดแขนตรงไปข้างหน้า",
      "เกร็งกล้ามเนื้อแกนกลางลำตัวและค่อยๆ กลิ้งล้อไปข้างหน้า รักษาหลังตรงและหน้าท้องเกร็งตลอด",
      "กลิ้งต่อไปจนลำตัวเหยียดสุดและแขนอยู่เหนือศีรษะ",
      "ค้างไว้ครู่หนึ่ง แล้วค่อยๆ กลิ้งล้อกลับหาเข่า ควบคุมจังหวะและเกร็งหน้าท้องตลอด",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "core-mountain-climber",
    nameTh: "เมาน์เทนไคลม์เบอร์",
    nameEn: "Mountain Climber",
    bodyPart: "core",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "intermediate",
    icon: "core",
    alternativeTh: "เมาน์เทนไคลม์เบอร์จังหวะช้า",
    cue: "สะโพกนิ่ง ดึงเข่าเข้าหาอกสลับข้างเร็ว",
    stepsTh: [
      "เริ่มในท่าแพลงก์สูง มือตรงใต้ไหล่ ลำตัวเป็นเส้นตรง",
      "เกร็งแกนกลางลำตัว ดึงเข่าขวาเข้าหาอก แล้วสลับดึงเข่าซ้ายเข้าหาอกอย่างรวดเร็ว",
      "สลับขาต่อเนื่องเหมือนท่าวิ่ง สะโพกอยู่ต่ำและเกร็งแกนกลางลำตัวตลอด",
      "รักษาจังหวะสม่ำเสมอและหายใจให้เป็นปกติตลอดการทำท่า",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "core-dead-bug",
    nameTh: "เดดบัก",
    nameEn: "Dead Bug",
    bodyPart: "core",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "core",
    alternativeTh: "เดดบักไม่เหยียดขาสุด (ลดช่วงการเคลื่อนไหว)",
    cue: "หลังส่วนล่างแนบพื้นตลอดการเคลื่อนไหว",
    stepsTh: [
      "นอนหงายราบกับพื้น เหยียดแขนตรงขึ้นเพดาน",
      "งอเข่าและยกขาขึ้นจากพื้น ทำมุม 90 องศาที่สะโพกและเข่า",
      "เกร็งแกนกลางลำตัวและกดหลังส่วนล่างติดพื้น",
      "ค่อยๆ ลดแขนขวาและขาซ้ายลงหาพื้น เหยียดตรงและลอยเหนือพื้นเล็กน้อย",
      "ค้างไว้ครู่หนึ่ง แล้วกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำด้วยแขนซ้ายและขาขวา สลับข้างต่อเนื่องตามจำนวนครั้งที่ต้องการ",
    ],
  },

  // ------------------------------------------------------------ GLUTES ----
  {
    id: "glutes-hip-thrust",
    nameTh: "ฮิปทรัสต์",
    nameEn: "Barbell Hip Thrust",
    bodyPart: "glutes",
    equipment: ["barbell", "bench"],
    isCompound: true,
    skillLevel: "advanced",
    icon: "glutes",
    alternativeTh: "ฮิปทรัสต์น้ำหนักตัว (Bodyweight Hip Thrust)",
    cue: "บีบก้นสุดช่วงบน สะบักพิงม้านั่ง",
    stepsTh: [
      "นอนหงายบนม้านั่ง เท้าวางราบบนพื้น เข่างอ",
      "จับบาร์เบลด้วยมือคว่ำ วางไว้บนสะโพก",
      "เกร็งก้นและยกสะโพกขึ้นจากม้านั่งจนลำตัวเป็นเส้นตรงจากเข่าถึงไหล่",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดสะโพกกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "glutes-glute-bridge",
    nameTh: "กลูทบริดจ์",
    nameEn: "Glute Bridge",
    bodyPart: "glutes",
    equipment: ["bodyweight"],
    isCompound: true,
    skillLevel: "beginner",
    icon: "glutes",
    alternativeTh: "กลูทบริดจ์ยกขาเดียว (Single-Leg Bridge)",
    cue: "เกร็งก้นค้าง 1-2 วินาทีที่จุดสูงสุด",
    stepsTh: [
      "นอนหงายราบกับพื้น เข่างอ เท้าวางราบบนพื้น",
      "วางแขนไว้ข้างลำตัว ฝ่ามือคว่ำลง",
      "เกร็งก้นและแกนกลางลำตัว ยกสะโพกขึ้นจากพื้นจนลำตัวเป็นเส้นตรงจากเข่าถึงไหล่",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด บีบก้น",
      "ค่อยๆ ลดสะโพกกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    // Swapped from "Cable Glute Kickback" — searched "kickback" across the
    // full dataset and every result targets triceps, not glutes. This is
    // the closest real match (same equipment: cable, same movement pattern
    // of extending the leg backward against cable resistance).
    id: "glutes-cable-hip-extension",
    nameTh: "เคเบิลยกขาไปด้านหลัง",
    nameEn: "Cable Standing Hip Extension",
    bodyPart: "glutes",
    equipment: ["cable"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "glutes",
    alternativeTh: "กลูทคิกแบ็กสี่ขา (Donkey Kick)",
    cue: "คล้องสายเคเบิลที่ข้อเท้า ยืนหันหน้าออกจากเครื่อง ยกขาไปด้านหลังตรงๆ ไม่แอ่นหลังช่วยแรง",
    stepsTh: [
      "ติดสายเคเบิลกับรอกต่ำ ยืนหันหน้าออกจากเครื่อง",
      "คล้องสายเคเบิลที่ข้อเท้า ยืนเท้ากว้างเท่าหัวไหล่",
      "เกร็งแกนกลางลำตัวและรักษาหลังตรงตลอดการทำท่า",
      "ค่อยๆ เหยียดขาไปด้านหลังตรงๆ บีบก้นที่จุดสูงสุด",
      "ค้างไว้ครู่หนึ่ง แล้วกลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ แล้วสลับข้างทำซ้ำกับขาอีกข้าง",
    ],
  },
  {
    id: "glutes-donkey-kick",
    nameTh: "กลูทคิกแบ็กสี่ขา",
    nameEn: "Donkey Kick",
    bodyPart: "glutes",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "glutes",
    alternativeTh: "กลูทคิกแบ็กใช้ยางยืดเพิ่มแรงต้าน (ถ้ามี)",
    cue: "เข่าคงมุม 90 องศา เตะขึ้นด้วยแรงจากก้น",
    stepsTh: [
      "คุกเข่าลงบนพื้นในท่าคลาน มือวางตรงใต้ไหล่ เข่าวางตรงใต้สะโพก",
      "เกร็งแกนกลางลำตัว รักษาหลังให้ตรงเป็นแนวราบ",
      "ยกขาข้างหนึ่งขึ้นด้านหลังโดยงอเข่าทำมุม 90 องศา ดันฝ่าเท้าขึ้นเพดาน",
      "บีบก้นที่จุดสูงสุด ระวังอย่าแอ่นหลังช่วยแรง",
      "ค่อยๆ ลดเข่ากลับสู่ท่าเริ่มต้นโดยไม่วางเข่าลงพื้นเต็มที่",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ แล้วสลับข้าง",
    ],
  },
  {
    id: "glutes-step-up",
    nameTh: "สเต็ปอัพ",
    nameEn: "Step-up",
    bodyPart: "glutes",
    equipment: ["prop"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "glutes",
    alternativeTh: "สเต็ปอัพน้ำหนักตัวจังหวะช้า ใช้บันไดหรือขั้นบันได",
    cue: "ดันตัวขึ้นด้วยส้นเท้าหน้า ไม่กระแทกเข่าหลัง",
    stepsTh: [
      "ยืนหน้าแท่นหรือม้านั่งที่มั่นคง เท้ากว้างเท่าหัวไหล่",
      "ก้าวเท้าข้างหนึ่งขึ้นวางเต็มฝ่าเท้าบนแท่น",
      "ดันพื้นด้วยส้นเท้าที่อยู่บนแท่น ยกตัวขึ้นจนยืนตรงบนแท่น",
      "ค่อยๆ ลดตัวลงกลับสู่ท่าเริ่มต้นอย่างควบคุม ไม่ให้เท้าหลังกระแทกพื้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ แล้วสลับขา",
    ],
  },
  {
    // Swapped from "Sumo Squat" — only a Smith-machine-loaded sumo squat
    // exists in the dataset. This is a real bodyweight glute exercise
    // instead (same equipment: bodyweight), though it's a crossing-leg
    // stance rather than a wide stance, and needs more balance — bumped
    // to intermediate skill level accordingly.
    id: "glutes-curtsy-squat",
    nameTh: "เคอร์ทซีสควอท",
    nameEn: "Curtsy Squat",
    bodyPart: "glutes",
    equipment: ["bodyweight"],
    isCompound: true,
    skillLevel: "intermediate",
    icon: "glutes",
    alternativeTh: "ซูโม่สควอทยืนกว้าง (Sumo Squat)",
    cue: "ไขว้ขาข้างหนึ่งไปด้านหลังเฉียง ย่อเข่าทั้งสองข้างลงคล้ายทำความเคารพ กลับมายืนตรง สลับข้าง",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่",
      "ก้าวเท้าขวาไขว้ไปด้านหลังทแยงมุม ไขว้หลังขาซ้าย",
      "งอเข่าทั้งสองข้างลงเหมือนกำลังทำความเคารพ หย่อนตัวลง",
      "รักษาลำตัวส่วนบนตั้งตรง น้ำหนักอยู่ที่เท้าหน้า",
      "ดันพื้นด้วยเท้าหน้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำอีกข้างโดยก้าวเท้าซ้ายไขว้ไปด้านหลังทแยงมุมสลับกัน",
    ],
  },

  // ------------------------------------------------------------ CALVES ----
  {
    id: "calves-standing-raise",
    nameTh: "ยืนยกส้นเท้า (เครื่อง)",
    nameEn: "Standing Calf Raise",
    bodyPart: "calves",
    equipment: ["machine"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "calves",
    alternativeTh: "ยืนยกส้นเท้าน้ำหนักตัว (Bodyweight Calf Raise)",
    cue: "ยกส้นเท้าสูงสุด ค้างเกร็ง 1 วินาที",
    stepsTh: [
      "ปรับเครื่องให้พอดีกับส่วนสูง ยืนเท้ากว้างเท่าหัวไหล่",
      "วางไหล่ใต้เบาะรองและจับที่จับเพื่อความมั่นคง",
      "ยกส้นเท้าขึ้นสูงที่สุดโดยเหยียดข้อเท้า",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดส้นเท้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "calves-dumbbell-raise",
    nameTh: "ดัมเบลยกส้นเท้า",
    nameEn: "Dumbbell Calf Raise",
    bodyPart: "calves",
    equipment: ["dumbbell"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "calves",
    alternativeTh: "ยกส้นเท้าขาเดียว (Single-Leg Calf Raise)",
    cue: "ยืนบนขอบขั้นบันไดเพื่อเพิ่มช่วงการเคลื่อนไหว",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ถือดัมเบลข้างละลูก",
      "ยกส้นเท้าขึ้นจากพื้นให้สูงที่สุดโดยใช้กล้ามเนื้อน่อง",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดส้นเท้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "calves-bodyweight-raise",
    nameTh: "ยกส้นเท้าน้ำหนักตัว",
    nameEn: "Bodyweight Calf Raise",
    bodyPart: "calves",
    equipment: ["bodyweight"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "calves",
    alternativeTh: "ยกส้นเท้าขาเดียวเพิ่มความหนัก",
    cue: "เคลื่อนไหวช้าๆ ควบคุมทั้งขึ้นและลง",
    stepsTh: [
      "ยืนเท้ากว้างเท่าหัวไหล่ ปลายเท้าชี้ไปด้านหน้า",
      "วางมือบนกำแพงหรือจุดพยุงที่มั่นคงเพื่อช่วยทรงตัว",
      "ค่อยๆ ยกส้นเท้าขึ้นจากพื้น ยกน้ำหนักตัวขึ้นบนปลายเท้า",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดส้นเท้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "calves-seated-raise",
    nameTh: "นั่งยกส้นเท้า (เครื่อง)",
    nameEn: "Seated Calf Raise",
    bodyPart: "calves",
    equipment: ["machine"],
    isCompound: false,
    skillLevel: "beginner",
    icon: "calves",
    alternativeTh: "ยกส้นเท้านั่งถ่วงด้วยดัมเบลบนเข่า",
    cue: "เน้นกล้ามเนื้อน่องส่วนลึก ช่วงล่างของขา",
    stepsTh: [
      "ปรับความสูงเบาะนั่งให้เข่างอเล็กน้อยและเท้าวางราบบนแท่นเหยียบ",
      "วางปลายเท้าบนแท่นเหยียบ ส้นเท้าห้อยออกนอกขอบ",
      "จับที่จับหรือด้านข้างเบาะเพื่อความมั่นคง",
      "ดันปลายเท้ายกส้นเท้าขึ้นให้สูงที่สุด",
      "ค้างไว้ครู่หนึ่งที่จุดสูงสุด แล้วค่อยๆ ลดส้นเท้ากลับสู่ท่าเริ่มต้น",
      "ทำซ้ำตามจำนวนครั้งที่ต้องการ",
    ],
  },
  {
    id: "calves-jump-rope",
    nameTh: "กระโดดเชือก",
    nameEn: "Jump Rope",
    bodyPart: "calves",
    equipment: ["jump_rope"],
    isCompound: false,
    skillLevel: "intermediate",
    icon: "calves",
    alternativeTh: "กระโดดอยู่กับที่โดยไม่ใช้เชือก (Bodyweight Jump)",
    cue: "กระโดดเบาๆ ด้วยปลายเท้า ข้อเข่ายืดหยุ่น",
    stepsTh: [
      "จับด้ามจับเชือกกระโดดด้วยมือทั้งสองข้าง ฝ่ามือหันเข้าหากัน",
      "ยืนเท้ากว้างเท่าหัวไหล่ เข่างอเล็กน้อย",
      "แกว่งเชือกข้ามศีรษะและกระโดดข้ามเชือกเมื่อเชือกมาถึงเท้า",
      "ลงพื้นเบาๆ บนปลายเท้าและกระโดดซ้ำเมื่อเชือกวนมาอีกครั้ง",
      "กระโดดต่อเนื่องตามระยะเวลาหรือจำนวนครั้งที่ต้องการ",
    ],
  },
];

// ---------------------------------------------------------------------------
// Pure helper functions (query layer) — swap the body of these for MongoDB
// calls later without changing any caller in lib/generator.ts.
// ---------------------------------------------------------------------------

const EQUIPMENT_BY_LOCATION: Record<Location, EquipmentTag[]> = {
  // Gym has everything, including fixed apparatus and specialty items.
  gym: [
    "machine",
    "barbell",
    "dumbbell",
    "cable",
    "bench",
    "band",
    "bodyweight",
    "pullup_bar",
    "dip_bars",
    "prop",
    "jump_rope",
    "ab_wheel",
  ],
  // "บ้านมีดัมเบล" means exactly that: dumbbells at home. We only assume
  // what's directly implied — dumbbells, an optional bench (the standard
  // dumbbell-plus-bench starter combo), household props, and the body.
  // We do NOT assume a pull-up bar, resistance band, jump rope, or ab
  // wheel — those are separate purchases nobody said they have.
  home_dumbbell: ["dumbbell", "bodyweight", "bench", "prop"],
  // Genuinely zero purchased equipment — only the body and ordinary
  // household furniture (a chair, step, wall).
  home_bodyweight: ["bodyweight", "prop"],
  // A park / outdoor space: body, found furniture (benches, curbs), and
  // the fixed bars many calisthenics parks provide.
  outdoor: ["bodyweight", "prop", "pullup_bar", "dip_bars"],
};

export function getAllExercises(): Exercise[] {
  return EXERCISES;
}

export function getExercisesByBodyPart(bodyPart: BodyPart): Exercise[] {
  return EXERCISES.filter((exercise) => exercise.bodyPart === bodyPart);
}

/** Returns exercises whose equipment is fully usable at the given location. */
export function getExercisesByLocation(location: Location): Exercise[] {
  const allowed = new Set(EQUIPMENT_BY_LOCATION[location]);
  return EXERCISES.filter((exercise) =>
    exercise.equipment.every((tag) => allowed.has(tag))
  );
}

export function getExercisesForBodyPartAtLocation(
  bodyPart: BodyPart,
  location: Location
): Exercise[] {
  const allowed = new Set(EQUIPMENT_BY_LOCATION[location]);
  return EXERCISES.filter(
    (exercise) =>
      exercise.bodyPart === bodyPart &&
      exercise.equipment.every((tag) => allowed.has(tag))
  );
}

export function getEquipmentForLocation(location: Location): EquipmentTag[] {
  return EQUIPMENT_BY_LOCATION[location];
}
