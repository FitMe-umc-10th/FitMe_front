import type { Posting } from '@/types/posting';
import type { UserProfile, Notice, FAQ } from '@/types/mypage';

// UI 개발용 가짜 데이터. 백엔드 API 나오면 apis/posting.ts 에서 교체.
export const MOCK_POSTINGS: Posting[] = [
  {
    id: 1,
    type: 'SCHOLARSHIP',
    title: '2026년 2학기 국가장학금 II유형 신청 안내',
    organization: '한국장학재단',
    deadline: '2026-07-10',
    posterUrl: 'https://placehold.co/300x400?text=KOSAF',
    isSaved: false,
  },
  {
    id: 2,
    type: 'CONTEST',
    title: '2026 대학생 마케팅 아이디어 공모전',
    organization: 'CJ ENM',
    deadline: '2026-07-21',
    posterUrl: 'https://placehold.co/300x400?text=Contest',
    isSaved: true,
  },
  {
    id: 3,
    type: 'SCHOLARSHIP',
    title: '교내 성적우수 장학금 신청',
    organization: '동국대학교',
    deadline: '2026-07-28',
    posterUrl: 'https://placehold.co/300x400?text=Univ',
    isSaved: false,
  },
];

export const MOCK_USER_PROFILE: UserProfile = {
  id: 1,
  name: '홍길동',
  university: '한국대학교 서울캠퍼스',
  grade: '22학번',
  profileImageUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  gpa: 4.06,
  incomeBracket: 8,
  fieldsOfInterest: ['마케팅', '기획/아이디어', '디자인', 'IT/개발'],
  activityRegion: '서울특별시 전체',
  activitySummary: {
    completedCount: 5,
    accumulatedScholarship: 2500000,
    pendingCount: 2,
  },
  notificationSettings: {
    email: 'contact@fitme.com',
    appPushEnabled: true,
    customRecommendationEnabled: true,
    deadlineReminderEnabled: true,
  },
};

export const MOCK_NOTICES: Notice[] = [
  {
    id: 1,
    type: '안내',
    title: 'FitMe 베타 서비스 정식 오픈 안내',
    createdAt: '2시간 전',
    content:
      '안녕하세요, FitMe 팀입니다. 많은 분들이 기다려 주셨던 FitMe 베타 서비스가 마침내 정식 오픈되었습니다! 맞춤형 장학금 및 공모전 매칭 서비스를 편리하게 이용해 보세요. 앞으로 더 좋은 서비스로 보답하겠습니다.',
    isNew: true,
  },
  {
    id: 2,
    type: '안내',
    title: '맞춤 공고 추천 알고리즘 업데이트',
    createdAt: '어제',
    content:
      '사용자 맞춤형 장학금/공모전 공고의 추천 알고리즘이 한층 정교해졌습니다. 이제 학점, 소득구간 및 설정하신 관심 카테고리에 맞춰 더욱 나에게 딱 맞는 핏한 공고들을 최상단에서 찾아보실 수 있습니다. 지금 바로 홈 화면에서 확인해 보세요!',
    isNew: true,
  },
  {
    id: 3,
    type: '안내',
    title: '서버 정기 점검에 따른 서비스 이용 제한',
    createdAt: '3일 전',
    content:
      '안정적인 서비스 운영을 위해 서버 정기 점검이 예정되어 있습니다. 점검 시간 동안 서비스 접속 및 공고 조회 등이 일시 중단될 예정이오니 참고하시어 이용에 불편이 없으시길 바랍니다.\n- 일시: 2026년 7월 12일 02:00 ~ 06:00 (약 4시간)',
    isNew: false,
  },
];

export const MOCK_FAQS: FAQ[] = [
  {
    id: 1,
    question: '장학금 신청은 어떻게 하나요?',
    answer:
      'FitMe에서 제공하는 각 장학금 공고의 상세 페이지 내 [공식 홈페이지로 이동] 버튼을 통해 주최 기관 사이트로 직접 접속하여 온라인 신청을 진행하실 수 있습니다. 각 장학금마다 제출 서류가 상이하므로 상세 요강을 꼭 참고해 주세요.',
  },
  {
    id: 2,
    question: '소득구간은 어디서 확인하고 입력하나요?',
    answer:
      '한국장학재단 홈페이지에서 나의 학기별 소득구간 분위(1~10구간)를 확인하실 수 있으며, 확인된 소득구간을 내 프로필 수정 화면의 [학업 정보] 항목에 입력해 주시면 맞춤 공고 추천에 반영됩니다.',
  },
  {
    id: 3,
    question: '1:1 문의 답변은 어디서 확인하나요?',
    answer:
      '1:1 문의 접수 시 작성해 주신 이메일 주소로 답변이 전송됩니다. 영업일 기준 보통 1~2일 내에 순차적으로 답변을 받아보실 수 있습니다.',
  },
];
