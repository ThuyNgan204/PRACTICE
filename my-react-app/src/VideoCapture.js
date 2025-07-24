import React, { useEffect, useRef } from 'react';

export default function VideoCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameIndexRef = useRef(0);
  const isUploadingRef = useRef(false);  // để tránh upload trùng

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const scale = 0.3;

    let captureInterval;

    const capture = () => {
      if (video.paused || video.ended) return;

      if (isUploadingRef.current) {
        // Đang upload frame trước, bỏ qua lần capture này
        return;
      }
      isUploadingRef.current = true;

      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const index = frameIndexRef.current++;
          const timestamp = Date.now();
          const formData = new FormData();
          formData.append('frame', blob, `frame_${index}_${timestamp}.jpg`);
          formData.append('running', 'true');

          try {
            await fetch('http://192.168.56.1:5000/api/upload_frame', {
              method: 'POST',
              body: formData,
            });
            console.log(`✅ Uploaded frame_${index}_${timestamp}`);
          } catch (e) {
            console.error('❌ Upload error:', e);
          }
        }
        isUploadingRef.current = false;
      }, 'image/jpeg', 0.3);
    };

    video.addEventListener('play', () => {
      captureInterval = setInterval(capture, 33);
    });
    video.addEventListener('pause', () => clearInterval(captureInterval));
    video.addEventListener('ended', () => clearInterval(captureInterval));

    return () => clearInterval(captureInterval);
  }, []);

  return (
    <div>
      <h2>🎥 Máy A</h2>
      <video ref={videoRef} src="/NguyenOanh-PhanVanTri-01.mp4" controls autoPlay muted style={{ maxWidth: '100%' }}/>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
