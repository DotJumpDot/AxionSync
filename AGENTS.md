# AGENTS Guidelines for This Repository

This repository contains **AxionSync**, a full-stack monorepo with:
- **Backend**: FastAPI (Python) in `AxionSync_Backend/`
- **Frontend**: Next.js (TypeScript) in `AxionSync_Frontend/`
- **Infrastructure**: Docker Compose, PostgreSQL, Redis

When working on the project interactively with an agent, please follow the guidelines below
to ensure smooth development with Hot Module Replacement (HMR) and proper service management.

---

## 1. Development Workflow

### Backend (FastAPI)
* **Always configure Python environment first** before running any Python commands
* **Use `uvicorn` in reload mode** for hot-reloading during development
* **Do _not_ run production WSGI servers** (e.g., gunicorn without reload) during development
* **Never run database migrations blindly** — review schema changes first

**Start Backend Dev Server:**
```bash
cd AxionSync_Backend
python main.py
# Or with uvicorn directly:
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)
* **Always use `npm run dev`** while iterating on the frontend
* **Do _not_ run `npm run build`** inside agent sessions — this disables HMR
* **Restart dev server** after dependency changes

**Start Frontend Dev Server:**
```bash
cd AxionSync_Frontend
npm run dev
```

### Docker Compose (Full Stack)
* During development don't use any docker or Redis
<!-- Use Docker Compose for running PostgreSQL and Redis services
**Do _not_ restart services unnecessarily** during active development


**Start Services:**
```bash
docker-compose up -d
``` -->

---

## 2. Project Structure

```
AxionSync/
├── AxionSync_Backend/          # FastAPI Python backend
│   ├── main.py                 # Application entry point
│   ├── requirements.txt        # Python dependencies
│   └── src/
│       ├── api/                # API route handlers
│       ├── models/             # Pydantic models & entities
│       ├── services/           # Business logic
│       ├── sql_query/          # SQL queries
│       └── workers/            # Background workers (Redis)
│
├── AxionSync_Frontend/         # Next.js TypeScript frontend
│   ├── package.json            # Node dependencies
│   ├── next.config.ts          # Next.js configuration
│   ├── src/
│   │   ├── app/                # App router pages
│   │   ├── Components/         # React components
│   │   ├── Service/            # API service layer
│   │   ├── Store/              # Zustand state management
│   │   └── Types/              # TypeScript types
│   └── public/                 # Static assets
│
├── docker-compose.yml          # PostgreSQL, Redis services
├── turbo.json                  # Turborepo configuration
└── Docs/                       # Documentation
    ├── README.md
    ├── README_TH.md
    └── schema.md               # Database schema documentation
