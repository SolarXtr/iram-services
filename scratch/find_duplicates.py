import json
import sys
from datetime import datetime

# Load data
def load_json(path):
    with open(path, 'r', encoding='utf-16') as f:
        # Wrangler output might have some warnings before the JSON array. We need to parse the JSON array properly.
        # But wait, we redirected standard output! Wrangler prints warnings to stdout!
        # Let's try to extract the JSON array part.
        content = f.read()
        try:
            start_idx = content.find('[\n  {\n    "results": [')
            if start_idx == -1:
                start_idx = content.find('[')
            json_data = json.loads(content[start_idx:])
            return json_data[0]['results']
        except Exception as e:
            print(f"Error parsing {path}: {e}")
            return []

users = load_json(r'D:\.gemini\antigravity\scratch\iram-services\scratch\remote_irUser.json')
profiles = load_json(r'D:\.gemini\antigravity\scratch\iram-services\scratch\remote_irResearcherProfile.json')

# Build lookup dictionaries for OLD users
old_users_by_name = {}
old_profiles_by_nameTh = {}

old_users = []
new_users = []

for u in users:
    # We identify new users created today (2026-07-22)
    is_new = '2026-07-22' in u['createdAt'] and 'no-email-' in u['email']
    if is_new:
        new_users.append(u)
    else:
        old_users.append(u)
        if u['name'] and u['name'].strip():
            old_users_by_name[u['name'].strip().lower()] = u['id']

for p in profiles:
    # If the profile belongs to an old user
    if p['userId'] in [u['id'] for u in old_users]:
        if p['nameTh'] and p['nameTh'].strip():
            old_profiles_by_nameTh[p['nameTh'].strip().replace(" ", "")] = p['userId']
            
# Map new users to new profiles
new_profiles = {p['userId']: p for p in profiles if p['userId'] in [u['id'] for u in new_users]}

sql_statements = []
matched_count = 0

for nu in new_users:
    matched_old_id = None
    name_en = nu['name'].strip()
    
    # Try match by name_en
    if name_en.lower() in old_users_by_name:
        matched_old_id = old_users_by_name[name_en.lower()]
    
    # Try match by nameTh
    if not matched_old_id and nu['id'] in new_profiles:
        name_th = new_profiles[nu['id']]['nameTh'].strip().replace(" ", "")
        if name_th in old_profiles_by_nameTh:
            matched_old_id = old_profiles_by_nameTh[name_th]
            
    if matched_old_id:
        matched_count += 1
        print(f"Found match: '{name_en}' -> Old ID: {matched_old_id} | New ID: {nu['id']}")
        new_id = nu['id']
        sql_statements.append(f"-- Merging duplicate for {name_en}")
        sql_statements.append(f"UPDATE irConsultation SET advisorId = '{matched_old_id}' WHERE advisorId = '{new_id}';")
        sql_statements.append(f"UPDATE irConsultation SET requesterId = '{matched_old_id}' WHERE requesterId = '{new_id}';")
        sql_statements.append(f"DELETE FROM irResearcherProfile WHERE userId = '{new_id}';")
        sql_statements.append(f"DELETE FROM irUser WHERE id = '{new_id}';\n")
        
print(f"Total duplicates found: {matched_count}")

sql_path = r'C:\Users\tinnakornh\.gemini\antigravity\brain\b31db261-266f-44a9-bf40-fb1f964ad43b\merge_duplicates_remote.sql'
with open(sql_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))
