# Weight Training Planner — บันทึกงานที่ทำ

## สถานะโปรเจกต์
สร้างเว็บแอป Weight Training Planner ด้วย Next.js 14 (App Router) + TypeScript + Tailwind CSS ตามสเปกที่กำหนด เสร็จสมบูรณ์และ build ผ่านแล้ว (ยกเว้นการโหลดฟอนต์ Google Fonts ที่ต้องทดสอบบนเครื่องจริงที่มีอินเทอร์เน็ตปกติ)

หมายเหตุ: ตอนเริ่มงาน โฟลเดอร์ที่เชื่อมต่อไว้ (`D:\project\myfitnesshome`) ว่างเปล่า แม้ในคำสั่งจะระบุว่าไฟล์ config บางส่วนมีอยู่แล้ว จึงสร้างไฟล์ config ทั้งหมดขึ้นใหม่ตั้งแต่ต้นด้วย

## ไฟล์ที่สร้าง

### Config
- `package.json` — Next.js 14.2.5, React 18.3.1, TypeScript, Tailwind
- `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`
- `tailwind.config.ts` — color tokens (paper, surface, surface2, ink, inkSoft, line, sage.{50,100,300,500,600,700}, amber.{100,400,600})
- `.gitignore`

### App
- `app/layout.tsx` — โหลดฟอนต์ Sora + Inter ผ่าน `next/font/google`, `lang="th"`
- `app/globals.css` — Tailwind base + focus-visible outline สำหรับ keyboard navigation
- `app/page.tsx` — หน้าแรก ฟอร์มเลือก 4 หมวดหมู่
- `app/program/page.tsx` — หน้าแสดงผลโปรแกรม (wrap ด้วย Suspense เพราะใช้ `useSearchParams`)

### Data layer (`lib/`)
- `lib/types.ts` — union types (Goal, Experience, DaysPerWeek, Location, BodyPart, EquipmentTag) และ interfaces (Exercise, ProgramExercise, ProgramDay, GeneratedProgram, FilterSelection)
- `lib/exercises.ts` — ฐานข้อมูลท่าออกกำลังกาย 55 ท่า ครบ 8 body part (chest/back/legs/shoulders/arms/core/glutes/calves) แต่ละท่ามี `alternativeTh` (ทางเลือกไม่มีเครื่อง) และ `cue`. เขียนเป็น pure data + pure query functions (`getExercisesByBodyPart`, `getExercisesByLocation` ฯลฯ) เพื่อสลับไปต่อ MongoDB ในอนาคตได้โดยไม่แตะ generator
- `lib/generator.ts` — `generateProgram(filters): GeneratedProgram`
  - กำหนด split ตามจำนวนวัน: 3 วัน = Full Body A/B/C, 4 วัน = Upper/Lower x2, 5 วัน = Push/Pull/Legs/Upper/Lower, 6 วัน = Push/Pull/Legs x2
  - กรองท่าตาม equipment ที่ location นั้นมี
  - กำหนด sets/reps/rest ตาม goal (strength/muscle/fatloss/general) แยกท่าหลัก (compound) กับท่าเสริม (isolation)
  - ปรับจำนวนเซตและจำนวนท่า/วันตาม experience (มือใหม่น้อยกว่า, ระดับสูงมากกว่า)
  - ใช้ seeded shuffle (deterministic) — เลือกเงื่อนไขเดิมได้ผลลัพธ์เดิมทุกครั้ง แต่ Full Body A/B/C ฯลฯ มีท่าไม่ซ้ำกัน
  - แนบ weekday label (จันทร์-เสาร์ ตามจำนวนวัน) และ notesTh (warm-up, progressive overload, การนอนพัก, และ tips เฉพาะ goal/location/experience)

### Components (`components/`)
- `Icon.tsx` — SVG line icon วาดเองครบ 8 body part (ไม่ใช้รูปถ่าย/ไอคอนจากภายนอก)
- `FilterForm.tsx` — ฟอร์มเลือก 4 หมวดหมู่แบบการ์ด (ไม่ใช้ dropdown) รองรับ keyboard, ส่งค่าไป `/program` ผ่าน query params
- `ProgramDayView.tsx` — day tabs (คลิก/กด arrow key สลับวันได้)
- `ExerciseCard.tsx` — แสดงรูป/ไอคอน, ชื่อไทย/อังกฤษ, sets x reps, เวลาพัก, ท่าหลัก/เสริม, ทางเลือกไม่มีเครื่อง, cue
- `ExercisePhoto.tsx` — client component แสดงรูปจริงจาก `/exercises/{id}.jpg` ถ้ามี ไม่มีก็ fallback เป็น SVG icon อัตโนมัติ
- `ProgramPageClient.tsx` — client component อ่าน query params, validate, เรียก `generateProgram`, render ผลลัพธ์ (มีหน้า fallback ถ้า query params ไม่ครบ/ไม่ถูกต้อง)

## การทดสอบ
- รัน `npm install` + `npx next build` ในสภาพแวดล้อมทดสอบ — compile และ type-check ผ่าน 100%, generate static pages สำเร็จ
- เขียนสคริปต์ทดสอบ `generateProgram` วนทุก combination ของ 4 หมวดหมู่ (4 goal × 3 experience × 4 days × 4 location = 192 แบบ) — ผ่านหมด ไม่มีวันไหนท่าน้อยเกินไป (ขั้นต่ำ 4 ท่า/วัน) และไม่มีท่าซ้ำในวันเดียวกัน
- ข้อจำกัดที่พบระหว่างทดสอบ: แซนด์บอกซ์ที่ใช้ทดสอบบล็อกการเชื่อมต่อ fonts.googleapis.com ทำให้ `next build` เต็มรูปแบบ (พร้อมฟอนต์จริง) รันไม่ผ่านในสภาพแวดล้อมนี้ — เป็นข้อจำกัดเครือข่ายของแซนด์บอกซ์ ไม่ใช่บั๊กของโค้ด ได้ทดสอบแยกด้วยการถอดฟอนต์ชั่วคราวแล้ว build ผ่านสมบูรณ์ ก่อนคืนโค้ดฟอนต์จริงกลับเข้าไป

## ขั้นตอนถัดไปสำหรับผู้ใช้
1. `npm install`
2. (ถ้าต้องการรูปจริง — ดูหัวข้อถัดไป) `npm run fetch-photos`
3. `npm run dev` แล้วเปิด `http://localhost:3000`
4. (ในอนาคต) ต่อ MongoDB จริงโดยแก้เฉพาะ query functions ใน `lib/exercises.ts` ให้ดึงจาก DB แทน static array — ไม่ต้องแก้ `lib/generator.ts`

## อัปเดต: รูปถ่ายท่าออกกำลังกายจริง (แทน/เสริม SVG icon)

ผู้ใช้ขอรูปจริงแทน SVG icon เนื่องจากเว็บนี้ทำไว้ใช้ส่วนตัว ไม่ใช่เพื่อจำหน่ายหรือหวังผลกำไร

**แหล่งข้อมูล:** hasaneyldrm/exercises-dataset (GitHub) — เดตาเซตท่าออกกำลังกาย 1,324+ ท่า พร้อมรูปธัมบ์เนล คำอธิบาย และ license ระบุชัดว่า "อนุญาตให้ใช้เพื่อโปรเจกต์ส่วนตัว การวิจัย และการเรียนรู้ ห้ามใช้เชิงพาณิชย์" — ตรงกับการใช้งานของเว็บนี้พอดี

**ข้อจำกัดของแซนด์บอกซ์ที่พบ:** เครือข่ายในแซนด์บอกซ์ที่ใช้พัฒนาอนุญาตเฉพาะการเชื่อมต่อ npm registry เท่านั้น ไม่สามารถดาวน์โหลดไฟล์รูปภาพ (binary) จากอินเทอร์เน็ตทั่วไปได้โดยตรง (ทั้งผ่าน bash/curl และเครื่องมือ fetch ข้อความ) จึงไม่สามารถดาวน์โหลดรูปมาฝังในโปรเจกต์ให้ตั้งแต่ในเซสชันนี้ได้ ทางแก้คือเขียนเป็นสคริปต์ให้ผู้ใช้รันเองบนเครื่องที่มีอินเทอร์เน็ตปกติ

**สิ่งที่เพิ่มเข้ามา:**
- `scripts/fetch-exercise-photos.mjs` — สคริปต์ Node.js (รันด้วย `npm run fetch-photos`) ที่:
  1. ดาวน์โหลด `data/exercises.json` จากเดตาเซตข้างต้น
  2. จับคู่ท่าออกกำลังกายทั้ง 55 ท่าใน `lib/exercises.ts` กับท่าที่ใกล้เคียงที่สุดในเดตาเซต โดยให้คะแนนจากความคล้ายชื่อ (Dice coefficient) + โบนัสถ้าหมวดหมู่ตรงกับ body part ที่คาดไว้
  3. ดาวน์โหลดรูปธัมบ์เนลที่จับคู่ได้ไปเก็บที่ `public/exercises/{exercise-id}.jpg`
  4. พิมพ์รายงานว่าท่าไหนจับคู่ได้/ไม่ได้ (ท่าที่ไม่ได้ก็ไม่เป็นไร — เว็บจะ fallback กลับไปใช้ SVG icon เดิมโดยอัตโนมัติ)
  - ทดสอบ logic การจับคู่แล้วด้วยชุดข้อมูลตัวอย่างจากเดตาเซตจริง (Barbell Bench Press, Deadlift, Squat, Pull-up ฯลฯ) ได้คะแนนจับคู่ถูกต้องครบ
- `components/ExercisePhoto.tsx` (ใหม่, client component) — พยายามโหลด `/exercises/{id}.jpg` ก่อน ถ้าไฟล์ไม่มี/โหลดไม่สำเร็จ (`onError`) จะ fallback ไปแสดง SVG icon เดิมโดยอัตโนมัติ — เว็บใช้งานได้ปกติทั้งก่อนและหลังรันสคริปต์
- `components/ExerciseCard.tsx` — แก้ให้ใช้ `ExercisePhoto` แทนไอคอนวงกลมเดิม (ขนาดใหญ่ขึ้นเป็น thumbnail สี่เหลี่ยมมุมโค้ง)
- `.gitignore` — เพิ่ม `/public/exercises/*.jpg` (ไม่ commit รูปที่ดาวน์โหลดมา เพราะเป็นสื่อที่มีเจ้าของลิขสิทธิ์ ไม่ใช่ของเรา ให้รันสคริปต์ใหม่แทนถ้าต้องโคลนโปรเจกต์)
- `package.json` — เพิ่ม script `"fetch-photos": "node scripts/fetch-exercise-photos.mjs"`

