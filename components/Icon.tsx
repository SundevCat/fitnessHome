import { BodyPart } from "@/lib/types";

interface IconProps {
  name: BodyPart;
  className?: string;
}

const COMMON = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Hand-drawn line-art icons, one per body part. Kept intentionally simple
// and consistent (24x24, single stroke weight) so they read clearly at
// small sizes without needing photography or external image assets.
function IconPath({ name }: { name: BodyPart }) {
  switch (name) {
    case "chest":
      return (
        <>
          <path d="M12 4c-1.6-1.4-4-1.6-5.4 0-1.4 1.6-1.2 4 .3 6.2C8.4 12.6 12 15 12 15s3.6-2.4 5.1-4.8c1.5-2.2 1.7-4.6.3-6.2-1.4-1.6-3.8-1.4-5.4 0Z" />
          <path d="M12 4v11" />
          <path d="M7 8.5c1 .6 2 .8 5 .8s4-.2 5-.8" />
        </>
      );
    case "back":
      return (
        <>
          <path d="M12 3 5 6.5V12c0 4.5 2.8 7.5 7 9 4.2-1.5 7-4.5 7-9V6.5L12 3Z" />
          <path d="M12 3v18" />
          <path d="M7 9c1.6 1 3.2 1.4 5 1.4S15.4 10 17 9" />
          <path d="M8 14c1.3.7 2.6 1 4 1s2.7-.3 4-1" />
        </>
      );
    case "legs":
      return (
        <>
          <path d="M9 3h6l.6 6.5-1.4 4L15 20h-2.2l-.8-7-.8 7H9l.8-6.5-1.4-4L9 3Z" />
          <path d="M9.6 9.5h4.8" />
          <path d="M10 3v3.2M14 3v3.2" />
        </>
      );
    case "shoulders":
      return (
        <>
          <circle cx="12" cy="6" r="2.2" />
          <path d="M4 15c.5-3.6 3-5.5 8-5.5s7.5 1.9 8 5.5" />
          <path d="M4 15c0 1.6.9 2.6 2.4 2.6M20 15c0 1.6-.9 2.6-2.4 2.6" />
        </>
      );
    case "biceps":
      // A flexed arm — bent elbow with a highlighted bicep bulge.
      return (
        <>
          <path d="M8 4c2 0 3 1.4 3 3.4 0 1.6-.8 2.4-.8 3.6 0 1.6 1.4 2 1.4 3.6 0 1.6-1.2 2.4-2.6 2.4" />
          <path d="M8 4C6.2 4 5 5.2 5 7c0 1.6 1 2.2 1 3.8" />
          <path d="M6 10.8c0 2.6 1.2 4 3.4 4.6" />
          <circle cx="8.6" cy="8.4" r="1.1" />
        </>
      );
    case "triceps":
      // A straight, extended arm — highlighted on the back of the upper arm.
      return (
        <>
          <path d="M8 4c2 0 3.2 1.6 3.2 3.8 0 2.4-1 3.6-1 5.6 0 1.8.8 2.8 2.4 3.2" />
          <path d="M8 4C6.2 4 5 5.3 5 7.1c0 2.2 1.2 3.3 1.2 5.5" />
          <circle cx="9.6" cy="9" r="1.1" />
          <path d="M9.4 15.6c.6.4 1.4.7 2.2.9" />
        </>
      );
    case "core":
      return (
        <>
          <rect x="8" y="4" width="8" height="15" rx="3" />
          <path d="M8 8.5h8M8 12h8M8 15.5h8" />
          <path d="M12 4v15" />
        </>
      );
    case "glutes":
      return (
        <>
          <path d="M6 6c0-1.6 1.4-2.6 3-2.6h6c1.6 0 3 1 3 2.6v3.4c2.4.6 3.6 2.6 3.6 5.2 0 3-2.2 5-5.6 5-2 0-3.2-.8-4-1.8-.8 1-2 1.8-4 1.8-3.4 0-5.6-2-5.6-5C2.4 12 3.6 10 6 9.4Z" />
          <path d="M12 6v13" />
        </>
      );
    case "calves":
      return (
        <>
          <path d="M10 3h4l.6 7.5c.3 3-.2 5-1.6 7.5h-2.6L9 17l-.4-6.5L10 3Z" />
          <path d="M9.3 9.5h5.4" />
          <path d="M10.4 17h3.2" />
        </>
      );
    default:
      return null;
  }
}

export default function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...COMMON}
    >
      <IconPath name={name} />
    </svg>
  );
}
