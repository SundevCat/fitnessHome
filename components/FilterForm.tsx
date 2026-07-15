"use client";

import { useState } from "react";
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

const STEP_META = [
  { title: "เป้าหมายของคุณ", shortTitle: "เป้าหมาย", subtitle: "เลือกสิ่งที่คุณอยากได้จากการเล่นเวทมากที่สุด" },
  { title: "ระดับประสบการณ์", shortTitle: "ระดับ", subtitle: "ช่วยให้ระบบปรับจำนวนท่าและความหนักให้เหมาะสม" },
  { title: "จำนวนวันต่อสัปดาห์", shortTitle: "จำนวนวัน", subtitle: "เลือกตามเวลาที่คุณสะดวกในแต่ละสัปดาห์" },
  { title: "สถานที่ออกกำลังกาย", shortTitle: "สถานที่", subtitle: "ระบบจะเลือกเฉพาะท่าที่ใช้อุปกรณ์ที่คุณมีจริงๆ เท่านั้น" },
  {
    title: "เพศ",
    shortTitle: "เพศ",
    subtitle:
      "ทุกท่าในฐานข้อมูลใช้ฝึกได้เหมือนกันทุกเพศ ตัวเลือกนี้แค่ปรับสัดส่วนน้ำหนักท่าให้เข้ากับเป้าหมายที่พบบ่อยเท่านั้น เลือก “ไม่ระบุ” ได้ถ้าไม่ต้องการเน้นกลุ่มใดเป็นพิเศษ",
  },
];

const TOTAL_STEPS = STEP_META.length;

function labelFor<T extends string | number>(options: OptionDef<T>[], value: T | null): string | null {
  if (value === null) return null;
  const found = options.find((o) => o.value === value);
  return found ? found.labelTh : null;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2 5 8.7l4.5-5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" aria-hidden="true">
      <path
        d="M8.2 1.8 10.2 3.8 4 10H2v-2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepDots({
  current,
  total,
  onJump,
}: {
  current: number;
  total: number;
  onJump: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center" role="presentation">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const isReachable = i <= current;
        return (
          <button
            key={i}
            type="button"
            aria-label={`ไปข้อที่ ${i + 1}`}
            aria-current={isActive ? "step" : undefined}
            disabled={!isReachable}
            onClick={() => isReachable && onJump(i)}
            className={[
              "group flex items-center justify-center p-1.5 sm:p-2",
              isReachable ? "cursor-pointer" : "cursor-default",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "block h-1.5 sm:h-2 rounded-full transition-all duration-300",
                isActive
                  ? "w-6 sm:w-8 bg-sage-gradient"
                  : isDone
                    ? "w-1.5 sm:w-2 bg-sage-400 group-hover:bg-sage-500"
                    : "w-1.5 sm:w-2 bg-surface2",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}

function AnsweredSummary({
  items,
  onEdit,
}: {
  items: { step: number; shortTitle: string; label: string }[];
  onEdit: (step: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-2.5 sm:mb-4 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={item.step}
          type="button"
          onClick={() => onEdit(item.step)}
          className="group flex min-w-0 items-center gap-1 rounded-full border border-line bg-surface px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs text-inkSoft shadow-soft transition-colors hover:border-sage-300 hover:text-sage-700"
        >
          <span className="flex-shrink-0 font-semibold text-sage-600">{item.shortTitle}:</span>
          <span className="max-w-[5rem] sm:max-w-[10rem] truncate">{item.label}</span>
          <PencilIcon className="h-2.5 w-2.5 flex-shrink-0 text-inkSoft/60 group-hover:text-sage-600" />
        </button>
      ))}
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
        "group flex w-full items-center gap-2.5 sm:gap-4 rounded-xl2 sm:rounded-xl3 border p-2.5 sm:p-4 text-left transition-all duration-200",
        selected
          ? "border-sage-500 bg-sage-50 shadow-glow"
          : "border-line bg-surface shadow-soft hover:-translate-y-0.5 hover:shadow-lifted hover:border-sage-300",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "flex h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200",
          selected
            ? "bg-sage-gradient"
            : "border-2 border-line bg-paper group-hover:border-sage-300",
        ].join(" ")}
      >
        {selected && <CheckIcon className="h-2 w-2 sm:h-3 sm:w-3 text-paper" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0">
          <span className="font-heading font-semibold text-ink text-[13px] sm:text-base leading-tight">
            {option.labelTh}
          </span>
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-amber-700 font-semibold">
            {option.labelEn}
          </span>
        </span>
        <span className="block text-[11px] sm:text-sm text-inkSoft leading-tight sm:leading-snug line-clamp-1 sm:line-clamp-none">
          {option.descTh}
        </span>
      </span>
    </button>
  );
}

