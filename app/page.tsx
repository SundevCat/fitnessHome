import FilterForm from "@/components/FilterForm";

const HIGHLIGHTS = [
  "62 ท่าออกกำลังกาย",
  "ปรับตามเป้าหมายและอุปกรณ์",
  "3-6 วัน/สัปดาห์",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 sm:h-[28rem] bg-hero-mesh"
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-16 md:py-20">
        <header className="mb-3 sm:mb-14 md:mb-16 space-y-1.5 sm:space-y-5 text-center animate-fade-in-up">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-sage-gradient px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-paper shadow-glow">
            Weight Training Planner
          </span>
          <h1 className="font-heading font-bold text-xl sm:text-4xl md:text-5xl lg:text-6xl text-ink tracking-tight leading-tight sm:leading-[1.1]">
            สร้างตาราง
            <span className="bg-sage-gradient bg-clip-text text-transparent">เล่นเวท</span>
            ของคุณเอง
          </h1>
          <p className="text-inkSoft text-[11px] sm:text-base md:text-lg max-w-xl mx-auto leading-snug sm:leading-relaxed">
            เลือก 5 หมวดหมู่ด้านล่าง ระบบจะประกอบโปรแกรมฝึกรายสัปดาห์ที่เหมาะกับคุณให้อัตโนมัติ
          </p>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 sm:pt-2">
            {HIGHLIGHTS.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-inkSoft shadow-soft"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sage-500 flex-shrink-0" />
                {h}
              </span>
            ))}
          </div>
        </header>

        <FilterForm />
      </div>
    </main>
  );
}
