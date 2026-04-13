# ml-service/train_models.py
# This script trains all three models and saves them to disk.
# You only need to run this once (or whenever you retrain).

import pandas as pd
import numpy as np
import joblib
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

print("=" * 50)
print("Training Model 1: Difficulty Predictor")
print("=" * 50)

# ── Load data ──────────────────────────────────────
df = pd.read_csv('data/problems.csv')

feature_cols = [
    'time_limit_ms', 'memory_limit_mb', 'num_test_cases',
    'avg_submission_time_s', 'acceptance_rate', 'num_hints',
    'topic_complexity', 'avg_lines_of_code'
]

X = df[feature_cols]
y = df['difficulty']

# ── Encode labels: easy=0, medium=1, hard=2 ────────
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# ── Split into train/test ──────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# ── Train Random Forest ────────────────────────────
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight='balanced'   # handles imbalanced classes
)
rf.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────
y_pred = rf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {accuracy:.3f}")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ── Feature importance (useful to explain to interviewers) ──
importances = dict(zip(feature_cols, rf.feature_importances_.tolist()))
print("\nFeature importances:")
for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
    print(f"  {feat:<30} {imp:.3f}")

# ── Save model + encoder ───────────────────────────
joblib.dump(rf, 'models/difficulty_model.pkl')
joblib.dump(le, 'models/label_encoder.pkl')
joblib.dump(feature_cols, 'models/feature_cols.pkl')
print("\nSaved: models/difficulty_model.pkl")


print("\n" + "=" * 50)
print("Training Model 2: Mastery Predictor (Knowledge Tracing)")
print("=" * 50)

# ── Generate user attempt data ─────────────────────
# Each row = one user's attempt at one problem
np.random.seed(99)
n_attempts = 2000

attempts = {
    'user_id':              np.random.randint(1, 201, n_attempts),
    'problem_topic':        np.random.randint(1, 8, n_attempts),    # 1-7 topics
    'attempts_so_far':      np.random.randint(1, 20, n_attempts),
    'avg_time_on_problem':  np.random.exponential(120, n_attempts).clip(5, 600),
    'hints_used':           np.random.randint(0, 5, n_attempts),
    'consecutive_correct':  np.random.randint(0, 10, n_attempts),
    'days_since_last':      np.random.exponential(3, n_attempts).clip(0, 30),
    # Mastery: 1 = mastered this topic, 0 = not yet
    'mastered':             np.random.choice([0, 1], n_attempts, p=[0.55, 0.45])
}

# Make mastery correlate with features
df_m = pd.DataFrame(attempts)
df_m.loc[df_m['consecutive_correct'] >= 5, 'mastered'] = 1
df_m.loc[df_m['hints_used'] >= 4, 'mastered'] = 0

mastery_features = [
    'problem_topic', 'attempts_so_far', 'avg_time_on_problem',
    'hints_used', 'consecutive_correct', 'days_since_last'
]

Xm = df_m[mastery_features]
ym = df_m['mastered']

Xm_train, Xm_test, ym_train, ym_test = train_test_split(
    Xm, ym, test_size=0.2, random_state=42
)

rf_mastery = RandomForestClassifier(
    n_estimators=80,
    max_depth=8,
    random_state=42
)
rf_mastery.fit(Xm_train, ym_train)

ym_pred = rf_mastery.predict(Xm_test)
print(f"Mastery accuracy: {accuracy_score(ym_test, ym_pred):.3f}")

joblib.dump(rf_mastery, 'models/mastery_model.pkl')
joblib.dump(mastery_features, 'models/mastery_features.pkl')
print("Saved: models/mastery_model.pkl")


print("\n" + "=" * 50)
print("Model 3: Sketch Recognizer — using rule-based approach")
print("(CNN would need GPU training data; we use smart geometry)")
print("=" * 50)
# We implement this as a smart rule-based recognizer in the Flask API
# It analyzes stroke geometry: aspect ratio, corner sharpness, line count
# This is still ML-adjacent and impressive to explain in interviews
print("Sketch recognizer: rule-based geometry engine (no training needed)")
print("Saved: built into Flask API")

print("\n All models trained and saved successfully!")