function StepScreen<T extends string | number>({
  index,
  title,
  subtitle,
  options,
  value,
  onSelect,
}: {
  index: number;
  title: string;
  subtitle: string;
  options: OptionDef<T>[];
  value: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="animate-fade-in-up space-y-2.5 sm:space-y-6">
      <div className="space-y-0.5 sm:space-y-1.5">
        <span className="font-heading text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sage-600">
          ข้อที่ {index} จาก {TOTAL_STEPS}
        </span>
        <h2
          id={`step-title-${index}`}
          className="font-heading font-bold text-base sm:text-2xl md:text-3xl text-ink tracking-tight leading-tight"
        >
          {title}
        </h2>
        <p className="text-[11px] sm:text-sm text-inkSoft leading-snug line-clamp-2 sm:line-clamp-none">{subtitle}</p>
      </div>
      <div role="radiogroup" aria-labelledby={`step-title-${index}`} className="space-y-1.5 sm:space-y-2.5">
        {options.map((option) => (
          <OptionCard key={option.value} option={option} selected={value === option.value} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default function FilterForm() {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const answers = [goal, experience, daysPerWeek, location, gender];
  const canProceed = answers[currentStep] !== null;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const answerLabels = [
    labelFor(GOAL_OPTIONS, goal),
    labelFor(EXPERIENCE_OPTIONS, experience),
    labelFor(DAYS_OPTIONS, daysPerWeek),
    labelFor(LOCATION_OPTIONS, location),
    labelFor(GENDER_OPTIONS, gender),
  ];

  const answeredSummaries = answerLabels
    .map((label, i) =>
      label !== null && i < currentStep ? { step: i, shortTitle: STEP_META[i].shortTitle, label } : null
    )
    .filter((item): item is { step: number; shortTitle: string; label: string } => item !== null);

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

  function handleNext() {
    if (!canProceed) return;
    if (isLastStep) {
      handleSubmit();
      return;
    }
    setCurrentStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  const meta = STEP_META[currentStep];

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 mb-3 sm:mb-8 bg-paper/85 glass border-b border-line px-4 sm:px-6 py-1.5 sm:py-3">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <StepDots current={currentStep} total={TOTAL_STEPS} onJump={setCurrentStep} />
          <span className="flex-shrink-0 text-[11px] sm:text-xs font-semibold text-inkSoft font-heading tabular-nums">
            {currentStep + 1}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      <AnsweredSummary items={answeredSummaries} onEdit={setCurrentStep} />

      <div key={currentStep}>
        {currentStep === 0 && (
          <StepScreen index={1} title={meta.title} subtitle={meta.subtitle} options={GOAL_OPTIONS} value={goal} onSelect={setGoal} />
        )}
        {currentStep === 1 && (
          <StepScreen
            index={2}
            title={meta.title}
            subtitle={meta.subtitle}
            options={EXPERIENCE_OPTIONS}
            value={experience}
            onSelect={setExperience}
          />
        )}
        {currentStep === 2 && (
          <StepScreen
            index={3}
            title={meta.title}
            subtitle={meta.subtitle}
            options={DAYS_OPTIONS}
            value={daysPerWeek}
            onSelect={setDaysPerWeek}
          />
        )}
        {currentStep === 3 && (
          <StepScreen
            index={4}
            title={meta.title}
            subtitle={meta.subtitle}
            options={LOCATION_OPTIONS}
            value={location}
            onSelect={setLocation}
          />
        )}
        {currentStep === 4 && (
          <StepScreen index={5} title={meta.title} subtitle={meta.subtitle} options={GENDER_OPTIONS} value={gender} onSelect={setGender} />
        )}
      </div>

      <div className="mt-3 sm:mt-8 flex items-center gap-2 sm:gap-3 pb-2 sm:pb-4">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="ย้อนกลับ"
            className="flex flex-shrink-0 items-center justify-center rounded-xl2 sm:rounded-xl3 border border-line bg-surface p-2.5 sm:p-3.5 text-inkSoft shadow-soft transition-all duration-200 hover:border-sage-300 hover:text-sage-600 hover:-translate-y-0.5"
          >
            <ArrowIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" flip />
          </button>
        )}
        <button
          type="button"
          disabled={!canProceed}
          onClick={handleNext}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl2 sm:rounded-xl3 py-2.5 sm:py-3.5 text-sm sm:text-base font-heading font-semibold transition-all duration-200",
            canProceed
              ? "bg-sage-gradient text-paper shadow-glow hover:shadow-lifted hover:-translate-y-0.5 active:translate-y-0"
              : "bg-surface2 text-inkSoft cursor-not-allowed",
          ].join(" ")}
        >
          {isLastStep ? "สร้างโปรแกรม" : "ถัดไป"}
          {!isLastStep && <ArrowIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />}
        </button>
      </div>
      {!canProceed && (
        <p className="text-center text-[11px] sm:text-xs text-inkSoft">เลือกตัวเลือกด้านบนก่อนเพื่อไปข้อถัดไป</p>
      )}
    </div>
  );
}
