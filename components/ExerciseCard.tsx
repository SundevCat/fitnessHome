import { ProgramExercise } from "@/lib/types";
import ExercisePhoto from "./ExercisePhoto";

interface ExerciseCardProps {
  exercise: ProgramExercise;
  index: number;
}

const ICON_COMMON = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function RepsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" {...ICON_COMMON}>
      <path d="M3 6.5v3M2 7v2" />
      <path d="M13 6.5v3M14 7v2" />
      <path d="M5 8h6" />
      <rect x="4" y="6" width="1.6" height="4" rx="0.5" />
      <rect x="10.4" y="6" width="1.6" height="4" rx="0.5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" {...ICON_COMMON}>
      <circle cx="8" cy="8.5" r="5.5" />
      <path d="M8 5.5V8.5L10 10" />
      <path d="M6 1.5h4" />
    </svg>
  );
}

export default function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  return (
    <li className="rounded-xl2 sm:rounded-xl3 border border-line bg-surface p-3 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-soft hover:shadow-lifted transition-shadow duration-200">
      <div className="flex items-center gap-2.5 sm:gap-3 sm:w-56 flex-shrink-0">
        <ExercisePhoto
          exerciseId={exercise.id}
          alt={exercise.nameTh}
          fallbackIcon={exercise.icon}
          className="h-24 w-24 rounded-xl2 sm:rounded-xl3 flex-shrink-0 ring-1 ring-line"
        />
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-inkSoft font-medium">ท่าที่ {index + 1}</p>
          <p className="font-heading font-semibold text-sm sm:text-base text-ink leading-tight truncate">
            {exercise.nameTh}
          </p>
          <p className="text-[11px] sm:text-xs text-inkSoft truncate">{exercise.nameEn}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 items-start">
        <div className="rounded-lg sm:rounded-xl2 bg-paper border border-line px-2.5 py-1.5 sm:px-3 sm:py-2">
          <p className="flex items-center gap-1 text-[11px] sm:text-xs text-inkSoft">
            <RepsIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-sage-500" />
            เซต x ครั้ง
          </p>
          <p className="font-heading font-semibold text-ink text-sm sm:text-base">
            {exercise.sets} x {exercise.reps}
          </p>
        </div>
        <div className="rounded-lg sm:rounded-xl2 bg-paper border border-line px-2.5 py-1.5 sm:px-3 sm:py-2">
          <p className="flex items-center gap-1 text-[11px] sm:text-xs text-inkSoft">
            <ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-sage-500" />
            พัก
          </p>
          <p className="font-heading font-semibold text-ink text-sm sm:text-base">{exercise.restSec} วินาที</p>
        </div>
        <div
          className={[
            "rounded-lg sm:rounded-xl2 px-2.5 py-1.5 sm:px-3 sm:py-2 col-span-2 sm:col-span-1 border",
            exercise.isCompound ? "bg-amber-50 border-amber-300/40" : "bg-sage-50 border-sage-200",
          ].join(" ")}
        >
          <p
            className={[
              "text-[11px] sm:text-xs font-medium",
              exercise.isCompound ? "text-amber-700" : "text-sage-700",
            ].join(" ")}
          >
            {exercise.isCompound ? "ท่าหลัก" : "ท่าเสริม"}
          </p>
          <p className="text-xs sm:text-sm text-ink hidden sm:block">
            {exercise.isCompound ? "โฟกัสฟอร์มและแรง" : "โฟกัสสร้างกล้าม"}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-3 text-xs sm:text-sm text-inkSoft space-y-1 sm:space-y-1.5 pt-0.5 sm:pt-1">
          {exercise.cue && (
            <p>
              <span className="font-medium text-ink">เคล็ดลับฟอร์ม: </span>
              {exercise.cue}
            </p>
          )}
          <p>
            <span className="font-medium text-ink">ทางเลือกไม่มีเครื่อง: </span>
            {exercise.alternativeTh}
          </p>
          {exercise.stepsTh && exercise.stepsTh.length > 0 && (
            <details className="group pt-0.5 sm:pt-1">
              <summary className="cursor-pointer select-none font-medium text-ink flex items-center gap-1.5 [&::-webkit-details-marker]:hidden marker:content-none">
                <svg
                  className="h-3 w-3 flex-shrink-0 text-sage-500 transition-transform duration-200 group-open:rotate-90"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M4 2.5 8 6l-4 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                วิธีทำละเอียด
              </summary>
              <ol className="mt-2 list-decimal space-y-1 pl-4 sm:pl-5 text-inkSoft">
                {exercise.stepsTh.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            </details>
          )}
        </div>
      </div>
    </li>
  );
}
