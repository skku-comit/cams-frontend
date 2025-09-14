"use server";
import { z } from "zod";

export type CreateStudyActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  payload?: CreateStudyPayload;
};

type StudyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER" | "ETC";

//Umm.. little too much code...? 타입 단언 하기 싫어서 런타임에서의 데이터 유효성 검사(타입가드)까지 해야 돼버림. 근데 zod도 런타임이니까 중복이네...
// const STUDY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const CAMPUSES = ["SEOUL", "SUWON", "NONE"] as const;
// type StudyLevel = (typeof STUDY_LEVELS)[number];
type Campus = (typeof CAMPUSES)[number];
// const isStudyLevel = (value: unknown): value is StudyLevel => {
//   return STUDY_LEVELS.includes(value as StudyLevel);
// };
const isCampus = (value: unknown): value is Campus => {
  return CAMPUSES.includes(value as Campus);
};
// const getValidatedLevel = (levelInput: string): StudyLevel => {
//   const upperLevel = levelInput.toUpperCase();
//   if (isStudyLevel(upperLevel)) {
//     return upperLevel; // 타입 가드를 통과했으므로 안전하게 StudyLevel 타입으로 반환
//   }
//   throw new Error(`Invalid study level provided: ${levelInput}`);
// };
const getValidatedCampus = (campusInput: string): Campus => {
  const upperCampus = campusInput.toUpperCase();
  if (isCampus(upperCampus)) {
    return upperCampus;
  }
  throw new Error(`Invalid campus provided: ${campusInput}`);
};
//Ummm

export type CreateStudyPayload = {
  title: string;
  description: string;
  level: StudyLevel;
  campus: Campus;
  max_member: number;
  imageUrl?: string;
  tags: string[];
  schedules?: Array<{
    day: DayOfWeek;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }>; // 선택하지 않으면 포함 안 함
  semester: {
    year: number;
    season: Season;
  };
};

const toUpperEnum = (v: unknown) =>
  String(v ?? "")
    .replace(/-/g, "_")
    .toUpperCase();

const timeStringToMinutes = (time: string): number | null => {
  if (!time) return null;
  const [h, m] = time.split(":");
  const hours = Number(h);
  const minutes = Number(m);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const createStudySchema = z
  .object({
    title: z.string().min(1, "스터디 이름을 입력하세요.").max(15, "스터디 이름은 15자 이하여야 합니다."),
    description: z.string().min(1, "활동 소개를 입력하세요.").max(2000, "활동 소개가 너무 깁니다."),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    campus: z.enum(["SEOUL", "SUWON", "NONE"]),
    max_member: z.coerce.number().int().min(2, "최소 2명").max(20, "최대 20명"),
    // 다중 스케줄은 동적 필드로 전송됨: schedule_{i}_{day|start|end}
    schedule_count: z.coerce.number().int().min(1).max(7),
    activity_stack: z.array(z.string()).default([]),
    // 대표 이미지: 업로드는 별도 구현. 여기서는 존재 시 타입만 확인.
    activity_image: z.custom<File | null>((val) => val === null || val instanceof File).optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    // 다중 스케줄 검증
    for (let i = 0; i < data.schedule_count; i++) {
      const rec = data as unknown as Record<string, unknown>;
      const day = String(rec[`schedule_${i}_day`] ?? "");
      const start = String(rec[`schedule_${i}_start`] ?? "");
      const end = String(rec[`schedule_${i}_end`] ?? "");

      if (!day) continue; // 미선택은 허용
      if (day !== "undecided") {
        if (!start || !end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${i + 1}번째 스케줄의 시간을 입력하세요.`,
            path: [`schedule_${i}_start`],
          });
          continue;
        }
        const s = timeStringToMinutes(start);
        const e = timeStringToMinutes(end);
        if (s != null && e != null && e <= s) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${i + 1}번째 스케줄의 종료 시간은 시작 시간보다 늦어야 합니다.`,
            path: [`schedule_${i}_end`],
          });
        }
      }
    }
  });

