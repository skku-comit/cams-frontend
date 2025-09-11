"use client";

import { useState, FormEvent, useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createStudyAction, type CreateStudyActionState } from "@/actions/createStudy";

const DAYS_OF_WEEK = [
  { value: "mon", label: "월요일", short: "월" },
  { value: "tue", label: "화요일", short: "화" },
  { value: "wed", label: "수요일", short: "수" },
  { value: "thurs", label: "목요일", short: "목" },
  { value: "fri", label: "금요일", short: "금" },
  { value: "sat", label: "토요일", short: "토" },
  { value: "sun", label: "일요일", short: "일" },
  { value: "undecided", label: "미정", short: "미정" },
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

type ActivityType = "study" | "project" | "session";
type ActivityLevel = "easy" | "intermediate" | "hard";

interface WeeklyPlan {
  week_index: number;
  learning_plan: string;
}

interface ActivityForm {
  activity_name: string;
  activity_type: ActivityType;
  activity_description: string;
  level: ActivityLevel | "";
  max_member: number;
  min_member: number;
  duration_week: number | null;
  day_of_week: string;
  activity_start_time: string;
  activity_end_time: string;
  activity_stack: string[];
  custom_stack: string;
  curriculum: WeeklyPlan[];
}

export default function CreateCoursePage() {
  const router = useRouter();
  const timeErrorRef = useRef<HTMLParagraphElement>(null);
  const initialActionState: CreateStudyActionState = { success: false };
  const [actionState, formAction, isPending] = useActionState(createStudyAction, initialActionState);
  const [formData, setFormData] = useState<ActivityForm>({
    activity_name: "",
    activity_type: "study",
    activity_description: "",
    level: "",
    max_member: 8,
    min_member: 2,
    duration_week: null,
    day_of_week: "",
    activity_start_time: "",
    activity_end_time: "",
    activity_stack: [],
    custom_stack: "",
    curriculum: [],
  });

  // 성공 시 축하 페이지로 이동 (낙관적 네비게이션)
  useEffect(() => {
    if (!actionState?.success) return;
    const level = formData.level || "";
    const name = formData.activity_name || "";
    const params = new URLSearchParams({ name, level });
    router.push(`/studies/success?${params.toString()}`);
  }, [actionState?.success, formData.level, formData.activity_name, router]);

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

  const handleStackChange = (stack: string) => {
    setFormData((prev) => ({
      ...prev,
      activity_stack: prev.activity_stack.includes(stack)
        ? prev.activity_stack.filter((s) => s !== stack)
        : [...prev.activity_stack, stack],
    }));
  };

  const addCustomStack = () => {
    if (formData.custom_stack && !formData.activity_stack.includes(formData.custom_stack)) {
      setFormData((prev) => ({
        ...prev,
        activity_stack: [...prev.activity_stack, prev.custom_stack],
        custom_stack: "",
      }));
    }
  };

  const handleDurationChange = (weeks: number) => {
    setFormData((prev) => ({
      ...prev,
      duration_week: weeks,
      curriculum:
        weeks > 0
          ? Array(weeks)
              .fill(null)
              .map((_, i) => ({
                week_index: i + 1,
                learning_plan: prev.curriculum[i]?.learning_plan || "",
              }))
          : [],
    }));
  };

  const handleCurriculumChange = (week: number, plan: string) => {
    setFormData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((item) => (item.week_index === week ? { ...item, learning_plan: plan } : item)),
    }));
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
        {/* 숨김 필드: 서버로 전송해야 하는 상태 값들 */}
        <input type="hidden" name="activity_type" value={formData.activity_type} />
        <input type="hidden" name="min_member" value={formData.min_member} />
        <div className="sr-only">
          {formData.activity_stack.map((s) => (
            <input key={s} type="hidden" name="activity_stack" value={s} />
          ))}
        </div>

        {/* 서버 메시지는 성공 페이지에서 노출 */}
        {/* 활동 유형 선택 */}
        {/* <div className="space-y-2">
          <label className="block text-[14px] font-medium md:text-[15px]">활동 유형</label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {["study", "project", "session"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, activity_type: type as ActivityType }))}
                className={`glass-card active:scale-[0.98] transition rounded-xl border p-3 text-[13px] md:p-4 md:text-[14px] ${
                  formData.activity_type === type
                    ? "bg-[rgba(138,43,226,0.35)] text-gray-900"
                    : "hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)]"
                }`}
              >
                {type === "study" && "📚 스터디"}
                {type === "project" && "💻 프로젝트"}
                {type === "session" && "🎯 세션"}
              </button>
            ))}
          </div>
        </div> */}

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
              value={formData.activity_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, activity_name: e.target.value }))}
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

          <div aria-required="true">
            <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">난이도</label>
            <div className="grid grid-cols-3 gap-3">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, level: level as ActivityLevel }))}
                  className={`opacity-100 active:scale-[0.98] transition rounded-xl border px-3 py-2 text-[13px] md:text-[14px] ${
                    formData.level === level
                      ? "bg-[rgba(138,43,226,0.35)] text-gray-900"
                      : "hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)]"
                  }`}
                >
                  {level === "easy" && "초급"}
                  {level === "intermediate" && "중급"}
                  {level === "hard" && "고급"}
                </button>
              ))}
              {/* 시맨틱 라디오(시각적으로 숨김) */}
              <div className="sr-only">
                {["easy", "intermediate", "hard"].map((level, idx) => (
                  <input
                    key={level}
                    type="radio"
                    name="level"
                    value={level}
                    checked={formData.level === (level as ActivityLevel)}
                    onChange={() => setFormData((prev) => ({ ...prev, level: level as ActivityLevel }))}
                    required={idx === 0}
                    readOnly
                  />
                ))}
              </div>
            </div>
            {actionState?.errors?.level && <p className="mt-1 text-[12px] text-red-600">{actionState.errors.level}</p>}
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
                value={formData.max_member}
                onChange={(e) => setFormData((prev) => ({ ...prev, max_member: Number(e.target.value) }))}
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
                {[4, 8, 12, 16].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleDurationChange(w)}
                    className={`active:scale-[0.98] transition rounded-xl border px-3 py-2 text-[13px] md:text-[14px] ${
                      formData.duration_week === w
                        ? "bg-[rgba(138,43,226,0.35)] text-gray-900"
                        : "hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)]"
                    }`}
                  >
                    {w}주
                  </button>
                ))}
                {/* 시맨틱 라디오(시각적으로 숨김) */}
                <div className="sr-only">
                  {[4, 8, 12, 16].map((w, idx) => (
                    <input
                      key={w}
                      type="radio"
                      name="duration_week"
                      value={String(w)}
                      checked={formData.duration_week === w}
                      onChange={() => handleDurationChange(w)}
                      required={idx === 0}
                      readOnly
                    />
                  ))}
                </div>
              </div>
              {actionState?.errors?.duration_week && (
                <p className="mt-1 text-[12px] text-red-600">{actionState.errors.duration_week}</p>
              )}
            </div>
          </div>

          <div aria-required="true">
            <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">활동 요일</label>
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, day_of_week: day.value }))}
                  className={`shrink-0 active:scale-[0.98] transition rounded-xl border px-2 py-1 text-[12px] ${
                    formData.day_of_week === day.value
                      ? "bg-[rgba(138,43,226,0.35)] text-gray-900"
                      : "hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)]"
                  }`}
                >
                  {day.short}
                </button>
              ))}
              {/* 시맨틱 라디오(시각적으로 숨김) */}
              <div className="sr-only">
                {DAYS_OF_WEEK.map((day, idx) => (
                  <input
                    key={day.value}
                    type="radio"
                    name="day_of_week"
                    value={day.value}
                    checked={formData.day_of_week === day.value}
                    onChange={() => setFormData((prev) => ({ ...prev, day_of_week: day.value }))}
                    required={idx === 0}
                    readOnly
                  />
                ))}
              </div>
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
                value={formData.activity_start_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, activity_start_time: e.target.value }))}
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
                value={formData.activity_end_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, activity_end_time: e.target.value }))}
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
            {TECH_STACKS.map((stack) => (
              <button
                key={stack}
                type="button"
                onClick={() => handleStackChange(stack)}
                className={`active:scale-[0.98] transition rounded-xl px-3 py-1.5 text-[13px] border ${
                  formData.activity_stack.includes(stack)
                    ? "bg-[rgba(138,43,226,0.3)] text-gray-900"
                    : "hover:shadow-[0_0_0_2px_rgba(0,0,0,0.12)]"
                }`}
              >
                {stack}
              </button>
            ))}
            {formData.activity_stack
              .filter((stack) => !KNOWN_STACKS.includes(stack))
              .map((stack) => (
                <button
                  key={stack}
                  type="button"
                  onClick={() => handleStackChange(stack)}
                  className="active:scale-[0.98] transition rounded-xl px-3 py-1.5 text-[13px] border bg-[rgba(138,43,226,0.3)] text-gray-900"
                >
                  {stack}
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.custom_stack}
              onChange={(e) => setFormData((prev) => ({ ...prev, custom_stack: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (formData.custom_stack && !formData.activity_stack.includes(formData.custom_stack)) {
                    setFormData((prev) => ({
                      ...prev,
                      activity_stack: [...prev.activity_stack, prev.custom_stack],
                      custom_stack: "",
                    }));
                  }
                }
              }}
              className="glass-input  flex-1 rounded-xl px-4 py-2 text-[13px]"
              placeholder="직접 입력 후 Enter 또는 추가 버튼 클릭"
            />
            <button
              type="button"
              onClick={addCustomStack}
              disabled={!formData.custom_stack}
              className={`glass-button rounded-xl px-4 py-2 text-[13px] transition-colors ${
                formData.custom_stack ? "" : "opacity-60 cursor-not-allowed"
              }`}
            >
              추가
            </button>
          </div>
        </div>

        {/* 커리큘럼 섹션 추가 */}
        {/* <div className="space-y-4">
          <label className="block text-[14px] font-medium md:text-[15px]">주차별 커리큘럼</label>
          <div className="space-y-3">
            {formData.curriculum.map((week) => (
              <div key={week.week_index} className="space-y-2">
                <label className="block text-[13px] text-gray-600">{week.week_index}주차</label>
                <textarea
                  value={week.learning_plan}
                  onChange={(e) => handleCurriculumChange(week.week_index, e.target.value)}
                  className="glass-input min-h-[30px] w-full rounded-xl px-3 py-2 text-[13px]"
                  placeholder={`${week.week_index}주차 학습 계획을 입력하세요`}
                />
              </div>
            ))}
          </div>
        </div> */}

        {/* 상세 정보 */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[14px] font-medium md:text-[15px]">활동 소개</label>
            <textarea
              name="activity_description"
              required
              aria-invalid={Boolean(actionState?.errors?.activity_description) || undefined}
              value={formData.activity_description}
              onChange={(e) => setFormData((prev) => ({ ...prev, activity_description: e.target.value }))}
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
