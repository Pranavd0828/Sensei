# Migration Guide: Moving Sensei MVP to Another Computer

This guide will help you successfully migrate the Sensei MVP project to your personal laptop.

## 📦 What's Included in the Migration Package

```
 sensei-migration.zip
├── Source Code (all project files)
├── Documentation (all .md files)
├── Configuration files (.env.example, configs)
├── Database schema (prisma/)
└── This migration guide
```

## ⚠️ What's NOT Included (and why)

These files are excluded from the zip and will be regenerated on the new machine:

- `node_modules/` - Dependencies (will reinstall)
- `.next/` - Build cache (will regenerate)
- `dev.db` - Development database with test data (will recreate)
- `*.db-journal` - SQLite temporary files
- `.env.local` - Contains secrets (will create new)
- Test result artifacts (`test-results/`, `playwright-report/`)

## 🚀 Step-by-Step Migration Process

### Step 1: Extract the Zip File

```bash
# Navigate to where you want the project
cd ~/Projects  # or wherever you keep your code

# Extract the zip file
unzip sensei-migration.zip
cd sensei
```

### Step 2: Verify Prerequisites

Check that you have the required software installed:

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Check git (optional, but recommended)
git --version
```

**If Node.js is not installed:**
- Download from: https://nodejs.org/
- Install version 18 or higher (LTS recommended)

### Step 3: Install Dependencies

```bash
# Install all npm packages
npm install

# This will take 2-5 minutes depending on your internet speed
# You should see packages being downloaded
```

**Expected output:**
```
added 500+ packages in 3m
```

### Step 4: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your preferred editor
nano .env.local  # or vim, code, etc.
```

**Required changes in `.env.local`:**

```bash
# Database (keep as-is for local development)
DATABASE_URL="file:./dev.db"

# Authentication (IMPORTANT: Generate a new secret!)
JWT_SECRET="REPLACE_WITH_NEW_RANDOM_STRING"

# API Keys (optional - app works without it)
ANTHROPIC_API_KEY="sk-ant-your-key-here"  # Optional

# App URL (keep as-is for local)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**How to generate a secure JWT_SECRET:**

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online (use a trusted generator)
# Visit: https://generate-random.org/api-key-generator
```

Copy the generated string and paste it as your `JWT_SECRET`.

### Step 5: Initialize the Database

```bash
# Generate Prisma Client (TypeScript types for database)
npx prisma generate

# Create the database and run migrations
npx prisma migrate dev --name init

# Seed the database with sample prompts
npx prisma db seed
```

**Expected output:**
```
✓ Prisma schema loaded
✓ Database connected
✓ Migrations applied
✓ Database seeded
```

### Step 6: Verify the Setup

```bash
# Run the development server
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.3s
```

### Step 7: Test the Application

1. **Open browser:** Navigate to http://localhost:3000
2. **Should redirect to:** http://localhost:3000/login
3. **Test authentication:**
   - Enter any email (e.g., `your@email.com`)
   - Click "Send login link"
   - Check terminal for magic link
   - Click the magic link (or paste in browser)
   - Should redirect to dashboard

4. **Test a session:**
   - Click "Start session"
   - Complete Step 1 (select objective, enter goal)
   - Verify navigation to Step 2
   - All working? ✅ You're good to go!

### Step 8: Run Tests (Optional but Recommended)

```bash
# Terminal 1: Keep dev server running
npm run dev

# Terminal 2: Run unit tests
npm test

# Expected: ✅ 145 tests passing

# Terminal 2: Run E2E tests
npm run test:e2e

# Expected: ✅ 12 tests (7 auth + 5 session with real backend)
```

## 🔧 Troubleshooting Common Issues

### Issue: "Cannot find module 'next'"

**Problem:** Dependencies not installed

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

**Problem:** Another app is using port 3000

**Solution:**
```bash
# Option 1: Kill the process
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port
PORT=3001 npm run dev
```

### Issue: "Prisma Client not generated"

**Problem:** TypeScript can't find database types

**Solution:**
```bash
npx prisma generate
npm run dev
```

### Issue: "Error: JWT_SECRET is required"

**Problem:** Environment variables not loaded

**Solution:**
1. Check `.env.local` exists in project root
2. Verify it contains `JWT_SECRET="..."`
3. Restart the dev server

### Issue: "Database is locked"

**Problem:** SQLite database file is being accessed by another process

**Solution:**
```bash
# Close Prisma Studio if open
# Then delete the lock file
rm dev.db-journal

# Or reset the database
npx prisma migrate reset
```

