"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { submitInfo } from "@/actions/signup";
import Picker from "react-mobile-picker";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState<string>("");
  const [birth, setBirth] = useState<{ year: string; month: string; day: string }>({
    year: String(new Date().getFullYear() - 18),
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
    day: String(new Date().getDate()).padStart(2, "0"),
  });
  // 바텀시트용 임시 값 및 상태
  const [isBirthSheetOpen, setIsBirthSheetOpen] = useState(false);
  const [birthDraft, setBirthDraft] = useState<{ year: string; month: string; day: string }>(() => ({ ...birth }));
  const [isBirthPicked, setIsBirthPicked] = useState(false);
  const pickerBoxRef = useRef<HTMLDivElement | null>(null);
  type ActionState = {
    success?: boolean;
    message?: string;
    errors?: Record<string, string>;
  };
  const initialState: ActionState = { success: undefined, message: "", errors: {} };
  type SignupAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  const [state, action, isPending] = useActionState<ActionState, FormData>(submitInfo as SignupAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement | null>(null);
  const setFormTick = useState(0)[1];
  const [copied, setCopied] = useState(false);
  const accountLabel = "토스뱅크 1002-0702-1096 (김*연)";

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => String(currentYear - i)), [currentYear]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")), []);
  const days = useMemo(() => {
    const y = parseInt(birth.year, 10);
    const m = parseInt(birth.month, 10);
    const last = new Date(y, m, 0).getDate();
    return Array.from({ length: last }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [birth.year, birth.month]);

  // 바텀시트 내부에서 사용할 draft용 일수 계산
  const draftDays = useMemo(() => {
    const y = parseInt(birthDraft.year, 10);
    const m = parseInt(birthDraft.month, 10);
    const last = new Date(y, m, 0).getDate();
    return Array.from({ length: last }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [birthDraft.year, birthDraft.month]);

  useEffect(() => {
    const maxDay = days[days.length - 1];
    if (parseInt(birth.day, 10) > parseInt(maxDay, 10)) {
      setBirth((prev) => ({ ...prev, day: maxDay }));
    }
  }, [days, birth.day]);

  // 바텀시트 draft도 월 바뀔 때 일수 보정
  useEffect(() => {
    const maxDay = draftDays[draftDays.length - 1];
    if (parseInt(birthDraft.day, 10) > parseInt(maxDay, 10)) {
      setBirthDraft((prev) => ({ ...prev, day: maxDay }));
    }
  }, [draftDays, birthDraft.day]);

  // 바텀시트 오픈 시 배경 스크롤/오버스크롤 완전 차단
  const scrollLockRef = useRef<number>(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const body = document.body as HTMLBodyElement;
    const html = document.documentElement as HTMLElement;
    if (isBirthSheetOpen) {
      scrollLockRef.current = window.scrollY || window.pageYOffset || 0;
      body.style.position = "fixed";
      body.style.top = `-${scrollLockRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      // iOS Safari overscroll-bounce 억제
      body.style.setProperty("overscroll-behavior-y", "contain");
      html.style.setProperty("overscroll-behavior-y", "contain");
      body.style.touchAction = "none";
    } else {
      const y = scrollLockRef.current || 0;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.removeProperty("overscroll-behavior-y");
      html.style.removeProperty("overscroll-behavior-y");
      body.style.touchAction = "";
      if (y) window.scrollTo(0, y);
    }
    return () => {
      // 언마운트 보호: 스타일 원복
      const body2 = document.body as HTMLBodyElement;
      const html2 = document.documentElement as HTMLElement;
      body2.style.position = "";
      body2.style.top = "";
      body2.style.left = "";
      body2.style.right = "";
      body2.style.width = "";
      body2.style.overflow = "";
      body2.style.removeProperty("overscroll-behavior-y");
      html2.style.removeProperty("overscroll-behavior-y");
      body2.style.touchAction = "";
    };
  }, [isBirthSheetOpen]);

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function handleBirthDraftChange(value: { [name: string]: string }) {
    setBirthDraft(value as { year: string; month: string; day: string });
  }

  const openBirthSheet = () => {
    setBirthDraft({ ...birth });
    setIsBirthSheetOpen(true);
  };

  const confirmBirthSheet = () => {
    setBirth({ ...birthDraft });
    setIsBirthPicked(true);
    setIsBirthSheetOpen(false);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // 서버 액션 제출은 form 의 action 으로 처리

  console.log(isPending);

  const getFormSnapshot = useCallback(() => {
    const formEl = formRef.current;
    const fd = formEl ? new FormData(formEl) : new FormData();
    const get = (key: string) => String(fd.get(key) ?? "").trim();
    return {
      name: get("name"),
      gender: get("gender"),
      birthdate: `${birth.year}-${birth.month}-${birth.day}`,
      phone: get("phone"),
      major: get("major"),
      studentId: get("studentId"),
      status: get("status"),
      campus: get("campus"),
      reasons: (fd.getAll("reasons") || []).map((v) => String(v)).filter(Boolean),
      reasonEtc: get("reasonEtc"),
      experience: get("experience"),
    };
  }, [birth]);

  function validateStep1(values: ReturnType<typeof getFormSnapshot>) {
    const errors: Record<string, string> = {};
    const name = values.name;
    if (!name) {
      errors.name = "이름을 입력해 주세요.";
    } else {
      const nameTrim = name.replace(/\s+/g, " ");
      if (nameTrim.length < 2) errors.name = "이름은 2자 이상이어야 합니다.";
      else if (nameTrim.length > 30) errors.name = "이름이 너무 깁니다 (최대 30자)";
      else if (!/^[A-Za-z가-힣\s'-]+$/.test(nameTrim)) errors.name = "이름은 한글/영문만 입력하세요.";
    }

    if (!values.gender) {
      errors.gender = "성별을 선택해주세요.";
    }

    const year = parseInt(birth.year, 10);
    if (Number.isNaN(year) || year > 2007) {
      errors.birthdate = "2007년생 이하만 가입 가능합니다.";
    }

    const phoneDigits = values.phone;
    if (!/^010\d{8}$/.test(phoneDigits)) {
      errors.phone = "010으로 시작하는 11자리 번호를 입력해주세요.";
    }
    return errors;
  }

  function validateStep2(values: ReturnType<typeof getFormSnapshot>) {
    const errors: Record<string, string> = {};
    if (!values.major) errors.major = "학과를 입력해주세요.";
    const sid = values.studentId;
    if (!/^[12]\d{9}$/.test(sid)) errors.studentId = "학번 10자리를 입력해주세요.";
    if (!values.status) errors.status = "학적 상태를 선택해주세요.";
    if (!values.campus) errors.campus = "캠퍼스를 선택해주세요.";
    return errors;
  }

  function validateStep3(values: ReturnType<typeof getFormSnapshot>) {
    const errors: Record<string, string> = {};
    const reasons = Array.isArray(values.reasons) ? values.reasons : [];
    if (!reasons.length) {
      errors.reasons = "하나 이상 선택해주세요.";
    }
    if (reasons.includes("기타") && !values.reasonEtc) {
      errors.reasonEtc = "기타 내용을 입력해주세요.";
    }
    if (!values.experience || values.experience.trim().length < 30) errors.experience = "30자 이상 작성해주세요.";
    return errors;
  }

  function mergeErrors(...maps: Record<string, string>[]) {
    return maps.reduce((acc, m) => Object.assign(acc, m), {} as Record<string, string>);
  }

  function validateAll() {
    const snapshot = getFormSnapshot();
    return mergeErrors(validateStep1(snapshot), validateStep2(snapshot), validateStep3(snapshot));
  }

  function scrollToFirstError() {
    setTimeout(() => {
      const root = formRef.current;
      if (!root) return;
      const first = root.querySelector('[aria-invalid="true"], [data-error="true"]') as HTMLElement | null;
      if (first && typeof first.scrollIntoView === "function") {
        first.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof first.focus === "function") first.focus();
      }
    }, 0);
  }

  function handleNextStep() {
    const snapshot = getFormSnapshot();
    const errors = step === 1 ? validateStep1(snapshot) : validateStep2(snapshot);
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      scrollToFirstError();
      return;
    }
    setClientErrors({});
    nextStep();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors = validateAll();
    if (Object.keys(errors).length > 0) {
      e.preventDefault();
      setClientErrors(errors);
      const step1Keys = ["name", "gender", "birthdate", "phone"];
      const step2Keys = ["major", "studentId", "status", "campus"];
      const keys = Object.keys(errors);
      if (keys.some((k) => step1Keys.includes(k))) setStep(1);
      else if (keys.some((k) => step2Keys.includes(k))) setStep(2);
      else setStep(3);
      scrollToFirstError();
      return;
    }
    setClientErrors({});
  }

  function handleFormChange() {
    setFormTick((v) => v + 1);
  }

  const snapshotForFilled = getFormSnapshot();
  const step1Filled = Boolean(snapshotForFilled.name && snapshotForFilled.gender && snapshotForFilled.phone);
  const step2Filled = Boolean(
    snapshotForFilled.major && snapshotForFilled.studentId && snapshotForFilled.status && snapshotForFilled.campus
  );
  const step3Filled = Boolean((snapshotForFilled.reasons?.length || 0) > 0 && snapshotForFilled.experience);
  const isReasonOtherSelected = Array.isArray(snapshotForFilled.reasons)
    ? snapshotForFilled.reasons.includes("기타")
    : false;

  async function copyAccount() {
    const text = accountLabel;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {}
    }
  }

  const stepHeadingMap: Record<number, React.ReactNode> = {
    1: (
      <>
        가입을 위해 기본적인
        <br />
        인적사항을 입력해 주세요
      </>
    ),
    2: (
      <>
        성균관대학교 재적
        <br />
        관련 정보를 입력해 주세요
      </>
    ),
    3: (
      <>
        미래 부원에 대해서
        <br />더 자세히 알고 싶어요
      </>
    ),
  };

  return (
    <div className="flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-md">
        {!state?.success && step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-1 text-black/60 text-[13px] leading-[18px] hover:text-black transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden>
              <path
                d="M11 15L6 10l5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="select-none">이전으로 돌아가기</span>
          </button>
        )}
        {!state?.success ? (
          <h2 className="text-[1.3rem] leading-7.5 font-bold text-left text-neutral-800 mb-3 mt-4.5">
            {stepHeadingMap[step]}
          </h2>
        ) : (
          <h2 className="text-[1.3rem] opacity-0 leading-7.5 font-bold text-center text-neutral-800 mb-2.5">
            코밋 부원이 되신 것을 환영합니다!
          </h2>
        )}
        {!state?.success ? (
          <>
            {/* Step 1 */}
            <form
              action={action}
              ref={formRef}
              onSubmit={handleSubmit}
              onChange={handleFormChange}
              onInput={handleFormChange}
              className="w-full space-y-4 text-[15px]"
            >
              <div className={step === 1 ? "space-y-4" : "hidden"}>
                <div>
                  <label className="block text-[15px] text-neutral-700 font-medium mb-1">이름</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="홍길동"
                    className="w-full rounded-xl px-[11px] py-[13px] border border-black/10 bg-white text-black placeholder-black/60 focus:outline-none caret-purple-800"
                    aria-invalid={Boolean(clientErrors.name || state?.errors?.name)}
                  />
                  {(clientErrors.name || state?.errors?.name) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.name || state?.errors?.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[15px] text-neutral-700 font-medium mb-1">성별</label>
                  <div
                    className="flex flex-row gap-0"
                    aria-invalid={Boolean(clientErrors.gender || state?.errors?.gender)}
                  >
                    <label className="cursor-pointer">
                      <input type="radio" name="gender" value="male" className="peer sr-only" />
                      <div className="rounded-l-xl segmented-option">
                        <span className="">남성</span>
                      </div>
                    </label>
                    <label className="cursor-pointer -translate-x-0.25">
                      <input type="radio" name="gender" value="female" className="peer sr-only" />
                      <div className="rounded-r-xl segmented-option">여성</div>
                    </label>
                  </div>
                  {(clientErrors.gender || state?.errors?.gender) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.gender || state?.errors?.gender}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-neutral-700">생년월일</label>
                  {/* 트리거: 읽기 전용 입력처럼 보이는 버튼 */}
                  <div
                    ref={pickerBoxRef}
                    role="button"
                    tabIndex={0}
                    onClick={openBirthSheet}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openBirthSheet();
                      }
                    }}
                    className="w-full rounded-xl px-[11px] h-11 border border-black/10 bg-white text-neutral-900 flex items-center justify-between cursor-pointer select-none"
                    data-error={Boolean(clientErrors.birthdate || state?.errors?.birthdate) ? "true" : undefined}
                  >
                    {isBirthPicked ? (
                      <span className="text-black">{`${birth.year}-${birth.month}-${birth.day}`}</span>
                    ) : (
                      <span className="text-black/60">클릭하여 날짜 선택</span>
                    )}
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-black/60" aria-hidden>
                      <path
                        d="M7 8l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input type="hidden" name="birthdate" value={`${birth.year}-${birth.month}-${birth.day}`} />
                  {(clientErrors.birthdate || state?.errors?.birthdate) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.birthdate || state?.errors?.birthdate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-neutral-700">전화번호</label>
                  <input
                    type="tel"
                    placeholder="010-1234-5678"
                    className="w-full rounded-xl px-[11px] py-[13px] border border-black/10 bg-white text-black placeholder-black/60 focus:outline-none caret-purple-800"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    aria-invalid={Boolean(clientErrors.phone || state?.errors?.phone)}
                  />
                  <input type="hidden" name="phone" value={phone.replace(/\D/g, "")} />
                  {(clientErrors.phone || state?.errors?.phone) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.phone || state?.errors?.phone}</p>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className={step === 2 ? "space-y-4" : "hidden"}>
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-black">학과</label>
                  <input
                    name="major"
                    type="text"
                    placeholder="소프트웨어학과"
                    className="w-full rounded-xl px-[11px] py-[13px] border border-black/10 bg-white text-black placeholder-black/60 focus:outline-none caret-purple-800"
                    aria-invalid={Boolean(clientErrors.major || state?.errors?.major)}
                  />
                  {(clientErrors.major || state?.errors?.major) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.major || state?.errors?.major}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-black">학번</label>
                  <input
                    name="studentId"
                    type="text"
                    inputMode="numeric"
                    placeholder="2024001234"
                    maxLength={10}
                    className="w-full rounded-xl px-[11px] py-[13px] border border-black/10 bg-white text-black placeholder-black/60 focus:outline-none caret-purple-800"
                    aria-invalid={Boolean(clientErrors.studentId || state?.errors?.studentId)}
                  />
                  {(clientErrors.studentId || state?.errors?.studentId) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.studentId || state?.errors?.studentId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-black">학적 상태</label>
                  <div
                    className="gap-0 flex flex-row"
                    aria-invalid={Boolean(clientErrors.status || state?.errors?.status)}
                  >
                    <label className="cursor-pointer">
                      <input type="radio" name="status" value="enrolled" className="peer sr-only" />
                      <div className="rounded-l-xl segmented-option">재학</div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="status" value="graduated" className="peer sr-only" />
                      <div className="-translate-x-0.25 segmented-option">졸업</div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="status" value="on_leave" className="peer sr-only" />
                      <div className="rounded-r-xl -translate-x-0.5 segmented-option">휴학</div>
                    </label>
                  </div>
                  {(clientErrors.status || state?.errors?.status) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.status || state?.errors?.status}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-black">캠퍼스</label>
                  <div
                    className="flex flex-row gap-0"
                    aria-invalid={Boolean(clientErrors.campus || state?.errors?.campus)}
                  >
                    <label className="cursor-pointer">
                      <input type="radio" name="campus" value="seoul" className="peer sr-only" />
                      <div className="rounded-l-xl segmented-option">서울</div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="campus" value="suwon" className="peer sr-only" />
                      <div className="-translate-x-0.25 segmented-option">수원</div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="campus" value="blank" className="peer sr-only" />
                      <div className="rounded-r-xl -translate-x-0.5 segmented-option">해당없음</div>
                    </label>
                  </div>
                  {(clientErrors.campus || state?.errors?.campus) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.campus || state?.errors?.campus}</p>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className={step === 3 ? "space-y-4" : "hidden"}>
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-black">가입 이유</label>
                  <div
                    className="grid grid-cols-2 gap-1.5"
                    aria-invalid={Boolean(clientErrors.reasons || state?.errors?.reasons)}
                  >
                    {["스터디", "세미나", "프로젝트", "대회 참여", "네트워킹 & 친목", "기타"].map((label) => (
                      <label key={label} className="cursor-pointer">
                        <input type="checkbox" name="reasons" value={label} className="peer sr-only" />
                        <div className="rounded-xl segmented-option text-center">
                          <span>{label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {(clientErrors.reasons || state?.errors?.reasons) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.reasons || state?.errors?.reasons}</p>
                  )}
                </div>
                {isReasonOtherSelected && (
                  <div>
                    <label className="block text-[15px] font-medium mb-1 text-black">기타 내용</label>
                    <input
                      name="reasonEtc"
                      type="text"
                      placeholder="예: 진로 상담, 커리어 개발 등"
                      className="w-full rounded-xl px-[11px] py-[13px] border border-black/10 bg-white text-black placeholder-black/60 focus:outline-none caret-purple-800"
                      aria-invalid={Boolean(clientErrors.reasonEtc || state?.errors?.reasonEtc)}
                    />
                    {(clientErrors.reasonEtc || state?.errors?.reasonEtc) && (
                      <p className="text-red-400 text-xs mt-1">{clientErrors.reasonEtc || state?.errors?.reasonEtc}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-[15px] font-medium mb-1 text-black">개발 경험</label>
                  <textarea
                    name="experience"
                    rows={3}
                    placeholder="개발 관련 경험을 간략히 작성해주세요. (없으면 희망하는 분야, 30자 이상)"
                    className="w-full rounded-xl px-[11px] py-[13px] border border-black/10 bg-white text-black placeholder-black/60 focus:outline-none caret-purple-800"
                    aria-invalid={Boolean(clientErrors.experience || state?.errors?.experience)}
                  />
                  {(clientErrors.experience || state?.errors?.experience) && (
                    <p className="text-red-400 text-xs mt-1">{clientErrors.experience || state?.errors?.experience}</p>
                  )}
                </div>
              </div>

              {/* 안내 메시지 */}
              {state?.message && (
                <p className={`text-sm ${state?.success ? "text-green-400" : "text-red-400"}`}>{state.message}</p>
              )}

              <div className="mt-6 w-full">
                {step < 3 && (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={(step === 1 && !step1Filled) || (step === 2 && !step2Filled)}
                    className={`w-full rounded-xl h-10 flex items-center justify-center active:scale-[0.98] transition ${
                      (step === 1 && !step1Filled) || (step === 2 && !step2Filled)
                        ? "bg-neutral-400 text-gray-200"
                        : "bg-purple-500 text-neutral-800"
                    }`}
                  >
                    <span className="select-none leading-5 font-medium">다음</span>
                  </button>
                )}
                {step === 3 && (
                  <button
                    type="submit"
                    disabled={isPending || !step3Filled}
                    className={`w-full rounded-xl px-4 py-2 flex items-center justify-center gap-2 active:scale-[0.98] transition ${
                      isPending || !step3Filled
                        ? "bg-neutral-500 text-gray-200 cursor-not-allowed opacity-70"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span className="select-none">처리중...</span>
                      </>
                    ) : (
                      <span className="select-none">완료</span>
                    )}
                  </button>
                )}
              </div>
            </form>
            {/* 바텀시트 모달 */}
            {isBirthSheetOpen && (
              <div className="fixed inset-0 z-50">
                {/* 오버레이: 모바일은 닫힘 비활성화, 태블릿 이상에서는 클릭 시 닫기 */}
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto"
                  onClick={() => {
                    // 최소 태블릿(768px 이상)에서만 오버레이 클릭으로 닫기
                    if (typeof window !== "undefined" && window.innerWidth >= 768) setIsBirthSheetOpen(false);
                  }}
                  aria-hidden
                ></div>
                {/* 컨테이너: 모바일=바텀시트, 태블릿+=중앙 모달 */}
                <div
                  role="dialog"
                  aria-modal="true"
                  className="absolute left-0 right-0 bottom-0 rounded-t-2xl bg-white shadow-2xl border-t border-black/10 md:left-1/2 md:right-auto md:top-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] md:rounded-2xl md:border md:border-black/10"
                >
                  <div className="px-4.5 pt-3 pb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsBirthSheetOpen(false)}
                      className="text-[15px] text-purple-700 active:opacity-70"
                    >
                      취소
                    </button>
                    <p className="text-base font-semibold text-neutral-800">생년월일 선택</p>
                    <button
                      type="button"
                      onClick={confirmBirthSheet}
                      className="text-[15px] font-semibold text-purple-700 active:opacity-70"
                    >
                      완료
                    </button>
                  </div>
                  <div className="relative h-50 px-3 pb-3">
                    {/* 중앙 하이라이트 (itemHeight와 동일 높이) */}
                    <div
                      className="pointer-events-none absolute left-4.5 right-4.5 top-1/2 -translate-y-1/2 rounded-xl bg-black/[0.04] z-10"
                      style={{ height: 36 }}
                    />
                    {/* 위/아래 그라데이션 마스크 */}
                    <div className="pointer-events-none md:hidden absolute left-0 right-0 top-0 h-20 bg-gradient-to-b from-white to-transparent z-20" />
                    <div className="pointer-events-none md:hidden absolute left-0 right-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent z-20" />
                    <div className="relative rounded-xl bg-white overflow-hidden overscroll-contain">
                      <Picker
                        className="picker-no-guides font-medium text-[18px]"
                        value={birthDraft}
                        onChange={handleBirthDraftChange}
                        wheelMode="normal"
                        height={200}
                        itemHeight={32}
                      >
                        <Picker.Column name="year">
                          {years.map((y) => (
                            <Picker.Item key={y} value={y}>
                              <span
                                className={`${
                                  birthDraft.year === y ? "text-neutral-900" : "text-neutral-500"
                                } inline-block translate-x-2`}
                              >
                                {y}
                              </span>
                            </Picker.Item>
                          ))}
                        </Picker.Column>
                        <Picker.Column name="month">
                          {months.map((m) => (
                            <Picker.Item key={m} value={m}>
                              <span className={birthDraft.month === m ? "text-neutral-900" : "text-neutral-500"}>
                                {m}
                              </span>
                            </Picker.Item>
                          ))}
                        </Picker.Column>
                        <Picker.Column name="day">
                          {draftDays.map((d) => (
                            <Picker.Item key={d} value={d}>
                              <span
                                className={`${
                                  birthDraft.day === d ? "text-neutral-900" : "text-neutral-500"
                                } inline-block -translate-x-2`}
                              >
                                {d}
                              </span>
                            </Picker.Item>
                          ))}
                        </Picker.Column>
                      </Picker>
                    </div>
                    <div className="h-2" />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-white to-purple-50 px-3 py-6 text-neutral-900 text-center">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-purple-200/40 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-purple-300/30 blur-2xl pointer-events-none" />

            <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="relative text-[16px] leading-6 font-medium">코밋 부원이 되신 것을 환영합니다!</p>
            <p className="relative mt-1 text-[13px] leading-5 text-neutral-600">
              회비 입금 확인 후 최종 가입 처리됩니다
            </p>

            <div
              className="relative mt-4 rounded-xl border border-black/10 bg-white p-3 text-left cursor-pointer select-none hover:bg-purple-50/60 transition-colors"
              role="button"
              tabIndex={0}
              onClick={copyAccount}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  copyAccount();
                }
              }}
              aria-label="계좌번호 복사"
            >
              <div className="flex justify-between flex-col text-center">
                <div>
                  <p className="text-[12px] text-neutral-500">입금 계좌</p>
                  <p className="mt-0.5 text-[14px] font-semibold tracking-tight">{accountLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyAccount();
                  }}
                  className={`rounded-lg mx-auto w-1/2 px-3 py-1.5 mt-1 ${
                    copied ? "bg-purple-400" : "bg-purple-600"
                  } text-white text-[12px] font-medium active:scale-[0.98]`}
                >
                  {copied ? "복사 완료!" : "클릭해서 복사하기"}
                </button>
              </div>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-2 text-left text-[12px]">
              <div className="rounded-xl border border-black/10 bg-white p-3">
                <p className="text-neutral-500">회비</p>
                <p className="mt-0.5 text-[14px] font-semibold">15,000원</p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-3">
                <p className="text-neutral-500">문의</p>
                <p className="mt-0.5 text-[14px] font-semibold">카카오톡 오픈톡</p>
                <p className="mt-0.5 text-[14px] font-semibold">인스타그램 DM</p>
              </div>
            </div>

            <div className="relative mt-5">
              <Link
                href="/"
                className="inline-flex items-center gap-0.5 rounded-lg pl-3.5 pr-3 py-2 text-[13px] font-medium bg-black/5 hover:bg-black/10 transition-colors"
              >
                홈으로 돌아가기
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden>
                  <path
                    d="M9 6l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
