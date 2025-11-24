# Getting Started with Sensei

Welcome to the Sensei MVP project! This guide will help you understand the project structure and start development.

## 📚 Documentation Overview

We've created a comprehensive documentation structure to guide development:

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [README.md](README.md) | Project overview, quick start, commands | **Start here** |
| [CLAUDE.md](CLAUDE.md) | 4-phase development guide (Plan → Verify) | Before coding |
| [sensei_prd.md](sensei_prd.md) | Product requirements document | For feature clarity |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture deep dive | Understanding design |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | File organization guide | Finding files |
| [.env.example](.env.example) | Environment variables template | Setup |

## 🎯 Current Status

```
✅ Phase 1: Planning (COMPLETE)
   ├── ✅ Folder structure created
   ├── ✅ Documentation written
   ├── ✅ Architecture defined
   └── ✅ Development guide ready

✅ Phase 2: Validation (COMPLETE)
   ├── ✅ Requirements reviewed
   ├── ✅ Tech stack validated
   └── ✅ Dependencies installed

✅ Phase 3: Execute (COMPLETE)
   ├── ✅ Authentication implemented
   ├── ✅ 8-step session flow built
   ├── ✅ AI scoring integrated (with mock fallback)
   ├── ✅ Gamification system added
   ├── ✅ Progress tracking implemented
   └── ✅ UI/UX polished

🔄 Phase 4: Verify (IN PROGRESS)
   ├── ✅ 145 unit tests passing
   ├── ✅ 7 E2E auth tests passing
   ├── ✅ 5 E2E session tests passing (real backend!) 🎉
   ├── ⏳ 4 E2E session tests (selector fixes needed)
   └── ⏳ Manual testing validation
```

## 🚀 Quick Start Checklist

### Prerequisites
- [x] Node.js 18+ installed
- [x] npm or yarn installed
- [ ] Anthropic API key (optional - mock scoring available)

### Initial Setup
- [x] Navigate to the project root
- [x] Copy `.env.example` to `.env.local`
- [ ] Add your `ANTHROPIC_API_KEY` to `.env.local` (optional)
- [x] Run `npm install`
- [x] Initialize Prisma and seed database
- [x] Start development server

### Testing the Application
- [ ] Navigate to http://localhost:3000
- [ ] Complete magic link authentication
- [ ] Start and complete a practice session
- [ ] View progress and settings
- [ ] Run test suite: `npm test` and `npm run test:e2e`

## 📁 Project Structure at a Glance

```
./
├── 📄 Root: Configs & docs
├── 🗄️ prisma/: Database schema & migrations
├── 🌐 public/: Static assets & OpenAPI spec
├── 📚 docs/: Architecture & guides
└── 💻 src/: Application code
    ├── app/: Next.js pages & API routes
    ├── components/: React components
    ├── services/: Business logic
    ├── schemas/: Validation
    ├── types/: TypeScript types
    ├── contexts/: Global state
    └── lib/: Utilities
```

## 🎓 Understanding the Architecture

### Layer Flow
```
User Interface (React Components + Framer Motion)
        ↓
Global State (React Contexts)
        ↓
API Client (Frontend → Backend)
        ↓
API Routes (Thin Controllers)
        ↓
Services Layer (Business Logic)
        ↓
Prisma ORM
        ↓
SQLite Database
```

### Key Principles
1. **Separation of Concerns**: Each layer has one job
2. **Type Safety**: TypeScript + Zod everywhere
3. **Local First**: SQLite, no Docker required
4. **Testable**: Services are independently testable (145 unit tests)
5. **Scalable**: Easy upgrade path to production
6. **Mock-Ready**: Works without external API dependencies

## 🛠️ Development Workflow

### Adding a New Feature

1. **Plan** (CLAUDE.md Phase 2)
   - Review PRD requirements
   - Define API contract
   - Plan database changes

