# ml-service/fetch_cf_data.py
import requests
import pandas as pd
import os

os.makedirs('data', exist_ok=True)

print("Fetching problems from Codeforces API...")

url = "https://codeforces.com/api/problemset.problems"
response = requests.get(url)
data = response.json()

if data['status'] != 'OK':
    print("Error:", data.get('comment'))
    exit()

problems      = data['result']['problems']
problem_stats = data['result']['problemStatistics']

stats_lookup = {
    (s['contestId'], s['index']): s['solvedCount']
    for s in problem_stats
}

rows = []
for p in problems:
    if 'rating' not in p:
        continue

    contest_id = p.get('contestId', 0)
    index      = p.get('index', '')
    rating     = p['rating']
    tags       = p.get('tags', [])
    solved     = stats_lookup.get((contest_id, index), 0)

    if rating <= 1200:
        difficulty = 'easy'
    elif rating <= 1900:
        difficulty = 'medium'
    else:
        difficulty = 'hard'

    hard_tags   = {'dp', 'graphs', 'flows', 'fft', 'geometry'}
    medium_tags = {'trees', 'binary search', 'greedy', 'dfs and bfs'}

    if any(t in hard_tags for t in tags):
        topic_complexity = 5
    elif any(t in medium_tags for t in tags):
        topic_complexity = 3
    else:
        topic_complexity = 1

    rows.append({
        'contest_id':       contest_id,
        'index':            index,
        'cf_rating':        rating,
        'solved_count':     solved,
        'num_tags':         len(tags),
        'topic_complexity': topic_complexity,
        'has_dp':           int('dp' in tags),
        'has_graphs':       int('graphs' in tags),
        'has_math':         int('math' in tags),
        'difficulty':       difficulty
    })

df = pd.DataFrame(rows)
df.to_csv('data/problems_real.csv', index=False)
print(f"Saved {len(df)} real problems")
print(df['difficulty'].value_counts())