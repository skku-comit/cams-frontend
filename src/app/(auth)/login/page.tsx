"use client";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { submitLogin } from "@/actions/login";

type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const initialState: ActionState = { success: undefined, message: "", errors: {} };
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    submitLogin as (prev: ActionState, formData: FormData) => Promise<ActionState>,
    initialState
  );

  // 미들웨어에서 needAuth=1로 온 경우 안내 표시
  const needAuth = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("needAuth") === "1";

  useEffect(() => {
    if (needAuth) {
      try {
        alert("로그인이 필요한 페이지입니다. 로그인 후 이용해주세요.");
      } catch {}
    }
  }, [needAuth]);

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card">
        <h2 className="text-neutral-900 text-2xl font-bold mb-2 text-center mt-4">로그인</h2>
        <p className="text-neutral-600 mb-6 text-center">학번과 비밀번호로 로그인하세요</p>

        <form action={action} className="space-y-4">
          <input
            type="hidden"
            name="next"
            value={typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("from") || "/" : "/"}
          />
          {needAuth && (
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-neutral-800 text-sm">
              로그인 후 이용 가능한 페이지입니다.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-800">아이디 (학번)</label>
            <input
              name="studentId"
              type="text"
              inputMode="numeric"
              placeholder="2024001234"
              maxLength={10}
              className="w-full rounded-xl px-4 py-3 border border-black/10 bg-white text-neutral-900 "
              aria-invalid={Boolean(state?.errors?.studentId)}
            />
            {state?.errors?.studentId && <p className="text-red-400 text-xs mt-1">{state.errors.studentId}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-neutral-800">비밀번호 (생일 6자리)</label>
            <input
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="040826"
              className="w-full rounded-xl px-4 py-3 pr-12 border border-black/10 bg-white text-neutral-900 "
              aria-invalid={Boolean(state?.errors?.password)}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 bottom-3.5 text-neutral-600 text-sm"
            >
              {showPw ? "숨김" : "표시"}
            </button>
            {state?.errors?.password && <p className="text-red-400 text-xs mt-1">{state.errors.password}</p>}
          </div>

          {state?.message && (
            <p className={`text-sm ${state?.success ? "text-green-400" : "text-red-400"}`}>{state.message}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl py-3 font-semibold active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                처리중...
              </>
            ) : (
              "로그인"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
