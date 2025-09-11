import Link from "next/link";

export default function StudiesPage() {
  return (
    <div className="min-h-dvh px-4 py-6 sm:px-6 md:px-0 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <input
          placeholder="스터디 검색"
          className="glass-input w-full rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500"
        />
        <button className="glass-card hover:shadow-[0_0_0_2px_rgba(138,43,226,0.5)] active:scale-[0.98] min-w-30 rounded-xl px-4 py-3 text-gray-900">
          필터
        </button>
      </div>

      <div className="mb-4">
        <a
          href="/studies/create"
          className="glass-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white active:scale-[0.98]"
        >
          스터디 개설하기
        </a>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Link key={idx} href="#" className="glass-card rounded-2xl p-4 active:scale-[0.98] transition border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-semibold">알고리즘 스터디 {idx + 1}</div>
                <div className="text-gray-600 text-sm">인원 6 / 8 • 매주 화·목</div>
              </div>
              <span className="text-gray-500">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
