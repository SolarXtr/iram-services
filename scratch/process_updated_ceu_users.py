import csv
import uuid
import sys

csv_file = r'D:\.gemini\antigravity\scratch\iRAM_agents_b31db261_unmatched_ceu_users-update.csv'
sql_local_path = r'C:\Users\tinnakornh\.gemini\antigravity\brain\b31db261-266f-44a9-bf40-fb1f964ad43b\insert_updated_users.sql'
sql_remote_path = r'C:\Users\tinnakornh\.gemini\antigravity\brain\b31db261-266f-44a9-bf40-fb1f964ad43b\insert_updated_users_remote.sql'

sql_statements = []

# Cache for users that have multiple CEU IDs (like we saw last time)
name_to_uuid = {}

with open(csv_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    next(reader) # skip header
    for row in reader:
        if not row or len(row) < 5: continue
        ceu_id = row[0].strip()
        name_th = row[1].strip()
        email = row[2].strip()
        role = row[3].strip()
        fname_th = row[4].strip() if len(row) > 4 else ''
        name_en = row[5].strip() if len(row) > 5 else ''
        department = row[6].strip() if len(row) > 6 else ''
        
        # If name_en is empty, we still create them but use their Thai name or a placeholder
        if not name_en:
            name_en = name_th
            
        if not fname_th:
            fname_th = "นพ." # Default fallback or empty string
            
        search_key = f"{fname_th}{name_th}".replace(" ", "")
        
        if search_key in name_to_uuid:
            real_user_id = name_to_uuid[search_key]
            sql_statements.append(f"-- Merging duplicate CEU account for: {name_th} ({ceu_id})")
            sql_statements.append(f"UPDATE irConsultation SET advisorId = '{real_user_id}' WHERE advisorId = '{ceu_id}';")
            sql_statements.append(f"UPDATE irConsultation SET requesterId = '{real_user_id}' WHERE requesterId = '{ceu_id}';")
            sql_statements.append(f"DELETE FROM irUser WHERE id = '{ceu_id}';\n")
        else:
            real_user_id = str(uuid.uuid4())
            profile_id = str(uuid.uuid4())
            name_to_uuid[search_key] = real_user_id
            
            user_email = email
            if not user_email or "iram-ceu.edu" in user_email or user_email.startswith('user.'):
                user_email = f"no-email-{real_user_id[:8]}@nu.ac.th"
                
            sql_statements.append(f"-- Creating new profile for: {name_th} ({ceu_id})")
            sql_statements.append(f"UPDATE irUser SET email = '{ceu_id}-deleted@nu.ac.th' WHERE id = '{ceu_id}';")
            sql_statements.append(f"INSERT INTO irUser (id, name, email, role) VALUES ('{real_user_id}', '{name_en}', '{user_email}', 'RESEARCHER');")
            sql_statements.append(f"UPDATE irConsultation SET advisorId = '{real_user_id}' WHERE advisorId = '{ceu_id}';")
            sql_statements.append(f"UPDATE irConsultation SET requesterId = '{real_user_id}' WHERE requesterId = '{ceu_id}';")
            sql_statements.append(f"INSERT INTO irResearcherProfile (id, userId, scopusAuthorId, nameTh, titleTh, department, status) VALUES ('{profile_id}', '{real_user_id}', NULL, '{name_th}', '{fname_th}', '{department}', 'Active');")
            sql_statements.append(f"DELETE FROM irUser WHERE id = '{ceu_id}';\n")

with open(sql_local_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))
    
with open(sql_remote_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))
    
print(f"Generated SQL for {len(name_to_uuid)} unique users.")
