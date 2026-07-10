import type { Posting } from '@/types/posting';
import type { UserProfile, Notice, FAQ } from '@/types/mypage';

// UI 개발용 가짜 데이터. 백엔드 API 나오면 apis/posting.ts 에서 교체.
export const MOCK_POSTINGS: Posting[] = [
  {
    id: 1,
    type: 'SCHOLARSHIP',
    title: '대학원 대통령 과학 장학금',
    organization: '과학기술정보통신부',
    deadline: '2026-07-13', // D-3 (오늘 2026-07-10 기준)
    posterUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=400&fit=crop',
    isSaved: false,
    views: 1200,
    createdAt: '2026-07-09',
  },
  {
    id: 2,
    type: 'CONTEST',
    title: '제1회 CJ FEED&CARE CUBE 아이디어 공모전',
    organization: 'CJ ENM',
    deadline: '2026-07-15', // D-5
    posterUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=300&h=400&fit=crop',
    isSaved: true,
    category: '기획/아이디어',
    views: 800,
    createdAt: '2026-07-01',
  },
  {
    id: 3,
    type: 'SCHOLARSHIP',
    title: '2026 국가장학금 II유형',
    organization: '한국장학재단',
    deadline: '2026-07-19', // D-9
    posterUrl: 'https://images.unsplash.com/photo-1557425955-df376b5903c8?w=300&h=400&fit=crop',
    isSaved: false,
    views: 3500,
    createdAt: '2026-07-08',
  },
  {
    id: 4,
    type: 'SCHOLARSHIP',
    title: '행정안전부 청년 장학금',
    organization: '행정안전부',
    deadline: '2026-07-12', // D-2
    posterUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=400&fit=crop',
    isSaved: false,
    views: 900,
    createdAt: '2026-07-05',
  },
  {
    id: 5,
    type: 'CONTEST',
    title: '대기업 브랜드 마케팅 공모전',
    organization: 'CJ ENM',
    deadline: '2026-07-18', // D-8
    posterUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=400&fit=crop',
    isSaved: false,
    category: '마케팅',
    views: 2100,
    createdAt: '2026-07-07',
  },
  {
    id: 6,
    type: 'CONTEST',
    title: '2026 AI 해커톤 대회',
    organization: '네이버',
    deadline: '2026-07-22', // D-12
    posterUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&h=400&fit=crop',
    isSaved: false,
    category: 'IT/개발',
    views: 4000,
    createdAt: '2026-07-06',
  },
  {
    id: 7,
    type: 'CONTEST',
    title: '글로벌 영어 스피칭 대회',
    organization: 'YBM',
    deadline: '2026-07-25', // D-15
    posterUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=400&fit=crop',
    isSaved: false,
    category: '어학',
    views: 600,
    createdAt: '2026-07-03',
  },
  {
    id: 8,
    type: 'CONTEST',
    title: '대학생 캐릭터 디자인 공모전',
    organization: '라인프렌즈',
    deadline: '2026-07-14', // D-4
    posterUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&h=400&fit=crop',
    isSaved: false,
    category: '디자인',
    views: 1500,
    createdAt: '2026-07-02',
  },
  {
    id: 9,
    type: 'CONTEST',
    title: '지자체 홍보 영상 공모전',
    organization: '서울특별시',
    deadline: '2026-07-30', // D-20
    posterUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=300&h=400&fit=crop',
    isSaved: false,
    category: '디자인',
    views: 700,
    createdAt: '2026-07-04',
  },
  {
    id: 10,
    type: 'SCHOLARSHIP',
    title: '교내 성적우수 장학금',
    organization: '한국대학교',
    deadline: '2026-07-28', // D-18
    posterUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop',
    isSaved: false,
    views: 1100,
    createdAt: '2026-07-10',
  },
  {
    id: 11,
    type: 'SCHOLARSHIP',
    title: '동창회 장학금 지원 안내',
    organization: '동창회',
    deadline: '2026-07-11', // D-1
    posterUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&h=400&fit=crop',
    isSaved: false,
    views: 300,
    createdAt: '2026-07-09',
  },
  {
    id: 12,
    type: 'CONTEST',
    title: '2026 스타트업 기획전',
    organization: '중소벤처기업부',
    deadline: '2026-07-29', // D-19
    posterUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=400&fit=crop',
    isSaved: false,
    category: '기획/아이디어',
    views: 950,
    createdAt: '2026-07-05',
  },
  {
    id: 13,
    type: 'CONTEST',
    title: '전국 대학생 코딩 경진대회',
    organization: '카카오',
    deadline: '2026-07-17', // D-7
    posterUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=300&h=400&fit=crop',
    isSaved: false,
    category: 'IT/개발',
    views: 2800,
    createdAt: '2026-07-08',
  },
  {
    id: 14,
    type: 'SCHOLARSHIP',
    title: '다문화 가정 교육 봉사단 장학금',
    organization: '러브투게더 재단',
    deadline: '2026-08-05', // D-26
    posterUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=400&fit=crop',
    isSaved: false,
    views: 450,
    createdAt: '2026-07-01',
  },
  {
    id: 15,
    type: 'SCHOLARSHIP',
    title: '푸른등대 기부 장학금',
    organization: '한국장학재단',
    deadline: '2026-07-26', // D-16
    posterUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&h=400&fit=crop',
    isSaved: false,
    views: 1800,
    createdAt: '2026-07-07',
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
