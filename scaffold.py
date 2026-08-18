import os

modules = ['projects', 'researchers', 'publications', 'presentations', 'documents', 'reports']
base = 'src/app'

for m in modules:
    # Showroom
    showroom_dir = os.path.join(base, m)
    os.makedirs(showroom_dir, exist_ok=True)
    with open(os.path.join(showroom_dir, 'page.tsx'), 'w', encoding='utf-8') as f:
        f.write(f'export default function Page() {{\n  return <div className="p-8"><h1>{m.capitalize()} Showroom</h1></div>;\n}}\n')
    
    # Admin
    admin_dir = os.path.join(base, 'admin', m)
    os.makedirs(admin_dir, exist_ok=True)
    with open(os.path.join(admin_dir, 'page.tsx'), 'w', encoding='utf-8') as f:
        f.write(f'export default function Page() {{\n  return <div className="p-8"><h1>{m.capitalize()} Admin</h1></div>;\n}}\n')

print("Scaffolding complete.")
