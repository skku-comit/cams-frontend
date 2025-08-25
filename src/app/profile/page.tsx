"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh px-4 py-6 sm:px-6 md:px-8">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-white/20 relative overflow-hidden">
              {/* avatar placeholder */}
              <button className="absolute inset-0 grid place-items-center text-white/70 text-xs hover:text-white">
                사진 변경
              </button>
            </div>
            <div>
              <div className="text-white text-lg font-semibold">홍길동</div>
              <div className="text-white/70 text-sm">20231234</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["React", "TypeScript", "Next.js", "Algorithm"].map((tag) => (
              <span key={tag} className="rounded-full bg-white/15 text-white text-xs px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="glass-card rounded-2xl p-5">
          <div className="grid gap-3">
            <button
              onClick={() => setOpen(true)}
              className="glass-card rounded-xl px-4 py-3 text-left hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2)]"
            >
              내 정보 수정
            </button>
            <button className="glass-card rounded-xl px-4 py-3 text-left hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2)]">
              신청한 스터디 목록
            </button>
            <button className="glass-card rounded-xl px-4 py-3 text-left hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2)]">
              개설한 스터디 목록
            </button>
            <button className="glass-card rounded-xl px-4 py-3 text-left hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2)]">
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">내 정보 수정</h3>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                닫기
              </button>
            </div>
            <div className="grid gap-3">
              <input
                placeholder="이름"
                className="glass-input focus-ring-primary rounded-xl px-4 py-3 text-white placeholder-white/60"
              />
              <input
                placeholder="학번"
                className="glass-input focus-ring-primary rounded-xl px-4 py-3 text-white placeholder-white/60"
              />
              <input
                placeholder="기술 스택(쉼표로 구분)"
                className="glass-input focus-ring-primary rounded-xl px-4 py-3 text-white placeholder-white/60"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setOpen(false)} className="glass-card rounded-xl px-4 py-2">
                  취소
                </button>
                <button className="glass-button rounded-xl px-4 py-2">저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
