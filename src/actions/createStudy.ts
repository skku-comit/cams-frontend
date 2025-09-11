"use server";
import { z } from "zod";

export type CreateStudyActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  payload?: CreateStudyPayload;
};

export type CreateStudyPayload = {
  title: string;
  description: string;
  leaderId: string;
  level: StudyLevelAPI;
  campus: CampusAPI;
  imageUrl?: string;
  tags: string[];
  schedule?: Array<{
    day: ScheduleDay;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }>;
  semester: {
    year: number;
    season: SemesterSeason;
  };
};

export type StudyLevelAPI = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CampusAPI = "SEOUL" | "SUWON" | "NONE";
export type ScheduleDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type SemesterSeason = "SPRING" | "SUMMER" | "FALL" | "WINTER" | "ETC";

const toUpperEnum = (v: unknown) =>
  String(v ?? "")
    .replace(/-/g, "_")
    .toUpperCase();

const toFullDay = (v: unknown): ScheduleDay | undefined => {
  const s = toUpperEnum(v);
  switch (s) {
    case "MON":
      return "MONDAY";
    case "TUE":
      return "TUESDAY";
    case "WED":
      return "WEDNESDAY";
    case "THU":
    case "THURS":
      return "THURSDAY";
    case "FRI":
      return "FRIDAY";
    case "SAT":
      return "SATURDAY";
    case "SUN":
      return "SUNDAY";
    default:
      return undefined;
  }
};

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
    activity_name: z.string().min(1, "스터디 이름을 입력하세요.").max(15, "스터디 이름은 15자 이하여야 합니다."),
    activity_type: z.enum(["study", "project", "session"]).default("study"),
    activity_description: z.string().min(1, "활동 소개를 입력하세요.").max(2000, "활동 소개가 너무 깁니다."),
    level: z.enum(["easy", "intermediate", "hard"]),
    campus: z.enum(["SEOUL", "SUWON", "NONE"]),
    max_member: z.coerce.number().int().min(2, "최소 2명").max(20, "최대 20명"),
    min_member: z.coerce.number().int().min(1).max(20).optional(),
    duration_week: z.coerce
      .number()
      .int()
      .refine((v) => [4, 8, 12, 16].includes(v), { message: "진행 기간을 선택하세요." }),
    day_of_week: z.enum(["mon", "tue", "wed", "thurs", "fri", "sat", "sun", "undecided"]),
    activity_start_time: z.string().min(1, "시작 시간을 선택하세요."),
    activity_end_time: z.string().min(1, "종료 시간을 선택하세요."),
    activity_stack: z.array(z.string()).default([]),
    // 대표 이미지: 업로드는 별도 구현. 여기서는 존재 시 타입만 확인.
    activity_image: z.custom<File | null>((val) => val === null || val instanceof File).optional(),
  })
  .superRefine((data, ctx) => {
    const start = timeStringToMinutes(data.activity_start_time);
    const end = timeStringToMinutes(data.activity_end_time);
    if (start != null && end != null && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "종료 시간은 시작 시간보다 늦어야 합니다.",
        path: ["activity_end_time"],
      });
    }
  });

export async function createStudyAction(
  _prevState: CreateStudyActionState,
  formData: FormData
): Promise<CreateStudyActionState> {
  // activity_stack: FormData에서는 같은 name으로 여러 값 전달

  const formPayload = {
    activity_name: String(formData.get("activity_name") || ""),
    activity_type: String(formData.get("activity_type") || "study"),
    activity_description: String(formData.get("activity_description") || ""),
    level: String(formData.get("level") || ""),
    campus: String(formData.get("campus") || ""),
    max_member: formData.get("max_member"),
    min_member: formData.get("min_member") ?? 2,
    duration_week: formData.get("duration_week"),
    day_of_week: String(formData.get("day_of_week") || ""),
    activity_start_time: String(formData.get("activity_start_time") || ""),
    activity_end_time: String(formData.get("activity_end_time") || ""),
    activity_stack: formData.getAll("activity_stack").map(String),
    activity_image: formData.get("activity_image") instanceof File,
  };

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
  let season: SemesterSeason = "ETC";
  if (month >= 3 && month <= 5) season = "SPRING";
  else if (month >= 6 && month <= 8) season = "SUMMER";
  else if (month >= 9 && month <= 11) season = "FALL";
  else season = "WINTER";

  const fullDay = toFullDay(data.day_of_week);
  const schedule: CreateStudyPayload["schedule"] =
    fullDay && data.activity_start_time && data.activity_end_time
      ? [
          {
            day: fullDay,
            startTime: data.activity_start_time,
            endTime: data.activity_end_time,
          },
        ]
      : [];

  const apiPayload: CreateStudyPayload = {
    title: data.activity_name,
    description: data.activity_description,
    leaderId: process.env.MOCK_LEADER_ID || "", // 세션에서 채워야 함 -> 아님. 헤더에 로그인정보 포함되어서 바디에는 필요없음
    level: data.level as StudyLevelAPI,
    campus: data.campus as CampusAPI,
    imageUrl: process.env.MOCK_IMAGE_URL || "", // 업로드 처리 후 URL 할당 필요
    tags: data.activity_stack,
    schedule,
    semester: {
      year: year,
      season: season,
    },
  };

  // 시뮬레이션: 외부 API로 전송 (실제 엔드포인트 준비 전)
  // 기본은 httpbin으로 전송, 환경변수로 재정의 가능
  const endpoint = process.env.NEXT_PUBLIC_SIMULATED_ENDPOINT || "https://httpbin.org/post";
  let sent = false;
  try {
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
