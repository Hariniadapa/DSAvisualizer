# ml-service/generate_data.py
# Run this once to create the training data

import pandas as pd
import numpy as np

np.random.seed(42)
n = 1000

data = {
    # Features the model uses to predict difficulty
    'time_limit_ms':         np.random.choice([500, 1000, 2000, 3000], n),
    'memory_limit_mb':       np.random.choice([128, 256, 512], n),
    'num_test_cases':        np.random.randint(5, 50, n),
    'avg_submission_time_s': np.random.exponential(30, n).clip(1, 300),
    'acceptance_rate':       np.random.beta(3, 5, n),          # 0 to 1
    'num_hints':             np.random.randint(0, 5, n),
    'topic_complexity':      np.random.randint(1, 6, n),       # 1=array, 5=DP
    'avg_lines_of_code':     np.random.randint(5, 80, n),

    # Label: difficulty (what we want to predict)
    'difficulty': np.random.choice(
        ['easy', 'medium', 'hard'],
        n,
        p=[0.3, 0.45, 0.25]
    )
}

df = pd.DataFrame(data)

# Make difficulty correlate with features (more realistic data)
df.loc[df['topic_complexity'] >= 4, 'difficulty'] = np.random.choice(
    ['medium', 'hard'], 
    (df['topic_complexity'] >= 4).sum(), 
    p=[0.4, 0.6]
)
df.loc[df['acceptance_rate'] > 0.7, 'difficulty'] = 'easy'

df.to_csv('data/problems.csv', index=False)
print(f"Created {len(df)} training samples")
print(df['difficulty'].value_counts())