**ข้อควรระวัง:** ห้ามใช้รูปเหล่านี้ในโปรดักต์เชิงพาณิชย์ ตาม license ของเดตาเซตต้นทาง

## อัปเดต: แก้ไขความสอดคล้องของอุปกรณ์ + เพิ่มตัวเลือกเพศ

ผู้ใช้ท้วงติงว่าท่าที่ขึ้นไม่ตรงกับเงื่อนไข เช่น เลือก "บ้านไม่มีอุปกรณ์" แต่ได้ท่า Ab Wheel Rollout ซึ่งจริงๆ ต้องใช้อุปกรณ์ (ล้อ Ab Wheel) — ตรวจสอบแล้วพบว่าเป็นบั๊กจริง เกิดจากตอนแรกแท็กอุปกรณ์หลายท่าไม่ตรงกับความเป็นจริง

**สิ่งที่แก้:**
- ตรวจสอบอุปกรณ์ของทั้ง 55 ท่าใหม่ทั้งหมด พบและแก้ท่าที่แท็กผิดประมาณ 12 ท่า เช่น:
  - Ab Wheel Rollout: เดิมแท็ก "bodyweight" (ไม่มีอุปกรณ์) → แก้เป็น "ab_wheel" (ต้องมีล้อ)
  - Pull-up: เดิมแท็ก "bodyweight" → แก้เป็น "pullup_bar" (ต้องมีบาร์โหน)
  - Jump Rope: เดิมแท็ก "bodyweight" → แก้เป็น "jump_rope" (ต้องมีเชือก)
  - Bench Dips, Step-up, Bulgarian Split Squat: เพิ่มแท็ก "prop" (ต้องมีเก้าอี้/ม้านั่ง/ขั้นบันได)
  - Chest Dips: แก้เป็น "dip_bars" (ต้องมีบาร์คู่ขนาน)
  - Hanging Leg Raise: แก้เป็น "pullup_bar"
  - Face Pull, Russian Twist, Donkey Kick, Sumo Squat, Walking Lunge, Band Lateral Raise: แก้บั๊ก "แท็กอุปกรณ์แบบ AND ทั้งที่ควรเป็น OR" (เช่น เดิมเขียนว่าต้องมีทั้ง cable และ band พร้อมกัน ทั้งที่จริงๆ ใช้อย่างใดอย่างหนึ่งก็พอ) → เลือกอุปกรณ์ที่เข้าถึงง่ายที่สุดเป็นหลัก
  - Romanian Deadlift: เปลี่ยนจากบาร์เบล (เข้าถึงยาก) เป็นดัมเบล (เข้าถึงง่ายกว่า เพิ่มตัวเลือกให้กลุ่มบ้านมีดัมเบล)
- เพิ่ม equipment tag ใหม่ให้ละเอียดขึ้น: `pullup_bar`, `dip_bars`, `prop` (อุปกรณ์ในบ้านทั่วไปเช่นเก้าอี้ ไม่ถือเป็น "อุปกรณ์" ที่ต้องซื้อ), `jump_rope`, `ab_wheel`
- นิยาม location ใหม่ให้เข้มงวดขึ้น: "บ้านไม่มีอุปกรณ์" อนุญาตแค่ bodyweight + prop (ของใช้ในบ้านทั่วไป) เท่านั้น ไม่รวมยางยืด/บาร์โหน/ล้อ/เชือกอีกต่อไป
- เพิ่มท่าใหม่ 2 ท่าเพื่อชดเชยท่าที่ถูกตัดออกจากกลุ่ม "ไม่มีอุปกรณ์": Decline Push-up (หน้าอก, ใช้ prop) และ Prone Y-T-W Raise (หลัง, bodyweight ล้วน)
- ทดสอบใหม่ครบทุก combination (4 goal × 3 experience × 4 days × 4 location × 3 gender = 576 แบบ) — ผ่านหมด ทุกวันมีอย่างน้อย 4 ท่าที่ใช้อุปกรณ์ตรงกับสถานที่จริง

**เพิ่มตัวเลือกเพศ (ช/ญ):**
- เพิ่มหมวดที่ 5 ในฟอร์มหน้าแรก: ชาย / หญิง / ไม่ระบุ
- ทุกท่าในฐานข้อมูลยังคงใช้ได้กับทุกเพศเหมือนเดิม — เพศไม่ได้ใช้กรองหรือตัดท่าออกเลย ใช้แค่ปรับ "น้ำหนักการเน้น" เล็กน้อยเท่านั้น (คล้ายฟีเจอร์ที่แอปฟิตเนสทั่วไปมี):
  - เลือก "หญิง" → วันที่มีท่าสะโพก/แกนกลางลำตัวอยู่แล้ว จะได้ท่าเพิ่มอีก 1 ท่าจากกลุ่มนั้น
  - เลือก "ชาย" → วันที่มีท่าอก/หลัง/แขนอยู่แล้ว จะได้ท่าเพิ่มอีก 1 ท่าจากกลุ่มนั้น
  - เลือก "ไม่ระบุ" → ไม่ปรับอะไรเลย ใช้สัดส่วนมาตรฐาน
- แก้ไข `lib/types.ts`, `lib/generator.ts`, `components/FilterForm.tsx`, `components/ProgramPageClient.tsx`

**ไฟล์ที่แก้ไขรอบนี้:** `lib/types.ts`, `lib/exercises.ts`, `lib/generator.ts`, `components/FilterForm.tsx`, `components/ProgramPageClient.tsx`, `scripts/fetch-exercise-photos.mjs` (อัปเดตให้ตรงกับท่าที่แก้ไข/เพิ่มใหม่)

Build ผ่านสมบูรณ์ (compile + type-check + static generation) ตรวจสอบไฟล์ทุกไฟล์ตรงกันระหว่างโฟลเดอร์ทำงานกับโฟลเดอร์ส่งมอบด้วย md5 checksum แล้ว

## อัปเดต: เปลี่ยนจากรูปนิ่ง (JPG) เป็นภาพเคลื่อนไหว (GIF)

ผู้ใช้ขอให้เปลี่ยนเป็น GIF เพื่อให้ดูท่าออกกำลังกายง่ายขึ้น (เห็นการเคลื่อนไหวจริง ไม่ใช่แค่ภาพนิ่ง)

**สิ่งที่แก้:**
- `scripts/fetch-exercise-photos.mjs` — เปลี่ยนจากดาวน์โหลด field `image` (thumbnail นิ่ง) เป็น `gif_url` (แอนิเมชัน) จากเดตาเซตเดิม (hasaneyldrm/exercises-dataset) บันทึกเป็น `public/exercises/{id}.gif`
- `components/ExercisePhoto.tsx` — เปลี่ยน src เป็น `/exercises/{id}.gif` (แท็ก `<img>` เล่น GIF แบบวนอัตโนมัติในตัวอยู่แล้ว ไม่ต้องเพิ่มโค้ดเล่นวิดีโอ)
- `components/ExerciseCard.tsx` — ขยายขนาดรูปจาก 64x64 เป็น 96x96 พิกเซล ให้เห็นการเคลื่อนไหวชัดขึ้น
- `.gitignore` — เปลี่ยน pattern จาก `*.jpg` เป็น `*.gif`

**หมายเหตุ:** ถ้าเคยรัน `npm run fetch-photos` เวอร์ชันก่อนหน้ามาแล้วจะมีไฟล์ `.jpg` เก่าตกค้างอยู่ใน `public/exercises/` — ลบทิ้งได้เลย ไม่ใช้แล้ว แล้วรัน `npm run fetch-photos` ใหม่อีกครั้งเพื่อโหลด GIF

Build ผ่านสมบูรณ์ ตรวจสอบไฟล์ตรงกันด้วย md5 checksum ระหว่างโฟลเดอร์ทำงานกับโฟลเดอร์ส่งมอบแล้ว

## อัปเดต: แก้ Push/Pull ไม่ตรงกล้ามเนื้อ + จำกัด "บ้านมีดัมเบล" ให้ตรงจริง + ข้อมูลอ้างอิง

ผู้ใช้ท้วงอีกครั้งว่าท่ายังไม่ตรงกับหมวดหมู่ และขอข้อมูลอ้างอิงที่ใช้จัดหมวดหมู่ ตรวจสอบพบ **บั๊กจริง 2 จุด**:

### บั๊กที่ 1: วัน Push ได้ท่า Bicep Curl / วัน Pull ได้ท่า Tricep

ต้นเหตุ: ระบบเดิมมี body part "arms" หมวดเดียวรวมทั้งลูกหนู (biceps) และหลังแขน (triceps) ทำให้วัน "Push" (bodyPart: arms) มีโอกาสสุ่มได้ท่า Barbell Curl ซึ่งเป็นท่าลูกหนู ทั้งที่ตามหลักการฝึก Push/Pull/Legs วัน Push ควรมีแค่ อก+ไหล่+หลังแขน (triceps) เท่านั้น ส่วนวัน Pull ควรมีแค่ หลัง+ลูกหนู (biceps) เท่านั้น

