import { useState, useEffect, useRef } from 'react';
import { useToastStore } from '@/store/toastStore';

export interface WebCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export default function WebCameraModal({ isOpen, onClose, onCapture }: WebCameraModalProps) {
  const toast = useToastStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

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
    if (isOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isOpen, cameraStream]);

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
    onClose();
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4 animate-fade-in">
      <div className="relative flex flex-col items-center w-full max-w-[360px] bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
        <h3 className="text-lg font-bold mb-4 text-center">사진 촬영</h3>

        {/* 카메라 실시간 프리뷰 (원형 프레임) */}
        <div className="relative size-[240px] rounded-full overflow-hidden border-4 border-blue-500 shadow-lg bg-black flex items-center justify-center mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="size-full object-cover -scale-x-100"
          />
        </div>

        {/* 촬영 / 취소 컨트롤 버튼 */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold rounded-xl text-sm transition-all"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleCapture}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <circle cx="12" cy="13" r="3" />
            </svg>
            촬영하기
          </button>
        </div>
      </div>
    </div>
  );
}
