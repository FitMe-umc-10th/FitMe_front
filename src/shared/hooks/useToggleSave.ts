import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleSave } from '@/apis/posting';
import { postingQueryKeys } from '@/apis/postingQueryKeys';
import { useToastStore } from '@/store/toastStore';
import type { HomePostingFeed, Posting } from '@/types/posting';

const updatePostingSavedState = (
  posting: Posting,
  postingId: number,
  nextSavedState: boolean,
  savedId?: number,
) => {
  if (posting.id !== postingId) return posting;

  return {
    ...posting,
    isSaved: nextSavedState,
    savedId: nextSavedState ? savedId ?? posting.savedId : undefined,
    savedCount: Math.max(0, (posting.savedCount ?? 0) + (nextSavedState ? 1 : -1)),
  };
};

const updateHomeFeedSavedState = (
  feed: HomePostingFeed,
  postingId: number,
  nextSavedState: boolean,
  savedId?: number,
): HomePostingFeed => ({
  popularPostings: feed.popularPostings.map((posting) =>
    updatePostingSavedState(posting, postingId, nextSavedState, savedId),
  ),
  recentViewedName: feed.recentViewedName,
  recentViewedPostings: feed.recentViewedPostings.map((posting) =>
    updatePostingSavedState(posting, postingId, nextSavedState, savedId),
  ),
  deadlinePostings: {
    SCHOLARSHIP: feed.deadlinePostings.SCHOLARSHIP.map((posting) =>
      updatePostingSavedState(posting, postingId, nextSavedState, savedId),
    ),
    CONTEST: feed.deadlinePostings.CONTEST.map((posting) =>
      updatePostingSavedState(posting, postingId, nextSavedState, savedId),
    ),
  },
});

const updateSavedPostingList = (
  postings: Posting[] | undefined,
  postingId: number,
  nextSavedState: boolean,
  savedId?: number,
) => {
  if (!postings) return postings;

  if (!nextSavedState) {
    return postings.filter((posting) => posting.id !== postingId);
  }

  return postings.map((posting) => updatePostingSavedState(posting, postingId, nextSavedState, savedId));
};

interface UseToggleSaveOptions {
  savedId?: number;
  showErrorToast?: boolean;
  onError?: (currentSavedState: boolean) => void;
}

