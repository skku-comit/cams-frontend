import Link from "next/link";

export default function BooksPage() {
  return (
    <div className="min-h-dvh px-4 py-6 sm:px-6 md:px-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <input
          placeholder="도서 검색"
          className="glass-input focus-ring-primary w-full rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500"
        />
        <button className="glass-card hover:shadow-[0_0_0_2px_rgba(138,43,226,0.5)] active:scale-[0.98] rounded-xl px-4 py-3 text-gray-900">
          필터
        </button>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Link key={idx} href="#" className="glass-card rounded-2xl p-4 active:scale-[0.98] transition border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-semibold">클린 코드</div>
                <div className="text-gray-600 text-sm">저자: 로버트 C. 마틴 • 재고: {5 + (idx % 3)}</div>
              </div>
              <span className="text-gray-500">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
