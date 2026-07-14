"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DaysPerWeek,
  Experience,
  FilterSelection,
  Gender,
  Goal,
  Location,
} from "@/lib/types";

interface OptionDef<T extends string | number> {
  value: T;
  labelTh: string;
  labelEn: string;
  descTh: string;
}

const GOAL_OPTIONS: OptionDef<Goal>[] = [
  { value: "strength", labelTh: "เพิ่มความแข็งแรง", labelEn: "Strength", descTh: "เน้นน้ำหนักมาก เซตสั้น พักยาว" },
  { value: "muscle", labelTh: "เพิ่มกล้ามเนื้อ", labelEn: "Muscle Gain", descTh: "เน้นสร้างมวลกล้ามเนื้อ (Hypertrophy)" },
  { value: "fatloss", labelTh: "ลดไขมัน", labelEn: "Fat Loss", descTh: "เซตเยอะ พักสั้น เผาผลาญสูง" },
  { value: "general", labelTh: "สุขภาพทั่วไป", labelEn: "General Fitness", descTh: "สมดุล เหมาะกับทุกวัน" },
];

const EXPERIENCE_OPTIONS: OptionDef<Experience>[] = [
  { value: "beginner", labelTh: "มือใหม่", labelEn: "Beginner", descTh: "0-6 เดือนแรกของการเล่นเวท" },
  { value: "intermediate", labelTh: "ระดับกลาง", labelEn: "Intermediate", descTh: "6 เดือน - 2 ปี" },
  { value: "advanced", labelTh: "ระดับสูง", labelEn: "Advanced", descTh: "2 ปีขึ้นไป คุ้นเคยกับท่าหลัก" },
];

const DAYS_OPTIONS: OptionDef<DaysPerWeek>[] = [
  { value: 3, labelTh: "3 วัน/สัปดาห์", labelEn: "3 Days", descTh: "Full Body A / B / C" },
  { value: 4, labelTh: "4 วัน/สัปดาห์", labelEn: "4 Days", descTh: "Upper / Lower สลับ 2 รอบ" },
  { value: 5, labelTh: "5 วัน/สัปดาห์", labelEn: "5 Days", descTh: "Push / Pull / Legs / Upper / Lower" },
  { value: 6, labelTh: "6 วัน/สัปดาห์", labelEn: "6 Days", descTh: "Push / Pull / Legs x2" },
];

const LOCATION_OPTIONS: OptionDef<Location>[] = [
  { value: "gym", labelTh: "ยิม/ฟิตเนส", labelEn: "Gym", descTh: "มีเครื่องครบ บาร์เบล เคเบิล" },
  { value: "home_dumbbell", labelTh: "บ้านมีดัมเบล", labelEn: "Home + Dumbbell", descTh: "ดัมเบลและม้านั่ง (ถ้ามี) เท่านั้น" },
  { value: "home_bodyweight", labelTh: "บ้านไม่มีอุปกรณ์", labelEn: "Bodyweight Only", descTh: "ใช้น้ำหนักตัวล้วนๆ ไม่มีเครื่องเลย" },
  { value: "outdoor", labelTh: "กลางแจ้ง", labelEn: "Outdoor", descTh: "สวนสาธารณะ มีบาร์/ม้านั่ง" },
];

const GENDER_OPTIONS: OptionDef<Gender>[] = [
  { value: "female", labelTh: "หญิง", labelEn: "Female", descTh: "เน้นน้ำหนักท่าสะโพก/แกนกลางเพิ่มขึ้นเล็กน้อย" },
  { value: "male", labelTh: "ชาย", labelEn: "Male", descTh: "เน้นน้ำหนักท่าอก/หลัง/แขนเพิ่มขึ้นเล็กน้อย" },
  { value: "unspecified", labelTh: "ไม่ระบุ", labelEn: "Prefer not to say", descTh: "ใช้สัดส่วนท่ามาตรฐาน ไม่เน้นกลุ่มใดเป็นพิเศษ" },
];

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 mb-6 sm:mb-8 px-4 sm:px-6 py-2 sm:py-3 bg-paper/85 glass border-b border-line">
      <div className="mx-auto max-w-5xl flex items-center gap-2.5 sm:gap-3">
        <div className="flex-1 h-1 sm:h-1.5 rounded-full bg-surface2 overflow-hidden">
          <div
            className="h-full rounded-full bg-sage-gradient transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-inkSoft font-heading flex-shrink-0 tabular-nums">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}

function OptionCard<T extends string | number>({
  option,
  selected,
  onSelect,
}: {
  option: OptionDef<T>;
  selected: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(option.value)}
      className={[
        "group relative text-left rounded-xl2 sm:rounded-xl3 border p-3 sm:p-5 transition-all duration-200 w-full h-full",
        "flex flex-col gap-1 sm:gap-1.5",
        selected
          ? "border-sage-500 bg-sage-50 shadow-glow"
          : "border-line bg-surface shadow-soft hover:-translate-y-0.5 hover:shadow-lifted hover:border-sage-300",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute top-2.5 right-2.5 sm:top-3 sm:right-3 h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0",
          selected
            ? "bg-sage-gradient scale-100 opacity-100"
            : "border border-line bg-paper scale-90 opacity-60 group-hover:opacity-100 group-hover:border-sage-300",
        ].join(" ")}
      >
        {selected && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-paper" fill="none">
            <path
              d="M2.5 6.2 5 8.7l4.5-5.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="font-heading font-semibold text-ink text-sm sm:text-lg pr-6 leading-snug">
        {option.labelTh}
      </span>
      <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-amber-600 font-semibold">
        {option.labelEn}
      </span>
      <span className="text-xs sm:text-sm text-inkSoft leading-snug">{option.descTh}</span>
    </button>
  );
}

