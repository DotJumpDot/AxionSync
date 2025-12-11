# 🧭 AxionSync

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Queue-DC382D?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

> 🌐 **[English Version](../README.md)**
> 🌐 **[Complete Schema & Sample data](/Schema.md)**

**AxionSync** คือแพลตฟอร์มจัดการชีวิตส่วนตัวแบบครบวงจร — รวมทุกอย่างที่สำคัญไว้ในที่เดียว  
ไม่ว่าจะเป็น **งานประจำวัน, บันทึกส่วนตัว, ติดตามสื่อ (หนังสือ, หนัง, เกม, อนิเมะ)** หรือแม้แต่ไอเดียระหว่างวัน  
ทั้งหมดถูกซิงค์และจัดเรียงอย่างเป็นระบบ เพื่อให้คุณโฟกัสกับสิ่งที่สำคัญจริง ๆ

---

## 🚀 ฟีเจอร์

### ✅ จัดการงาน (Todo)
- CRUD เต็มรูปแบบสำหรับงานประจำวัน
- ติดตามสถานะ: `รอดำเนินการ`, `กำลังทำ`, `เสร็จสิ้น`, `ยกเลิก`
- ระดับความสำคัญ: `ต่ำ`, `ปานกลาง`, `สูง`, `เร่งด่วน`
- **ติดตามอารมณ์** ต่องาน: มีแรงจูงใจ, จดจ่อ, เครียด ฯลฯ
- รองรับ **Checklist/งานย่อย** ภายในงานหลัก
- **งานที่ทำซ้ำ**: รายวัน, รายสัปดาห์, รายเดือน
- **แชร์งาน** กับผู้ใช้อื่น (สิทธิ์ดู/แก้ไข)
- **ติดตาม Streak** และวิเคราะห์ความสำเร็จ
- **การแจ้งเตือนตามกำหนด** ผ่าน Redis queue (in-app, email, push)
- Soft delete พร้อมถังขยะ/กู้คืน

### 📝 บันทึกและโน้ต
- สร้างและจัดระเบียบโน้ตด้วยแท็บที่กำหนดเอง
- ปรับแต่งแท็บ: สี, ฟอนต์, ขนาดฟอนต์
- จัดระเบียบโน้ตด้วยการลงสี
- ค้นหาโน้ตได้อย่างรวดเร็ว
- Soft delete พร้อมการกู้คืน
- ซิงค์แบบเรียลไทม์ระหว่างอุปกรณ์

### 📚 ติดตามสื่อ (Bookmark)
- ติดตาม: **เกม, หนัง, นิยาย, มังงะ, มันฮวา, อนิเมะ, ซีรีส์**
- จัดการสถานะ: `กำลังดู`, `ดูจบแล้ว`, `จะดู`, `ดรอป`
- **คะแนนหลายหมวด**: เนื้อเรื่อง, แอคชั่น, กราฟิก, เสียง
- **แท็กอารมณ์**: 20+ ตัวเลือก (happy, mind-blown, thrilling ฯลฯ)
- ติดตาม Chapter/ความคืบหน้า
- อัปโหลดภาพปกที่กำหนดเอง
- **ระบบแท็ก** สำหรับจัดหมวดหมู่
- การมองเห็น Public/Private
- รีวิวและรีวิวสั้น

### 🔔 การแจ้งเตือนอัจฉริยะ
- **Redis-based background worker** สำหรับการแจ้งเตือนตามกำหนด
- หลายช่องทาง: In-App, Email, Push
- Graceful shutdown และ automatic retry พร้อม exponential backoff
- Dead letter queue สำหรับงานที่ล้มเหลว
- จัดการ Device token สำหรับ push notifications

### 🌍 รองรับหลายภาษา (i18n)
- รองรับหลายภาษาเต็มรูปแบบ (อังกฤษ, ไทย)
- สลับภาษาแบบไดนามิก
- บันทึกค่าภาษาที่ผู้ใช้เลือก

### ☁️ Cloud Sync และความปลอดภัย
- ข้อมูลทั้งหมดซิงค์อัตโนมัติระหว่างอุปกรณ์
- ระบบยืนยันตัวตนด้วย **JWT Bearer Token**
- เข้ารหัสรหัสผ่านด้วย **bcrypt**
- Role-based access control (User, Admin)
- ตั้งค่า **CORS** เพื่อความปลอดภัย

---

## 🧩 เทคโนโลยีที่ใช้

