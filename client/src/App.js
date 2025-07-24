import React, { useEffect, useRef, useState } from 'react';

export default function VideoReceiver() {
  const [latestFrame, setLatestFrame] = useState(null);
  const [index, setIndex] = useState(0);
  const lastFrameRef = useRef(null);

  useEffect(() => {
    let shouldFetch = true;

    const checkAndFetch = async () => {
      while (shouldFetch) {
        try {
          const res = await fetch('http://192.168.56.1:5000/api/status');
          const data = await res.json();
          const running = data.running;

          // ✅ Chỉ fetch frame mới nếu tên frame khác với lần trước
          if (running && data.latest_frame && data.latest_frame !== lastFrameRef.current) {
            lastFrameRef.current = data.latest_frame;

            const imgRes = await fetch(`http://192.168.56.1:5000/frames/${data.latest_frame}`);
            const blob = await imgRes.blob();

            setLatestFrame(URL.createObjectURL(blob));

            // Gửi blob sang client.py để lưu
            const formData = new FormData();
            formData.append('frame', blob, data.latest_frame);
            await fetch('http://127.0.0.1:5001/save_frame', {
              method: 'POST',
              body: formData,
            });

            console.log(`💾 Đã lưu: ${data.latest_frame}`);
            setIndex(prev => prev + 1);
          }

          if (running) {
            await new Promise(res => setTimeout(res, 100));
          } else {
            await new Promise(res => setTimeout(res, 1000));
          }
        } catch (e) {
          console.error('❌ Error:', e);
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    };

    checkAndFetch();

    return () => { shouldFetch = false; };
  }, []);

  return (
    <div>
      <h2>📥 Máy B</h2>
      {latestFrame && <img src={latestFrame} alt="Latest frame" style={{ maxWidth: '100%' }} />}
      <p>Frame count: {index}</p>
    </div>
  );
}
