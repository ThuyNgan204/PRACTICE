from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import cv2, os, threading, time

app = Flask(__name__)
CORS(app)

FRAMES_DIR = 'frames'
os.makedirs(FRAMES_DIR, exist_ok=True)

latest_index = -1

def extract_frames(video_path):
    global latest_index
    cap = cv2.VideoCapture(video_path)
    index = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("✅ Video ended")
            break
        filename = f"frame_{index}.jpg"
        cv2.imwrite(os.path.join(FRAMES_DIR, filename), frame)
        latest_index = index
        index += 1
        time.sleep(1/30)  # giả lập 30fps
    cap.release()
    print("✅ Finished extracting frames")

@app.route('/api/status')
def status():
    return jsonify({"latest_index": latest_index})

@app.route('/frames/<filename>')
def get_frame(filename):
    return send_from_directory(FRAMES_DIR, filename)

if __name__ == '__main__':
    # Tách frame chạy song song
    threading.Thread(target=extract_frames, args=('NguyenOanh-PhanVanTri-01.mp4',), daemon=True).start()
    app.run(host='0.0.0.0', port=5000)
