import os
import cv2
import numpy as np
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import detect_and_process_id_card

app = Flask(__name__)
CORS(app)  
@app.route('/process-id', methods=['POST'])
def process_id():
 
    if 'id_image' not in request.files:
        return jsonify({
            "status": "fail",
            "message": "No file part with name 'id_image'"
        }), 400
    
    file = request.files['id_image']
    
    if file.filename == '':
        return jsonify({
            "status": "fail",
            "message": "No image selected for uploading"
        }), 400

    try:
       
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

      
        results = detect_and_process_id_card(temp_file_path)
        
       
        response_data = {
            "status": "success",
            "data": {
                "first_name": results[0],
                "second_name": results[1],
                "full_name": results[2],
                "national_id": results[3],
                "address": results[4],
                "birth_date": results[5],
                "governorate": results[6],
                "gender": results[7]
            }
        }
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if os.path.exists("d2.jpg"): 
            os.remove("d2.jpg")

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
   
    app.run(host='0.0.0.0', port=5000, debug=True)