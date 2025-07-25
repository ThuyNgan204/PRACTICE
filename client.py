from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS  # ⭐ thêm dòng này
import requests
import os

app = Flask(__name__)
CORS(app) 

SERVER_A = '192.168.56.1'
SERVER_A_PORT = 5000
SERVER_A_URL = f'http://{SERVER_A}:{SERVER_A_PORT}'

SAVE_FOLDER = 'saved_frames'
os.makedirs(SAVE_FOLDER, exist_ok=True)

latest_frame = None
frame_count = 0

@app.route('/api/frames')
def get_frames():
    global latest_frame, frame_count
    try:
        res = requests.get(f'{SERVER_A_URL}/api/status', timeout=2)
        data = res.json()

        latest_index = data.get('latest_index')
        new_frame = f'frame_{latest_index}.jpg'  # tạo đúng tên file

        if latest_index is not None and new_frame != latest_frame:
            print(f"➡️ New frame detected: {new_frame}")
            img_res = requests.get(f'{SERVER_A_URL}/frames/{new_frame}', timeout=5)
            if img_res.status_code == 200:
                save_path = os.path.join(SAVE_FOLDER, new_frame)
                with open(save_path, 'wb') as f:
                    f.write(img_res.content)
                print(f'✅ Đã lưu: {save_path}')
                latest_frame = new_frame
                frame_count += 1
                return jsonify({'frame': new_frame, 'count': frame_count})
            else:
                print(f'⚠️ Không tải được frame từ máy A, status: {img_res.status_code}')
        return jsonify({'frame': latest_frame, 'count': frame_count})
    except Exception as e:
        print(f'❌ Error: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/saved_frames/<filename>')
def serve_frame(filename):
    return send_from_directory(SAVE_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
