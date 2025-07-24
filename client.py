from flask import Flask, request
import os

app = Flask(__name__)

SAVE_FOLDER = 'saved_frames'
os.makedirs(SAVE_FOLDER, exist_ok=True)  # tự tạo thư mục nếu chưa có

@app.route('/save_frame', methods=['POST'])
def save_frame():
    if 'frame' not in request.files:
        return 'No frame part', 400
    file = request.files['frame']
    filename = file.filename or f'frame_{int(time.time() * 1000)}.jpg'
    save_path = os.path.join(SAVE_FOLDER, filename)
    file.save(save_path)
    print(f'✅: {save_path}')
    return 'OK', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
