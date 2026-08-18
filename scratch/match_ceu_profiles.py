import json
import re
import uuid
import subprocess
import csv
import os

def split_thai_name(full_name):
    # Common Thai medical/academic titles
    titles = [
        "ศ.ดร.นพ.", "ศ.นพ.", "รศ.ดร.นพ.", "รศ.นพ.", "ผศ.ดร.นพ.", "ผศ.นพ.", "อ.นพ.", "นพ.",
        "ศ.ดร.พญ.", "ศ.พญ.", "รศ.ดร.พญ.", "รศ.พญ.", "ผศ.ดร.พญ.", "ผศ.พญ.", "อ.พญ.", "พญ.",
        "ศ.ดร.ทพ.", "ศ.ทพ.", "รศ.ดร.ทพ.", "รศ.ทพ.", "ผศ.ดร.ทพ.", "ผศ.ทพ.", "อ.ทพ.", "ทพ.",
        "ศ.ดร.ทญ.", "ศ.ทญ.", "รศ.ดร.ทญ.", "รศ.ทญ.", "ผศ.ดร.ทญ.", "ผศ.ทญ.", "อ.ทญ.", "ทญ.",
        "ศ.ดร.", "รศ.ดร.", "ผศ.ดร.", "ดร.", "อ.ดร.",
        "ศ.", "รศ.", "ผศ.", "อ.",
        "นายแพทย์", "แพทย์หญิง", "นาย", "นางสาว", "นาง"
    ]
    title = ""
    name = full_name.strip()
    for t in titles:
        if name.startswith(t):
            title = t
            name = name[len(t):].strip()
            break
    return title, name

def run_wrangler_query(query):
    result = subprocess.run(
        ["npx.cmd", "wrangler", "d1", "execute", "iram-db", "--remote", f"--command={query}", "--json"],
        cwd=r"D:\.gemini\antigravity\scratch\iram-backend",
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    output = result.stdout
    json_start = output.find('[')
    if json_start != -1:
        try:
            data = json.loads(output[json_start:])
            return data[0]['results']
        except:
            pass
    return []

def main():
    # 1. Read researchers_list.csv
    csv_map = {}
    with open(r'D:\.gemini\antigravity\scratch\researchers_list.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['name_th']:
                key = row['name_th'].strip().replace(" ", "")
                csv_map[key] = row
                
    # 2. Get D1 data
    ceu_users = run_wrangler_query("SELECT id, name, email FROM irUser WHERE id LIKE 'ceu-user-%'")
    existing_profiles = run_wrangler_query("SELECT id, userId, nameTh FROM irResearcherProfile")
    
    # Existing map
    profile_map = {}
    profile_scopus_map = {}
    for p in existing_profiles:
        if p.get('nameTh'):
            profile_map[p['nameTh'].strip().replace(" ", "")] = p['userId']
            
    # Need to query scopusAuthorId from D1 because existing_profiles didn't select it
    existing_full_profiles = run_wrangler_query("SELECT userId, scopusAuthorId FROM irResearcherProfile")
    for p in existing_full_profiles:
        if p.get('scopusAuthorId'):
            profile_scopus_map[p['scopusAuthorId']] = p['userId']
            
    matched_existing = []
    matched_csv = []
    still_unmatched = []
    
    sql_statements = []
    sql_statements.append("-- SQL to merge matched CEU users into real users\n")
    
    for u in ceu_users:
        ceu_id = u['id']
        full_name = u['name']
        title_th, name_th = split_thai_name(full_name)
        search_key = name_th.replace(" ", "")
        
        # Check if they exist in CSV
        row = csv_map.get(search_key)
        
        # Determine real user ID if they already exist in D1 (either by name or by Scopus ID from CSV)
        real_user_id = None
        if search_key in profile_map:
            real_user_id = profile_map[search_key]
        elif row and row['id'] in profile_scopus_map:
            real_user_id = profile_scopus_map[row['id']]
            
        if real_user_id:
            # Match 1: Already exists in D1 profiles (either name matched or Scopus ID matched)
            matched_existing.append(name_th)
            sql_statements.append(f"-- 1. Merging EXISTING profile: {name_th} ({ceu_id}) -> {real_user_id}")
            sql_statements.append(f"UPDATE irConsultation SET advisorId = '{real_user_id}' WHERE advisorId = '{ceu_id}';")
            sql_statements.append(f"UPDATE irConsultation SET requesterId = '{real_user_id}' WHERE requesterId = '{ceu_id}';")
            sql_statements.append(f"DELETE FROM irUser WHERE id = '{ceu_id}';\n")
            
        elif row:
            # Match 2: Found in CSV but not yet in D1 Profile
            matched_csv.append(name_th)
            row = csv_map[search_key]
            real_user_id = str(uuid.uuid4())
            profile_id = str(uuid.uuid4())
            
            # Cache it so if this person has another CEU account, it merges instead of creating duplicate
            profile_map[search_key] = real_user_id
            
            # Handle empty email constraint
            user_email = row['email'].strip()
            if not user_email:
                user_email = f"no-email-{real_user_id[:8]}@nu.ac.th"
            
            sql_statements.append(f"-- 2. Creating NEW user and profile from CSV: {name_th} ({ceu_id}) -> {real_user_id}")
            # Insert real user (English name)
            sql_statements.append(f"INSERT INTO irUser (id, name, email, role) VALUES ('{real_user_id}', '{row['name_en']}', '{user_email}', 'RESEARCHER');")
            
            # Insert profile (Thai details) - Handle empty Scopus ID
            scopus_val = f"'{row['id']}'" if row['id'].strip() else "NULL"
            sql_statements.append(f"INSERT INTO irResearcherProfile (id, userId, scopusAuthorId, nameTh, titleTh, department, status) VALUES ('{profile_id}', '{real_user_id}', {scopus_val}, '{row['name_th']}', '{row['fname_th']}', '{row['department']}', 'Active');")
            
            # Update links
            sql_statements.append(f"UPDATE irConsultation SET advisorId = '{real_user_id}' WHERE advisorId = '{ceu_id}';")
            sql_statements.append(f"UPDATE irConsultation SET requesterId = '{real_user_id}' WHERE requesterId = '{ceu_id}';")
            # Delete old CEU user
            sql_statements.append(f"DELETE FROM irUser WHERE id = '{ceu_id}';\n")
            
        else:
            # Still Unmatched
            still_unmatched.append((ceu_id, title_th, name_th, u['email']))
            
    sql_path = r'C:\Users\tinnakornh\.gemini\antigravity\brain\b31db261-266f-44a9-bf40-fb1f964ad43b\merge_matched_users_remote.sql'
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
        
    csv_path = r'C:\Users\tinnakornh\.gemini\antigravity\brain\b31db261-266f-44a9-bf40-fb1f964ad43b\unmatched_ceu_users_remote.csv'
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['CEU ID', 'Title', 'Name', 'Email'])
        for u in still_unmatched:
            writer.writerow([u[0], u[1], u[2], u[3]])
            
    print(f"Total CEU Users: {len(ceu_users)}")
    print(f"Matched with existing profiles in D1: {len(matched_existing)}")
    print(f"Matched with researchers_list.csv: {len(matched_csv)}")
    print(f"Still Unmatched: {len(still_unmatched)}")
    print(f"Generated SQL for merges at: {sql_path}")
    print(f"Generated CSV for unmatched at: {csv_path}")

if __name__ == '__main__':
    main()
