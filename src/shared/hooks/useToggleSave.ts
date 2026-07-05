import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleSave } from '@/apis/posting';
import { useToastStore } from '@/store/toastStore';
import type { Posting } from '@/types/posting';

export const useToggleSave = (postingId: number) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  return useMutation({
    mutationFn: (isSaved: boolean) => toggleSave(postingId, isSaved),
    // 1. 낙관적 업데이트 수행 (서버 응답을 기다리지 않고 UI 상태 먼저 갱신)
    onMutate: async (currentSavedState) => {
      // 쿼리 자동 리프레시 등으로 데이터가 덮어씌워지는 걸 방지하기 위해 쿼리 진행을 일시 취소합니다.
      await queryClient.cancelQueries({ queryKey: ['postings'] });

      // 혹시라도 실패했을 때 원상복구(Rollback)하기 위해 기존 캐시 데이터 스냅샷을 저장합니다.
      const previousPostings = queryClient.getQueryData<Posting[]>(['postings']);

      // 찜하기 상태 값을 먼저 즉시 반전시켜 줍니다.
      queryClient.setQueryData<Posting[]>(['postings'], (old) => {
        if (!old) return old;
        return old.map((p) =>
          p.id === postingId ? { ...p, isSaved: !currentSavedState } : p
        );
      });

      // 롤백 데이터를 컨텍스트로 반환하여 onError에서 사용할 수 있게 합니다.
      return { previousPostings };
    },
    // 2. 에러가 나면 기존 데이터로 원상복구하고 토스트 알림을 띄웁니다.
    onError: (_err, currentSavedState, context) => {
      if (context?.previousPostings) {
        queryClient.setQueryData(['postings'], context.previousPostings);
      }
      
      const actionText = currentSavedState ? '저장 해제' : '저장';
      showToast(`${actionText}에 실패했어요.`, 'error');
    },
    // 3. 작업 종료 후(성공/실패 무관) 최신 상태 동기화를 위해 캐시 무효화를 실행합니다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['postings'] });
    },
  });
};
