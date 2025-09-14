"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function StudyCreateSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-10">로딩 중...</div>}>
      <StudyCreateSuccessContent />
    </Suspense>
  );
}

function StudyCreateSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const name = params.get("name") ?? "스터디";
  const levelRaw = params.get("level") ?? "";
  const levelMap: Record<string, string> = {
    easy: "초급",
    intermediate: "중급",
    hard: "고급",
  };
  const level = levelMap[levelRaw] ?? levelRaw;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-black/10 p-8 text-center shadow-2xl">
        <h1 className="mb-2 text-xl font-semibold">🎉 스터디 개설 신청이 완료되었습니다!</h1>
        <p className="mb-6 text-[14px] text-gray-700">아래 정보를 확인해주세요.</p>
        <div className="mx-auto mb-6 inline-block rounded-xl border px-5 py-3 text-left">
          <p className="text-[14px]">
            <span className="text-gray-500">스터디 이름</span> : <span className="font-medium">{name}</span>
          </p>
          {level && (
            <p className="text-[14px]">
              <span className="text-gray-500">난이도</span> : <span className="font-medium">{level}</span>
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => router.push("/my-study")} className="glass-button rounded-xl px-5 py-2 text-[13px]">
            내 스터디로 이동
          </button>
          <button
            onClick={() => router.push("/studies")}
            className="glass-card rounded-xl border px-5 py-2 text-[13px] hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)]"
          >
            목록 보기
          </button>
        </div>
      </div>
    </div>
  );
}
