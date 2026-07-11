import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleSave } from '@/apis/posting';
import { useToastStore } from '@/store/toastStore';
import type { HomePostingFeed, Posting } from '@/types/posting';

const updatePostingSavedState = (posting: Posting, postingId: number, nextSavedState: boolean) => {
  if (posting.id !== postingId) return posting;

  return {
    ...posting,
    isSaved: nextSavedState,
    savedCount: Math.max(0, (posting.savedCount ?? 0) + (nextSavedState ? 1 : -1)),
  };
};

const updateHomeFeedSavedState = (
  feed: HomePostingFeed,
  postingId: number,
  nextSavedState: boolean,
): HomePostingFeed => ({
  popularPostings: feed.popularPostings.map((posting) =>
    updatePostingSavedState(posting, postingId, nextSavedState),
  ),
  recentViewedPostings: feed.recentViewedPostings.map((posting) =>
    updatePostingSavedState(posting, postingId, nextSavedState),
  ),
  deadlinePostings: {
    SCHOLARSHIP: feed.deadlinePostings.SCHOLARSHIP.map((posting) =>
      updatePostingSavedState(posting, postingId, nextSavedState),
    ),
    CONTEST: feed.deadlinePostings.CONTEST.map((posting) =>
      updatePostingSavedState(posting, postingId, nextSavedState),
    ),
  },
});

export const useToggleSave = (postingId: number) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  return useMutation({
    mutationFn: (isSaved: boolean) => toggleSave(postingId, isSaved),
    // 1. 낙관적 업데이트 수행 (서버 응답을 기다리지 않고 UI 상태 먼저 갱신)
    onMutate: async (currentSavedState) => {
      const nextSavedState = !currentSavedState;

      // 쿼리 자동 리프레시 등으로 데이터가 덮어씌워지는 걸 방지하기 위해 쿼리 진행을 일시 취소합니다.
      await queryClient.cancelQueries({ queryKey: ['postings'] });
      await queryClient.cancelQueries({ queryKey: ['homePostingFeed'] });
      await queryClient.cancelQueries({ queryKey: ['recentViewedPostings'] });
      await queryClient.cancelQueries({ queryKey: ['posting', postingId] });
      await queryClient.cancelQueries({ queryKey: ['deadlinePostings'] });

      // 혹시라도 실패했을 때 원상복구(Rollback)하기 위해 기존 캐시 데이터 스냅샷을 저장합니다.
      const previousPostings = queryClient.getQueryData<Posting[]>(['postings']);
      const previousHomePostingFeed = queryClient.getQueryData<HomePostingFeed>(['homePostingFeed']);
      const previousRecentViewedPostings = queryClient.getQueryData<Posting[]>(['recentViewedPostings']);
      const previousPosting = queryClient.getQueryData<Posting>(['posting', postingId]);
      const previousDeadlinePostings = queryClient.getQueryData<Posting[]>(['deadlinePostings']);

      // 찜하기 상태 값을 먼저 즉시 반전시켜 줍니다.
      queryClient.setQueryData<Posting[]>(['postings'], (old) => {
        if (!old) return old;
        return old.map((posting) => updatePostingSavedState(posting, postingId, nextSavedState));
      });

      queryClient.setQueryData<HomePostingFeed>(['homePostingFeed'], (old) => {
        if (!old) return old;
        return updateHomeFeedSavedState(old, postingId, nextSavedState);
      });

      queryClient.setQueryData<Posting[]>(['recentViewedPostings'], (old) => {
        if (!old) return old;
        return old.map((posting) => updatePostingSavedState(posting, postingId, nextSavedState));
      });

      queryClient.setQueryData<Posting>(['posting', postingId], (old) => {
        if (!old) return old;
        return updatePostingSavedState(old, postingId, nextSavedState);
      });

      queryClient.setQueryData<Posting[]>(['deadlinePostings'], (old) => {
        if (!old) return old;
        return old.map((posting) => updatePostingSavedState(posting, postingId, nextSavedState));
      });

      // 롤백 데이터를 컨텍스트로 반환하여 onError에서 사용할 수 있게 합니다.
      return {
        previousPostings,
        previousHomePostingFeed,
        previousRecentViewedPostings,
        previousPosting,
        previousDeadlinePostings,
      };
    },
    // 2. 에러가 나면 기존 데이터로 원상복구하고 토스트 알림을 띄웁니다.
    onError: (_err, currentSavedState, context) => {
      if (context?.previousPostings) {
        queryClient.setQueryData(['postings'], context.previousPostings);
      }
      if (context?.previousHomePostingFeed) {
        queryClient.setQueryData(['homePostingFeed'], context.previousHomePostingFeed);
      }
      if (context?.previousRecentViewedPostings) {
        queryClient.setQueryData(['recentViewedPostings'], context.previousRecentViewedPostings);
      }
      if (context?.previousPosting) {
        queryClient.setQueryData(['posting', postingId], context.previousPosting);
      }
      if (context?.previousDeadlinePostings) {
        queryClient.setQueryData(['deadlinePostings'], context.previousDeadlinePostings);
      }

      const actionText = currentSavedState ? '저장 해제' : '저장';
      showToast(`${actionText}에 실패했어요.`, 'error');
    },
    // 3. 작업 종료 후(성공/실패 무관) 최신 상태 동기화를 위해 캐시 무효화를 실행합니다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['postings'] });
      queryClient.invalidateQueries({ queryKey: ['homePostingFeed'] });
      queryClient.invalidateQueries({ queryKey: ['recentViewedPostings'] });
      queryClient.invalidateQueries({ queryKey: ['posting', postingId] });
      queryClient.invalidateQueries({ queryKey: ['deadlinePostings'] });
    },
  });
};
