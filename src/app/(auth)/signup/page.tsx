"use client";
import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { submitInfo } from "@/actions/signup";
import Picker from "react-mobile-picker";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState<string>("");
  const [birth, setBirth] = useState<{ year: string; month: string; day: string }>({
    year: String(new Date().getFullYear()),
    month: "01",
    day: "01",
  });
  type ActionState = {
    success?: boolean;
    message?: string;
    errors?: Record<string, string>;
  };
  const initialState: ActionState = { success: undefined, message: "", errors: {} };
  type SignupAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  const [state, action, isPending] = useActionState<ActionState, FormData>(submitInfo as SignupAction, initialState);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => String(currentYear - i)), [currentYear]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")), []);
  const days = useMemo(() => {
    const y = parseInt(birth.year, 10);
    const m = parseInt(birth.month, 10);
    const last = new Date(y, m, 0).getDate();
    return Array.from({ length: last }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [birth.year, birth.month]);

  useEffect(() => {
    const maxDay = days[days.length - 1];
    if (parseInt(birth.day, 10) > parseInt(maxDay, 10)) {
      setBirth((prev) => ({ ...prev, day: maxDay }));
    }
  }, [days, birth.day]);

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function handleBirthChange(value: { [name: string]: string }) {
    setBirth(value as { year: string; month: string; day: string });
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // 서버 액션 제출은 form 의 action 으로 처리

  console.log(isPending);

  const stepHeadingMap: Record<number, string> = {
    1: "기본적인 인적사항을 입력해 주세요",
    2: "학교 재적 관련 정보를 입력해 주세요",
    3: "미래 부원에 대해 더 자세히 알고 싶어요",
  };

  return (
    <div className="flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-md">
        {!state?.success ? (
          <h2 className="text-[1.3rem] leading-7.5 font-bold text-left text-black mb-2.5">{stepHeadingMap[step]}</h2>
        ) : (
          <h2 className="text-[1.3rem] leading-7.5 font-bold text-center text-black mb-2.5">코밋 부원이 되신 것을 환영합니다!</h2>
        )}
        {!state?.success ? (
          <>
            <div className="w-full h-1 bg-black/20 rounded-full mb-6">
              <div
                className="h-1 bg-indigo-500 rounded-full transition-all"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
            {/* Step 1 */}
            <form action={action} className="flex w-full">
              <div className={step === 1 ? "space-y-4" : "hidden"}>
                <div>
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="홍길동"
                    className="glass-input focus-ring-primary w-full rounded-xl px-4 py-3"
                    aria-invalid={Boolean(state?.errors?.name)}
                  />
                  {state?.errors?.name && <p className="text-red-400 text-xs mt-1">{state.errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">성별</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="gender" value="male" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">남성</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="gender" value="female" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">여성</span>
                    </label>
                  </div>
                  {state?.errors?.gender && <p className="text-red-400 text-xs mt-1">{state.errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">생년월일</label>
                  <div className="glass-input w-full rounded-xl px-2 py-2 text-black overflow-hidden">
                    <Picker value={birth} onChange={handleBirthChange} wheelMode="normal" height={44} itemHeight={44}>
                      <Picker.Column name="year">
                        {years.map((y) => (
                          <Picker.Item key={y} value={y}>
                            {y}
                          </Picker.Item>
                        ))}
                      </Picker.Column>
                      <Picker.Column name="month">
                        {months.map((m) => (
                          <Picker.Item key={m} value={m}>
                            {m}
                          </Picker.Item>
                        ))}
                      </Picker.Column>
                      <Picker.Column name="day">
                        {days.map((d) => (
                          <Picker.Item key={d} value={d}>
                            {d}
                          </Picker.Item>
                        ))}
                      </Picker.Column>
                    </Picker>
                  </div>
                  <input type="hidden" name="birthdate" value={`${birth.year}-${birth.month}-${birth.day}`} />
                  {state?.errors?.birthdate && <p className="text-red-400 text-xs mt-1">{state.errors.birthdate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">전화번호</label>
                  <input
                    type="tel"
                    placeholder="010-1234-5678"
                    className="glass-input focus-ring-primary w-full rounded-xl px-4 py-3 text-black placeholder-black/60"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    aria-invalid={Boolean(state?.errors?.phone)}
                  />
                  <input type="hidden" name="phone" value={phone.replace(/\D/g, "")} />
                  {state?.errors?.phone && <p className="text-red-400 text-xs mt-1">{state.errors.phone}</p>}
                </div>
              </div>

              {/* Step 2 */}
              <div className={step === 2 ? "space-y-4" : "hidden"}>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">학과</label>
                  <input
                    name="major"
                    type="text"
                    placeholder="컴퓨터공학"
                    className="glass-input focus-ring-primary w-full rounded-xl px-4 py-3 text-black placeholder-black/60"
                    aria-invalid={Boolean(state?.errors?.major)}
                  />
                  {state?.errors?.major && <p className="text-red-400 text-xs mt-1">{state.errors.major}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">학번</label>
                  <input
                    name="studentId"
                    type="text"
                    inputMode="numeric"
                    placeholder="2024001234"
                    maxLength={10}
                    className="glass-input focus-ring-primary w-full rounded-xl px-4 py-3 text-black placeholder-black/60"
                    aria-invalid={Boolean(state?.errors?.studentId)}
                  />
                  {state?.errors?.studentId && <p className="text-red-400 text-xs mt-1">{state.errors.studentId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">학적 상태</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="status" value="enrolled" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">재학</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="status" value="graduated" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">졸업</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="status" value="on_leave" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">휴학</span>
                    </label>
                  </div>
                  {state?.errors?.status && <p className="text-red-400 text-xs mt-1">{state.errors.status}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">캠퍼스</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="campus" value="seoul" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">서울</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="campus" value="suwon" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">수원</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="campus" value="cheon_an" className="h-4 w-4 accent-indigo-500" />
                      <span className="text-black text-sm">천안</span>
                    </label>
                  </div>
                  {state?.errors?.campus && <p className="text-red-400 text-xs mt-1">{state.errors.campus}</p>}
                </div>
              </div>

              {/* Step 3 */}
              <div className={step === 3 ? "space-y-4" : "hidden"}>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">가입 이유</label>
                  <textarea
                    name="reason"
                    rows={3}
                    placeholder="가입 동기를 자유롭게 작성해주세요."
                    className="glass-input focus-ring-primary w-full rounded-xl px-4 py-3 text-black placeholder-black/60"
                    aria-invalid={Boolean(state?.errors?.reason)}
                  />
                  {state?.errors?.reason && <p className="text-red-400 text-xs mt-1">{state.errors.reason}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">개발 경험</label>
                  <textarea
                    name="experience"
                    rows={3}
                    placeholder="개발 경험을 간략히 작성해주세요."
                    className="glass-input focus-ring-primary w-full rounded-xl px-4 py-3 text-black placeholder-black/60"
                    aria-invalid={Boolean(state?.errors?.experience)}
                  />
                  {state?.errors?.experience && <p className="text-red-400 text-xs mt-1">{state.errors.experience}</p>}
                </div>
              </div>

              {/* 안내 메시지 */}
              {state?.message && (
                <p className={`text-sm ${state?.success ? "text-green-400" : "text-red-400"}`}>{state.message}</p>
              )}

              <div className="flex justify-between mt-4">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="glass-button rounded-xl px-4 py-2 text-black">
                    뒤로
                  </button>
                ) : (
                  <div />
                )}
                {step < 3 && (
                  <button type="button" onClick={nextStep} className="glass-button rounded-xl px-4 py-2 text-black">
                    다음
                  </button>
                )}
                {step === 3 && (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="glass-button rounded-xl px-4 py-2 text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        처리중...
                      </>
                    ) : (
                      "완료"
                    )}
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          <div className="rounded-xl bg-black/10 border border-black/10 p-4 text-black text-sm">
            <p className="text-base font-semibold mb-2">회원가입 신청이 완료되었습니다.</p>
            <p className="mb-1">동아리비 입금 확인 후 최종 가입 처리됩니다.</p>
            <p>
              동아리비: <span className="font-semibold">15,000원</span> / 입금 계좌:{" "}
              <span className="font-semibold">3333-29-1234-56</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