### Frontend
| เทคโนโลยี | เวอร์ชัน | วัตถุประสงค์ |
|-----------|---------|-------------|
| **Next.js** | 16.0.1 | React framework พร้อม App Router |
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
| เทคโนโลยี | เวอร์ชัน | วัตถุประสงค์ |
|-----------|---------|-------------|
| **FastAPI** | 0.103.1 | Modern Python web framework |
| **PostgreSQL** | 15 | Relational database |
| **Redis** | - | Job queue และ caching |
| **Pydantic** | v2 | Data validation |
| **psycopg2** | - | PostgreSQL adapter |
| **bcrypt** | 4.0.1 | Password hashing |
| **PyJWT** | - | JWT token handling |
| **aioredis** | 2.0.1 | Async Redis client |
| **Uvicorn** | - | ASGI server |

### DevOps และเครื่องมือ
| เทคโนโลยี | วัตถุประสงค์ |
|-----------|-------------|
| **Docker Compose** | Container orchestration |
| **Turbopack** | Fast bundler สำหรับ Next.js |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |

---

## 🏗️ โครงสร้างโปรเจค

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

### Entity หลัก
- **User** - ระบบยืนยันตัวตน, โปรไฟล์, บทบาท
- **Memo** - บันทึกพร้อมการจัดระเบียบด้วยแท็บ
- **Tab** - หมวดหมู่โน้ตที่ปรับแต่งได้
- **Todo** - งานพร้อมสถานะ, ความสำคัญ, อารมณ์
- **TodoItem** - งานย่อย Checklist
- **TodoTag** - แท็กที่กำหนดเองสำหรับงาน
- **TodoShare** - การแชร์แบบร่วมมือ
- **TodoStatusHistory** - ติดตามการเปลี่ยนแปลงสำหรับ analytics
- **Bookmark** - ติดตามสื่อ
- **Tag** - จัดหมวดหมู่ Bookmark
- **TodoNotification** - การแจ้งเตือนตามกำหนด
- **UserDeviceToken** - Push notification tokens

---

## ⚙️ การติดตั้ง

### สิ่งที่ต้องมี
- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- Redis (ไม่บังคับ, สำหรับการแจ้งเตือน)
- Docker & Docker Compose (ไม่บังคับ)

### ตัวเลือกที่ 1: Docker Compose (แนะนำ)
```bash
# Clone repository
git clone https://github.com/DotJumpDot/AxionSync.git
cd AxionSync

# คัดลอกไฟล์ environment
cp env.example .env

# เริ่มบริการทั้งหมด
docker-compose up -d
```

### ตัวเลือกที่ 2: ติดตั้งเอง

**Backend:**
```bash
cd AxionSync_Backend

# สร้าง virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# หรือ: venv\Scripts\activate  # Windows

# ติดตั้ง dependencies
pip install -r requirements.txt

# รันเซิร์ฟเวอร์
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd AxionSync_Frontend

# ติดตั้ง dependencies
npm install

# รันเซิร์ฟเวอร์ development
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

# Frontend URL (สำหรับ CORS)
FRONTEND_BASE_URL=http://localhost:3000

# Redis (ไม่บังคับ)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🔌 API Documentation

เมื่อ backend ทำงานแล้ว เข้าถึง API docs แบบ interactive ได้ที่:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints หลัก
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/auth/login` | ยืนยันตัวตนผู้ใช้ |
| `POST` | `/users/register` | ลงทะเบียนผู้ใช้ |
| `GET` | `/todos/` | ดึงงานทั้งหมด |
| `GET` | `/todos/analytics` | ดึงสถิติงาน |
| `GET` | `/todos/streak` | ดึงสรุป Streak |
| `POST` | `/todos/` | สร้างงานใหม่ |
| `GET` | `/memos/` | ดึงบันทึกทั้งหมด |
| `GET` | `/bookmarks/` | ดึง bookmark ทั้งหมด |
| `GET` | `/bookmarks/public` | ดึง public bookmarks |

---

## 🛠️ Development

```bash
# Frontend (พร้อม Turbopack)
npm run dev

# Backend (พร้อม auto-reload)
uvicorn main:app --reload

# รัน notification worker
python -m src.workers.notification_worker
```

---

## 📱 Screenshots

*เร็ว ๆ นี้*

---

## 🤝 การมีส่วนร่วม

1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

---

## 📄 License

โปรเจคนี้อยู่ภายใต้ MIT License

---

## 👤 ผู้พัฒนา

**DotJumpDot**

- GitHub: [@DotJumpDot](https://github.com/DotJumpDot)

---

<p align="center">สร้างด้วย ❤️ โดยใช้ Next.js และ FastAPI</p>