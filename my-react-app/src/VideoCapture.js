import React, { useEffect, useState } from 'react';

export default function VideoPlayer() {
  const [latestIndex, setLatestIndex] = useState(-1);
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    let running = true;

    const fetchLoop = async () => {
      while (running) {
        try {
          const res = await fetch('http://127.0.0.1:5000/api/status');
          const data = await res.json();

          if (data.latest_index !== latestIndex && data.latest_index >= 0) {
            setLatestIndex(data.latest_index);
            const imgRes = await fetch(`http://127.0.0.1:5000/frames/frame_${data.latest_index}.jpg`);
            const blob = await imgRes.blob();
            setImgUrl(URL.createObjectURL(blob));
          }
        } catch (e) {
          console.error('❌ Error:', e);
        }
        await new Promise(r => setTimeout(r, 33)); // ~30fps
      }
    };
    fetchLoop();

    return () => { running = false; };
  }, [latestIndex]);

  return (
    <div>
      <h3>🎥 Phát video từ frame</h3>
      {imgUrl && <img src={imgUrl} alt="frame" style={{ maxWidth: '100%' }}/> }
      <p>Frame index: {latestIndex}</p>
    </div>
  );
}
