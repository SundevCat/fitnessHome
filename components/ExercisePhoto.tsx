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

// Set at build time in next.config.mjs — empty locally, "/repo-name" when
// built inside GitHub Actions for GitHub Pages. This <img> tag is a plain
// HTML element (not next/image or next/link), so unlike those it does NOT
// automatically pick up Next's configured basePath — the prefix has to be
// added by hand here or the GIFs 404 once deployed under a subpath.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
      src={`${BASE_PATH}/exercises/${exerciseId}.gif`}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`object-cover bg-sage-100 ${className ?? ""}`}
    />
  );
}