### Issue: "Module not found: Can't resolve '@/...'"

**Problem:** TypeScript path aliases not working

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📊 Verifying Everything Works

Use this checklist to ensure the migration was successful:

### Development Environment
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] Environment variables configured (`.env.local` exists)
- [ ] Database initialized (`dev.db` exists)
- [ ] Dev server starts without errors
- [ ] Can access http://localhost:3000

### Application Features
- [ ] Login page loads
- [ ] Magic link authentication works
- [ ] Dashboard displays after login
- [ ] Can start a new session
- [ ] Can navigate through steps
- [ ] Form inputs work correctly
- [ ] Can view settings page

### Testing
- [ ] Unit tests run: `npm test`
- [ ] E2E tests run: `npm run test:e2e`
- [ ] No critical errors in console

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Run production build

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create new migration
npx prisma db seed       # Seed database with test data
npx prisma migrate reset # Reset database (careful!)

# Testing
npm test                 # Run unit tests
npm run test:watch       # Unit tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # E2E tests in UI mode

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## 🔐 Security Considerations

### Before Migrating

1. **Never commit secrets to Git:**
   - `.env.local` should be in `.gitignore` ✅
   - No API keys in source code ✅

2. **Generate NEW secrets on the new machine:**
   - Don't copy the old `JWT_SECRET`
   - Generate a fresh random string
   - This prevents token reuse across environments

3. **Database considerations:**
   - Dev database contains test data only
   - Safe to start fresh with `npx prisma migrate reset`
   - No production data at risk

### After Migrating

1. **Secure your environment:**
   - Keep `.env.local` private
   - Don't commit to Git
   - Don't share in screenshots/logs

2. **If using Git:**
```bash
# Initialize git repository (if not already)
cd sensei
git init
git add .
git commit -m "Initial commit after migration"
```

3. **Verify .gitignore includes:**
```
node_modules/
.next/
.env.local
*.db
*.db-journal
test-results/
playwright-report/
```

## 📂 Understanding the Project Structure

After migration, your project will look like this:

```
./
├── src/                 # Application source code
│   ├── app/            # Next.js pages and API routes
│   ├── components/     # React components
│   ├── services/       # Business logic
│   ├── schemas/        # Validation schemas
│   ├── types/          # TypeScript types
│   └── lib/            # Utilities
├── prisma/             # Database schema and migrations
├── e2e/                # E2E tests
├── public/             # Static assets
├── docs/               # Documentation
├── .env.local          # Environment variables (you create this)
├── dev.db              # SQLite database (generated)
└── node_modules/       # Dependencies (generated)
```

## 🚀 Next Steps After Migration

1. **Familiarize yourself with the project:**
   - Read [GETTING_STARTED.md](GETTING_STARTED.md)
   - Review [README.md](README.md)
   - Check [TESTING.md](TESTING.md)

2. **Verify everything works:**
   - Run the app: `npm run dev`
   - Run tests: `npm test && npm run test:e2e`
   - Open Prisma Studio: `npx prisma studio`

3. **Set up version control (if not already):**
```bash
git init
git add .
git commit -m "Initial commit: Sensei MVP"
```

4. **Optional: Set up IDE:**
   - Install VS Code extensions:
     - ESLint
     - Prettier
     - Prisma
     - Tailwind CSS IntelliSense
   - Enable format on save

## 📞 Getting Help

If you encounter issues during migration:

1. **Check the documentation:**
   - [GETTING_STARTED.md](GETTING_STARTED.md) - General setup
   - [README.md](README.md) - Project overview
   - [TESTING.md](TESTING.md) - Testing guide

2. **Common issues are documented above** - Check the Troubleshooting section

3. **Check dependencies:**
```bash
npm list  # Shows all installed packages
npx prisma studio  # Visual database inspector
```

4. **Verify environment:**
```bash
node --version    # Should be 18+
npm --version     # Should be 9+
cat .env.local    # Check environment variables (be careful not to expose secrets!)
```

## ✅ Migration Complete!

If you've completed all steps above, your migration is successful! 🎉

**Quick verification:**
```bash
# Should all work without errors:
npm run dev           # ✅ Server starts on port 3000
npm test              # ✅ 145 unit tests pass
npm run test:e2e      # ✅ 12 E2E tests pass (requires dev server)
```

**You're ready to:**
- ✅ Develop new features
- ✅ Run the full application
- ✅ Execute all tests
- ✅ Access the database
- ✅ Deploy (when ready)

---

**Last Updated**: 2025-11-14

**Project**: Sensei MVP - Product Sense Practice Game

**For more information**: See [DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
