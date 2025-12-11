# 🧭 AxionSync

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Queue-DC382D?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

> 🌐 **[ภาษาไทย (Thai Version)](Docs/README_TH.md)**
> 🌐 **[Complete Schema & Sample data](Docs/Schema.md)**

**AxionSync** is a comprehensive personal life management platform — bringing everything important together in one place.  
Whether it's **Daily Tasks, Personal Notes, Media Tracker (Books, Movies, Games, Anime)**, or even ideas throughout the day,  
everything is synced and organized systematically to help you focus on what truly matters.

---

## 🚀 Features

### ✅ Task Management (Todo)
- Full CRUD operations for daily tasks
- Status tracking: `Pending`, `In Progress`, `Completed`, `Cancelled`
- Priority levels: `Low`, `Medium`, `High`, `Urgent`
- **Mood tracking** per task: Motivated, Focused, Stressed, etc.
- **Checklist/Sub-tasks** support within todos
- **Recurring tasks**: Daily, Weekly, Monthly repeat options
- **Todo sharing** with other users (view/edit permissions)
- **Streak tracking** & completion analytics
- **Scheduled notifications** via Redis queue (in-app, email, push)
- Soft delete with trash/restore functionality

### 📝 Notes & Memos
- Create and organize notes with custom tabs
- Tab customization: colors, fonts, font sizes
- Rich memo organization with color coding
- Quick search through all notes
- Soft delete with restoration support
- Real-time sync across devices

### 📚 Media Tracker (Bookmark)
- Track: **Games, Movies, Novels, Manga, Manhwa, Anime, Series**
- Status management: `On Going`, `Finished`, `Pre-Watch`, `Dropped`
- **Multi-category ratings**: Story, Action, Graphics, Sound
- **Mood tags**: 20+ mood options (happy, mind-blown, thrilling, etc.)
- Chapter/progress tracking
- Custom cover image uploads
- **Tag system** for categorization
- Public/Private bookmark visibility
- Reviews and short reviews
- Soft delete with trash/restore functionality

### 🔔 Smart Notifications
- **Redis-based background worker** for scheduled notifications
- Multiple channels: In-App, Email, Push
- Graceful shutdown & automatic retry with exponential backoff
- Dead letter queue for failed notifications
- Device token management for push notifications

### 🌍 Internationalization (i18n)
- Full multi-language support (English, Thai)
- Dynamic language switching
- Locale-persisted user preferences

### ☁️ Cloud Sync & Security
- All data synced automatically between devices
- **JWT Bearer Token** authentication
- **bcrypt** password hashing
- Role-based access control (User, Admin)
- **CORS** configured for security

### ⚙️ General
- Customize Swagger (/docs) to enable login and retrieve the token directly within Swagger

---

## 🧩 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **TailwindCSS** | 4.x | Utility-first CSS |
| **Zustand** | 5.0.8 | State management |
| **Ant Design** | 6.1.0 | UI component library |
| **Mantine** | 8.3.8 | React components |
| **Framer Motion** | 12.x | Animations |
| **next-intl** | 4.5.8 | Internationalization |
| **Axios** | 1.13.2 | HTTP client |
| **nuqs** | 2.8.1 | URL query state management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.103.1 | Modern Python web framework |
| **PostgreSQL** | 15 | Relational database |
| **Redis** | - | Job queue & caching |
| **Pydantic** | v2 | Data validation |
| **psycopg2** | - | PostgreSQL adapter |
| **bcrypt** | 4.0.1 | Password hashing |
| **PyJWT** | - | JWT token handling |
| **aioredis** | 2.0.1 | Async Redis client |
| **Uvicorn** | - | ASGI server |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **Docker Compose** | Container orchestration |
| **Turbopack** | Fast bundler for Next.js |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |

---

## 🏗️ Architecture

```
AxionSync/
├── AxionSync_Frontend/          # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   └── [locale]/        # i18n routes (en, th)
│   │   ├── Components/          # Reusable UI components
│   │   │   ├── Auth/            # Login, Register forms
│   │   │   ├── Bookmark/        # Media tracker components
│   │   │   ├── Memo/            # Notes components
│   │   │   ├── Todo/            # Task management components
│   │   │   └── Modal/           # Modal components
│   │   ├── Functions/           # Business logic helpers
│   │   ├── Service/             # API service layer (Axios)
│   │   ├── Store/               # Zustand state stores
│   │   ├── Types/               # TypeScript interfaces
│   │   └── languages/           # i18n translations
│   └── public/                  # Static assets
│
├── AxionSync_Backend/           # FastAPI Backend
│   ├── main.py                  # Application entry point
│   └── src/
│       ├── api/                 # API route handlers
│       ├── database/            # Database connection
│       ├── models/              # Pydantic models
│       │   ├── entity/          # Database entities
│       │   └── function/        # Auth functions
│       ├── services/            # Business logic layer
│       ├── sql_query/           # SQL query layer
│       └── workers/             # Background workers
│           ├── notification_worker.py  # Notification processor
│           └── redis_queue.py          # Redis job queue
│
└── docker-compose.yml           # Docker orchestration
```

---

## 📊 Database Schema

### Core Entities
- **User** - Authentication, profile, roles
- **Memo** - Notes with tab organization
- **Tab** - Customizable memo categories
- **Todo** - Tasks with status, priority, mood
- **TodoItem** - Checklist sub-tasks
- **TodoTag** - Custom tags for todos
- **TodoShare** - Collaborative sharing
- **TodoStatusHistory** - Change tracking for analytics
- **Bookmark** - Media tracking
- **Tag** - Bookmark categorization
- **TodoNotification** - Scheduled reminders
- **UserDeviceToken** - Push notification tokens

---

## ⚙️ Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- Redis (optional, for notifications)
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/DotJumpDot/AxionSync.git
cd AxionSync

# Copy environment file
cp env.example .env

# Start all services
docker-compose up -d
```

### Option 2: Manual Setup

**Backend:**
```bash
cd AxionSync_Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd AxionSync_Frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/axionsync

# JWT
JWT_EXPIRE_MINUTES=60
JWT_SECRET=your-secret-key

# API Key
X_API_KEY=['your-api-key']

# Frontend URL (for CORS)
FRONTEND_BASE_URL=http://localhost:3000

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🔌 API Documentation

Once the backend is running, access the interactive API docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | User authentication |
| `POST` | `/users/register` | User registration |
| `GET` | `/todos/` | Get all todos |
| `GET` | `/todos/analytics` | Get todo statistics |
| `GET` | `/todos/streak` | Get streak summary |
| `POST` | `/todos/` | Create new todo |
| `GET` | `/memos/` | Get all memos |
| `GET` | `/bookmarks/` | Get all bookmarks |
| `GET` | `/bookmarks/public` | Get public bookmarks |

---

## 🛠️ Development

```bash
# Frontend (with Turbopack)
npm run dev

# Backend (with auto-reload)
uvicorn main:app --reload

# Run notification worker
python -m src.workers.notification_worker
```

---

## 📱 Screenshots

*Coming soon*

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**DotJumpDot**

- GitHub: [@DotJumpDot](https://github.com/DotJumpDot)

---

<p align="center">Made with ❤️ using Next.js & FastAPI</p>
