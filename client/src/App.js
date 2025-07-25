import React, { useEffect, useState } from 'react';

export default function VideoReceiver() {
  const [latestFrame, setLatestFrame] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let shouldFetch = true;

    const fetchLoop = async () => {
      while (shouldFetch) {
        try {
          const res = await fetch('http://127.0.0.1:5001/api/frames');
          const data = await res.json();

          if (data.frame) {
            // Lưu ý: phải gọi đúng URL BE máy B
            setLatestFrame(`http://127.0.0.1:5001/saved_frames/${data.frame}`);
            setIndex(data.count);
          }

          await new Promise(res => setTimeout(res, 100)); // khoảng 10fps
        } catch (e) {
          console.error('❌ Error:', e);
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    };

    fetchLoop();

    return () => { shouldFetch = false; };
  }, []);

  return (
    <div>
      <h2>📥 Máy B (FE)</h2>
      {latestFrame && (
        <img src={latestFrame} alt="Latest frame" style={{ maxWidth: '100%' }} />
      )}
      <p>Frame count: {index}</p>
    </div>
  );
}
