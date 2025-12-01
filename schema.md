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
| created_at | datetime | No | Record creation timestamp (UTC) |
| updated_at | datetime | Yes | Record last update timestamp (UTC) |

**Notes:**
- `username` should be UNIQUE for authentication
- `role` is used for authorization (e.g., "user", "admin")
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
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    nickname VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    tel VARCHAR(20),
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
INSERT INTO "user" (username, password_hash, firstname, lastname, nickname, role, tel)
VALUES ('admin', '1234', 'Demo', 'User', 'Demo', 'Admin', '0800000000')
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

---

## Common Queries

### Get all non-deleted memos for a user (ordered oldest→newest)
```sql
SELECT m.* FROM memo m
WHERE m.user_id = $1 AND m.deleted_status = FALSE
ORDER BY m.created_at ASC;
```

### Get memos for a user by tab (ordered oldest→newest)
```sql
SELECT m.* FROM memo m
WHERE m.user_id = $1 AND m.tab_id = $2 AND m.deleted_status = FALSE
ORDER BY m.created_at ASC;
```

### Get user with password hash (for authentication)
```sql
SELECT * FROM "user" WHERE username = $1;
```

### Get a single memo with user details
```sql
SELECT m.*, u.* FROM memo m
JOIN "user" u ON m.user_id = u.id
WHERE m.id = $1 AND m.deleted_status = FALSE;
```

### Soft delete a memo
```sql
UPDATE memo SET deleted_status = TRUE, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
```

### Create a new user
```sql
INSERT INTO "user" (username, password_hash, firstname, lastname, nickname, role, tel)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
```

### Create a new memo
```sql
INSERT INTO memo (title, content, user_id)
VALUES ($1, $2, $3)
RETURNING *;
```

### Collect a memo
```sql
UPDATE memo 
SET collected = TRUE, collected_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
```

---

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
