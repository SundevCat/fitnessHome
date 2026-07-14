import { Suspense } from "react";
import ProgramPageClient from "@/components/ProgramPageClient";

export default function ProgramPage() {
  return (
    <Suspense fallback={null}>
      <ProgramPageClient />
    </Suspense>
  );
}
