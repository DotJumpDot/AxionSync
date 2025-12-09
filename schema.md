# AxionSync Database Schema Documentation

## Overview
AxionSync uses PostgreSQL as its relational database. The application manages users, tabs, and memos with full CRUD operations.

---

## Entity Models

### 1. User Entity
**File:** `src/models/entity/en_user.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented user ID |
| username | str | No | Unique username for login |
| firstname | str | Yes | User's first name |
| lastname | str | Yes | User's last name |
| nickname | str | Yes | User's nickname/display name |
| role | str | No | User role (default: "user") |
| tel | str | Yes | Telephone number |
| picture_url | str | No | Profile picture filename (default: "unidentified.jpg") |
| created_at | datetime | No | Record creation timestamp (UTC) |
| updated_at | datetime | Yes | Record last update timestamp (UTC) |

**Notes:**
- `username` should be UNIQUE for authentication
- `role` is used for authorization (e.g., "user", "admin")
- `picture_url` stores only the filename, images are stored in `public/userProfilePicture/`
- Timestamps are stored in UTC

---

### 2. Tab Entity
**File:** `src/models/entity/en_tab.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented tab ID |
| tab_name | str | No | Tab display name |
| color | str | No | Tab color in hex format (#FFAA00) |
| user_id | int | No | Foreign key referencing User.id |
| font_name | str | No | Font family for tab content |
| font_size | int | No | Font size for tab content |

**Relationships:**
- Many-to-One: Multiple tabs can belong to one user
- Foreign Key: `user_id` → `user.id`

**Notes:**
- Each tab belongs to a user and defines styling for memos
- Color format: hexadecimal (#RGB or #RRGGBB)

---

### 3. Memo Entity
**File:** `src/models/entity/en_memo.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented memo ID |
| title | str | No | Memo title |
| content | str | No | Memo content/body text |
| user_id | int | No | Foreign key referencing User.id |
| tab_id | int | Yes | Foreign key referencing Tab.id |
| font_color | str | Yes | Font color in hex format (#FFFFFF) |
| deleted_status | bool | No | Soft delete flag (default: False) |
| collected | bool | No | Whether memo has been collected (default: False) |
| collected_time | datetime | Yes | Timestamp when memo was collected |
| created_at | datetime | No | Record creation timestamp (UTC) |
| updated_at | datetime | Yes | Record last update timestamp (UTC) |

**Relationships:**
- Many-to-One: Multiple memos can belong to one user
- Many-to-One: Multiple memos can belong to one tab
- Foreign Key: `user_id` → `user.id`
- Foreign Key: `tab_id` → `tab.id`

**Notes:**
- Uses soft delete pattern (deleted_status = true instead of removing rows)
- Each memo must be associated with a user
- Memos can optionally be grouped by tab
- Font color can override tab's default styling
- Timestamps are stored in UTC

---

## API Request/Response Models

### LoginRequest
```
username: str (required)
password: str (required)
```

### UserCreate (Registration)
```
username: str (required) - Must be unique
password: str (required) - Will be hashed with bcrypt
firstname: str (optional)
lastname: str (optional)
nickname: str (optional)
role: str (optional, default: "user")
tel: str (optional)
picture_url: str (optional, default: "unidentified.jpg")
```

### UserUpdate (Profile Update)
```
firstname: str (optional)
lastname: str (optional)
nickname: str (optional)
tel: str (optional)
```

### CreateMemoRequest
```
title: str (required)
content: str (required)
tab_id: int (optional)
font_color: str (optional, hex)
```

### UpdateMemoRequest
```
title: str (required)
content: str (required)
font_color: str (optional, hex)
```

---

## SQL Schema Creation Scripts

### Prerequisites
```sql
-- Connect to your PostgreSQL database
CREATE DATABASE axionsync;
\c axionsync
```

### 1. Create Users Table
```sql
DROP TABLE IF EXISTS "user" CASCADE;

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    nickname VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    tel VARCHAR(20),
    picture_url VARCHAR(255) NOT NULL DEFAULT 'unidentified.jpg',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create index on username for faster login queries
CREATE INDEX idx_user_username ON "user"(username);
CREATE INDEX idx_user_created_at ON "user"(created_at);
```

### 2. Create Tabs Table
```sql
CREATE TABLE IF NOT EXISTS tab (
    id SERIAL PRIMARY KEY,
    tab_name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    user_id INTEGER NOT NULL,
    font_name VARCHAR(100) NOT NULL,
    font_size INTEGER NOT NULL,
    CONSTRAINT fk_tab_user_id FOREIGN KEY (user_id)
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tab_user_id ON tab(user_id);
```

### 3. Create Memos Table
```sql
CREATE TABLE IF NOT EXISTS memo (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    tab_id INTEGER,
    font_color VARCHAR(7),
    deleted_status BOOLEAN NOT NULL DEFAULT FALSE,
    collected BOOLEAN NOT NULL DEFAULT FALSE,
    collected_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_memo_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_memo_tab_id FOREIGN KEY (tab_id)
        REFERENCES tab(id) ON DELETE SET NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_memo_user_id ON memo(user_id);
CREATE INDEX IF NOT EXISTS idx_memo_tab_id ON memo(tab_id);
CREATE INDEX IF NOT EXISTS idx_memo_created_at ON memo(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_memo_updated_at ON memo(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memo_deleted_status ON memo(deleted_status);
CREATE INDEX IF NOT EXISTS idx_memo_collected ON memo(collected);
CREATE INDEX IF NOT EXISTS idx_memo_user_deleted ON memo(user_id, deleted_status);
```

### 4. Complete SQL Script (Run All at Once)
```sql
-- Drop existing tables (optional - use for development/testing only)
-- DROP TABLE IF EXISTS memo CASCADE;
-- DROP TABLE IF EXISTS tab CASCADE;
-- DROP TABLE IF EXISTS "user" CASCADE;

-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    nickname VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    tel VARCHAR(20),
    picture_url VARCHAR(255) NOT NULL DEFAULT 'unidentified.jpg',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for user table
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "user"(created_at);

-- Create memo table
CREATE TABLE IF NOT EXISTS memo (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    tab_id INTEGER,
    font_color VARCHAR(7),
    deleted_status BOOLEAN NOT NULL DEFAULT FALSE,
    collected BOOLEAN NOT NULL DEFAULT FALSE,
    collected_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_memo_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_memo_tab_id FOREIGN KEY (tab_id)
        REFERENCES tab(id) ON DELETE SET NULL
);

-- Create indexes for memo table
CREATE INDEX IF NOT EXISTS idx_memo_user_id ON memo(user_id);
CREATE INDEX IF NOT EXISTS idx_memo_tab_id ON memo(tab_id);
CREATE INDEX IF NOT EXISTS idx_memo_created_at ON memo(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_memo_updated_at ON memo(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memo_deleted_status ON memo(deleted_status);
CREATE INDEX IF NOT EXISTS idx_memo_collected ON memo(collected);
CREATE INDEX IF NOT EXISTS idx_memo_user_deleted ON memo(user_id, deleted_status);
```

---

## Sample Data

```sql
-- Create a sample user
INSERT INTO "user" (username, password_hash, firstname, lastname, nickname, role, tel, picture_url)
VALUES ('admin', '1234', 'Demo', 'User', 'Demo', 'Admin', '0800000000', 'unidentified.jpg')
RETURNING id;

-- Assume returned id is 1

-- Create sample tabs
INSERT INTO tab (tab_name, color, user_id, font_name, font_size)
VALUES 
    ('General', '#5865f2', 1, 'Inter', 14),
    ('Bugs', '#ed4245', 1, 'Inter', 14),
    ('Ideas', '#43b581', 1, 'Inter', 16)
RETURNING id;

-- Assume tab ids 1,2,3

-- Create sample memos (ordered oldest→newest)
INSERT INTO memo (title, content, user_id, tab_id, font_color)
VALUES
    ('Memo', 'Hello world!', 1, 1, NULL),
    ('Memo', 'Bug: cannot login', 1, 2, '#FFAA00'),
    ('Memo', 'New idea: add themes', 1, 3, NULL);
```

## Database Constraints & Relationships

### Data Integrity
- **User PK**: `id` - ensures each user has a unique identifier
- **Memo FK**: `user_id` → `user.id` - enforces referential integrity
- **Cascade Delete**: Deleting a user automatically removes their memos
- **Unique Username**: Prevents duplicate user registrations

### Indexing Strategy
- `user.username`: Fast authentication lookups
- `user.created_at`: Sorting/filtering users by registration date
- `memo.user_id`: Quick retrieval of user's memos
- `memo.created_at DESC`: Efficient recent memo fetching
- `memo.deleted_status`: Fast filtering of non-deleted memos
- `memo(user_id, deleted_status)`: Composite index for common query pattern

---

## Environment Configuration
Ensure your `.env` file contains:
```
DATABASE_URL=postgresql://user:password@localhost:5433/axionsync
JWT_EXPIRE_MINUTES=60
X_API_KEY=['1234']
```

---

## Migration Notes
- All timestamps use `TIMESTAMP WITH TIME ZONE` for consistency across timezones
- Soft delete pattern used for memos (never physically deleted)
- Passwords stored as hashed values using bcrypt
- User roles support future authorization features

### Add picture_url column (if upgrading existing database)
```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS picture_url VARCHAR(255) NOT NULL DEFAULT 'unidentified.jpg';
```

---

## API Endpoints

### User Registration & Profile Endpoints

#### POST /users/register
Register a new user with password hashing.
- **Auth:** API key required (X-API-KEY header)
- **Body:** 
```json
{
  "username": "string (required, must be unique)",
  "password": "string (required, will be hashed)",
  "firstname": "string (optional)",
  "lastname": "string (optional)",
  "nickname": "string (optional)",
  "role": "string (optional, default: 'user')",
  "tel": "string (optional)",
  "picture_url": "string (optional, default: 'unidentified.jpg')"
}
```
- **Response:** User object (without password)
- **Errors:** 
  - 400: Username already exists
  - 500: Failed to create user

#### GET /users/users
Get all users.
- **Auth:** Bearer token required
- **Response:** Array of User objects

#### GET /users/{user_id}
Get user by ID.
- **Auth:** Bearer token required
- **Response:** User object

#### POST /users/get_by_id
Get user by ID (POST method).
- **Auth:** Bearer token required
- **Body:** `{ "id": number }`
- **Response:** User object

#### PUT /users/{user_id}/profile
Update user profile (firstname, lastname, nickname, tel).
- **Auth:** Bearer token required (can only update own profile)
- **Body:** `{ firstname?, lastname?, nickname?, tel? }`
- **Response:** Updated User object

#### POST /users/{user_id}/picture
Upload profile picture.
- **Auth:** Bearer token required (can only update own picture)
- **Body:** `multipart/form-data` with `file` field
- **Allowed types:** JPEG, PNG, GIF, WebP
- **Max size:** 5MB
- **Response:** `{ success: true, picture_url: string, user: User }`

---

## Sample Data

### Create Admin User via API
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: 1234" \
  -d '{
    "username": "admin",
    "password": "1234",
    "firstname": "Demo",
    "lastname": "User",
    "nickname": "Demo",
    "role": "Admin",
    "tel": "0800000000",
    "picture_url": "unidentified.jpg"
  }'
```

### Create User via SQL (with bcrypt hash)
```sql
-- Note: Password '1234' hashed with bcrypt
-- Generate hash: python -c "from passlib.hash import bcrypt; print(bcrypt.hash('1234'))"
INSERT INTO "user" (username, password_hash, firstname, lastname, nickname, role, tel, picture_url, created_at)
VALUES (
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.OPKgINmAOTjVN6',  -- bcrypt hash of '1234'
    'Demo',
    'User',
    'Demo',
    'Admin',
    '0800000000',
    'unidentified.jpg',
    NOW()
) RETURNING *;
```
