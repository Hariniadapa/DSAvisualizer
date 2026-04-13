# ml-service/fetch_mastery_data.py
# Fetches real submission data directly from Codeforces API
# No Hugging Face needed

import requests
import pandas as pd
import time
import os

os.makedirs('data', exist_ok=True)

# 20 active CF users across different skill levels
HANDLES = [
    # High rated
    'tourist', 'jiangly', 'Um_nik', 'neal', 'Benq',
    # Mid rated  
    'Radewoosh', 'ksun48', 'ecnerwala', 'maroonrk', 'Petr',
    # Lower rated (more realistic training data)
    'user1234567', 'codeforces', 'Mike', 'MikeMirzayanov',
    'andrewzta', 'GlebsHP', 'niyaznigmatul', 'Radewoosh',
    'vintage_Vlad_Makeev', 'PavelKunyavskiy'
]

all_rows = []

for handle in HANDLES:
    print(f"Fetching {handle}...")

    url = f"https://codeforces.com/api/user.status?handle={handle}&from=1&count=500"

    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()

        if data['status'] != 'OK':
            print(f"  Skipping {handle}: {data.get('comment', 'unknown error')}")
            time.sleep(2)
            continue

        submissions = data['result']

        # Get user's rating
        rating_url  = f"https://codeforces.com/api/user.info?handles={handle}"
        rating_resp = requests.get(rating_url, timeout=10).json()
        time.sleep(2)  # rate limit between requests

        user_rating = 1200  # default
        if rating_resp['status'] == 'OK':
            user_rating = rating_resp['result'][0].get('rating', 1200)

        print(f"  Rating: {user_rating}, Submissions: {len(submissions)}")

        # Track per-problem stats
        problem_map = {}

        for sub in submissions:
            prob = sub.get('problem', {})
            if 'rating' not in prob:
                continue

            key     = f"{prob.get('contestId')}_{prob.get('index')}"
            verdict = sub.get('verdict', '')

            if key not in problem_map:
                problem_map[key] = {
                    'problem_rating': prob['rating'],
                    'tags':           prob.get('tags', []),
                    'attempts':       0,
                    'solved':         False
                }

            problem_map[key]['attempts'] += 1
            if verdict == 'OK':
                problem_map[key]['solved'] = True

        # Convert to rows
        for key, stats in problem_map.items():
            p_rating = stats['problem_rating']
            tags     = stats['tags']

            def rating_to_complexity(r):
                if r <= 1200: return 1
                elif r <= 1600: return 2
                elif r <= 1900: return 3
                elif r <= 2200: return 4
                else: return 5

            rating_gap       = user_rating - p_rating
            topic_complexity = rating_to_complexity(p_rating)
            mastered         = 1 if stats['solved'] else 0

            all_rows.append({
                'handle':               handle,
                'rating_at_submission': user_rating,
                'problem_rating':       p_rating,
                'rating_gap':           rating_gap,
                'topic_complexity':     topic_complexity,
                'attempts':             stats['attempts'],
                'mastered':             mastered
            })

        print(f"  Added {len(problem_map)} problem records")

    except requests.exceptions.Timeout:
        print(f"  Timeout for {handle}, skipping")
    except Exception as e:
        print(f"  Error for {handle}: {e}")

    time.sleep(2)  # respect CF rate limit

df = pd.DataFrame(all_rows)

if len(df) == 0:
    print("\nNo data fetched — generating fallback synthetic data...")
    # Fallback: realistic synthetic based on CF rating distributions
    import numpy as np
    np.random.seed(42)
    rows = []
    for _ in range(5000):
        user_r   = np.random.choice([800,900,1000,1100,1200,1400,1600,1800,2000,2200,2400])
        prob_r   = np.random.choice([800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,2400,2600,2800,3000,3200,3500])
        gap      = user_r - prob_r
        mastered = 1 if (gap > 0 and np.random.random() > 0.2) or (gap <= 0 and np.random.random() > 0.8) else 0
        rows.append({
            'handle':               'synthetic',
            'rating_at_submission': user_r,
            'problem_rating':       prob_r,
            'rating_gap':           gap,
            'topic_complexity':     1 if prob_r<=1200 else 2 if prob_r<=1600 else 3 if prob_r<=1900 else 4 if prob_r<=2200 else 5,
            'attempts':             np.random.randint(1, 8),
            'mastered':             mastered
        })
    df = pd.DataFrame(rows)

df.to_csv('data/user_submissions_real.csv', index=False)
print(f"\nSaved {len(df)} rows to data/user_submissions_real.csv")
print(df['mastered'].value_counts())
print(df.head())