function Section<T extends string | number>({
  step,
  title,
  subtitle,
  options,
  value,
  onSelect,
  columns,
}: {
  step: number;
  title: string;
  subtitle: string;
  options: OptionDef<T>[];
  value: T | null;
  onSelect: (value: T) => void;
  columns: string;
}) {
  return (
    <section aria-labelledby={`section-${step}`} className="space-y-2.5 sm:space-y-3 scroll-mt-16 sm:scroll-mt-24">
      <div className="flex items-baseline gap-2 sm:gap-3">
        <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-sage-gradient text-paper text-[11px] sm:text-xs font-bold font-heading flex-shrink-0 shadow-glow">
          {step}
        </span>
        <h2 id={`section-${step}`} className="font-heading font-semibold text-base sm:text-xl text-ink tracking-tight">
          {title}
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-inkSoft pl-8 sm:pl-10">{subtitle}</p>
      <div role="radiogroup" aria-labelledby={`section-${step}`} className={`grid ${columns} gap-2 sm:gap-3 sm:pl-10`}>
        {options.map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            selected={value === option.value}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default function FilterForm() {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);

  const completedCount = useMemo(
    () => [goal, experience, daysPerWeek, location, gender].filter((v) => v !== null).length,
    [goal, experience, daysPerWeek, location, gender]
  );
  const isComplete = completedCount === 5;

  function handleSubmit() {
    if (!goal || !experience || !daysPerWeek || !location || !gender) return;
    const filters: FilterSelection = { goal, experience, daysPerWeek, location, gender };
    const params = new URLSearchParams({
      goal: filters.goal,
      experience: filters.experience,
      days: String(filters.daysPerWeek),
      location: filters.location,
      gender: filters.gender,
    });
    router.push(`/program?${params.toString()}`);
  }

  return (
    <div>
      <ProgressBar completed={completedCount} total={5} />
      <div className="space-y-7 sm:space-y-10">
        <Section
          step={1}
          title="เป้าหมายของคุณ"
          subtitle="เลือกสิ่งที่คุณอยากได้จากการเล่นเวทมากที่สุด"
          options={GOAL_OPTIONS}
          value={goal}
          onSelect={setGoal}
          columns="grid-cols-1 sm:grid-cols-2"
        />
        <Section
          step={2}
          title="ระดับประสบการณ์"
          subtitle="ช่วยให้ระบบปรับจำนวนท่าและความหนักให้เหมาะสม"
          options={EXPERIENCE_OPTIONS}
          value={experience}
          onSelect={setExperience}
          columns="grid-cols-1 sm:grid-cols-3"
        />
        <Section
          step={3}
          title="จำนวนวันต่อสัปดาห์"
          subtitle="เลือกตามเวลาที่คุณสะดวกในแต่ละสัปดาห์"
          options={DAYS_OPTIONS}
          value={daysPerWeek}
          onSelect={setDaysPerWeek}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
        <Section
          step={4}
          title="สถานที่ออกกำลังกาย"
          subtitle="ระบบจะเลือกเฉพาะท่าที่ใช้อุปกรณ์ที่คุณมีจริงๆ เท่านั้น"
          options={LOCATION_OPTIONS}
          value={location}
          onSelect={setLocation}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
        <Section
          step={5}
          title="เพศ"
          subtitle="ทุกท่าในฐานข้อมูลใช้ฝึกได้เหมือนกันทุกเพศ ตัวเลือกนี้แค่ปรับสัดส่วนน้ำหนักท่าให้เข้ากับเป้าหมายที่พบบ่อยเท่านั้น เลือก “ไม่ระบุ” ได้ถ้าไม่ต้องการเน้นกลุ่มใดเป็นพิเศษ"
          options={GENDER_OPTIONS}
          value={gender}
          onSelect={setGender}
          columns="grid-cols-1 sm:grid-cols-3"
        />

        <div className="flex flex-col items-center gap-2.5 sm:gap-3 pt-4 sm:pt-6">
          <button
            type="button"
            disabled={!isComplete}
            onClick={handleSubmit}
            className={[
              "font-heading font-semibold rounded-xl2 sm:rounded-xl3 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-lg transition-all duration-200 w-full sm:w-auto",
              isComplete
                ? "bg-sage-gradient text-paper shadow-glow hover:shadow-lifted hover:-translate-y-0.5 active:translate-y-0"
                : "bg-surface2 text-inkSoft cursor-not-allowed",
            ].join(" ")}
          >
            สร้างโปรแกรม
          </button>
          {!isComplete && (
            <p className="text-[11px] sm:text-xs text-inkSoft">กรุณาเลือกครบทั้ง 5 หมวดหมู่ก่อนสร้างโปรแกรม</p>
          )}
        </div>
      </div>
    </div>
  );
}