**อ้างอิงที่ใช้ยืนยัน:**
- [The Push/Pull/Legs Routine for Muscle Gains – Aston University](https://www.aston.ac.uk/sport/news/tips/fitness-exercise/push-pull-legs) — "push movements engage... pecs, triceps, and shoulders" / "pulling movements recruit... mid-to-upper back, biceps, and rear deltoids"
- [Push-Pull Workouts – Healthline](https://www.healthline.com/nutrition/push-pull-workout)
- [The Best Push Pull Legs Split for Building Muscle – StrengthLog](https://www.strengthlog.com/push-pull-legs-split/)

**วิธีแก้:** แยก body part "arms" ออกเป็น "biceps" กับ "triceps" อย่างชัดเจนใน `lib/types.ts`, `lib/exercises.ts`, `lib/generator.ts`, `components/Icon.tsx` (มีไอคอนแยกกัน — biceps เป็นแขนงอ, triceps เป็นแขนเหยียด) แล้วแก้ SPLIT_TEMPLATES ให้วัน Push ดึงเฉพาะ triceps และวัน Pull ดึงเฉพาะ biceps เท่านั้น (ทดสอบอัตโนมัติแล้วว่าไม่มีวัน Push ไหนมีท่า biceps และไม่มีวัน Pull ไหนมีท่า triceps เลยในทั้ง 576 combination)

### บั๊กที่ 2: "บ้านมีดัมเบล" ยังให้ท่าที่ต้องใช้อุปกรณ์อื่นที่ไม่ได้บอกว่ามี

เดิมสมมติว่าคนที่มีดัมเบลน่าจะมียางยืด/บาร์โหน/ล้อ Ab Wheel/เชือกกระโดดด้วย ซึ่งเป็นการเดาเกินไป — ผู้ใช้บอกแค่ว่า "มีดัมเบล" เท่านั้น

**วิธีแก้:** จำกัด `home_dumbbell` ให้เหลือแค่ dumbbell + bodyweight + bench (ม้านั่งเป็นของที่มักซื้อคู่กับดัมเบล) + prop (ของใช้ในบ้าน) เท่านั้น ตัดยางยืด/บาร์โหน/ล้อ/เชือกออกทั้งหมด ท่าที่ต้องใช้สิ่งเหล่านี้จะไปอยู่ที่ยิมหรือกลางแจ้งแทน (ที่มีบาร์จริง)

### เพิ่มท่าใหม่เพื่อไม่ให้ "บ้านไม่มีอุปกรณ์" ขาดท่าลูกหนู

หลังแยก biceps ออกมา พบว่าไม่มีท่าลูกหนูแบบไม่ใช้อุปกรณ์เลยสักท่า (บาร์เบล/ดัมเบล/ยางยืดทั้งหมดต้องใช้ของ) จึงเพิ่ม **Self-Resistance Curl** (เคิร์ลต้านแรงตัวเอง ใช้มืออีกข้างกดต้าน) ซึ่งเป็นเทคนิคที่ใช้จริงในการฝึกแบบ calisthenics ไม่ต้องใช้อุปกรณ์เลย

### อ้างอิงทั่วไปสำหรับการจัดหมวดหมู่กล้ามเนื้อ/อุปกรณ์

ใช้แนวทางเดียวกับ [ExRx.net Exercise Directory](https://exrx.net/Lists/Directory) ซึ่งเป็นฐานข้อมูลท่าออกกำลังกายเชิงวิชาการที่เปิดให้บริการมาตั้งแต่ปี 1999 จัดหมวดตาม muscle group / movement mechanics / equipment — เป็นมาตรฐานอ้างอิงที่ใช้จัดกลุ่มกล้ามเนื้อเป้าหมายและอุปกรณ์ของแต่ละท่าในฐานข้อมูลนี้

### เพิ่มความแม่นยำการจับคู่ GIF

`scripts/fetch-exercise-photos.mjs` ปรับให้ใช้ field `target` (กล้ามเนื้อเป้าหมายเฉพาะ เช่น "biceps", "triceps", "glutes") จากเดตาเซตต้นทางร่วมด้วย ไม่ใช่แค่ชื่อกับหมวดหมู่กว้างๆ อีกต่อไป และปรับเกณฑ์คะแนนขั้นต่ำจาก 0.32 เป็น 0.42 ให้เข้มงวดขึ้น (ยอมรับ "ไม่จับคู่" มากกว่าจับคู่ผิดท่า) พร้อมพิมพ์ log ให้ตรวจสอบได้ว่าแต่ละท่าจับคู่กับท่าไหนในเดตาเซต — ถ้าเห็นว่าจับคู่ผิดท่าไหน ลบไฟล์ `.gif` นั้นทิ้งได้ แอปจะ fallback เป็น SVG icon ให้อัตโนมัติ

**หมายเหตุสำคัญ:** การจับคู่ GIF เป็นการจับคู่ด้วยข้อความอัตโนมัติ ไม่ได้ตรวจสอบด้วยสายตาจริง เพราะแซนด์บอกซ์ที่ใช้พัฒนาไม่สามารถดาวน์โหลด/ดูรูปภาพได้ — ยังมีโอกาสจับคู่คลาดเคลื่อนได้บ้างแม้จะเพิ่มความแม่นยำแล้ว แนะนำให้ตรวจสอบ log ตอนรัน `npm run fetch-photos` เทียบกับชื่อท่า

**ทดสอบ:** รัน combination test ครบ 576 แบบอีกครั้งหลังแก้ไข — ผ่านหมด ไม่มีวันไหนท่าน้อยเกินไป และไม่มีท่า biceps ปนในวัน Push หรือท่า triceps ปนในวัน Pull เลย build ผ่านสมบูรณ์ ตรวจสอบไฟล์ตรงกันด้วย md5 checksum แล้ว

**ไฟล์ที่แก้ไขรอบนี้:** `lib/types.ts`, `lib/exercises.ts`, `lib/generator.ts`, `components/Icon.tsx`, `components/FilterForm.tsx`, `scripts/fetch-exercise-photos.mjs`

## อัปเดต: จัดลำดับความยากของท่าให้เหมาะกับมือใหม่ (skillLevel)

ผู้ใช้ถามว่าท่าสำหรับมือใหม่ดูเล่นยากไปหรือเปล่า และอ้างอิงจากอะไร — ตรวจโค้ดแล้วพบว่า **ไม่เคยมีการกรอง/จัดลำดับท่าตามระดับความยากเลย** ระดับ "มือใหม่" เดิมมีผลแค่ลดจำนวนเซตกับจำนวนท่า ไม่ได้ส่งผลต่อว่าจะสุ่มท่าไหนมาให้ ทำให้มือใหม่ที่เลือกยิมมีโอกาสได้ Barbell Back Squat, Deadlift, Bent-Over Row, Overhead Press ในวันเดียวกันได้ ทั้งที่ท่าเหล่านี้ต้องการทักษะควบคุมฟอร์ม/บาลานซ์สูง

**อ้างอิง:** ACSM ("Selecting and Effectively Using Free Weights") และแนวทาง NSCA ระบุว่านักยกน้ำหนักมือใหม่ควรเริ่มจากท่าที่มีการควบคุมมากกว่า (เครื่อง/ท่าที่มีไกด์/บอดี้เวทพื้นฐาน) ก่อนขยับไปท่าบาร์เบลอิสระที่ต้องการการทรงตัวและเทคนิคสูงกว่า เพื่อลดความเสี่ยงบาดเจ็บช่วงเรียนรู้ฟอร์ม

**สิ่งที่แก้:**
- เพิ่ม field ใหม่ `skillLevel: "beginner" | "intermediate" | "advanced"` ใน `lib/types.ts` และจัดระดับให้ครบทั้ง 62 ท่าใน `lib/exercises.ts` ตามกฎ:
  - **beginner**: ท่าเครื่อง (guided path), ท่ายางยืด (แรงต้านต่ำ ปลอดภัย), ท่าบอดี้เวท/ดัมเบลไอโซเลชันที่ไม่ต้องใช้บาลานซ์มาก (เช่น Push-up, Bodyweight Squat, Goblet Squat, Plank, Dead Bug, ท่าเคิร์ลทุกแบบ)
  - **intermediate**: ท่าคอมพาวด์ดัมเบล/เคเบิลที่ต้องการการทรงตัวปานกลาง และท่าบอดี้เวทที่ต้องใช้แรง/coordination มากขึ้น (เช่น Pull-up, Walking Lunge, Diamond Push-up)
  - **advanced**: ท่าบาร์เบลอิสระที่เป็นท่าหลัก (Barbell Back Squat, Deadlift, Bent-Over Row, Overhead Press, Barbell Bench Press, Barbell Hip Thrust) บวกกับท่าที่มีความเสี่ยงบาดเจ็บ/ทักษะสูงแม้ไม่ใช้บาร์เบล (Ab Wheel Rollout, Hanging Leg Raise, Bulgarian Split Squat, Chest Dips) — ยกเว้น Barbell Curl ที่ยังจัดเป็น beginner เพราะเป็นการงอข้อศอกท่าเดียว ไม่ต้องใช้บาลานซ์เหมือนท่าคอมพาวด์อื่น
- แก้ `lib/generator.ts`: เพิ่มฟังก์ชัน `buildBeginnerQueue()` — สำหรับมือใหม่เท่านั้น จะเรียงคิวท่าตาม **ระดับความยากเป็นหลัก** (ก่อนคอมพาวด์/ไอโซเลชัน) ส่วนระดับกลาง/สูงไม่เปลี่ยนพฤติกรรมเดิม (คอมพาวด์มาก่อนเสมอ)
  - **หมายเหตุสำคัญระหว่างพัฒนา**: ตอนแรกออกแบบให้แค่ "จัดเรียงภายในกลุ่มคอมพาวด์" กับ "จัดเรียงภายในกลุ่มไอโซเลชัน" แยกกัน แต่พบบั๊กจากการทดสอบว่าบางส่วนของร่างกาย (เช่น core) มีท่าคอมพาวด์แค่ท่าเดียวคือ Ab Wheel Rollout ซึ่งเป็น advanced — ทำให้ยังถูกเลือกก่อน Plank (beginner) อยู่ดี เพราะคอมพาวด์มาก่อนเสมอ จึงแก้ให้ระดับความยากเป็นตัวจัดลำดับหลักแทน คอมพาวด์/ไอโซเลชันเป็นแค่ tie-breaker ภายในระดับเดียวกัน
- ระบบยังคง**ไม่ตัดท่าไหนออกเลย** (เหมือนหลักการเดียวกับ gender emphasis) — แค่จัดลำดับความสำคัญ ถ้า pool ของ body part นั้นๆ มีแต่ท่า advanced ในสถานที่ที่เลือก ก็ยังเลือกได้ตามปกติ ไม่ทิ้งวันให้ท่าไม่ครบ
- เพิ่มโน้ตอธิบายในหน้าโปรแกรมสำหรับมือใหม่ ว่าเหตุผลที่จัดท่าเรียงแบบนี้คืออะไร

**ทดสอบ:** รัน combination test ครบ 576 แบบอีกครั้ง พร้อมนับสัดส่วนท่า advanced ที่มือใหม่ได้รับ — **ก่อนแก้ได้ 2.7% (108 จาก 4,048 ท่า), หลังแก้เหลือ 0% (0 จาก 4,048 ท่า)** ขณะที่ระดับกลาง/สูงไม่เปลี่ยนแปลง (ยังได้ท่า advanced ตามปกติ 527 จาก 4,704 ท่า = 11.2%) ตรวจ spot check ด้วยตาจริงเทียบ beginner vs advanced ที่ gym/3วัน/Full Body A ยืนยันว่ามือใหม่ได้ Goblet Squat, Push-up, Plank, Lat Pulldown, Machine Shoulder Press แทน Barbell Back Squat, Barbell Bench Press, Ab Wheel Rollout, Barbell Overhead Press ที่ระดับ advanced ได้รับ build ผ่านสมบูรณ์ ไม่มี type error

**ไฟล์ที่แก้ไขรอบนี้:** `lib/types.ts`, `lib/exercises.ts`, `lib/generator.ts`

## อัปเดต: ตรวจสอบรูป GIF ด้วยตาจริงทั้งหมด + แก้ไฟล์ที่ผิด + ปรับสคริปต์จับคู่

ผู้ใช้ท้วงว่า "Machine Shoulder Press" ดูรูปไม่ตรงกับชื่อท่า — ก่อนหน้านี้เคยบันทึกไว้ว่าไม่สามารถดูรูป/GIF ที่ดาวน์โหลดมาได้เพราะแซนด์บอกซ์จำกัดการดาวน์โหลดไฟล์ไบนารีจากอินเทอร์เน็ต แต่รอบนี้พบว่า **ไฟล์ที่ดาวน์โหลดมาแล้วในโฟลเดอร์ผู้ใช้ (ผ่าน `npm run fetch-photos` ที่ผู้ใช้รันเอง) สามารถเปิดดูได้จริงด้วยเครื่องมืออ่านไฟล์** จึงตรวจสอบด้วยตาทีละไฟล์ครบทั้ง 62 ท่าที่ใช้งานอยู่

**ผลตรวจสอบ: พบ 10 ท่าที่รูปไม่ตรงจริง**
1. `shoulders-machine-press` — รูปเป็นท่ายางยืด (band) ไม่ใช่เครื่อง
2. `shoulders-cable-lateral-raise` — รูปคล้าย Cable Fly/Crossover (ท่าอก) ไม่ใช่ยกข้าง
3. `shoulders-rear-delt-fly` — รูปคล้ายท่าโรว์ก้มตัวข้างเดียว ไม่ใช่ท่าฟลาย
4. `shoulders-band-lateral-raise` — ท่ายืนมือไพล่หลัง ไม่ใช่ท่ายกข้าง
5. `back-prone-ytw-raise` — รูปเป็นเครื่อง Reverse Fly ไม่ใช่ท่านอนคว่ำยกแขนแบบไม่มีอุปกรณ์
6. `biceps-self-resistance-curl` — รูปเป็นเครื่องเคิร์ลแขน (machine) ไม่ใช่เทคนิคต้านแรงตัวเอง
7. `legs-walking-lunge` — รูปเป็นท่ายืนตรงเฉยๆ ไม่มีท่าลันจ์ให้เห็นเลย
8. `glutes-glute-bridge` — รูปเป็นบาร์เบลฮิปทรัสต์ ไม่ใช่กลูทบริดจ์ไม่มีอุปกรณ์
9. `glutes-donkey-kick` — รูปเป็นท่ากลูทบริดจ์ ไม่ใช่ท่าคุกเข่าเตะขาหลัง
10. `glutes-sumo-squat` — รูปเป็นบาร์เบลสควอทในแร็ค ไม่ใช่ท่าสควอทไม่มีอุปกรณ์

**สิ่งที่แก้:**
- ลบไฟล์ GIF ทั้ง 10 ไฟล์ที่ผิดออกจาก `public/exercises/` — เว็บจะ fallback ไปแสดงไอคอน SVG โดยอัตโนมัติสำหรับท่าเหล่านี้ (ตามดีไซน์เดิมของ `ExercisePhoto.tsx`)
- ลบไฟล์ GIF เก่าที่ค้างอยู่ 8 ไฟล์ (`arms-*.gif`) ซึ่งเป็นไฟล์จากก่อนรอบแยก biceps/triceps ไม่ถูกใช้งานแล้วในโค้ดปัจจุบัน แต่ยังค้างอยู่ในโฟลเดอร์
- **ค้นพบสาเหตุหลัก**: เดตาเซตต้นทางมี field `"equipment"` (เช่น `"body weight"`, `"cable"`, `"leverage machine"`) ที่สคริปต์จับคู่ (`scripts/fetch-exercise-photos.mjs`) ไม่เคยใช้เลย ทำให้จับคู่แค่จากชื่อ+หมวดหมู่+กล้ามเนื้อเป้าหมาย โดยไม่สนใจว่าอุปกรณ์ในรูปตรงกับที่ท่าเราต้องการหรือไม่ — เป็นเหตุผลตรงที่ทำให้ "Machine Shoulder Press" จับคู่กับท่ายางยืดได้
- ปรับ `scoreCandidate()` ในสคริปต์ให้ใช้ field equipment นี้: ให้คะแนนบวกถ้าอุปกรณ์ตรงกับที่คาดไว้ ให้คะแนนลบถ้าอุปกรณ์ไม่ตรง (เช่น ท่าที่ต้องเป็น "machine" แต่จับคู่ได้ "resistance band" จะโดนหักคะแนนแรง) —ใช้กับทั้ง 62 ท่า ไม่ใช่แค่ 10 ท่าที่ผิด
- เพิ่ม `excludeKeywords` (คำที่ถ้าเจอในชื่อท่าที่จับคู่ได้ให้หักคะแนน) และ `preferKeywords` (คำที่ถ้าเจอให้บวกคะแนน) สำหรับ 6 ท่าที่ปัญหาเป็นเรื่อง "อุปกรณ์ตรงแต่ท่าทางผิด" ซึ่งการเช็ค equipment อย่างเดียวช่วยไม่ได้ (เช่น cable-lateral-raise ที่ดันจับคู่กับ cable fly ซึ่งใช้อุปกรณ์เดียวกัน)
- เพิ่มการแสดงค่า equipment ใน log บรรทัด "OK" ของสคริปต์ ให้ตรวจสอบย้อนหลังได้ง่ายขึ้นโดยไม่ต้องเปิดดูรูปทุกไฟล์

**หมายเหตุ:** ค่า equipment ในตาราง `DATASET_EQUIPMENT_BY_TAG` มีแค่ 5 ค่าที่ยืนยันได้จริงจากเดตาเซต ("body weight", "cable", "leverage machine", "assisted", "medicine ball") ส่วนที่เหลือ (barbell, dumbbell, band, rope, wheel) เป็นการเดาที่มีเหตุผลรองรับ (ชื่อมาตรฐานที่เดตาเซตประเภทนี้มักใช้) ถ้าเดาไม่ตรงจะแค่ไม่ช่วยกรอง ไม่ทำให้จับคู่ที่ถูกต้องอยู่แล้วเสียหาย

**ข้อจำกัด:** ยังไม่สามารถรันสคริปต์ที่ปรับปรุงแล้วเพื่อดาวน์โหลดและตรวจสอบผลจริงได้ในเซสชันนี้ (แซนด์บอกซ์ไม่มีสิทธิ์เข้าถึงอินเทอร์เน็ตสำหรับดาวน์โหลดไฟล์ไบนารี) — ผู้ใช้ต้องรัน `npm run fetch-photos` อีกครั้งเพื่อให้สคริปต์ที่ปรับปรุงแล้วดาวน์โหลดรูปใหม่ทับของเดิม แนะนำให้ตรวจสอบ log "OK" เทียบชื่อท่า+equipment อีกครั้งหลังรัน

**ไฟล์ที่แก้ไขรอบนี้:** `scripts/fetch-exercise-photos.mjs` (เพิ่ม equipment-based scoring), ลบไฟล์ผิด/ค้าง 18 ไฟล์ใน `public/exercises/`

## อัปเดต: Machine Shoulder Press ยังผิดอยู่หลังแก้ครั้งแรก — ปิดการจับคู่อัตโนมัติถาวรสำหรับ 4 ท่า

หลังผู้ใช้รัน `npm run fetch-photos` ใหม่ (สคริปต์ที่เพิ่ม equipment-based scoring แล้ว) ท่า "Machine Shoulder Press" ยังได้รูปผิดอยู่ดี — ตรวจดูรูปใหม่แล้วพบว่าเปลี่ยนจากท่ายางยืด (รอบก่อน) เป็นท่า **Landmine Squat/Press** (บาร์เบลปลายหนึ่งปักพื้น อีกปลายถือ) ซึ่งก็ยังไม่ใช่เครื่อง Shoulder Press เหมือนเดิม — เป็นการเดาผิดสองครั้งติดกันด้วยผลลัพธ์คนละแบบ

ผู้ใช้ถามตรงๆ ว่า "ใน ref ไม่มีหรือป่าว" — คำตอบที่ตรงไปตรงมาคือ **ไม่สามารถยืนยันได้ 100%** เพราะเดตาเซตเต็มมีมากกว่า 1,300 ท่า และแซนด์บอกซ์ที่ใช้พัฒนาไม่สามารถโหลดไฟล์ JSON ทั้งหมดมาดูได้ (ทดลองแล้วโดนตัดที่ ~92KB/29 รายการ จากทั้งหมด 1,300+ รายการ) แต่จากที่ระบบจับคู่อัตโนมัติเดาผิดมา 2 รอบติดกันด้วยคำตอบคนละแบบ มีความเป็นไปได้สูงว่าเดตาเซตนี้ไม่มีคลิป "Machine Shoulder Press" ที่ดีจริงๆ

**ตรวจสอบเพิ่มเติม:** พบว่าอีก 3 ท่าที่เคยแก้ไปแล้ว (`shoulders-cable-lateral-raise`, `shoulders-rear-delt-fly`, `shoulders-band-lateral-raise`) หลังรันสคริปต์ที่ปรับปรุงแล้วใหม่ ได้ **ไฟล์เดิมขนาดเท่าเดิมทุกไบต์** — แปลว่าการปรับ excludeKeywords/preferKeywords ไม่ได้เปลี่ยนผลลัพธ์เลย แปลว่าอย่างใดอย่างหนึ่ง: (ก) เดตาเซตไม่มีตัวเลือกที่ดีกว่านี้จริงๆ หรือ (ข) คำในชื่อท่าที่จับคู่ได้ไม่ตรงกับคำที่คาดไว้ใน excludeKeywords

**การตัดสินใจ:** แทนที่จะปรับแต่งคำค้นหาไปเรื่อยๆ โดยไม่มีทางตรวจสอบผลจริงได้จากฝั่งนี้ (ต้องรอผู้ใช้รันแล้วส่งกลับมาดูทุกรอบ) เปลี่ยนมาปิดการจับคู่อัตโนมัติถาวรสำหรับ 4 ท่านี้ (`skip: true` ใน `MATCH_TARGETS`):
- `shoulders-machine-press`
- `shoulders-band-lateral-raise`
- `shoulders-rear-delt-fly`
- `shoulders-cable-lateral-raise`

ทั้ง 4 ท่านี้จะแสดงไอคอน SVG มือวาดแทนเสมอ (ไม่ลองเดาอีก) ส่วนท่าอื่นๆ ยังจับคู่อัตโนมัติตามปกติ — ลบไฟล์ GIF ที่ผิดทั้ง 4 ไฟล์ออกจาก `public/exercises/` แล้ว

**ไฟล์ที่แก้ไขรอบนี้:** `scripts/fetch-exercise-photos.mjs` (เพิ่ม `skip`/`skipReason` field + logic กรองใน `main()` + log รายงานท่าที่ถูก skip), ลบไฟล์ผิด 4 ไฟล์ใน `public/exercises/`

## อัปเดต: ตรวจสอบกับเดตาเซตจริงทั้งหมด (ผู้ใช้ส่งไฟล์ `_reference-dataset.json` มาให้) — คำตอบที่แน่ชัดแล้ว

ผู้ใช้ถามว่า "Machine Shoulder Press ยังไม่ตรง ใน ref ไม่มีหรือป่าว" และดาวน์โหลดไฟล์ `data/exercises.json` เต็ม (1,324 ท่า, 15.9MB) มาวางไว้ในโปรเจกต์ให้ตรวจสอบโดยตรง — ทำให้ตอบคำถามนี้ได้แน่ชัดเป็นครั้งแรก (ก่อนหน้านี้เดาจากเดตาเซตที่โหลดมาได้แค่บางส่วน)

**ผลตรวจสอบ:** รันอัลกอริทึมจับคู่จริงกับเดตาเซตเต็มทั้ง 1,324 ท่า พบว่า **เดตาเซตมีท่าที่ตรงกับ Machine Shoulder Press อยู่จริง** — ชื่อ `"lever shoulder press"` (equipment: leverage machine, target: delts) ตรงเป๊ะ ปัญหาที่ผ่านมาไม่ใช่ว่าเดตาเซตไม่มี แต่เป็นเพราะอัลกอริทึมจับคู่แบบ fuzzy score ไปเลือกท่าอื่นที่คะแนนใกล้เคียงกันแทน (ทั้งที่ท่าที่ถูกต้องมีอยู่แล้ว) จึง **ปักหมุด (pin) ท่านี้ตรงๆ** ด้วย `exactNameMatch: "lever shoulder press"` แทนการพึ่งพา fuzzy score

**ตรวจสอบอีก 3 ท่าที่เคยสงสัยด้วย พบว่าทั้งหมดมีท่าที่ถูกต้องในเดตาเซตจริง:**
- `shoulders-band-lateral-raise` → `"band front lateral raise"` (band, delts)
- `shoulders-rear-delt-fly` → `"dumbbell rear fly"` (dumbbell, delts)
- `shoulders-cable-lateral-raise` → `"cable lateral raise"` (cable, delts, ตรงเป๊ะอยู่แล้ว)

ปักหมุดทั้ง 4 ท่านี้ด้วย `exactNameMatch` แทนการเดา — ยกเลิก `skip: true` ที่เคยตั้งไว้ก่อนหน้า

**ระหว่างตรวจสอบ พบเพิ่มอีก 2 ท่าที่จับคู่ได้ไม่ดีพอ แก้ให้ดีขึ้น:**
- `triceps-overhead-extension` — เดิมจับคู่ `"dumbbell decline triceps extension"` (ไม่ใช่ท่า overhead) → ปักหมุดใหม่เป็น `"dumbbell seated reverse grip one arm overhead tricep extension"` ซึ่งเป็นท่า overhead จริง
- `glutes-glute-bridge` — เดิมจับคู่ `"glute bridge march"` (ท่ายากกว่า มีการยกขาสลับ) → ปักหมุดใหม่เป็น `"low glute bridge on floor"` ซึ่งเป็นกลูทบริดจ์พื้นฐานตรงกว่า

**สำคัญที่สุด — พบว่ามี 10 ท่าที่เดตาเซตนี้ "ไม่มีท่าที่ตรงจริงๆ" เลย** (ค้นด้วยคำสำคัญหลายแบบในเดตาเซตเต็มแล้วไม่พบ) จึงปิดการจับคู่อัตโนมัติถาวร (`skip: true`) ให้ทั้ง 10 ท่านี้ เพื่อไม่ให้ระบบฝืนจับคู่กับท่าที่ผิดหลักการแล้วแสดงผลผิด — จะแสดงไอคอน SVG แทนเสมอ:
- `back-face-pull` — ค้นหา "face"+"pull" ในเดตาเซตไม่เจอเลย ท่าใกล้เคียงที่สุด (rear delt row) ดึงมาที่ระดับอกไม่ใช่ระดับหน้า ผิดจุดสำคัญของท่านี้
- `back-superman` — มีแค่ "superman push-up" (ท่าวิดพื้นคนละแบบ) ไม่มีท่านอนคว่ำยกแขนขาแบบ Superman Hold เลย
- `back-prone-ytw-raise` — ไม่มีท่า Y-T-W raise หรือใกล้เคียงเลย
- `legs-bodyweight-squat` — สควอทไม่มีอุปกรณ์ในเดตาเซตมีแต่แบบกระโดด/ขาเดียว/ผสมท่าอื่น ไม่มีสควอทพื้นฐานควบคุมจังหวะธรรมดา
- `shoulders-pike-pushup` — มีแค่แบบใช้ลูกบอลออกกำลังกายหรือผสมท่าอื่น ไม่มีไพค์พุชอัพพื้นฐานไม่มีอุปกรณ์
- `biceps-self-resistance-curl` — เทคนิคต้านแรงตัวเองไม่มีในเดตาเซตนี้เลย
- `glutes-cable-kickback` — ค้นคำว่า "kickback" ในเดตาเซตทั้งหมด เจอแต่ท่าทริเซป (หลังแขน) ไม่มีกลูทคิกแบ็กเลย
- `glutes-donkey-kick` — ค้นคำว่า "donkey" เจอแต่ท่ายกส้นเท้า (calf raise) ไม่มีท่ากลูทดองกี้คิกเลย
- `glutes-step-up` — ท่า step-up ในเดตาเซตต้องใช้ดัมเบล/บาร์เบล/ยางยืดทั้งหมด ไม่มีแบบไม่มีอุปกรณ์/ใช้แค่เก้าอี้
- `glutes-sumo-squat` — มีแค่แบบใช้ Smith machine ไม่มีซูโม่สควอทไม่มีอุปกรณ์

**สรุปด้วยตัวเลข:** จาก 62 ท่า — จับคู่อัตโนมัติได้ถูกต้อง 46 ท่า, ปักหมุดด้วยชื่อที่ตรวจสอบแล้ว 6 ท่า, ปิดการจับคู่ถาวรเพราะไม่มีท่าที่ตรงจริงในเดตาเซต 10 ท่า (แสดงไอคอนแทน)

**หมายเหตุ:** ยังไม่ได้ดาวน์โหลดรูปจริงมาดูอีกครั้ง (สคริปต์ต้องรันจากเครื่องผู้ใช้ที่มีอินเทอร์เน็ตปกติ) การยืนยันครั้งนี้อ้างอิงจากชื่อท่า+อุปกรณ์+กล้ามเนื้อเป้าหมายตรงกันทั้งหมดในเดตาเซตจริง ซึ่งเป็นหลักฐานที่หนักแน่นกว่าการเดาแบบเดิมมาก แนะนำให้รัน `npm run fetch-photos` อีกครั้งแล้วดูผลจริง

**ไฟล์ที่แก้ไขรอบนี้:** `scripts/fetch-exercise-photos.mjs` (ปักหมุด 6 ท่า, ปิดจับคู่ถาวร 10 ท่า, คอมเมนต์อธิบายเหตุผลทุกจุด)

## อัปเดต: สลับท่าที่ไม่มีในเดตาเซตเป็นท่าทดแทนจริง (6 ท่า) + คงท่าเดิมไว้อีก 4 ท่า

ผู้ใช้ถามว่าถ้าท่าไหนไม่มีในเดตาเซต เอาท่าอื่นมาแทนได้ไหม หรือใช้รูปจาก Google แทนได้ไหม — แนะนำว่ารูปจาก Google มีความเสี่ยงลิขสิทธิ์ไม่แนะนำ ส่วนการสลับท่านั้นทำได้และค้นหาท่าทดแทนจริงจากเดตาเซตเต็มให้ ผู้ใช้เลือก "สลับเป็นท่าทดแทนทั้งหมด"

**สลับท่า 6 ท่า (id เปลี่ยน เพราะเป็นท่าคนละท่าจริงๆ ไม่ใช่แค่เปลี่ยนรูป):**
- `back-face-pull` → `back-band-rear-delt-row` ("Band Standing Rear Delt Row" — อุปกรณ์เหมือนเดิม: ยางยืด)
- `back-prone-ytw-raise` → `back-band-reverse-fly` ("Band Reverse Fly" — อุปกรณ์เปลี่ยนจากไม่มีอุปกรณ์ → ยางยืด เพราะไม่มีท่า Y-T-W หรือใกล้เคียงแบบไม่ใช้อุปกรณ์ในเดตาเซตเลย)
- `legs-bodyweight-squat` → `legs-potty-squat-support` ("Potty Squat With Support" — อุปกรณ์เปลี่ยนจากไม่มีอุปกรณ์ → "prop" คือจับเก้าอี้/กำแพงพยุงตัว ยังอยู่ในเงื่อนไข "บ้านไม่มีอุปกรณ์" ได้ปกติ)
- `biceps-self-resistance-curl` → `biceps-side-lying-curl` ("Bodyweight Side-Lying Biceps Curl" — อุปกรณ์เหมือนเดิม: ไม่มีอุปกรณ์ เป็นท่าจริงในเดตาเซตแทนเทคนิคที่คิดขึ้นเอง)
- `glutes-cable-kickback` → `glutes-cable-hip-extension` ("Cable Standing Hip Extension" — อุปกรณ์เหมือนเดิม: เคเบิล แทบเป็นท่าเดียวกัน)
- `glutes-sumo-squat` → `glutes-curtsy-squat` ("Curtsy Squat" — อุปกรณ์เหมือนเดิม: ไม่มีอุปกรณ์ แต่ต้องไขว้ขาแทนยืนกว้าง ปรับ skillLevel เป็น intermediate เพราะต้องใช้บาลานซ์มากกว่า)

**คงท่าเดิมไว้ 4 ท่า (ไม่มีท่าทดแทนที่เหมาะสมจริงๆ ในเดตาเซต — ไม่มีรูป แสดงไอคอนแทน):**
- `back-superman` — ตอนแรกคิดจะสลับเป็น "Hyperextension" แต่ตรวจ instructions ในเดตาเซตแล้วพบว่าท่านี้ต้องใช้ม้านั่งไฮเปอร์เอ็กซ์เทนชันเฉพาะทาง (ทั้งที่ dataset ติด equipment tag "body weight" ผิดๆ) ถ้าสลับไปจะขัดกับสัญญา "ไม่มีอุปกรณ์เลย" ของท่านี้ จึงไม่สลับ — **นี่คือจุดที่ตรวจสอบละเอียดแล้วพบว่าตัวเองเกือบตัดสินใจผิด แก้ก่อนใช้งานจริง**
- `shoulders-pike-pushup` — มีแค่แบบใช้ลูกบอลออกกำลังกายหรือท่าผสม ไม่มีแบบพื้นฐานไม่มีอุปกรณ์
- `glutes-donkey-kick` — ค้นด้วยคำว่า "donkey" เจอแต่ท่ายกส้นเท้า ไม่มีท่ากลูทดองกี้คิกเลย
- `glutes-step-up` — ทุกท่า step-up ในเดตาเซตต้องใช้อุปกรณ์ (ดัมเบล/บาร์เบล/ยางยืด) ไม่มีแบบไม่มีอุปกรณ์

**ทดสอบหลังแก้:** rebuild + รัน combination test ครบ 576 แบบอีกครั้ง — ผ่านหมด (0 ปัญหา, 0 วันท่าน้อยเกินไป, 0 push/pull violation, มือใหม่ยังได้ท่า advanced 0% เหมือนเดิม) ตรวจ pool ของ back/legs/biceps/glutes ที่ "บ้านไม่มีอุปกรณ์" เป็นพิเศษหลังเปลี่ยน equipment ของบางท่า (Prone Y-T-W→band, Bodyweight Squat→prop) ยืนยันว่ายังมีท่าให้เลือกเพียงพอทุก body part ไม่มีวันไหนขาดท่า

**ไฟล์ที่แก้ไขรอบนี้:** `lib/exercises.ts` (6 ท่าใหม่แทนที่ 6 ท่าเดิม), `scripts/fetch-exercise-photos.mjs` (ปรับ MATCH_TARGETS ให้ตรงกับ id ใหม่ + ปักหมุดด้วย exactNameMatch ทั้ง 6), ลบไฟล์ GIF เก่าที่ผูกกับ id เดิม 6 ไฟล์

## Machine Shoulder Press — แก้ครั้งที่ 3 (2026-07-14)

ท่า `shoulders-machine-press` ผิดติดต่อกัน 3 ครั้ง แม้จะปักหมุดด้วย `exactNameMatch` แล้วในรอบก่อนหน้า:

1. **ครั้งที่ 1** (ก่อนมี equipment scoring): จับคู่ผิดเป็นท่ายางยืด
2. **ครั้งที่ 2** (หลังเพิ่ม equipment scoring): จับคู่ผิดเป็น Landmine Squat/Press
3. **ครั้งที่ 3** (ปักหมุด `exactNameMatch: "lever shoulder press"` id 0603 ซึ่งตรวจสอบแล้วว่าถูกต้องกับข้อมูล snapshot ในเครื่อง — equipment "leverage machine", target "delts"): ผู้ใช้รันสคริปต์จริงแล้วได้รูป **เดิม** (Landmine Squat/Press, ไฟล์ขนาด byte เท่ากันเป๊ะ 81,313 bytes) — ตรวจแล้วว่าไม่ใช่ปัญหาสคริปต์เก่าค้าง (timestamp ของ GIF ใหม่กว่าสคริปต์) และไม่ใช่ปัญหาข้อมูล snapshot เลื่อนแถว (เช็ค entry รอบข้าง id 0600-0607 เรียงลำดับสมเหตุสมผลทั้งหมด)

**สรุป:** เป็นไปได้สูงว่า entry id 0603 ("lever shoulder press") ในเดตาเซตต้นทาง มี `gif_url` ผิดตัว (data quality bug ของเดตาเซตเอง) ไม่ใช่ปัญหาจาก logic การจับคู่ของเรา เพราะ `exactNameMatch` ที่ปักหมุดแล้วจะดาวน์โหลดตาม `gif_url` ของ entry นั้นเสมอ ถ้า entry นั้นมีลิงก์ผิด ต่อให้ปักหมุดถูก 100% ก็ยังได้รูปผิด

**ทางแก้ (ตามที่ผู้ใช้อนุญาตให้ใช้ท่าอื่นแทนถ้าไม่มีท่าที่ตรง):** เปลี่ยนไปปักหมุด entry คนละตัวแทน — `exactNameMatch: "smith seated shoulder press"` (id 0765, equipment "smith machine" — ยังจัดอยู่ในกลุ่ม "machine" ของเราได้, target "delts") ตรวจสอบข้อความ instructions ของ entry นี้แล้วอ่านสอดคล้องกับท่า seated shoulder press บนเครื่อง Smith จริง ไม่ใช่ท่าอื่นที่ติดป้ายผิด

**ข้อจำกัดที่ต้องแจ้งผู้ใช้:** sandbox นี้ไม่มีสิทธิ์เข้าถึงเครือข่ายแบบ raw (curl/web_fetch ไปยัง raw.githubusercontent.com ถูกบล็อก) จึงไม่สามารถดาวน์โหลดไฟล์ GIF จริงมาเช็คภาพล่วงหน้าได้ก่อนที่ผู้ใช้จะรันสคริปต์เอง — ยืนยันได้แค่ระดับข้อมูล (name/equipment/target/instructions text) ไม่ใช่ระดับภาพจริง ถ้ารูปยังผิดอีกหลังรันรอบนี้ แนะนำให้เปลี่ยนไปตัดขาดจากเดตาเซตนี้ทั้งหมดสำหรับท่านี้ (`skip: true` ให้ตกไปใช้ไอคอน SVG แทน) แทนที่จะไล่ปักหมุด entry อื่นต่อไปเรื่อยๆ

**ไฟล์ที่แก้ไขรอบนี้:** `scripts/fetch-exercise-photos.mjs` (เปลี่ยน `exactNameMatch` ของ `shoulders-machine-press` เป็น id 0765), ลบไฟล์ `public/exercises/shoulders-machine-press.gif` เก่าที่ผิด (ให้ตกกลับไปใช้ไอคอน SVG จนกว่าจะรัน `npm run fetch-photos` ใหม่)
## เพิ่มวิธีทำละเอียดแบบขั้นตอน (stepsTh) — 2026-07-14

ผู้ใช้ถามว่าเดตาเซตมี instructions อยู่ไหม อยากได้แปลไทยใส่เพิ่ม ตรวจสอบแล้วพบว่า
`_reference-dataset.json` แต่ละ entry มีฟิลด์ `instruction_steps.en` (ขั้นตอนละเอียดแบบ
array ของประโยค ไม่ใช่แค่ paragraph เดียว) ซึ่งสคริปต์ matching เดิมไม่เคยดึงมาใช้เลย —
ดึงมาแค่ชื่อกับ gif_url เท่านั้น

**สิ่งที่ทำ:**
1. เขียน dry-run script จำลอง logic การจับคู่ตัวจริงใน `fetch-exercise-photos.mjs`
   (exactNameMatch / skip / fuzzy scoring) รันกับ `_reference-dataset.json` ในเครื่อง
   เพื่อดึง `instruction_steps.en` ของ entry ที่แต่ละท่าจับคู่ได้จริง — รับประกันว่า
   ขั้นตอนที่แปลจะตรงกับท่าที่ปรากฏในรูป/GIF จริง ไม่ใช่ตรงแค่ชื่อ
   ผลลัพธ์: จับคู่ได้ 58/62 ท่า (อีก 4 ท่าที่ `skip: true` ไม่มีข้อมูลจากเดตาเซต)
2. แปลขั้นตอนภาษาอังกฤษเป็นไทยเอง ทั้ง 58 ท่า โทนเดียวกับ `cue` ที่มีอยู่เดิม
3. เขียนขั้นตอนเองให้ครบสำหรับ 4 ท่าที่ไม่มีข้อมูลจากเดตาเซต
   (`back-superman`, `shoulders-pike-pushup`, `glutes-donkey-kick`, `glutes-step-up`)
   ตามที่ผู้ใช้เลือกไว้ตอนถูกถาม แทนที่จะปล่อยว่าง — รวมเป็นครบ 62/62 ท่า
4. เพิ่ม field `stepsTh?: string[]` ใน `Exercise` interface (`lib/types.ts`)
   และใส่ข้อมูลจริงในทุก exercise entry ของ `lib/exercises.ts`
5. เพิ่มส่วนขยาย "วิธีทำละเอียด" ใน `components/ExerciseCard.tsx` โดยใช้
   `<details>/<summary>` มาตรฐานของ HTML (ไม่ต้องใช้ state ฝั่ง client) แสดงเป็น
   ordered list ต่อท้าย cue/ทางเลือกไม่มีเครื่องเดิม ตามที่ผู้ใช้เลือก
   ("เพิ่มเป็นส่วนขยายใหม่" แทนที่จะแทน cue เดิม)

**ปัญหาสภาพแวดล้อมระหว่างทำงานรอบนี้:** พบว่า `node_modules` ในโฟลเดอร์ outputs
(scratchpad) กลายเป็น read-only/corrupt กลางคัน (ทุกความพยายาม `npm install` ใหม่ล้ม
ด้วย ENOTEMPTY/EPERM ซ้ำๆ ในไดเรกทอรีที่ต่างกันหลายรอบ) — วินิจฉัยว่าเป็นปัญหาระดับ
sandbox ของ session นี้ ไม่เกี่ยวกับโค้ดที่แก้ไข แก้ปัญหาโดยข้ามการติดตั้งใหม่ แล้วใช้
`node_modules` ที่ทำงานได้ปกติอยู่แล้วใน `myfitnesshome/node_modules` (ติดตั้งไว้จาก
รอบทำงานก่อนหน้าใน session เดียวกัน) รันตรวจสอบแทน:
- `tsc --noEmit` ทั้งโปรเจกต์ — **ผ่าน 0 error** (ยืนยันว่า field ใหม่และ JSX ใหม่ไม่มี
  ปัญหา type)
- `next build` เต็มรูปแบบติดปัญหาที่ไม่เกี่ยวกับโค้ด: ไม่มี native SWC binary สำหรับ
  Linux ใน node_modules ชุดนี้ (มีแต่ตัว Windows) และ sandbox ไม่มีสิทธิ์เข้าถึง
  registry.npmjs.org เพื่อดาวน์โหลดเพิ่ม — เป็นข้อจำกัดของสภาพแวดล้อมเดียวกับปัญหา
  Google Fonts ที่เคยเจอมาก่อน ไม่ใช่ปัญหาของโค้ด
- ทดสอบ runtime จริงแทน: คัดลอก `generator.ts`/`exercises.ts`/`types.ts` ไปรันด้วย
  Node's native TypeScript stripping (`--experimental-strip-types` + custom loader
  แก้ปัญหา extension resolution) วนทดสอบครบ 576 คอมโบ (goal × experience × days ×
  location × gender) — **ผ่านหมด 0 ปัญหา**, exercise slot ทั้ง 14,232 มี `stepsTh`
  ครบ, สัดส่วนท่า advanced ที่หลุดไปให้มือใหม่ยังคงเป็น 0% เหมือนเดิม (generator.ts
  ไม่ได้ถูกแก้ในรอบนี้เลย)

**ไฟล์ที่แก้ไขรอบนี้:** `lib/types.ts` (เพิ่ม field `stepsTh`), `lib/exercises.ts`
(ใส่ `stepsTh` ให้ครบ 62 ท่า), `components/ExerciseCard.tsx` (เพิ่ม `<details>`
"วิธีทำละเอียด")
## รีดีไซน์ UI ให้ทันสมัยขึ้น — 2026-07-14

ผู้ใช้บอกว่า UI เดิมดูไม่ทันสมัย ขอให้ทำการรีดีไซน์ ใช้ design-critique skill ประกอบการ
วิเคราะห์ปัญหาของดีไซน์เดิม (ก่อนแก้ไข อ่านโค้ดทุกไฟล์ที่เกี่ยวกับ UI ทั้งหมด):

**ปัญหาที่พบในดีไซน์เดิม:** พาเลตสีเรียบเกินไป (sage เขียวอ่อน + ครีมล้วน ไม่มีมิติ),
ไม่มี shadow/ความลึกเลย (การ์ดทุกใบใช้ border บางๆ เหมือนกันหมด), ปุ่ม/ป้าย badge จืด
ไม่มีจุดโฟกัส, ฟอร์มเลือกเงื่อนไข 5 ขั้นตอนไม่มี progress indicator, radio state ใช้แค่
จุดวงกลมเปล่าๆ ไม่มี micro-interaction, และพบ copy ผิดเล็กน้อย ("เลือก 4 หมวดหมู่" ทั้งที่
มี 5 หมวดหมู่จริง ตกหล่นตอนเพิ่มฟิลเตอร์เพศ)

**สิ่งที่แก้:**
1. `tailwind.config.ts` — เพิ่มเฉด sage เต็มสเกล (50-900), เพิ่มสี amber/coral เสริม,
   เพิ่ม radius `xl3` (1.75rem) สำหรับ surface หลัก, เพิ่ม custom shadow 3 แบบ
   (`soft`/`lifted`/`glow`), เพิ่ม gradient (`sage-gradient`, `hero-mesh`), เพิ่ม
   fade-in-up animation
2. `app/globals.css` — เพิ่มพื้นหลัง radial-gradient mesh บาง ๆ ให้ตัวหน้าเว็บมีมิติแทน
   สีขาวล้วน, เพิ่ม `.glass` utility (backdrop-blur) สำหรับ sticky bar
3. `app/page.tsx` — หัวข้อใหญ่ขึ้น มี gradient text บนคำว่า "เล่นเวท", เพิ่มแถบ highlight
   3 จุดเด่นของแอป, แก้ copy "4 หมวดหมู่" → "5 หมวดหมู่" ให้ตรงกับจำนวนจริง
4. `components/FilterForm.tsx` — เพิ่ม sticky progress bar (X/5) ด้านบน, การ์ดตัวเลือก
   ยกตัวเมื่อ hover พร้อมเงา, สถานะเลือกแล้วมี badge ✓ วงกลม gradient แทนจุดว่างๆ,
   ปุ่ม "สร้างโปรแกรม" เป็น gradient พร้อม glow shadow
5. `components/ProgramPageClient.tsx` — หัวข้อใหญ่ขึ้น, ป้าย chip เงื่อนไข 5 อันสลับสี
   (sage/amber/coral/เทา) แทนสีเทาเดียวหมด, การ์ดหมายเหตุมีไอคอนหัวข้อ
6. `components/ProgramDayView.tsx` — แท็บเลือกวันเป็น pill แบบ gradient เมื่อ active
   พร้อมเงา, เนื้อหาแต่ละวัน fade-in เมื่อสลับแท็บ
7. `components/ExerciseCard.tsx` — การ์ดมีเงานุ่ม (shadow-soft) ยกเงาเมื่อ hover, รูป
   ท่าออกกำลังกายมี ring บาง ๆ, ส่วนขยาย "วิธีทำละเอียด" เปลี่ยนจากลูกศร default ของ
   `<details>` เป็นไอคอน chevron หมุนเมื่อเปิด

**หลักการออกแบบ:** คงอัตลักษณ์สีเขียว sage เดิมไว้ (ไม่เปลี่ยนแบรนด์） แต่เพิ่มความลึก
(shadow/gradient), เพิ่มจังหวะ micro-interaction (hover lift, transition, ✓ badge),
และเพิ่ม progress indicator ที่ขาดหายไป — ไม่แตะ logic การสร้างโปรแกรม (`lib/generator.ts`,
`lib/exercises.ts`) เลยในรอบนี้ เป็นการเปลี่ยนเฉพาะชั้นการแสดงผล

**ทดสอบ:** `tsc --noEmit` ทั้งโปรเจกต์ผ่าน 0 error, ตรวจสอบ JSX tag/brace ทุกไฟล์ที่แก้
สมดุลครบ, `next build` ยังติดปัญหาเดิม (ไม่มี native SWC binary สำหรับ Linux ใน
sandbox + ไม่มีสิทธิ์เข้าเน็ตดาวน์โหลดเพิ่ม) ซึ่งเป็นข้อจำกัดของ sandbox ไม่เกี่ยวกับโค้ด
เหมือนที่เคยพบมาก่อน — ไม่ได้แตะ `lib/generator.ts` หรือ `lib/exercises.ts` ในรอบนี้เลย
จึงไม่จำเป็นต้องรัน 576-combo regression test ซ้ำ (ผลลัพธ์โปรแกรมยังเหมือนเดิมทุกประการ
เปลี่ยนแค่หน้าตา)

**ไฟล์ที่แก้ไขรอบนี้:** `tailwind.config.ts`, `app/globals.css`, `app/page.tsx`,
`components/FilterForm.tsx`, `components/ProgramPageClient.tsx`,
`components/ProgramDayView.tsx`, `components/ExerciseCard.tsx`
## ปรับ UI ให้เหมาะกับมือถือ (mobile-first tightening) — 2026-07-14

ผู้ใช้บอกว่ารีดีไซน์รอบก่อนสวยขึ้นแต่บนมือถือดูใหญ่/เทอะทะเกินไป มองเห็นเนื้อหาได้น้อย
ขอให้ปรับตาม UX/UI ที่เหมาะสม และลองใช้ไอคอนแทนข้อความในจุดที่ทำได้

**สาเหตุ:** รอบก่อนออกแบบโดยใช้ base size (ไม่มี breakpoint) ค่อนข้างใหญ่แล้วค่อยลดขนาด
ลงเฉพาะจุดผ่าน `sm:` — พอกลับด้านมาดูจริงบนมือถือ (ขนาดที่ไม่มี prefix คือ mobile
default ใน Tailwind) พบว่า heading/padding/รูปภาพ/แท็บวัน ยังใหญ่แบบ desktop-first อยู่

**สิ่งที่แก้ (mobile-first: ลดขนาด default แล้วค่อยขยายที่ `sm:` ขึ้นไป):**
1. `app/page.tsx` — หัวข้อ hero เล็กลงบนมือถือ (text-3xl แทน 4xl), การ์ด/badge/
   highlight chip เล็กลง, ระยะห่างแนวตั้งกระชับขึ้น
2. `components/FilterForm.tsx` — progress bar บางลง, การ์ดตัวเลือกลด padding และ
   ลดฟอนต์ (text-sm บนมือถือแทน text-lg), เลขขั้นตอน/เช็คมาร์กเล็กลง, มุมโค้งใช้
   `rounded-xl2` บนมือถือ (แทน `xl3` ที่ใหญ่เกินสัดส่วนการ์ดเล็ก), ปุ่ม "สร้างโปรแกรม"
   กระชับขึ้น
3. `components/ProgramPageClient.tsx` — หัวข้อ/ป้าย chip เงื่อนไข/การ์ดหมายเหตุ เล็กลง
   ทั้งชุดบนมือถือ
4. `components/ProgramDayView.tsx` — แท็บเลือกวันแคบลง (min-width 6.5rem แทน 9.5rem
   บนมือถือ) ลดการกินพื้นที่แนวนอน
5. `components/ExerciseCard.tsx` — จุดที่ใหญ่ที่สุดในรอบก่อน:
   - รูปท่าออกกำลังกายเล็กลงจาก 96px เหลือ 56px บนมือถือ
   - **เพิ่มไอคอนแทนข้อความยาว**: ป้าย "เซต x ครั้ง" มีไอคอนดัมเบลเล็กๆ กำกับ,
     "พักระหว่างเซต" ย่อเหลือ "พัก" พร้อมไอคอนนาฬิกา (วาดเป็น inline SVG เส้นบาง
     สไตล์เดียวกับไอคอน body part เดิมใน `Icon.tsx`)
   - ป้ายท่าหลัก/ท่าเสริม ตัดบรรทัดคำอธิบายรอง (โฟกัสฟอร์มและแรง/โฟกัสสร้างกล้าม)
     ออกบนมือถือ เหลือแค่ป้ายสั้นๆ (`hidden sm:block` สำหรับบรรทัดรอง)
   - ชื่อท่าใช้ `truncate` ป้องกันข้อความยาวดันเลย์เอาต์

**ทดสอบ:** `tsc --noEmit` ผ่าน 0 error ทั้งโปรเจกต์, ตรวจสอบ brace/paren สมดุลทุกไฟล์ที่แก้
ไม่ได้แตะ logic การสร้างโปรแกรมเลยในรอบนี้เช่นกัน (เปลี่ยนแค่ responsive sizing +
เพิ่มไอคอน 2 ตัว)

**ไฟล์ที่แก้ไขรอบนี้:** `app/page.tsx`, `components/FilterForm.tsx`,
`components/ProgramPageClient.tsx`, `components/ProgramDayView.tsx`,
`components/ExerciseCard.tsx`
## แก้ตามฟีดแบ็ก: รูป GIF เล็กไป + เมนูเลือกวันซ้ำซ้อน — 2026-07-14

ผู้ใช้ทดลองใช้บนมือถือแล้วให้ฟีดแบ็ก 2 จุด:
1. รูป GIF ท่าออกกำลังกายที่เพิ่งลดขนาดไปในรอบก่อน จริงๆ อยากให้ใหญ่แบบเดิมบนมือถือด้วย
   (ใหญ่ = ดูท่าง่ายกว่า ไม่ใช่ปัญหา)
2. เมนูแท็บเลือกวัน (วันจันทร์/อังคาร/พุธ...) ใหญ่เทอะทะ แถมข้อมูลซ้ำกับตอนเลือกดูวันนั้น
   (หัวข้อ + กลุ่มกล้ามเนื้อที่โฟกัส ถูกแสดงซ้ำสองที่: ในแท็บ และในหัวข้อ panel ด้านล่าง
   หลังเลือก)

**แก้:**
1. `components/ExerciseCard.tsx` — คืนขนาดรูปกลับเป็น 96px (h-24 w-24) คงที่ทุกขนาดจอ
   ไม่ลดบนมือถืออีกต่อไป
2. `components/ProgramDayView.tsx` — ออกแบบแท็บเลือกวันใหม่เป็น pill เล็กบรรทัดเดียว
   (rounded-full) ตัดบรรทัดกลุ่มกล้ามเนื้อ (focusTh) ออกจากแท็บทั้งหมด เพราะซ้ำกับ
   หัวข้อ panel ด้านล่างที่แสดงอยู่แล้วเมื่อเลือกวันนั้น เหลือแค่ชื่อวัน (เช่น
   "วันจันทร์ · Push") พร้อมไอคอนกลุ่มกล้ามเนื้อหลักของวันนั้น (ดึงจาก
   `exercises[0].icon` ของวันนั้น ใช้ `Icon` component เดิมที่มีอยู่แล้ว ไม่ต้องเพิ่ม field
   ใหม่ใน type) ทำให้แท็บกระชับขึ้นมากและไม่มีข้อมูลซ้ำอีก

**ทดสอบ:** `tsc --noEmit` ผ่าน 0 error, ตรวจ brace/paren สมดุลทั้งสองไฟล์ ไม่ได้แตะ
`lib/generator.ts`/`lib/types.ts` เลย (ใช้ field ที่มีอยู่แล้ว)

**ไฟล์ที่แก้ไขรอบนี้:** `components/ExerciseCard.tsx`, `components/ProgramDayView.tsx`
## เตรียม deploy ขึ้น GitHub Pages — 2026-07-14

ผู้ใช้บอกว่ามี `.github/workflows/nextjs.yml` (workflow เริ่มต้นของ GitHub สำหรับ
Next.js + Pages) อยู่แล้ว ถามว่าต้องทำอะไรต่อ ตรวจสอบพบว่า repo ยังไม่พร้อม deploy จริง
ด้วยเหตุผลหลายจุด:

**ปัญหาที่พบและแก้:**
1. **`.git/index` เสียหาย 2 รอบ** ("bad index file sha1 signature" และ "unknown index
   entry format") — เป็นปัญหาจาก sandbox mount sync (เหมือนบัคที่เจอกับไฟล์ source
   หลายรอบก่อนหน้าในเซสชันนี้) ไม่ใช่ความเสียหายจริงของ git history (ยืนยันด้วย
   `git log --all` ที่ยังอ่านได้ปกติ และ object ที่ index อ้างถึงยังอยู่ครบใน
   `.git/objects`) แก้ด้วยวิธีมาตรฐานปลอดภัย: ลบ `.git/index` แล้ว `git reset`
   สร้าง index ใหม่จาก HEAD — ไม่กระทบ commit history หรือไฟล์ใน working tree เลย
2. **`next.config.mjs` ไม่มี static export config** — ถ้าไม่แก้ `next build` จะไม่สร้าง
   โฟลเดอร์ `./out` เลย (workflow ที่มีอยู่คาดหวัง `./out` อยู่แล้ว) ทำให้ CI build ล้มเหลว
   ทันที เพิ่ม `output: "export"`, `basePath`/`assetPrefix` ที่ตรวจจับอัตโนมัติจาก
   `GITHUB_REPOSITORY` เมื่อรันใน GitHub Actions (ว่างเปล่าตอนรัน local ไม่กระทบ dev),
   `images.unoptimized`, `trailingSlash` ตามแนวทางที่ Next.js เอกสารแนะนำสำหรับ
   GitHub Pages
3. **`components/ExercisePhoto.tsx` ใช้ `<img src="/exercises/...">` แบบ hardcode** —
   ต่างจาก `<Link>`/`next/image` ที่ inject basePath ให้อัตโนมัติ แท็ก `<img>` ธรรมดา
   ไม่ได้ ถ้าไม่แก้ รูป GIF ทุกท่าจะ 404 ทันทีที่ deploy ขึ้น subpath
   (`username.github.io/repo-name`) เพิ่มการต่อ `NEXT_PUBLIC_BASE_PATH`
   (ส่งผ่านจาก next.config.mjs) เข้าไปหน้า path
4. **`.gitignore` เพี้ยนจากบัค sync เดิม** — บรรทัด `/public/exercises/*.gif` หายไป
   ระหว่างเซสชัน ถามผู้ใช้ว่าจะจัดการรูป GIF บน GitHub Pages ยังไง (ให้ CI ดาวน์โหลดตอน
   build / commit เข้า git เลย / ไม่เอารูปเลย) — **ผู้ใช้เลือก commit รูปเข้า git ไปเลย**
   จึงลบเงื่อนไข ignore gif ออก เขียนคอมเมนต์ใหม่อธิบายเหตุผลและอ้างอิงลิขสิทธิ์เดตาเซต
   (การศึกษา/ไม่ใช้เชิงพาณิชย์ — โปรเจกต์นี้เป็นโปรเจกต์ส่วนตัวไม่แสวงกำไร)
5. **พบไฟล์ GIF เก่าค้างอยู่ 4 ไฟล์** ของท่าที่มีการตัดสินใจ (บันทึกไว้ในหัวข้อก่อนหน้า)
   ว่า `skip: true` เพราะไม่มี match ที่ดีในเดตาเซต (back-superman, shoulders-pike-pushup,
   glutes-donkey-kick, glutes-step-up) — ไฟล์เก่าเหล่านี้ยังอยู่ใน `public/exercises/`
   จากการจับคู่รอบก่อนๆ ที่ยังไม่ได้ลบทิ้ง ถ้า deploy ไปแบบนี้จะโชว์รูปผิด/ไม่เกี่ยวข้องแทน
   ไอคอน SVG ที่ตั้งใจไว้ ลบทั้ง 4 ไฟล์ออกให้ตรงกับพฤติกรรมที่ตั้งใจจริง

**สิ่งที่ commit ไปแล้ว (local commit `74b4eb9`, ยังไม่ push):**
`.gitignore`, `next.config.mjs`, `components/ExercisePhoto.tsx`, ลบ GIF ค้าง 4 ไฟล์,
อัปเดต GIF ที่เคย re-match/re-pin ไว้ 5 ไฟล์ให้ตรงกับเวอร์ชันปัจจุบันใน working tree

**สิ่งที่ผู้ใช้ต้องทำเองต่อ (ต้องใช้สิทธิ์เข้าถึง GitHub ของผู้ใช้เอง ไม่สามารถทำแทนได้):**
1. `git push origin main` (หรือ push ผ่าน GUI/IDE ที่ใช้อยู่)
2. ไปที่ repo settings บน GitHub → Pages → เลือก Source เป็น "GitHub Actions"
   (ถ้ายังไม่เคยตั้งมาก่อน)
3. workflow จะรันอัตโนมัติหลัง push (หรือกด "Run workflow" เองใน tab Actions)
   เว็บจะ deploy ไปที่ `https://sundevcat.github.io/fitnessHome/`

**ทดสอบ:** `tsc --noEmit` ผ่าน 0 error, จำลอง env `GITHUB_ACTIONS=true` +
`GITHUB_REPOSITORY=SundevCat/fitnessHome` แล้ว import next.config.mjs ตรวจว่า
`basePath`/`assetPrefix` คำนวณถูกต้อง (`/fitnessHome`), และตรวจ env ปกติ (local) ให้
basePath ว่างเปล่าไม่กระทบ dev — `next build` จริงยังติด native SWC binary ของ sandbox
เหมือนเดิม (ข้อจำกัด sandbox ไม่เกี่ยวกับโค้ด) แต่ GitHub Actions runner จริงมี binary
ครบและมีอินเทอร์เน็ตเข้าถึง Google Fonts/registry.npmjs.org ปกติ ไม่ควรเจอปัญหานี้

**ไฟล์ที่แก้ไขรอบนี้:** `.gitignore`, `next.config.mjs`, `components/ExercisePhoto.tsx`,
ลบ `public/exercises/{back-superman,shoulders-pike-pushup,glutes-donkey-kick,glutes-step-up}.gif`
