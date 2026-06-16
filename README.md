# iRAM-Services - Research Management System

This is a [Next.js](https://nextjs.org) project for managing research projects, publications, presentations, and consultations.

## 🚀 Quick Start

### Development (Local - Mock Database)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

The development environment uses **in-memory Mock data** - no database setup required!

### Production (Cloudflare D1)

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx @cloudflare/next-on-pages --skip-build
npx wrangler deploy --no-bundle
```

## 📊 Database Modes

The system supports **2 modes**:

| Mode | Environment | Database | Status |
|------|-------------|----------|--------|
| **Mock** | Local / Development | In-memory JSON data | Ready for development |
| **D1** | Production | Cloudflare D1 (SQLite) | Ready for production |

### Switching Between Modes

**For Local Development (Mock - Default):**
```bash
npm run dev
```

**For Production on Cloudflare (D1):**
```bash
npm run build
npx wrangler d1 execute iram-db --file=./d1-schema.sql --remote
npx wrangler deploy --no-bundle
```

## 🗄️ Database Schema

The system manages 5 main entities:

1. **irUser** - Users (RESEARCHER, STAFF, EXECUTIVE)
2. **irResearchProject** - Research projects with budget tracking
3. **irPublication** - Research publications (journal, quartile, rewards)
4. **irPresentation** - Conference presentations (ORAL, POSTER)
5. **irConsultation** - Consultation appointments (PROTOCOL, STATISTICAL)

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server (Mock DB)

# Production
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database Management
npx wrangler d1 execute iram-db --file=./d1-schema.sql --remote
# Update D1 schema (when making changes to d1-schema.sql)
```

## 📝 Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard pages
│   ├── my-workspace/  # User workspace
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Main page
│   └── globals.css    # Global styles
└── lib/
    ├── apiDb.ts       # Database abstraction layer (Mock/D1)
    ├── db.ts          # D1 query execution
    └── mockDb.ts      # Mock database implementation
```

## 🔄 API Layer Architecture

The `apiDb` Proxy dynamically selects the appropriate database handler:

```typescript
// Works the same in both Mock and D1 environments
const users = await apiDb.users.findMany();
const project = await apiDb.projects.findUnique(projectId);
const newProject = await apiDb.projects.create(projectData);
```

## 🔒 No External Dependencies

- ✅ **No PostgreSQL needed** - Mock data in development
- ✅ **No environment setup** - Works out of the box locally
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Seamless scaling** - Switch to D1 for production

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🚢 Deploy on Cloudflare

```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler deploy --no-bundle
```

For more details, check the [deployment documentation](https://developers.cloudflare.com/workers/platform/deploy/).
