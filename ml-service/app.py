# ml-service/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import math

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from our Node.js backend

# ── Load trained models on startup ────────────────
print("Loading models...")
difficulty_model  = joblib.load('models/difficulty_model.pkl')
label_encoder     = joblib.load('models/label_encoder.pkl')
feature_cols      = joblib.load('models/feature_cols.pkl')
mastery_model     = joblib.load('models/mastery_model.pkl')
mastery_features  = joblib.load('models/mastery_features.pkl')
print("Models loaded.")


# ════════════════════════════════════════
# ENDPOINT 1: Predict problem difficulty
# POST /predict/difficulty
# Body: { features: { time_limit_ms: 1000, ... } }
# ════════════════════════════════════════
@app.route('/predict/difficulty', methods=['POST'])
def predict_difficulty():
    try:
        data = request.json
        features = data['features']

        # Build input array in the correct column order
        X = np.array([[
            features.get('time_limit_ms', 1000),
            features.get('memory_limit_mb', 256),
            features.get('num_test_cases', 10),
            features.get('avg_submission_time_s', 30),
            features.get('acceptance_rate', 0.5),
            features.get('num_hints', 2),
            features.get('topic_complexity', 3),
            features.get('avg_lines_of_code', 20),
        ]])

        # Get prediction + probabilities
        pred_encoded = difficulty_model.predict(X)[0]
        pred_proba   = difficulty_model.predict_proba(X)[0]
        pred_label   = label_encoder.inverse_transform([pred_encoded])[0]

        # Build probability dict: { easy: 0.12, medium: 0.63, hard: 0.25 }
        proba_dict = {
            label: float(prob)
            for label, prob in zip(label_encoder.classes_, pred_proba)
        }

        return jsonify({
            'difficulty':    pred_label,
            'confidence':    float(max(pred_proba)),
            'probabilities': proba_dict
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ════════════════════════════════════════
# ENDPOINT 2: Predict user mastery
# POST /predict/mastery
# Body: { user_data: { consecutive_correct: 5, ... } }
# ════════════════════════════════════════
# In app.py — replace the /predict/mastery route

@app.route('/predict/mastery', methods=['POST'])
def predict_mastery():
    try:
        data      = request.json
        user_data = data.get('user_data', {})

        mastery_features = joblib.load('models/mastery_features.pkl')

        # Map frontend fields → real model features
        # Frontend sends: attempts, cf_rating, topic_complexity etc.
        # Real model expects: rating_at_submission, problem_rating, rating_gap, topic_complexity

        rating_at_submission = user_data.get('rating_at_submission', 1200)
        problem_rating       = user_data.get('cf_rating', 1200)
        rating_gap           = rating_at_submission - problem_rating
        topic_complexity     = user_data.get('topic_complexity', 1)

        features = pd.DataFrame([[
            rating_at_submission,
            problem_rating,
            rating_gap,
            topic_complexity
        ]], columns=mastery_features)

        model          = joblib.load('models/mastery_model.pkl')
        prediction     = model.predict(features)[0]
        probability    = model.predict_proba(features)[0]
        mastery_prob   = float(max(probability))

        # Spaced repetition: harder problems reviewed sooner
        if mastery_prob >= 0.8:
            next_review_days = 7
        elif mastery_prob >= 0.5:
            next_review_days = 3
        else:
            next_review_days = 1

        return jsonify({
            'mastered':        bool(prediction),
            'mastery_percent': round(mastery_prob * 100),
            'next_review_days': next_review_days
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ════════════════════════════════════════
# ENDPOINT 3: Sketch recognition
# POST /predict/sketch
# Body: { strokes: [ [ [x,y], [x,y], ... ], ... ] }
# Each stroke is a list of [x, y] points
# ════════════════════════════════════════
@app.route('/predict/sketch', methods=['POST'])
def predict_sketch():
    try:
        data    = request.json
        strokes = data['strokes']   # list of strokes, each stroke = list of [x,y]

        if not strokes:
            return jsonify({'error': 'No strokes provided'}), 400

        # ── Geometry feature extraction ────────────────
        all_points = [pt for stroke in strokes for pt in stroke]
        xs = [p[0] for p in all_points]
        ys = [p[1] for p in all_points]

        bbox_w     = max(xs) - min(xs) if xs else 1
        bbox_h     = max(ys) - min(ys) if ys else 1
        aspect     = bbox_w / (bbox_h + 1e-6)
        num_strokes = len(strokes)

        # Count approximate corners in all strokes combined
        def count_corners(stroke, threshold=30):
            corners = 0
            for i in range(1, len(stroke) - 1):
                dx1 = stroke[i][0] - stroke[i-1][0]
                dy1 = stroke[i][1] - stroke[i-1][1]
                dx2 = stroke[i+1][0] - stroke[i][0]
                dy2 = stroke[i+1][1] - stroke[i][1]
                angle = abs(math.atan2(dy2, dx2) - math.atan2(dy1, dx1))
                angle = min(angle, 2 * math.pi - angle)
                if math.degrees(angle) > threshold:
                    corners += 1
            return corners

        total_corners = sum(count_corners(s) for s in strokes)
        avg_corners   = total_corners / num_strokes if num_strokes else 0

        # ── Rule-based classification ─────────────────
        # These rules are based on typical geometric properties:
        if num_strokes == 1 and avg_corners < 3:
            if 0.8 < aspect < 1.2:
                shape = 'circle'        # round, ~square bounding box
            elif aspect > 2.0:
                shape = 'array'         # long horizontal single stroke = array box
            else:
                shape = 'line'
        elif num_strokes <= 4 and avg_corners >= 3:
            if aspect > 1.5:
                shape = 'array'         # wide rectangle = array visualization
            else:
                shape = 'rectangle'     # general box / node
        elif num_strokes >= 3 and avg_corners < 2:
            shape = 'tree'              # multiple curved/rounded strokes = tree structure
        elif num_strokes >= 5:
            shape = 'graph'             # many strokes = graph with edges
        else:
            shape = 'unknown'

        # Map shapes to DSA structures
        dsa_map = {
            'array':     'Array / Stack / Queue',
            'circle':    'Circular buffer / Heap',
            'tree':      'Binary tree / BST',
            'graph':     'Graph (adjacency)',
            'rectangle': 'Stack frame / Node',
            'line':      'Linked list',
            'unknown':   'Unknown — draw clearer'
        }

        confidence_map = {
            'array': 0.82, 'circle': 0.76, 'tree': 0.71,
            'graph': 0.68, 'rectangle': 0.74, 'line': 0.79, 'unknown': 0.3
        }

        return jsonify({
            'shape':       shape,
            'dsa_concept': dsa_map[shape],
            'confidence':  confidence_map[shape],
            'features': {
                'num_strokes':   num_strokes,
                'aspect_ratio':  round(aspect, 2),
                'avg_corners':   round(avg_corners, 2),
                'total_points':  len(all_points)
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ════════════════════════════════════════
# HEALTH CHECK
# ════════════════════════════════════════
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'models_loaded': True})


if __name__ == '__main__':
    app.run(port=5001, debug=True)