```

---

## 3. Keep Dependencies in Sync

### Backend (Python)
When adding/updating Python packages:
```bash
cd AxionSync_Backend
pip install <package>
pip freeze > requirements.txt
```

### Frontend (Node)
When adding/updating npm packages:
```bash
cd AxionSync_Frontend
npm install <package>
# This auto-updates package-lock.json
# Restart dev server after changes
```

---

## 4. File Naming Conventions

### Backend (Python)
Follow these strict naming patterns for consistency:

| Layer | Pattern | Example |
|-------|---------|---------|
| API Routes | `api_{feature}.py` | `api_bookmark.py`, `api_todo.py`, `api_auth.py` |
| Entity Models | `en_{feature}.py` | `en_bookmark.py`, `en_user.py`, `en_memo.py` |
| Function Models | `ft_{feature}.py` | `ft_auth.py` |
| Services | `sv_{feature}.py` | `sv_bookmark.py`, `sv_todo.py`, `sv_auth.py` |
| SQL Queries | `sql_{feature}.py` | `sql_bookmark.py`, `sql_todo.py`, `sql_user.py` |
| Workers | `{name}_worker.py` | `notification_worker.py` |
| Database | `connect.py` | Database connection module |

**Rules:**
- Use **snake_case** for all Python files
- Prefix indicates the layer/purpose
- Feature name should match across all layers (e.g., `bookmark` appears in `api_bookmark.py`, `sv_bookmark.py`, `sql_bookmark.py`, `en_bookmark.py`)

### Frontend (TypeScript)
Follow these naming patterns:

| Layer | Pattern | Example |
|-------|---------|---------|
| Components | `PascalCase.tsx` | `LanguageSwitcher.tsx`, `Loading.tsx` |
| Component Folders | `PascalCase/` | `Auth/`, `Bookmark/`, `Memo/`, `Todo/`, `Header/` |
| Services | `lowercase.ts` | `auth.ts`, `bookmark.ts`, `memo.ts`, `todo.ts` |
| Store (Zustand) | `lowercase.ts` | `auth.ts`, `bookmark.ts`, `memo.ts`, `todo.ts` |
| Types | `PascalCase.ts` | `Auth.ts`, `Bookmark.ts`, `Memo.ts`, `Todo.ts` |
| Functions/Utils | `PascalCase/` | `Auth/`, `Bookmark/`, `Memo/`, `Todo/` |
| Config Files | `lowercase.ts` | `http.ts`, `config.ts` |
| Function Files | `{feature}_function_{purpose}.ts` | `memo_function_color.ts`, `bookmark_function_sort.ts` |

**Rules:**
- Use **PascalCase** for React components and TypeScript type files
- Use **lowercase** for service and store files
- Feature names should be consistent across Service, Store, and Types layers
- For function files inside `Functions/{Feature}/`, use `{feature}_function_{purpose}.ts` (e.g., `memo_function_color.ts`)
- If a component or function folder contains 3 or more files, always include an `index.ts` file to re-export or organize exports for that folder

---

## 5. Coding Conventions

### Backend (Python)
* **Prefer async/await** for database queries and I/O operations
* **Use Pydantic v2 models** for request/response validation
* **Use type hints** throughout Python code
* **Follow layered architecture**:
  - `api/` → Route handlers (thin layer, delegates to services)
  - `services/` → Business logic (orchestrates SQL queries)
  - `sql_query/` → Raw SQL queries (separated from logic)
  - `models/entity/` → Pydantic models for database entities
  - `models/function/` → Pydantic models for request/response
* **Import patterns**:
  ```python
  from src.models.entity.en_user import UserEntity
  from src.services.sv_auth import AuthService
  from src.sql_query.sql_user import UserQueries
  ```

### Frontend (TypeScript)
* **Prefer TypeScript** (`.tsx`/`.ts`) for all new code
* **Use Zustand** for state management (see `Store/` directory)
* **Co-locate component styles** with components when practical
* **Follow Next.js App Router** patterns (in `app/[locale]/`)
* **Use `next-intl`** for internationalization (English/Thai)
* **Layered architecture**:
  - `Components/` → React UI components
  - `Service/` → API client calls (using Axios)
  - `Store/` → Zustand state management
  - `Types/` → TypeScript interfaces and types
  - `Functions/` → Utility functions and helpers
* **Import patterns**:
  ```typescript
  import { bookmarkService } from '@/Service/bookmark';
  import { useBookmarkStore } from '@/Store/bookmark';
  import type { Bookmark } from '@/Types/Bookmark';
  ```

---

## 6. Database

### Database
* **PostgreSQL** runs on port 5433 (via Docker)
* **Schema documentation** in `Docs/schema.md`
* **Run migrations carefully** — always review SQL before executing

---

## 7. Useful Commands

### Backend
| Command | Purpose |
|---------|---------|
| `cd AxionSync_Backend && python main.py` | Start FastAPI dev server with reload |
| `pip install -r requirements.txt` | Install Python dependencies |
| `python -m src.workers.notification_worker` | Start Redis notification worker |

### Frontend
| Command | Purpose |
|---------|---------|
| `cd AxionSync_Frontend && npm run dev` | Start Next.js dev server with HMR |
| `npm run lint` | Run ESLint checks |
| `npm install` | Install Node dependencies |
| `npm run build` | **Production build — _do not run during agent sessions_** |

### Infrastructure
| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | Start PostgreSQL and Redis |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View service logs |

---

## 8. Key Technologies

**Backend Stack:**
- FastAPI, Python 3.x
- PostgreSQL (psycopg2)
- Redis (aioredis)
- Pydantic v2
- Bcrypt (password hashing)
- Uvicorn (ASGI server)

**Frontend Stack:**
- Next.js 15+, React 19+
- TypeScript
- Zustand (state management)
- Ant Design, Mantine UI
- TailwindCSS
- next-intl (i18n)
- Axios (HTTP client)

**DevOps:**
- Docker Compose
- Turbopack (Next.js bundler)

---

Following these practices ensures fast, dependable agent-assisted development. When in doubt:
- **Backend**: Restart uvicorn with `--reload`
- **Frontend**: Restart `npm run dev`
- **Services**: Check `docker-compose logs`