export const useToggleSave = (postingId: number, options: UseToggleSaveOptions = {}) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const { savedId, showErrorToast = true, onError } = options;

  return useMutation({
    mutationFn: (isSaved: boolean) => toggleSave(postingId, isSaved, savedId),
    // 1. 낙관적 업데이트 수행 (서버 응답을 기다리지 않고 UI 상태 먼저 갱신)
    onMutate: async (currentSavedState) => {
      const nextSavedState = !currentSavedState;

      // 쿼리 자동 리프레시 등으로 데이터가 덮어씌워지는 걸 방지하기 위해 쿼리 진행을 일시 취소합니다.
      await queryClient.cancelQueries({ queryKey: postingQueryKeys.all });

      // 혹시라도 실패했을 때 원상복구(Rollback)하기 위해 기존 캐시 데이터 스냅샷을 저장합니다.
      const previousPostings = queryClient.getQueryData<Posting[]>(postingQueryKeys.all);
      const previousHomePostingFeed = queryClient.getQueryData<HomePostingFeed>(postingQueryKeys.home);
      const previousRecentViewedPostings = queryClient.getQueryData<Posting[]>(postingQueryKeys.recentViewed);
      const previousPosting = queryClient.getQueryData<Posting>(postingQueryKeys.detail(postingId));
      const previousDeadlinePostings = queryClient.getQueryData<Posting[]>(postingQueryKeys.deadline);
      const previousSavedPostingQueries = queryClient.getQueriesData<Posting[]>({
        queryKey: postingQueryKeys.saved,
      });

      // 찜하기 상태 값을 먼저 즉시 반전시켜 줍니다.
      queryClient.setQueryData<Posting[]>(postingQueryKeys.all, (old) => {
        if (!old) return old;
        return old.map((posting) => updatePostingSavedState(posting, postingId, nextSavedState));
      });

      queryClient.setQueryData<HomePostingFeed>(postingQueryKeys.home, (old) => {
        if (!old) return old;
        return updateHomeFeedSavedState(old, postingId, nextSavedState);
      });

      queryClient.setQueryData<Posting[]>(postingQueryKeys.recentViewed, (old) => {
        if (!old) return old;
        return old.map((posting) => updatePostingSavedState(posting, postingId, nextSavedState));
      });

      queryClient.setQueryData<Posting>(postingQueryKeys.detail(postingId), (old) => {
        if (!old) return old;
        return updatePostingSavedState(old, postingId, nextSavedState);
      });

      queryClient.setQueryData<Posting[]>(postingQueryKeys.deadline, (old) => {
        if (!old) return old;
        return old.map((posting) => updatePostingSavedState(posting, postingId, nextSavedState));
      });

      queryClient.setQueriesData<Posting[]>(
        { queryKey: postingQueryKeys.saved },
        (old) => updateSavedPostingList(old, postingId, nextSavedState),
      );

      // 롤백 데이터를 컨텍스트로 반환하여 onError에서 사용할 수 있게 합니다.
      return {
        previousPostings,
        previousHomePostingFeed,
        previousRecentViewedPostings,
        previousPosting,
        previousDeadlinePostings,
        previousSavedPostingQueries,
      };
    },
    onSuccess: (result) => {
      const syncSavedResult = (posting: Posting) =>
        updatePostingSavedState(posting, postingId, result.isSaved, result.savedId);

      queryClient.setQueryData<Posting[]>(postingQueryKeys.all, (old) => {
        if (!old) return old;
        return old.map(syncSavedResult);
      });

      queryClient.setQueryData<HomePostingFeed>(postingQueryKeys.home, (old) => {
        if (!old) return old;
        return updateHomeFeedSavedState(old, postingId, result.isSaved, result.savedId);
      });

      queryClient.setQueryData<Posting[]>(postingQueryKeys.recentViewed, (old) => {
        if (!old) return old;
        return old.map(syncSavedResult);
      });

      queryClient.setQueryData<Posting>(postingQueryKeys.detail(postingId), (old) => {
        if (!old) return old;
        return syncSavedResult(old);
      });

      queryClient.setQueryData<Posting[]>(postingQueryKeys.deadline, (old) => {
        if (!old) return old;
        return old.map(syncSavedResult);
      });

      queryClient.setQueriesData<Posting[]>(
        { queryKey: postingQueryKeys.saved },
        (old) => updateSavedPostingList(old, postingId, result.isSaved, result.savedId),
      );
    },
    // 2. 에러가 나면 기존 데이터로 원상복구하고 토스트 알림을 띄웁니다.
    onError: (_err, currentSavedState, context) => {
      if (!currentSavedState && axios.isAxiosError(_err) && _err.response?.status === 409) {
        if (showErrorToast) {
          showToast('이미 저장된 공고입니다.', 'error');
        }
        return;
      }

      if (context?.previousPostings) {
        queryClient.setQueryData(postingQueryKeys.all, context.previousPostings);
      }
      if (context?.previousHomePostingFeed) {
        queryClient.setQueryData(postingQueryKeys.home, context.previousHomePostingFeed);
      }
      if (context?.previousRecentViewedPostings) {
        queryClient.setQueryData(postingQueryKeys.recentViewed, context.previousRecentViewedPostings);
      }
      if (context?.previousPosting) {
        queryClient.setQueryData(postingQueryKeys.detail(postingId), context.previousPosting);
      }
      if (context?.previousDeadlinePostings) {
        queryClient.setQueryData(postingQueryKeys.deadline, context.previousDeadlinePostings);
      }
      if (context?.previousSavedPostingQueries) {
        context.previousSavedPostingQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const actionText = currentSavedState ? '저장 해제' : '저장';
      if (showErrorToast) {
        showToast(`${actionText}에 실패했어요! 네트워크를 확인해주세요.`, 'error');
      }
      onError?.(currentSavedState);
    },
    // 3. 작업 종료 후(성공/실패 무관) 최신 상태 동기화를 위해 캐시 무효화를 실행합니다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postingQueryKeys.all });
    },
  });
};
