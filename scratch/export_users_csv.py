import json
import csv
import subprocess
import os

# We will run the wrangler command and capture its output
result = subprocess.run(
    ["npx.cmd", "wrangler", "d1", "execute", "iram-db", "--local", "--command=SELECT id, name, email, role FROM irUser", "--json"],
    cwd=r"D:\.gemini\antigravity\scratch\iram-backend",
    capture_output=True,
    text=True,
    encoding="utf-8"
)

# Sometimes wrangler outputs some text before the actual JSON array. We extract the JSON.
output = result.stdout
try:
    # Find the start of the JSON array
    json_start = output.find('[')
    if json_start != -1:
        json_str = output[json_start:]
        data = json.loads(json_str)
        
        # The result format for D1 is usually a list of objects, where the first object has 'results'
        rows = data[0]['results']
        
        csv_path = r'C:\Users\tinnakornh\.gemini\antigravity\brain\b31db261-266f-44a9-bf40-fb1f964ad43b\irUser_Export.csv'
        
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f: # utf-8-sig for Excel Thai support
            writer = csv.writer(f)
            writer.writerow(['id', 'name', 'email', 'role'])
            for r in rows:
                writer.writerow([r.get('id'), r.get('name'), r.get('email'), r.get('role')])
                
        print(f"Exported to {csv_path}")
    else:
        print("Could not find JSON output in wrangler response.")
except Exception as e:
    print(f"Error parsing data: {e}")
