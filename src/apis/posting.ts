import type { Posting } from '@/types/posting';
import { MOCK_POSTINGS } from '@/constants/mockData';
// import { axiosInstance } from '@/apis/axiosInstance';

// === 지금은 mock 반환 (UI 먼저 개발) ===
export const getPostings = async (): Promise<Posting[]> => {
  await new Promise((r) => setTimeout(r, 300)); // 네트워크 흉내
  return MOCK_POSTINGS;
};

// === 찜하기 토글 API Mock (낙관적 업데이트 및 롤백 테스트용) ===
export const toggleSave = async (postingId: number, isSaved: boolean): Promise<boolean> => {
  await new Promise((r) => setTimeout(r, 500)); // 500ms 네트워크 지연 모방

  console.log(`[Mock API] toggleSave called for postingId: ${postingId}`);

  // 에러 발생 및 롤백 동작을 테스트할 수 있도록 15% 확률로 실패하게 만듭니다.
  if (Math.random() < 0.15) {
    throw new Error('의도된 서버 에러: 찜하기 상태 변경 실패');
  }

  // 메모리 상의 mock 데이터를 실제로 업데이트하여 refetch 시에도 상태가 보존되게 함
  const target = MOCK_POSTINGS.find((p) => p.id === postingId);
  if (target) {
    target.isSaved = !isSaved;
  }

  return !isSaved; // 정상 처리 시 반전된 값 반환
};

// === 백엔드 Swagger 나오면 이 함수 "내부만" 교체하면 끝 ===
// export const getPostings = async (): Promise<Posting[]> => {
//   const { data } = await axiosInstance.get<Posting[]>('/postings');
//   return data;
// };

// export const toggleSave = async (postingId: number, isSaved: boolean): Promise<boolean> => {
//   // 백엔드 엔드포인트에 맞춰 호출 (예: POST /postings/:id/save)
//   const { data } = await axiosInstance.post<{ isSaved: boolean }>(`/postings/${postingId}/save`);
//   return data.isSaved;
// };
