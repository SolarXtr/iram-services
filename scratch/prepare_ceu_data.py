import json
import os
import sys

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, bool):
        return "1" if val else "0"
    # Replace single quotes with two single quotes for SQL
    clean_val = str(val).replace("'", "''")
    return f"'{clean_val}'"

def main():
    json_path = '../mock-db.json'
    out_path = r'C:\Users\tinnakornh\.gemini\antigravity\brain\b31db261-266f-44a9-bf40-fb1f964ad43b\preview_ceu_data.sql'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    users = data.get('users', [])
    projects = data.get('projects', [])
    consultations = data.get('consultations', [])
    
    # Filter for CEU data
    ceu_users = [u for u in users if 'ceu' in u.get('id', '').lower() or 'ceu' in u.get('email', '').lower()]
    # To avoid foreign key errors, let's include non-CEU users if they are leaders of CEU projects or involved in consultations
    ceu_projects = [p for p in projects if p.get('ceuConsultDate') or 'ceu' in p.get('id', '').lower()]
    
    # Identify required users (all ceu_users + leaders of ceu_projects + requesters/advisors in consultations)
    required_user_ids = set([u['id'] for u in ceu_users])
    for p in ceu_projects:
        if p.get('leaderId'):
            required_user_ids.add(p['leaderId'])
            
    for c in consultations:
        if c.get('advisorId'):
            required_user_ids.add(c['advisorId'])
        if c.get('requesterId'):
            required_user_ids.add(c['requesterId'])
            
    # Also fetch the actual user objects for those required IDs
    all_users_to_insert = [u for u in users if u['id'] in required_user_ids]
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("-- =========================================\n")
        f.write("-- CEU Data Preview SQL\n")
        f.write("-- Do NOT execute unless confirmed by USER\n")
        f.write("-- =========================================\n\n")
        
        f.write("-- 1. Insert Users\n")
        for u in all_users_to_insert:
            role = "RESEARCHER" # Override as requested by user
            if u['id'] in ['user-3', 'user-4']: # Keep some base mock roles if they are staff
                role = u.get('role', 'RESEARCHER').split(',')[0]
                
            f.write(f"INSERT OR IGNORE INTO \"irUser\" (\"id\", \"name\", \"email\", \"role\", \"isDeleted\", \"createdAt\", \"updatedAt\") VALUES ")
            f.write(f"({escape_sql(u.get('id'))}, {escape_sql(u.get('name'))}, {escape_sql(u.get('email'))}, {escape_sql(role)}, {escape_sql(u.get('isDeleted', False))}, {escape_sql(u.get('createdAt'))}, {escape_sql(u.get('updatedAt'))});\n")
            
        # --- CEU Projects Insertion Removed ---
        # User explicitly requested to NOT mix CEU projects with irResearchProject (Funding)
        # f.write("\n-- 2. Insert Research Projects (CEU)\n")
        # for p in ceu_projects:
        #     f.write(f"INSERT OR IGNORE INTO \"irResearchProject\" ... )

        f.write("\n-- 3. Insert Consultations\n")
        for c in consultations:
            f.write(f"INSERT OR IGNORE INTO \"irConsultation\" (\"id\", \"type\", \"appointmentTime\", \"status\", \"advisorId\", \"requesterId\", \"isDeleted\", \"createdAt\", \"updatedAt\") VALUES ")
            f.write(f"({escape_sql(c.get('id'))}, {escape_sql(c.get('type'))}, {escape_sql(c.get('appointmentTime'))}, {escape_sql(c.get('status'))}, {escape_sql(c.get('advisorId'))}, {escape_sql(c.get('requesterId'))}, {escape_sql(c.get('isDeleted', False))}, {escape_sql(c.get('createdAt'))}, {escape_sql(c.get('updatedAt'))});\n")
            
    print(f"Preview SQL generated at: {out_path}")

if __name__ == '__main__':
    main()
