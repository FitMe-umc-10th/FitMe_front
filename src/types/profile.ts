interface ProfileDTO {
  name: string;
  universityName: string;
  profileImageUrl: string;
}

interface ActivitySummaryDTO {
  completedApplicationCount: number;
  totalScholarshipAmount: number;
  pendingResultCount: number;
}

// mypage에서 쓰일 interface
export interface MyPageDTO {
  profile: ProfileDTO;
  activitySummary: ActivitySummaryDTO;
}

export interface ProfileDetailDTO {
  gpa: number;
  incomeBracket: number;
  region: string;
  interests: number[];
  profileImageUrl: string;
}

interface InterestsDTO {
  interestId: number;
  interestName: string;
  selected: boolean;
}

// mypage 수정에서 쓰일 interface
export interface ProfileSettingsDTO {
  name: string;
  universityName: string;
  profileImageUrl: string;
  gpa: number;
  incomeBracket: number;
  region: string;
  interests: InterestsDTO[];
}

export interface UserProfile {
  id: number;
  // name: string;
  // university: string;
  grade: string;
  // profileImageUrl: string;
  // gpa: number; // 예: 4.06
  // incomeBracket: number; // 예: 8
  // fieldsOfInterest: string[]; // 예: ['마케팅', '기획/아이디어', '디자인', 'IT/개발']
  // activityRegion: string; // 예: "서울특별시 전체"
  // activitySummary: {
  //   completedCount: number; // 지원 완료 횟수
  //   accumulatedScholarship: number; // 누적 장학금 (원)
  //   pendingCount: number; // 결과 대기 건수
  // };
  // notificationSettings: {
  //   email: string;
  //   appPushEnabled: boolean;
  //   customRecommendationEnabled: boolean;
  //   deadlineReminderEnabled: boolean;
  // };
}

export interface Notice {
  id: number;
  type: string; // 예: "안내"
  title: string;
  createdAt: string; // 예: "2시간 전", "어제", "3일 전"
  content: string;
  isNew: boolean;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}
