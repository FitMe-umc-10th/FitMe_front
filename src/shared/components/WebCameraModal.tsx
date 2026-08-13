import { useState, useEffect, useRef } from 'react';
import { useToastStore } from '@/store/toastStore';
import cameraIcon from '@/assets/icons/camera_img.svg';
import closeXIcon from '@/assets/icons/close-x.svg';

export interface WebCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export default function WebCameraModal({ isOpen, onClose, onCapture }: WebCameraModalProps) {
  const toast = useToastStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCapturedImage(null);
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        });

        if (isMounted) {
          setCameraStream(stream);
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.error('웹 카메라 접근 실패:', err);
        toast.error('카메라 접근 권한이 필요하거나 카메라를 찾을 수 없습니다.');
        onClose();
      }
    };

    startCamera();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 비디오 태그 스트림 바인딩
  useEffect(() => {
    if (isOpen && cameraStream && videoRef.current && !capturedImage) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isOpen, cameraStream, capturedImage]);

  // 컴포넌트 닫힘/언마운트 시 트랙 정지 및 정리
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleClose = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCapturedImage(null);
    onClose();
  };

  // 1. 사진 촬영 (확인 모드로 전환)
  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 프리뷰 화면과 일치하도록 좌우 반전 처리
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);
      }
    }
  };

  // 2. 다시 촬영 (라이브 카메라로 복귀)
  const handleRetake = () => {
    setCapturedImage(null);
  };

  // 3. 사진 최종 적용 (업로드)
  const handleConfirmUse = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      toast.success('촬영한 사진이 프로필에 적용되었습니다.');
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm">
      <div className="relative flex flex-col items-center w-full max-w-[360px] bg-white rounded-[24px] p-6 text-gray-900 shadow-2xl animate-fade-in-up border border-gray-100">
        {/* 상단 헤더 */}
        <div className="w-full flex items-center justify-between mb-4">
          <h3 className="text-[20px] font-semibold leading-[140%] text-[#1E1E1E]">
            {capturedImage ? '사진 확인' : '사진 촬영'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-[#8C8C8C] hover:bg-gray-100 hover:text-[#1E1E1E] transition-colors focus:outline-none"
            aria-label="닫기"
          >
            <img src={closeXIcon} className="size-5 text-[#8C8C8C]" alt="" />
          </button>
        </div>

        {/* 원형 프리뷰 프레임 (촬영 전: 실시간 비디오, 촬영 후: 캡처된 정지 이미지) */}
        <div className="relative size-[220px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner mb-6">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="촬영된 사진"
              className="size-full object-cover animate-fade-in"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="size-full object-cover -scale-x-100"
            />
          )}
        </div>

        {/* 컨트롤 버튼 그룹 */}
        {capturedImage ? (
          /* [촬영 후 확인 모드] 다시 촬영 vs 적용하기 */
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 h-[52px] bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#737373] font-medium rounded-xl text-[16px] leading-[140%] tracking-[-0.24px] transition-all active:scale-[0.98]"
            >
              다시 촬영
            </button>
            <button
              type="button"
              onClick={handleConfirmUse}
              className="flex-1 h-[52px] bg-[#0059FF] hover:bg-blue-700 text-white font-semibold rounded-xl text-[16px] leading-[140%] tracking-[-0.24px] transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
            >
              사용하기
            </button>
          </div>
        ) : (
          /* [촬영 전 라이브 모드] 취소 vs 촬영하기 */
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-[52px] bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#737373] font-medium rounded-xl text-[16px] leading-[140%] tracking-[-0.24px] transition-all active:scale-[0.98]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="flex-1 h-[52px] bg-[#0059FF] hover:bg-blue-700 text-white font-semibold rounded-xl text-[16px] leading-[140%] tracking-[-0.24px] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <img src={cameraIcon} className="w-[16px] h-[15px] filter brightness-0 invert" alt="" />
              촬영하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
