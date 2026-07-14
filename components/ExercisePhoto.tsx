"use client";

import { useState } from "react";
import { BodyPart } from "@/lib/types";
import Icon from "./Icon";

interface ExercisePhotoProps {
  exerciseId: string;
  alt: string;
  fallbackIcon: BodyPart;
  className?: string;
}

/**
 * Shows a real exercise animation GIF from /public/exercises/{exerciseId}.gif
 * when available (downloaded via `npm run fetch-photos`, see
 * scripts/fetch-exercise-photos.mjs). GIFs animate automatically in a plain
 * <img> tag, so the movement is easy to follow at a glance. Falls back to
 * the hand-drawn SVG icon if the file hasn't been downloaded yet or failed
 * to match, so the app always renders something reasonable.
 */
export default function ExercisePhoto({
  exerciseId,
  alt,
  fallbackIcon,
  className,
}: ExercisePhotoProps) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className={`flex items-center justify-center bg-sage-100 text-sage-700 ${className ?? ""}`}>
        <Icon name={fallbackIcon} className="h-6 w-6" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/exercises/${exerciseId}.gif`}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`object-cover bg-sage-100 ${className ?? ""}`}
    />
  );
}
