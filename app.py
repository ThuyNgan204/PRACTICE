from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'frames')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

latest_frame = None
is_running = False

@app.route('/api/upload_frame', methods=['POST'])
def upload_frame():
    global latest_frame, is_running
    if 'frame' not in request.files:
        return 'No file part', 400
    file = request.files['frame']
    running = request.form.get('running') == 'true'
    is_running = running
    filename = file.filename
    latest_frame = filename
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    return 'OK', 200

@app.route('/api/upload_status', methods=['POST'])
def upload_status():
    global is_running
    data = request.get_json()
    is_running = data.get('running', False)
    return 'OK', 200

@app.route('/frames/<filename>')
def get_frame(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/status')
def status():
    return jsonify({"running": is_running, "latest_frame": latest_frame})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
