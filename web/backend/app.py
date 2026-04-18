from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import json

app = Flask(__name__)
CORS(app)

MODEL_PATH   = r'C:\Users\Jake Norwin\OneDrive\Documents\housing2\ph_housing_ml\models\Design_3__Gradient_Boosting.pkl'
COLUMNS_PATH = r'C:\Users\Jake Norwin\OneDrive\Documents\housing2\ph_housing_ml\models\feature_columns.json'

with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)
with open(COLUMNS_PATH, 'r') as f:
    feature_columns = json.load(f)

print(f"Model ready. Expecting {len(feature_columns)} features.")

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        # Build a zero vector for all features
        row = {col: 0.0 for col in feature_columns}

        # Fill in the numeric features we know
        row['Bedrooms']   = float(data['bedrooms'])
        row['Bathrooms']  = float(data['bathrooms'])
        row['Floor Area'] = float(data['floor_area'])
        row['Land Area']  = float(data['land_area']) if data.get('land_area') else 0.0
        row['Latitude']   = 14.5995   # default PH center
        row['Longitude']  = 120.9842

        X = np.array([list(row.values())])
        log_price = model.predict(X)[0]
        price = np.exp(log_price)

        return jsonify({
            'predicted_price': round(price, 2),
            'price_low':       round(price * 0.8508, 2),
            'price_high':      round(price * 1.1492, 2),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)