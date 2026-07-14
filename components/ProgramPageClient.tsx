"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { generateProgram } from "@/lib/generator";
import {
  DaysPerWeek,
  Experience,
  FilterSelection,
  Gender,
  Goal,
  Location,
} from "@/lib/types";
import ProgramDayView from "./ProgramDayView";

const VALID_GOALS: Goal[] = ["strength", "muscle", "fatloss", "general"];
const VALID_EXPERIENCE: Experience[] = ["beginner", "intermediate", "advanced"];
const VALID_DAYS: DaysPerWeek[] = [3, 4, 5, 6];
const VALID_LOCATIONS: Location[] = ["gym", "home_dumbbell", "home_bodyweight", "outdoor"];
const VALID_GENDERS: Gender[] = ["male", "female", "unspecified"];

const GOAL_LABEL: Record<Goal, string> = {
  strength: "เพิ่มความแข็งแรง",
  muscle: "เพิ่มกล้ามเนื้อ",
  fatloss: "ลดไขมัน",
  general: "สุขภาพทั่วไป",
};
const EXPERIENCE_LABEL: Record<Experience, string> = {
  beginner: "มือใหม่",
  intermediate: "ระดับกลาง",
  advanced: "ระดับสูง",
};
const LOCATION_LABEL: Record<Location, string> = {
  gym: "ยิม/ฟิตเนส",
  home_dumbbell: "บ้านมีดัมเบล",
  home_bodyweight: "บ้านไม่มีอุปกรณ์",
  outdoor: "กลางแจ้ง",
};
const GENDER_LABEL: Record<Gender, string> = {
  male: "ชาย",
  female: "หญิง",
  unspecified: "ไม่ระบุเพศ",
};

const CHIP_STYLES = [
  "bg-sage-50 text-sage-700 border-sage-200",
  "bg-amber-50 text-amber-700 border-amber-300/50",
  "bg-coral-100 text-coral-600 border-coral-400/30",
  "bg-surface2 text-inkSoft border-line",
  "bg-sage-100 text-sage-800 border-sage-300/50",
];

function parseFilters(searchParams: URLSearchParams): FilterSelection | null {
  const goal = searchParams.get("goal") as Goal | null;
  const experience = searchParams.get("experience") as Experience | null;
  const daysRaw = searchParams.get("days");
  const location = searchParams.get("location") as Location | null;
  const genderRaw = searchParams.get("gender") as Gender | null;
  const days = daysRaw ? (Number(daysRaw) as DaysPerWeek) : null;
  // Gender defaults to "unspecified" for backward-compatible links that
  // don't include it, rather than treating the whole selection as invalid.
  const gender: Gender = genderRaw && VALID_GENDERS.includes(genderRaw) ? genderRaw : "unspecified";

  if (
    !goal ||
    !experience ||
    !days ||
    !location ||
    !VALID_GOALS.includes(goal) ||
    !VALID_EXPERIENCE.includes(experience) ||
    !VALID_DAYS.includes(days) ||
    !VALID_LOCATIONS.includes(location)
  ) {
    return null;
  }

  return { goal, experience, daysPerWeek: days, location, gender };
}

export default function ProgramPageClient() {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const program = useMemo(() => (filters ? generateProgram(filters) : null), [filters]);

  if (!filters || !program) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="text-center space-y-3 sm:space-y-4 max-w-sm rounded-xl2 sm:rounded-xl3 border border-line bg-surface p-6 sm:p-8 shadow-soft">
          <p className="font-heading font-semibold text-lg sm:text-xl text-ink">
            ไม่พบเงื่อนไขของโปรแกรม
          </p>
          <p className="text-xs sm:text-sm text-inkSoft">
            กรุณากลับไปเลือกเป้าหมาย ระดับ จำนวนวัน สถานที่ออกกำลังกาย และเพศก่อนสร้างโปรแกรม
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl2 sm:rounded-xl3 bg-sage-gradient text-paper font-heading font-semibold px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-glow hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200"
          >
            กลับไปหน้าเลือกเงื่อนไข
          </Link>
        </div>
      </main>
    );
  }

  const chipLabels = [
    GOAL_LABEL[program.goal],
    EXPERIENCE_LABEL[program.experience],
    `${program.daysPerWeek} วัน/สัปดาห์`,
    LOCATION_LABEL[program.location],
    GENDER_LABEL[program.gender],
  ];

  return (
    <main className="min-h-screen bg-paper relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 sm:h-[22rem] bg-hero-mesh"
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-12 space-y-6 sm:space-y-8">
        <header className="space-y-2.5 sm:space-y-4 animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-sage-700 hover:text-sage-800 transition-colors rounded-full bg-surface border border-line px-2.5 py-1 sm:px-3 sm:py-1.5 hover:bg-surface2 shadow-soft"
          >
            ← เปลี่ยนเงื่อนไข
          </Link>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-ink tracking-tight">
            โปรแกรมฝึกเวทของคุณ
          </h1>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {chipLabels.map((label, i) => (
              <span
                key={label}
                className={[
                  "text-[10px] sm:text-xs font-medium rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5",
                  CHIP_STYLES[i % CHIP_STYLES.length],
                ].join(" ")}
              >
                {label}
              </span>
            ))}
          </div>
        </header>

        <ProgramDayView program={program} />

        <section className="rounded-xl2 sm:rounded-xl3 border border-line bg-surface p-4 sm:p-6 space-y-2.5 sm:space-y-3 shadow-soft">
          <h2 className="font-heading font-semibold text-base sm:text-lg text-ink flex items-center gap-2">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-[10px] sm:text-xs font-bold flex-shrink-0">
              !
            </span>
            หมายเหตุทั่วไป
          </h2>
          <ul className="space-y-1.5 sm:space-y-2">
            {program.notesTh.map((note, i) => (
              <li key={i} className="text-xs sm:text-sm text-inkSoft flex gap-2">
                <span className="text-sage-500 flex-shrink-0">●</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