export async function createStudyAction(
  _prevState: CreateStudyActionState,
  formData: FormData
): Promise<CreateStudyActionState> {
  // activity_stack: FormData에서는 같은 name으로 여러 값 전달

  const formPayload: Record<string, unknown> = {
    title: String(formData.get("activity_name") || ""),
    description: String(formData.get("activity_description") || ""),
    level: String(formData.get("level") || ""),
    campus: String(formData.get("campus") || ""),
    max_member: formData.get("max_member"),
    activity_stack: formData.getAll("activity_stack").map(String),
    activity_image: ((): File | null => {
      const value = formData.get("activity_image");
      return value instanceof File && value.name ? value : null;
    })(),
    schedule_count: formData.get("schedule_count"),
  };

  // 동적 스케줄 필드 수집
  const scheduleCount = Number(formPayload.schedule_count || 0);
  for (let i = 0; i < scheduleCount; i++) {
    formPayload[`schedule_${i}_day`] = String(formData.get(`schedule_${i}_day`) || "");
    formPayload[`schedule_${i}_start`] = String(formData.get(`schedule_${i}_start`) || "");
    formPayload[`schedule_${i}_end`] = String(formData.get(`schedule_${i}_end`) || "");
  }

  const parsed = createStudySchema.safeParse(formPayload);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "form";
      // 마지막 에러 메시지 우선 적용
      errors[path] = issue.message;
    }
    return {
      success: false,
      message: "입력값을 확인해주세요.",
      errors,
    };
  }

  // 가공: 서버 전송용 Payload 생성
  const data = parsed.data;
  // 대문자 변환: signup과 동일 패턴 사용

  //년도 및 학기 설정, 디테일 추가 필요함.
  const now = new Date();
  const [month, year] = [now.getMonth() + 1, now.getFullYear()]; // 1-12, 년도
  let season = "ETC";
  if (month >= 3 && month <= 5) season = "SPRING";
  else if (month >= 6 && month <= 8) season = "SUMMER";
  else if (month >= 9 && month <= 11) season = "FALL";
  else season = "WINTER";

  // schedules 배열 구성: 'undecided' 및 불완전 행 제외, 없으면 [{}]
  const list: Array<{ day: DayOfWeek; startTime: string; endTime: string }> = [];
  for (let i = 0; i < scheduleCount; i++) {
    const day = String(formPayload[`schedule_${i}_day`] || "");
    if (!day || day === "undecided") continue;
    const start = String(formPayload[`schedule_${i}_start`] || "");
    const end = String(formPayload[`schedule_${i}_end`] || "");
    if (!start || !end) continue;
    list.push({ day: toUpperEnum(day) as DayOfWeek, startTime: start, endTime: end });
  }
  const schedules: Array<{ day: DayOfWeek; startTime: string; endTime: string }> | undefined =
    list.length > 0 ? list : undefined;

  const apiPayload: CreateStudyPayload = {
    title: data.title,
    description: data.description,
    max_member: data.max_member,
    level: data.level as StudyLevel, //요놈은 타입 단언
    campus: getValidatedCampus(data.campus), //요놈은 타입 가드
    imageUrl: "not yet implemented", // 업로드 처리 후 URL 할당 필요
    tags: data.activity_stack,
    ...(schedules ? { schedules } : {}),
    semester: {
      year: year,
      season: season as Season,
    },
  };

  // 시뮬레이션: 외부 API로 전송 (실제 엔드포인트 준비 전)
  // 기본은 httpbin으로 전송, 환경변수로 재정의 가능
  const endpoint = process.env.NEXT_PUBLIC_SIMULATED_ENDPOINT || "https://httpbin.org/post";
  let sent = false;
  try {
    console.log(apiPayload);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
      // cache: "no-store" // 필요 시 비활성화 캐싱
    });
    sent = res.ok;
  } catch (err) {
    // 시뮬레이션 실패는 낙관적 업데이트를 막지 않음
    console.error("Simulated study create POST failed", err);
  }

  return {
    success: true,
    message: sent ? "서버 전송 완료(시뮬레이션)." : "전송 시도 완료(시뮬레이션).",
    payload: apiPayload,
  };
}
