"use client";
import { useState } from "react";

type TabKey = "active" | "pending" | "completed";

export default function MyStudyPage() {
  const [tab, setTab] = useState<TabKey>("active");

  const items: Record<TabKey, string[]> = {
    active: ["알고리즘 스터디", "프론트엔드 스터디"],
    pending: ["CS 스터디"],
    completed: ["클린코드 리딩"],
  };

  const list = items[tab];

  return (
    <div className="min-h-dvh px-4 py-6 sm:px-6 md:px-8">
      {/* Tabs */}
      <div className="glass-card rounded-2xl p-1 mb-4 flex gap-1">
        {(
          [
            { key: "active", label: "참여 중" },
            { key: "pending", label: "신청 대기" },
            { key: "completed", label: "완료" },
          ] as { key: TabKey; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm transition ${
              tab === key ? "bg-[rgba(138,43,226,0.35)] text-white" : "text-white/80 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-white font-semibold mb-2">표시할 스터디가 없어요</div>
          <div className="text-white/70 text-sm mb-4">새로운 스터디를 찾아볼까요?</div>
          <a href="/studies" className="glass-button rounded-xl px-4 py-2 inline-block">
            개설된 스터디 둘러보기
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((name, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{name}</div>
                  <div className="text-white/70 text-sm">
                    {tab === "pending" && "승인 대기 중"}
                    {tab === "active" && "다음 모임: 금요일 19:00"}
                    {tab === "completed" && "완료됨"}
                  </div>
                </div>
                {tab === "pending" ? (
                  <button className="glass-card rounded-lg px-3 py-2 text-white/90 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2)] active:scale-[0.98]">
                    신청 취소
                  </button>
                ) : tab === "active" ? (
                  <div className="w-28 h-2 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full w-1/2 bg-white/60" />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
