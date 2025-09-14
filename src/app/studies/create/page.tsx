"use client";

import { useState, FormEvent, useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createStudyAction, type CreateStudyActionState } from "@/actions/createStudy";

const LEVEL_OPTIONS = [
  { value: "beginner", label: "초급" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "고급" },
] as const;
type Level = (typeof LEVEL_OPTIONS)[number]["value"];

const DAYS_OF_WEEK = [
  { value: "monday", label: "월" },
  { value: "tuesday", label: "화" },
  { value: "wednesday", label: "수" },
  { value: "thursday", label: "목" },
  { value: "friday", label: "금" },
  { value: "saturday", label: "토" },
  { value: "sunday", label: "일" },
  { value: "undecided", label: "미정" },
] as const;
const TECH_STACKS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "Spring",
  "C/C++",
  "Go",
  "AWS",
  "Docker",
  "Kubernetes",
  "MySQL",
  "MongoDB",
  "Redis",
  "Git",
] as const;

const KNOWN_STACKS: ReadonlyArray<string> = TECH_STACKS;

interface WeeklyPlan {
  week_index: number;
  learning_plan: string;
}

export default function CreateStudyPage() {
  const router = useRouter();
  const timeErrorRef = useRef<HTMLParagraphElement>(null);
  const initialActionState: CreateStudyActionState = { success: false };
  const [actionState, formAction, isPending] = useActionState(createStudyAction, initialActionState);
  // 사용자 정의 스택만 최소 상태로 관리
  const [customStackInput, setCustomStackInput] = useState("");
  const [customStacks, setCustomStacks] = useState<string[]>([]);

  // 성공 시 축하 페이지로 이동 (낙관적 네비게이션)
  useEffect(() => {
    if (!actionState?.success) return;
    const name = actionState?.payload?.title || "";
    const level = (actionState?.payload?.level || "").toLowerCase();
    const params = new URLSearchParams({ name, level });
    router.push(`/studies/success?${params.toString()}`);
  }, [actionState?.success, actionState?.payload?.title, actionState?.payload?.level, router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // 클라이언트 측 시간 검증 (state 미사용)
    if (timeErrorRef.current) {
      timeErrorRef.current.textContent = "";
      timeErrorRef.current.classList.add("hidden");
    }
    const fd = new FormData(e.currentTarget);
    const start = String(fd.get("activity_start_time") || "");
    const end = String(fd.get("activity_end_time") || "");
    if (start && end) {
      const toMinutes = (t: string) => {
        const [h, m] = t.split(":");
        return Number(h) * 60 + Number(m);
      };
      if (toMinutes(end) <= toMinutes(start)) {
        e.preventDefault();
        if (timeErrorRef.current) {
          timeErrorRef.current.textContent = "날짜를 확인하세요. 종료 시간은 시작 시간보다 늦어야 합니다.";
          timeErrorRef.current.classList.remove("hidden");
        }
      }
    }
  };

  const addCustomStack = () => {
    const value = customStackInput.trim();
    if (!value) return;
    if (KNOWN_STACKS.includes(value) || customStacks.includes(value)) return;
    setCustomStacks((prev) => [...prev, value]);
    setCustomStackInput("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 md:px-6 md:py-6 lg:px-0">
      <div className="mb-6 md:mb-6">
        <button onClick={() => router.back()} className="mb-3 text-[13px] text-gray-500 hover:text-gray-700 md:mb-4">
          ← 목록으로
        </button>
        <div className="container px-5 lg:max-w-xl mx-auto mt-3">
          <h1 className="text-[15px] break-keep md:text-lg lg:text-xl  text-center font-light italic leading-[1.5]">
            &quot;다른 사람에게 배움을 주기 위해 완벽할 필요는 없다. <br />
            사람들은 당신이 불완전함을 다루는 방식에 영감을 받는다.&quot;
          </h1>
        </div>
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="border border-black/10 shadow-2xl rounded-2xl p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
      >
        {/* 사용자 정의 스택 hidden inputs */}
        <div className="sr-only">
          {customStacks.map((s) => (
            <input key={s} type="hidden" name="activity_stack" value={s} />
          ))}
        </div>

        {/* 기본 정보 */}
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">스터디 이름</label>
            <input
              type="text"
              maxLength={15}
              name="activity_name"
              required
              aria-invalid={Boolean(actionState?.errors?.activity_name) || undefined}
              className="glass-input w-full rounded-xl px-4 py-3 text-[13px] md:text-[14px] placeholder-black/60"
              placeholder="활동명을 입력하세요 (최대 15자)"
            />
            {actionState?.errors?.activity_name && (
              <p className="mt-1 text-[12px] text-red-600">{actionState.errors.activity_name}</p>
            )}
          </div>

          {/* 대표 이미지 */}
          <div>
            <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">대표 이미지</label>
            <input
              type="file"
              name="activity_image"
              accept="image/*"
              className="glass-input w-full rounded-xl px-4 py-2 text-[13px] md:text-[14px] file:mr-3 file:rounded-lg file:border file:px-3 file:py-1.5"
            />
            {actionState?.errors?.activity_image && (
              <p className="mt-1 text-[12px] text-red-600">{actionState.errors.activity_image}</p>
            )}
          </div>

          <div role="radiogroup" aria-labelledby="level-label" aria-required="true">
            <label id="level-label" className="mb-1.5 block text-[14px] font-medium md:text-[15px]">
              난이도
            </label>
            <div className="grid grid-cols-3 gap-3">
              {LEVEL_OPTIONS.map(({ value, label }, idx) => (
                <div key={value}>
                  <input
                    type="radio"
                    id={`level-${value}`}
                    name="level"
                    value={value}
                    className="peer sr-only"
                    required={idx === 0}
                  />
                  <label
                    htmlFor={`level-${value}`}
                    className="block cursor-pointer rounded-xl border px-3 py-2 text-center text-[13px] transition md:text-[14px] active:scale-[0.98] bg-white text-gray-700 hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)] peer-checked:bg-blue-100 peer-checked:text-blue-800 peer-checked:border-blue-300 peer-checked:font-semibold"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
            {actionState?.errors?.level && (
              <p id="level-error" className="mt-1 text-[12px] text-red-600">
                {actionState.errors.level}
              </p>
            )}
          </div>

          {/* 캠퍼스 */}
          <div role="radiogroup" aria-labelledby="campus-label" aria-required="true">
            <label id="campus-label" className="mb-1.5 block text-[14px] font-medium md:text-[15px]">
              캠퍼스
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "SEOUL", label: "서울" },
                { value: "SUWON", label: "수원" },
                { value: "NONE", label: "무관" },
              ].map(({ value, label }, idx) => (
                <div key={value}>
                  <input
                    type="radio"
                    id={`campus-${value}`}
                    name="campus"
                    value={value}
                    className="peer sr-only"
                    required={idx === 0}
                  />
                  <label
                    htmlFor={`campus-${value}`}
                    className="block cursor-pointer rounded-xl border px-3 py-2 text-center text-[13px] transition md:text-[14px] active:scale-[0.98] bg-white text-gray-700 hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)] peer-checked:bg-blue-100 peer-checked:text-blue-800 peer-checked:border-blue-300 peer-checked:font-semibold"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
            {actionState?.errors?.campus && (
              <p className="mt-1 text-[12px] text-red-600">{actionState.errors.campus}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">모집 인원(최대)</label>
              <input
                type="number"
                min="2"
                max="20"
                name="max_member"
                required
                aria-invalid={Boolean(actionState?.errors?.max_member) || undefined}
                className="glass-input  w-28 md:w-32 rounded-xl px-4 py-3 text-[13px] md:text-[14px]"
                placeholder="2~20명"
              />
              {actionState?.errors?.max_member && (
                <p className="mt-1 text-[12px] text-red-600">{actionState.errors.max_member}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">진행 기간</label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 8, 12, 16].map((w, idx) => (
                  <div key={w}>
                    <input
                      id={`duration-${w}`}
                      type="radio"
                      name="duration_week"
                      value={String(w)}
                      className="peer sr-only"
                      required={idx === 0}
                    />
                    <label
                      htmlFor={`duration-${w}`}
                      className="active:scale-[0.98] transition rounded-xl border px-3 py-2 text-[13px] md:text-[14px] hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)] peer-checked:bg-[rgba(138,43,226,0.35)] peer-checked:text-gray-900"
                    >
                      {w}주
                    </label>
                  </div>
                ))}
              </div>
              {actionState?.errors?.duration_week && (
                <p className="mt-1 text-[12px] text-red-600">{actionState.errors.duration_week}</p>
              )}
            </div>
          </div>

          <div aria-required="true">
            <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">활동 요일</label>
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={day.value} className="shrink-0">
                  <input
                    className="peer sr-only"
                    id={`dow-${day.value}`}
                    type="radio"
                    name="day_of_week"
                    value={day.value}
                    required={idx === 0}
                  />
                  <label
                    htmlFor={`dow-${day.value}`}
                    className="active:scale-[0.98] transition rounded-xl border px-2 py-1 text-[12px] hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)] peer-checked:bg-[rgba(138,43,226,0.35)] peer-checked:text-gray-900"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
            {actionState?.errors?.day_of_week && (
              <p className="mt-1 text-[12px] text-red-600">{actionState.errors.day_of_week}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">시작 시간</label>
              <input
                type="time"
                name="activity_start_time"
                required
                aria-invalid={Boolean(actionState?.errors?.activity_start_time) || undefined}
                className="glass-input w-full rounded-xl px-4 py-3 text-[13px] md:text-[14px]"
              />
              {actionState?.errors?.activity_start_time && (
                <p className="mt-1 text-[12px] text-red-600">{actionState.errors.activity_start_time}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">종료 시간</label>
              <input
                type="time"
                name="activity_end_time"
                required
                aria-invalid={Boolean(actionState?.errors?.activity_end_time) || undefined}
                className="glass-input  w-full rounded-xl px-4 py-3 text-[13px] md:text-[14px]"
              />
              {actionState?.errors?.activity_end_time && (
                <p className="mt-1 text-[12px] text-red-600">{actionState.errors.activity_end_time}</p>
              )}
              <p ref={timeErrorRef} className="mt-1 text-[12px] text-red-600 hidden" aria-live="assertive" />
            </div>
          </div>
        </div>

        {/* 기술 스택 */}
        <div className="space-y-4">
          <label className="block text-[14px] font-medium md:text-[15px]">사용 기술</label>
          <div className="flex flex-wrap gap-2">
            {TECH_STACKS.map((stack) => {
              const id = `stack-${stack.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;
              return (
                <div key={stack}>
                  <input id={id} type="checkbox" name="activity_stack" value={stack} className="peer sr-only" />
                  <label
                    htmlFor={id}
                    className="active:scale-[0.98] transition rounded-xl px-3 py-1.5 text-[13px] border hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)] peer-checked:bg-[rgba(138,43,226,0.3)] peer-checked:text-gray-900"
                  >
                    {stack}
                  </label>
                </div>
              );
            })}
            {customStacks.map((stack) => {
              const id = `stack-${stack.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;
              return (
                <div key={stack}>
                  <input
                    id={id}
                    type="checkbox"
                    name="activity_stack"
                    value={stack}
                    className="peer sr-only"
                    defaultChecked
                  />
                  <label
                    htmlFor={id}
                    className="active:scale-[0.98] transition rounded-xl px-3 py-1.5 text-[13px] border bg-[rgba(138,43,226,0.3)] text-gray-900"
                  >
                    {stack}
                  </label>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customStackInput}
              onChange={(e) => setCustomStackInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomStack();
                }
              }}
              className="glass-input  flex-1 rounded-xl px-4 py-2 text-[13px]"
              placeholder="직접 입력 후 Enter 또는 추가 버튼 클릭"
            />
            <button
              type="button"
              onClick={addCustomStack}
              disabled={!customStackInput.trim()}
              className={`glass-button rounded-xl px-4 py-2 text-[13px] transition-colors ${
                customStackInput.trim() ? "" : "opacity-60 cursor-not-allowed"
              }`}
            >
              추가
            </button>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">활동 소개</label>
            <textarea
              name="activity_description"
              required
              aria-invalid={Boolean(actionState?.errors?.activity_description) || undefined}
              className="h-24 w-full rounded-lg border px-3 py-2 text-[13px] md:px-4 md:py-2.5 md:text-[14px]"
              placeholder="활동 목표와 진행 방식을 소개해주세요"
            />
            {actionState?.errors?.activity_description && (
              <p className="mt-1 text-[12px] text-red-600">{actionState.errors.activity_description}</p>
            )}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex flex-col items-center justify-center gap-3 pt-4 md:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className="glass-card active:scale-[0.98] transition w-full rounded-xl border px-4 py-2.5 text-[13px] text-black/60 hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)] md:w-28 md:text-[14px]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`rounded-xl px-6 py-2.5 text-[13px] md:w-56 md:text-[14px] transition-colors ${
              isPending
                ? "bg-black/10 text-black/60 border border-black/10 shadow-none cursor-not-allowed"
                : "glass-button"
            }`}
          >
            {isPending ? "개설 중..." : "개설하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
