"use client";

import { useState } from "react";
import { GeneratedProgram } from "@/lib/types";
import ExerciseCard from "./ExerciseCard";
import Icon from "./Icon";

interface ProgramDayViewProps {
  program: GeneratedProgram;
}

export default function ProgramDayView({ program }: ProgramDayViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = program.days[activeIndex];

  function handleTabKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveIndex((index + 1) % program.days.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveIndex((index - 1 + program.days.length) % program.days.length);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Compact pill selector — each day already repeats its title + focus
          muscle groups in the panel header below, so the tabs themselves only
          need the short title plus a representative body-part icon to stay
          scannable on narrow screens without duplicating information. Tabs
          wrap to a new row instead of scrolling horizontally so a 6-day
          program never overflows off-screen or shows a scrollbar. min-h-9
          keeps each tab a usable tap target on mobile even though the
          visible pill itself stays compact. */}
      <div role="tablist" aria-label="วันฝึกในสัปดาห์" className="flex flex-wrap gap-1.5">
        {program.days.map((day, index) => {
          const selected = index === activeIndex;
          const repIcon = day.exercises[0]?.icon ?? "core";
          return (
            <button
              key={day.dayIndex}
              role="tab"
              id={`day-tab-${index}`}
              aria-selected={selected}
              aria-controls={`day-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={[
                "flex-shrink-0 inline-flex min-h-9 sm:min-h-0 items-center gap-1 sm:gap-1.5 rounded-full border px-2.5 sm:px-3 py-2 sm:py-2 text-[11px] sm:text-sm font-heading font-semibold whitespace-nowrap transition-all duration-200",
                selected
                  ? "bg-sage-gradient border-transparent text-paper shadow-glow"
                  : "bg-surface border-line text-ink shadow-soft hover:-translate-y-0.5 hover:shadow-lifted hover:border-sage-300",
              ].join(" ")}
            >
              <Icon
                name={repIcon}
                className={["h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 flex-shrink-0", selected ? "text-paper" : "text-sage-500"].join(" ")}
              />
              {day.titleTh}
            </button>
          );
        })}
      </div>

      <div
        key={activeIndex}
        role="tabpanel"
        id={`day-panel-${activeIndex}`}
        aria-labelledby={`day-tab-${activeIndex}`}
        className="space-y-3 sm:space-y-4 animate-fade-in-up"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-1">
          <h2 className="font-heading font-semibold text-lg sm:text-xl text-ink tracking-tight">
            {activeDay.titleTh}
          </h2>
          <span className="text-xs sm:text-sm text-inkSoft">{activeDay.focusTh}</span>
        </div>
        <ul className="space-y-2.5 sm:space-y-3">
          {activeDay.exercises.map((exercise, index) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
          ))}
        </ul>
      </div>
    </div>
  );
}
