import json

with open('../mock-db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

users = data.get('users', [])
projects = data.get('projects', [])
consultations = data.get('consultations', [])

print(f"Total Users: {len(users)}")
ceu_users = [u for u in users if 'ceu' in u.get('id', '').lower() or 'ceu' in u.get('email', '').lower()]
print(f"CEU Users: {len(ceu_users)}")
if ceu_users:
    print(f"Sample CEU User: {ceu_users[0]}")

print(f"\nTotal Projects: {len(projects)}")
ceu_projects = [p for p in projects if p.get('ceuConsultDate') or 'ceu' in p.get('id', '').lower()]
print(f"Projects with CEU Consult: {len(ceu_projects)}")
if ceu_projects:
    print(f"Sample CEU Project: {ceu_projects[0]}")

print(f"\nTotal Consultations: {len(consultations)}")
if consultations:
    print(f"Sample Consultation: {consultations[0]}")
    status_counts = {}
    type_counts = {}
    for c in consultations:
        status_counts[c.get('status', 'None')] = status_counts.get(c.get('status', 'None'), 0) + 1
        type_counts[c.get('type', 'None')] = type_counts.get(c.get('type', 'None'), 0) + 1
    print(f"Consultation Status: {status_counts}")
    print(f"Consultation Types: {type_counts}")
