"use server";

import { z } from "zod";

// 회원가입 스키마 (폼의 name과 일치)
const signupSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "성별을 선택하세요" }),
  }),
  birthdate: z.string().min(1, "생년월일은 필수입니다"),
  phone: z.string().min(9, "전화번호를 올바르게 입력하세요"),
  major: z.string().min(1, "학과를 입력하세요"),
  studentId: z.string().regex(/^\d{10}$/, { message: "학번은 숫자 10자리여야 합니다" }),
  status: z.enum(["enrolled", "graduated", "on_leave"], {
    errorMap: () => ({ message: "학적 상태를 선택하세요" }),
  }),
  campus: z.enum(["seoul", "suwon", "cheon_an"], {
    errorMap: () => ({ message: "캠퍼스를 선택하세요" }),
  }),
  reason: z.string().min(1, "가입 이유를 입력하세요"),
  experience: z.string().min(1, "개발 경험을 입력하세요"),
});

export async function submitInfo(prevState, formData) {
  // 네트워크 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const rawData = {
      name: formData.get("name") ?? "",
      gender: formData.get("gender") ?? "",
      birthdate: formData.get("birthdate") ?? "",
      phone: formData.get("phone") ?? "",
      major: formData.get("major") ?? "",
      studentId: formData.get("studentId") ?? "",
      status: formData.get("status") ?? "",
      campus: formData.get("campus") ?? "",
      reason: formData.get("reason") ?? "",
      experience: formData.get("experience") ?? "",
    };

    const validated = signupSchema.safeParse(rawData);

    if (!validated.success) {
      const errorMap = validated.error.issues.reduce((acc, issue) => {
        const key = issue.path.join(".");
        if (typeof key === "string") acc[key] = issue.message;
        return acc;
      }, {});

      return {
        success: false,
        message: "입력한 정보를 확인해주세요.",
        errors: errorMap,
      };
    }

    // 백엔드 API 페이로드 매핑
    const toUpperEnum = (v) =>
      String(v || "")
        .replace(/-/g, "_")
        .toUpperCase();
    const payload = {
      name: validated.data.name,
      studentId: validated.data.studentId,
      birthDate: validated.data.birthdate, // YYYY-MM-DD
      phoneNumber: validated.data.phone, // 숫자만
      gender: toUpperEnum(validated.data.gender), // MALE/FEMALE
      department: validated.data.major,
      enrollmentStatus: toUpperEnum(validated.data.status), // ENROLLED/GRADUATED/ON_LEAVE
      campus: toUpperEnum(validated.data.campus), // SEOUL/SUWON/CHEON_AN
      joinReason: validated.data.reason,
      devExperience: validated.data.experience,
      isFeePaid: false,
    };

    const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
    const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");
    if (!API_BASE_URL) {
      console.error("[회원가입] API base URL 미설정: NEXT_PUBLIC_BACKEND_API_URL");
      return {
        success: false,
        message: "서버 설정 오류: API 주소가 설정되지 않았습니다.",
        errors: {},
      };
    }
    const endpoint = `${API_BASE_URL}/auth/signup`;

    console.log("[회원가입] API 요청:", {
      endpoint,
      payload,
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    console.log("[회원가입] API 응답 상태:", res.status, res.statusText);

    if (!res.ok) {
      let msg = "회원가입 요청에 실패했습니다.";
      let fieldErrors = {};
      try {
        const data = await res.json();
        console.log("[회원가입] API 에러 응답:", data);
        if (data?.message) msg = data.message;
        if (data?.errors && typeof data.errors === "object") fieldErrors = data.errors;
      } catch (parseError) {
        console.log("[회원가입] 응답 파싱 실패:", parseError);
      }
      return {
        success: false,
        message: msg,
        errors: fieldErrors,
      };
    }

    let responseBody = null;
    try {
      responseBody = await res.json();
      console.log("[회원가입] API 성공 응답:", responseBody);
    } catch (parseError) {
      console.log("[회원가입] 성공 응답 파싱 실패:", parseError);
    }

    return {
      success: true,
      message: responseBody?.message || "회원가입 신청이 접수되었습니다.",
      errors: {},
    };
  } catch (error) {
    console.error("[회원가입] 예외 발생:", error);
    return {
      success: false,
      message: "알 수 없는 오류가 발생했습니다.",
      errors: {},
    };
  }
}
