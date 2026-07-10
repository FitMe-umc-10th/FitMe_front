import type { Posting } from '@/types/posting';
import { MOCK_POSTINGS } from '@/constants/mockData';

export type HistoryStatus = 'DRAFT' | 'WAITING' | 'DOCUMENT_PASS' | 'FINAL_PASS';

export interface HistoryItem {
  id: number;
  postingId: number;
  status: HistoryStatus;
  memo: string;
  posting?: Posting;
}

// 초기 이력 데이터 (Figma 시안 기준)
export let MOCK_HISTORIES: HistoryItem[] = [
  {
    id: 1,
    postingId: 4, // 행정안전부 청년 장학금
    status: 'WAITING',
    memo: '포토폴리오 제출 완료! 면접 준비 (T1 사례 활용) 미리 할 것',
  },
  {
    id: 2,
    postingId: 5, // 대기업 브랜드 마케팅 공모전
    status: 'DOCUMENT_PASS',
    memo: '포폴 주요 내용 암기, 예상 면접 스크립트 정독, 카메라 테스트 진행..',
  },
  {
    id: 3,
    postingId: 2, // 제1회 CJ FEED&CARE CUBE 아이디어 공모전
    status: 'DRAFT',
    memo: '아이디어 기획서 초안 작성 완료. 피드백 수렴 후 수정 예정',
  },
];

// 이력 전체 가져오기 (각 이력마다 연관 공고 Join)
export const getHistoryList = async (): Promise<HistoryItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_HISTORIES.map((history) => {
    const posting = MOCK_POSTINGS.find((p) => p.id === history.postingId);
    return {
      ...history,
      posting,
    };
  });
};

// 특정 이력 상세 정보 가져오기
export const getHistoryDetail = async (id: number): Promise<HistoryItem> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const history = MOCK_HISTORIES.find((h) => h.id === id);
  if (!history) {
    throw new Error('해당 이력을 찾을 수 없습니다.');
  }
  const posting = MOCK_POSTINGS.find((p) => p.id === history.postingId);
  return {
    ...history,
    posting,
  };
};

// 이력 상태 변경 API (20% 확률로 의도적 실패 유도)
export const updateHistoryStatus = async (
  id: number,
  status: HistoryStatus
): Promise<HistoryItem> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  // 의도적인 20% 상태 변경 실패 시뮬레이션
  if (Math.random() < 0.2) {
    throw new Error('서버 에러: 상태 변경 처리에 실패하였습니다.');
  }

  const target = MOCK_HISTORIES.find((h) => h.id === id);
  if (!target) {
    throw new Error('수정할 이력을 찾을 수 없습니다.');
  }

  target.status = status;
  return target;
};

// 이력 메모 업데이트 API
export const updateHistoryMemo = async (id: number, memo: string): Promise<HistoryItem> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const target = MOCK_HISTORIES.find((h) => h.id === id);
  if (!target) {
    throw new Error('수정할 이력을 찾을 수 없습니다.');
  }
  target.memo = memo;
  return target;
};