2. **Database** (if needed)
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name feature_name
   npx prisma generate
   ```

3. **Backend**
   - Create Zod schema in `src/schemas/`
   - Implement service in `src/services/`
   - Add API route in `src/app/api/`
   - Define types in `src/types/`

4. **Frontend**
   - Create components in `src/components/`
   - Add page in `src/app/`
   - Update contexts if needed

5. **Test**
   - Manual testing
   - Write tests (optional for MVP)

6. **Document**
   - Update OpenAPI spec if API changed
   - Add comments for complex logic

## 📖 Key Files to Read First

### For Product Understanding
1. [sensei_prd.md](sensei_prd.md) - What we're building
2. [README.md](README.md) - How to run it

### For Technical Understanding
1. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - How it works
2. [CLAUDE.md](CLAUDE.md) - How to build it
3. [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Where files go

### For Implementation
1. `src/services/README.md` - Business logic patterns
2. `src/schemas/README.md` - Validation patterns
3. `src/app/api/README.md` - API patterns
4. `src/components/README.md` - Component patterns

## 🎯 Next Steps

### ✅ Completed
1. ✅ Initialized Next.js project
2. ✅ Set up Prisma with SQLite
3. ✅ Implemented magic link authentication
4. ✅ Built complete 8-step session flow
5. ✅ Integrated AI scoring (Anthropic Claude) with mock fallback
6. ✅ Added gamification system (XP, levels, streaks)
7. ✅ Created 145 unit tests
8. ✅ Set up E2E testing with Playwright

### 🔄 In Progress (Phase 4: Verify)
1. ✅ **E2E backend integration complete!** (5/9 tests passing)
2. ⏳ Fix remaining 4 E2E tests (selector issues)
3. ⏳ Manual testing of all user flows
4. ⏳ Performance optimization
5. ⏳ Accessibility audit
6. ⏳ Final polish and bug fixes

### 🚀 Future Enhancements
1. Real-time collaboration features
2. Social features (leaderboards, sharing)
3. Mobile app (React Native)
4. Advanced analytics dashboard
5. Premium features and monetization

## 💡 Development Tips

### For Humans
- Read the PRD first to understand the product vision
- Check CLAUDE.md for the development roadmap
- Use the README files in each directory as guides
- Follow the established patterns in existing code

### For AI Agents
- This project is structured for AI-friendly navigation
- Each layer has clear responsibilities
- Types and schemas provide strong contracts
- Services are stateless and testable
- File names follow consistent conventions

## 🔍 Finding What You Need

| I want to... | Go to... |
|--------------|----------|
| Understand the product | `sensei_prd.md` |
| Get started quickly | `README.md` |
| Understand architecture | `docs/ARCHITECTURE.md` |
| Find where files go | `docs/PROJECT_STRUCTURE.md` |
| Follow dev process | `CLAUDE.md` |
| See file patterns | `src/*/README.md` |
| Check API spec | `public/openapi.json` |

## 🎨 Development Phases from CLAUDE.md

### Phase 1: Planning ✅
- Architecture decisions
- Tech stack selection
- Project structure design
- Database schema planning
- API design

### Phase 2: Validation ⏳
- Requirements review
- Technical validation
- API contract review
- Dependency audit

### Phase 3: Execute
- Setup and bootstrap
- 6 implementation sprints
- Feature development
- Testing

### Phase 4: Verify
- Manual testing
- Acceptance criteria validation
- Performance testing
- Security audit
- Pre-production checklist

## 📞 Getting Help

### Resources
- **PRD Questions**: Check [sensei_prd.md](sensei_prd.md) Section 14 (Open Questions)
- **Technical Questions**: Check [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) Q&A section
- **Code Patterns**: Check `src/*/README.md` files
- **API Questions**: Check `public/openapi.json` (when created)

### Common Questions

**Q: Where do I start coding?**
A: Follow Phase 2 (Validation) in CLAUDE.md first, then Phase 3 (Execute).

**Q: How do I add a new API endpoint?**
A: See `src/app/api/README.md` for the pattern.

**Q: Where does business logic go?**
A: Always in `src/services/`. API routes should be thin controllers.

**Q: How do I validate inputs?**
A: Create Zod schemas in `src/schemas/` and use them in API routes.

**Q: Can I change the database from SQLite?**
A: Yes! Just update `DATABASE_URL` in `.env.local` and re-run migrations.

## 🎉 You're Ready!

You now have:
- ✅ Complete folder structure
- ✅ Comprehensive documentation
- ✅ Fully implemented application
- ✅ 145 unit tests passing
- ✅ 7 E2E auth tests passing
- ✅ **5 E2E session tests passing with REAL backend!** 🎉
- ✅ Mock scoring system (no API key needed)
- ✅ Development server running at http://localhost:3000

**Major Milestone**: E2E tests now use real backend authentication!
- Tests create actual users in the database
- Real JWT tokens, not mocked
- Full-stack integration testing (frontend + backend + database)

**Next Action**: Test the application, provide feedback, and help us improve!

**Testing Guide**: See [TESTING.md](TESTING.md) for complete testing documentation

---

**Happy Testing! 🚀**

Built with ❤️ for product managers and aspiring PMs

**Last Updated**: 2025-11-14
