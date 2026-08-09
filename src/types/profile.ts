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
  name: string;
  university: string;
  grade: string;
  profileImageUrl: string;
  gpa: number;
  incomeBracket: number;
  fieldsOfInterest?: string[];
  activityRegion?: string;
  activitySummary?: {
    completedCount: number;
    accumulatedScholarship: number;
    pendingCount: number;
  };
  notificationSettings?: {
    email: string;
    appPushEnabled: boolean;
    customRecommendationEnabled: boolean;
    deadlineReminderEnabled: boolean;
  };
}

export interface RevertImageUrlDTO {
  uploadUrl: string;
  fileUrl: string;
}

export enum ImageType {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  GIF = 'image/gif',
  BMP = 'image/bmp',
  WEBP = 'image/webp',
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
