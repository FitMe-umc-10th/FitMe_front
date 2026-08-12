import { useState } from 'react';
import defaultScholarshipThumbnail from '@/assets/illustrations/default-scholarship-thumbnail.svg';
import type { PostingType } from '@/types/posting';

type PostingThumbnailProps = {
  src?: string | null;
  alt: string;
  className?: string;
  type?: PostingType;
};

export default function PostingThumbnail({
  src,
  alt,
  className = 'h-full w-full',
  type,
}: PostingThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <PostingThumbnailFallback className={className} type={type} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-cover`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

function PostingThumbnailFallback({ className, type }: { className: string; type?: PostingType }) {
  if (type === 'SCHOLARSHIP') {
    return (
      <img
        src={defaultScholarshipThumbnail}
        alt="장학금 공고 기본 이미지"
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-[#E6EEF8] text-[13px] font-bold text-[#9AA6B2]`}
      aria-label="공고 기본 이미지"
    >
      FitMe
    </div>
  );
}
