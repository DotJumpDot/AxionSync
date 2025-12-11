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

-- Create sample tags
INSERT INTO tag (name, tag_priority) VALUES
    ('Action', 1),
    ('Romance', 2),
    ('Fantasy', 3),
    ('Comedy', 4)
RETURNING id;
-- Assume tag ids 1,2,3,4

-- Create sample bookmarks
INSERT INTO bookmark (name, type, user_id, status, public, created_at)
VALUES
    ('One Piece', 'Anime', 1, 'onGoing', true, NOW()),
    ('The Witcher', 'Game', 1, 'Finished', false, NOW()),
    ('Your Name', 'Movie', 1, 'Finished', true, NOW())
RETURNING id;
-- Assume bookmark ids 1,2,3

-- Create sample bookmark_tag relations
INSERT INTO bookmark_tag (bookmark_id, tag_id) VALUES
    (1, 1), -- One Piece: Action
    (1, 3), -- One Piece: Fantasy
    (2, 1), -- Witcher: Action
    (2, 3), -- Witcher: Fantasy
    (3, 2), -- Your Name: Romance
    (3, 4); -- Your Name: Comedy
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

---


## Bookmark Feature

### Tag Entity
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | SERIAL | No | Primary key, auto-incremented |
| name | VARCHAR(100) | No | Unique tag name |
| tag_priority | INTEGER | No | Priority for ordering (default: 0) |

### Bookmark Entity
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | SERIAL | No | Primary key, auto-incremented |
| name | VARCHAR(255) | No | Name of the bookmark item |
| type | VARCHAR(50) | No | Type enum: Game, Movie, Novel, Manga, Manhwa, Anime, Series |
| review | TEXT | Yes | Full review text |
| watch_from | JSON | Yes | Source info: `{"siteName": "Netflix", "siteURL": "https://..."}` |
| release_time | TIMESTAMP | Yes | Release date of the content |
| time_used | INTEGER | Yes | Time spent in minutes |
| rating | DECIMAL(3,1) | Yes | Overall rating 0-10 |
| story_rating | DECIMAL(3,1) | Yes | Story rating 0-10 |
| action_rating | DECIMAL(3,1) | Yes | Action rating 0-10 |
| graphic_rating | DECIMAL(3,1) | Yes | Graphics/visuals rating 0-10 |
| sound_rating | DECIMAL(3,1) | Yes | Sound/music rating 0-10 |
| chapter | VARCHAR(100) | Yes | Current chapter/episode |
| mood | JSON | Yes | **Array of mood strings** (max 5): `["happy", "excited"]` |
| review_version | INTEGER | No | **Auto-managed version number** (default: 1, auto-increments on update) |
| short_review | TEXT | Yes | Brief summary review |
| status | VARCHAR(50) | No | Status enum: onGoing, Finished, PreWatch, Dropped |
| public | BOOLEAN | No | Whether bookmark is public (default: false) |
| user_id | INTEGER | No | FK to user.id |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | Yes | Last update timestamp |
| cover_image | VARCHAR(255) | Yes | Cover image filename |
| deleted_status | BOOLEAN | No | Soft delete flag (default: false) |
| last_viewed_at | TIMESTAMP | Yes | Last time user viewed this bookmark |

### bookmark_tag (Junction Table)
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| bookmark_id | INTEGER | No | FK to bookmark.id |
| tag_id | INTEGER | No | FK to tag.id |
| PRIMARY KEY | (bookmark_id, tag_id) | - | Composite primary key |

### Valid Mood Values (22 options)
```
happy, sad, excited, boring, fun, serious, mind-blown,
emotional, heartwarming, tragic, thrilling, suspenseful, scary,
satisfied, unsatisfied, disappointed, impressed, addicted,
confusing, thought-provoking, deep, chill, feel-good
```

### Type-Based Field Visibility
Different bookmark types show different rating fields:
| Type | Available Fields |
|------|-----------------|
| Game | rating, story_rating, action_rating, graphic_rating, sound_rating, time_used, chapter, mood |
| Movie | rating, story_rating, action_rating, graphic_rating, sound_rating, time_used, mood |
| Novel | rating, story_rating, chapter, mood |
| Manga | rating, story_rating, graphic_rating, chapter, mood |
| Manhwa | rating, story_rating, graphic_rating, chapter, mood |
| Anime | rating, story_rating, action_rating, graphic_rating, sound_rating, chapter, mood |
| Series | rating, story_rating, action_rating, graphic_rating, sound_rating, chapter, mood |

### Notes
- **Bookmark Types**: Game, Movie, Novel, Manga, Manhwa, Anime, Series
- **Bookmark Status**: onGoing (currently watching/reading), Finished, PreWatch (planned), Dropped
- **Rating Scale**: All ratings are from 0.0 to 10.0
- **watch_from**: JSON field with structure `{"siteName": string, "siteURL"?: string}`
- **mood**: JSON array storing up to 5 mood strings from the valid mood list
- **review_version**: Integer that starts at 1 on creation and auto-increments on each update (not user-editable)
- **Soft Delete**: Uses `deleted_status` flag, similar to memo pattern
- **Many-to-Many Tags**: A bookmark can have multiple tags, a tag can be on multiple bookmarks

---

## Bookmark SQL Schema Creation Scripts

### 5. Create Tag Table
```sql
CREATE TABLE IF NOT EXISTS tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    tag_priority INTEGER NOT NULL DEFAULT 0
);

-- Create index on tag name for fast lookups
CREATE INDEX IF NOT EXISTS idx_tag_name ON tag(name);
```

### 6. Create Bookmark Table
```sql
CREATE TABLE IF NOT EXISTS bookmark (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Game', 'Movie', 'Novel', 'Manga', 'Manhwa', 'Anime', 'Series')),
    review TEXT,
    watch_from JSON,
    release_time TIMESTAMP WITH TIME ZONE,
    time_used INTEGER,
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    story_rating DECIMAL(3,1) CHECK (story_rating >= 0 AND story_rating <= 10),
    action_rating DECIMAL(3,1) CHECK (action_rating >= 0 AND action_rating <= 10),
    graphic_rating DECIMAL(3,1) CHECK (graphic_rating >= 0 AND graphic_rating <= 10),
    sound_rating DECIMAL(3,1) CHECK (sound_rating >= 0 AND sound_rating <= 10),
    chapter VARCHAR(100),
    mood JSON,
    review_version INTEGER NOT NULL DEFAULT 1,
    short_review TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PreWatch' CHECK (status IN ('onGoing', 'Finished', 'PreWatch', 'Dropped')),
    public BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    cover_image VARCHAR(255),
    deleted_status BOOLEAN NOT NULL DEFAULT FALSE,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_bookmark_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookmark_user_id ON bookmark(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_type ON bookmark(type);
CREATE INDEX IF NOT EXISTS idx_bookmark_status ON bookmark(status);
CREATE INDEX IF NOT EXISTS idx_bookmark_public ON bookmark(public);
CREATE INDEX IF NOT EXISTS idx_bookmark_created_at ON bookmark(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmark_deleted_status ON bookmark(deleted_status);
CREATE INDEX IF NOT EXISTS idx_bookmark_user_deleted ON bookmark(user_id, deleted_status);
```

### 7. Create bookmark_tag Junction Table
```sql
CREATE TABLE IF NOT EXISTS bookmark_tag (
    bookmark_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (bookmark_id, tag_id),
    CONSTRAINT fk_bookmark_tag_bookmark_id FOREIGN KEY (bookmark_id) 
        REFERENCES bookmark(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmark_tag_tag_id FOREIGN KEY (tag_id) 
        REFERENCES tag(id) ON DELETE CASCADE
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_bookmark_tag_bookmark_id ON bookmark_tag(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tag_tag_id ON bookmark_tag(tag_id);
```

### Migration Script (for existing databases)
```sql
-- Migrate mood from VARCHAR to JSON array
ALTER TABLE bookmark 
ALTER COLUMN mood TYPE JSON USING 
  CASE 
    WHEN mood IS NULL THEN NULL
    WHEN mood = '' THEN NULL
    ELSE jsonb_build_array(mood)::json
  END;

-- Migrate watch_from to new structure
ALTER TABLE bookmark 
ALTER COLUMN watch_from TYPE JSON USING 
  CASE 
    WHEN watch_from IS NULL THEN NULL
    WHEN watch_from::text LIKE '%platform%' THEN 
      json_build_object('siteName', watch_from->>'platform', 'siteURL', watch_from->>'url')
    ELSE watch_from
  END;

-- Add review_version if not exists, set to INTEGER
ALTER TABLE bookmark 
ALTER COLUMN review_version TYPE INTEGER USING COALESCE(NULLIF(review_version, '')::INTEGER, 1);

ALTER TABLE bookmark 
ALTER COLUMN review_version SET NOT NULL;

ALTER TABLE bookmark 
ALTER COLUMN review_version SET DEFAULT 1;

-- Update existing NULL review_versions to 1
UPDATE bookmark SET review_version = 1 WHERE review_version IS NULL;
```

---

## Bookmark API Request/Response Models

### CreateBookmarkRequest
```json
{
  "name": "string (required)",
  "type": "string (required, one of: Game, Movie, Novel, Manga, Manhwa, Anime, Series)",
  "review": "string (optional)",
  "watch_from": {
    "siteName": "string (required if watch_from provided)",
    "siteURL": "string (optional)"
  },
  "release_time": "datetime (optional)",
  "time_used": "int (optional, minutes)",
  "rating": "float (optional, 0-10)",
  "story_rating": "float (optional, 0-10)",
  "action_rating": "float (optional, 0-10)",
  "graphic_rating": "float (optional, 0-10)",
  "sound_rating": "float (optional, 0-10)",
  "chapter": "string (optional)",
  "mood": ["string array (optional, max 5, from valid mood list)"],
  "short_review": "string (optional)",
  "status": "string (optional, default: 'PreWatch')",
  "public": "bool (optional, default: false)",
  "cover_image": "string (optional)",
  "tag_ids": "[int] (optional, list of tag IDs to associate)"
}
```
**Note:** `review_version` is NOT included - it's auto-set to 1 by the backend.

### UpdateBookmarkRequest
```json
{
  "name": "string (optional)",
  "type": "string (optional)",
  "review": "string (optional)",
  "watch_from": {
    "siteName": "string",
    "siteURL": "string (optional)"
  },
  "release_time": "datetime (optional)",
  "time_used": "int (optional)",
  "rating": "float (optional)",
  "story_rating": "float (optional)",
  "action_rating": "float (optional)",
  "graphic_rating": "float (optional)",
  "sound_rating": "float (optional)",
  "chapter": "string (optional)",
  "mood": ["string array (optional, max 5)"],
  "short_review": "string (optional)",
  "status": "string (optional)",
  "public": "bool (optional)",
  "cover_image": "string (optional)",
  "tag_ids": "[int] (optional)"
}
```
**Note:** `review_version` is NOT included - it's auto-incremented by the backend on each update.


---

## Todo + Notification System

### Overview
The Todo system provides task management with:
- Core todo CRUD operations
- Shared todos with permission levels
- Checklist sub-tasks
- Tag system for categorization
- Status history for analytics and streak calculation
- Notification scheduling via Redis queue
- Push notification support for multiple platforms

---

## Todo Entity Models

### Todo Entity
**File:** `src/models/entity/en_todo.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented |
| title | str | No | Todo title |
| description | str | Yes | Detailed description |
| status | str | No | 'pending' \| 'in_progress' \| 'completed' \| 'cancelled' |
| priority | str | No | 'low' \| 'medium' \| 'high' \| 'urgent' |
| due_date | datetime | Yes | Deadline timestamp |
| completed_at | datetime | Yes | When todo was completed |
| is_repeat | bool | No | Whether todo repeats (default: false) |
| repeat_type | str | Yes | 'daily' \| 'weekly' \| 'monthly' |
| mood | str | Yes | 'motivated' \| 'lazy' \| 'focused' \| 'stressed' \| 'excited' |
| user_id | int | No | FK to user.id |
| deleted_status | bool | No | Soft delete flag (default: false) |
| created_at | datetime | No | Creation timestamp (UTC) |
| updated_at | datetime | Yes | Last update timestamp (UTC) |

**Relationships:**
- Many-to-One: Multiple todos belong to one user
- One-to-Many: One todo has many checklist items
- Many-to-Many: Todos and tags via pivot table
- One-to-Many: One todo can be shared with multiple users

**Valid Status Values:** `pending`, `in_progress`, `completed`, `cancelled`
**Valid Priority Values:** `low`, `medium`, `high`, `urgent`
**Valid Repeat Types:** `daily`, `weekly`, `monthly`
**Valid Mood Values:** `motivated`, `lazy`, `focused`, `stressed`, `excited`

---

### TodoItem Entity (Checklist / Sub-tasks)
**File:** `src/models/entity/en_todo.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented |
| todo_id | int | No | FK to todo.id |
| content | str | No | Checklist item content |
| is_done | bool | No | Whether item is completed (default: false) |
| created_at | datetime | No | Creation timestamp |
| updated_at | datetime | Yes | Last update timestamp |

**Relationships:**
- Many-to-One: Multiple items belong to one todo
- Foreign Key: `todo_id` → `todo.id` (CASCADE DELETE)

---

### TodoTag Entity
**File:** `src/models/entity/en_todo.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented |
| name | str | No | Tag name (unique per user) |
| color | str | Yes | Tag color in hex format (#RRGGBB) |
| user_id | int | No | FK to user.id (tag owner) |
| created_at | datetime | No | Creation timestamp |

**Relationships:**
- Many-to-One: Multiple tags belong to one user
- Many-to-Many: Tags and todos via pivot table

---

### TodoShare Entity
**File:** `src/models/entity/en_todo.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented |
| todo_id | int | No | FK to todo.id |
| shared_with_user_id | int | No | FK to user.id |
| permission | str | No | 'view' \| 'edit' |
| created_at | datetime | No | Share creation timestamp |

**Relationships:**
- Many-to-One: Multiple shares can exist for one todo
- Foreign Key: `todo_id` → `todo.id` (CASCADE DELETE)
- Foreign Key: `shared_with_user_id` → `user.id`
- Unique Constraint: (todo_id, shared_with_user_id)

---

### TodoStatusHistory Entity
**File:** `src/models/entity/en_todo.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented |
| todo_id | int | No | FK to todo.id |
| old_status | str | No | Previous status |
| new_status | str | No | New status |
| changed_by | int | No | FK to user.id who made the change |
| changed_at | datetime | No | When the change was made |

**Purpose:**
- Track status transitions for analytics
- Calculate streaks from completion dates
- Audit trail for shared todos

---

### TodoNotification Entity
**File:** `src/models/entity/en_notification.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented |
| todo_id | int | No | FK to todo.id |
| user_id | int | No | FK to user.id |
| notify_time | datetime | No | When to send notification |
| is_sent | bool | No | Whether notification has been sent (default: false) |
| channel | str | No | 'in_app' \| 'email' \| 'push' |
| message | str | Yes | Custom notification message |
| created_at | datetime | No | Creation timestamp |

**Valid Channel Values:** `in_app`, `email`, `push`

---

### UserDeviceToken Entity
**File:** `src/models/entity/en_notification.py`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | int | No | Primary key, auto-incremented |
| user_id | int | No | FK to user.id |
| device_token | str | No | Device token for push notifications (unique) |
| platform | str | No | 'ios' \| 'android' \| 'web' |
| is_active | bool | No | Whether device is active (default: true) |
| created_at | datetime | No | Registration timestamp |
| updated_at | datetime | Yes | Last update timestamp |

**Valid Platform Values:** `ios`, `android`, `web`

---

## Todo SQL Schema Creation Scripts

### 8. Create Todo Table
```sql
CREATE TABLE IF NOT EXISTS todo (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    is_repeat BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_type VARCHAR(50) CHECK (repeat_type IN ('daily', 'weekly', 'monthly')),
    mood VARCHAR(50) CHECK (mood IN ('motivated', 'lazy', 'focused', 'stressed', 'excited')),
    user_id INTEGER NOT NULL,
    deleted_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_todo_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_todo_user_id ON todo(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_status ON todo(status);
CREATE INDEX IF NOT EXISTS idx_todo_due_date ON todo(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_priority ON todo(priority);
CREATE INDEX IF NOT EXISTS idx_todo_user_deleted ON todo(user_id, deleted_status);
CREATE INDEX IF NOT EXISTS idx_todo_user_status ON todo(user_id, status);
CREATE INDEX IF NOT EXISTS idx_todo_due_date_status ON todo(due_date, status);
```

### 9. Create TodoItem Table (Checklist)
```sql
CREATE TABLE IF NOT EXISTS todo_item (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    content VARCHAR(500) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_todo_item_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_todo_item_todo_id ON todo_item(todo_id);
```

### 10. Create TodoTag Table
```sql
CREATE TABLE IF NOT EXISTS todo_tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_tag_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT uq_todo_tag_name_user UNIQUE (name, user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_todo_tag_user_id ON todo_tag(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_tag_name ON todo_tag(name);
```

### 11. Create TodoTagPivot Table (Many-to-Many)
```sql
CREATE TABLE IF NOT EXISTS todo_tag_pivot (
    todo_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    CONSTRAINT fk_todo_tag_pivot_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_tag_pivot_tag_id FOREIGN KEY (tag_id) 
        REFERENCES todo_tag(id) ON DELETE CASCADE
);

-- Performance indexes for fast tag filtering
CREATE INDEX IF NOT EXISTS idx_todo_tag_pivot_todo_id ON todo_tag_pivot(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_tag_pivot_tag_id ON todo_tag_pivot(tag_id);
```

### 12. Create TodoShare Table
```sql
CREATE TABLE IF NOT EXISTS todo_share (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    shared_with_user_id INTEGER NOT NULL,
    permission VARCHAR(20) NOT NULL DEFAULT 'view'
        CHECK (permission IN ('view', 'edit')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_share_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_share_user_id FOREIGN KEY (shared_with_user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT uq_todo_share UNIQUE (todo_id, shared_with_user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_todo_share_todo_id ON todo_share(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_share_user_id ON todo_share(shared_with_user_id);
```

### 13. Create TodoStatusHistory Table
```sql
CREATE TABLE IF NOT EXISTS todo_status_history (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_status_history_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_status_history_changed_by FOREIGN KEY (changed_by) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Performance indexes for streak calculation
CREATE INDEX IF NOT EXISTS idx_todo_status_history_todo_id ON todo_status_history(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_status_history_changed_at ON todo_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_todo_status_history_new_status ON todo_status_history(new_status);
CREATE INDEX IF NOT EXISTS idx_todo_status_history_user_completed ON todo_status_history(changed_by, new_status, changed_at);
```

### 14. Create TodoNotification Table
```sql
CREATE TABLE IF NOT EXISTS todo_notification (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    notify_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    channel VARCHAR(20) NOT NULL DEFAULT 'in_app'
        CHECK (channel IN ('in_app', 'email', 'push')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_notification_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_notification_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Performance indexes for notification worker
CREATE INDEX IF NOT EXISTS idx_todo_notification_user_id ON todo_notification(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_notification_notify_time ON todo_notification(notify_time);
CREATE INDEX IF NOT EXISTS idx_todo_notification_is_sent ON todo_notification(is_sent);
CREATE INDEX IF NOT EXISTS idx_todo_notification_pending ON todo_notification(notify_time, is_sent) WHERE is_sent = FALSE;
```

### 15. Create UserDeviceToken Table
```sql
CREATE TABLE IF NOT EXISTS user_device_token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_token VARCHAR(500) NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_user_device_token_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_device_token_user_id ON user_device_token(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_token_active ON user_device_token(user_id, is_active) WHERE is_active = TRUE;
```

### 16. Complete Todo System SQL Script
```sql
-- Drop existing tables (for development/testing only)
-- DROP TABLE IF EXISTS user_device_token CASCADE;
-- DROP TABLE IF EXISTS todo_notification CASCADE;
-- DROP TABLE IF EXISTS todo_status_history CASCADE;
-- DROP TABLE IF EXISTS todo_share CASCADE;
-- DROP TABLE IF EXISTS todo_tag_pivot CASCADE;
-- DROP TABLE IF EXISTS todo_tag CASCADE;
-- DROP TABLE IF EXISTS todo_item CASCADE;
-- DROP TABLE IF EXISTS todo CASCADE;

-- Create todo table
CREATE TABLE IF NOT EXISTS todo (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    is_repeat BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_type VARCHAR(50) CHECK (repeat_type IN ('daily', 'weekly', 'monthly')),
    mood VARCHAR(50) CHECK (mood IN ('motivated', 'lazy', 'focused', 'stressed', 'excited')),
    user_id INTEGER NOT NULL,
    deleted_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_todo_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create todo_item table
CREATE TABLE IF NOT EXISTS todo_item (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    content VARCHAR(500) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_todo_item_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE
);

-- Create todo_tag table
CREATE TABLE IF NOT EXISTS todo_tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_tag_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT uq_todo_tag_name_user UNIQUE (name, user_id)
);

-- Create todo_tag_pivot table
CREATE TABLE IF NOT EXISTS todo_tag_pivot (
    todo_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    CONSTRAINT fk_todo_tag_pivot_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_tag_pivot_tag_id FOREIGN KEY (tag_id) 
        REFERENCES todo_tag(id) ON DELETE CASCADE
);

-- Create todo_share table
CREATE TABLE IF NOT EXISTS todo_share (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    shared_with_user_id INTEGER NOT NULL,
    permission VARCHAR(20) NOT NULL DEFAULT 'view'
        CHECK (permission IN ('view', 'edit')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_share_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_share_user_id FOREIGN KEY (shared_with_user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT uq_todo_share UNIQUE (todo_id, shared_with_user_id)
);

-- Create todo_status_history table
CREATE TABLE IF NOT EXISTS todo_status_history (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_status_history_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_status_history_changed_by FOREIGN KEY (changed_by) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create todo_notification table
CREATE TABLE IF NOT EXISTS todo_notification (
    id SERIAL PRIMARY KEY,
    todo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    notify_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    channel VARCHAR(20) NOT NULL DEFAULT 'in_app'
        CHECK (channel IN ('in_app', 'email', 'push')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_notification_todo_id FOREIGN KEY (todo_id) 
        REFERENCES todo(id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_notification_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create user_device_token table
CREATE TABLE IF NOT EXISTS user_device_token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_token VARCHAR(500) NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_user_device_token_user_id FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create all indexes
CREATE INDEX IF NOT EXISTS idx_todo_user_id ON todo(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_status ON todo(status);
CREATE INDEX IF NOT EXISTS idx_todo_due_date ON todo(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_priority ON todo(priority);
CREATE INDEX IF NOT EXISTS idx_todo_user_deleted ON todo(user_id, deleted_status);
CREATE INDEX IF NOT EXISTS idx_todo_user_status ON todo(user_id, status);
CREATE INDEX IF NOT EXISTS idx_todo_due_date_status ON todo(due_date, status);

CREATE INDEX IF NOT EXISTS idx_todo_item_todo_id ON todo_item(todo_id);

CREATE INDEX IF NOT EXISTS idx_todo_tag_user_id ON todo_tag(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_tag_name ON todo_tag(name);

CREATE INDEX IF NOT EXISTS idx_todo_tag_pivot_todo_id ON todo_tag_pivot(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_tag_pivot_tag_id ON todo_tag_pivot(tag_id);

CREATE INDEX IF NOT EXISTS idx_todo_share_todo_id ON todo_share(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_share_user_id ON todo_share(shared_with_user_id);

CREATE INDEX IF NOT EXISTS idx_todo_status_history_todo_id ON todo_status_history(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_status_history_changed_at ON todo_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_todo_status_history_new_status ON todo_status_history(new_status);
CREATE INDEX IF NOT EXISTS idx_todo_status_history_user_completed ON todo_status_history(changed_by, new_status, changed_at);

CREATE INDEX IF NOT EXISTS idx_todo_notification_user_id ON todo_notification(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_notification_notify_time ON todo_notification(notify_time);
CREATE INDEX IF NOT EXISTS idx_todo_notification_is_sent ON todo_notification(is_sent);
CREATE INDEX IF NOT EXISTS idx_todo_notification_pending ON todo_notification(notify_time, is_sent) WHERE is_sent = FALSE;

CREATE INDEX IF NOT EXISTS idx_user_device_token_user_id ON user_device_token(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_token_active ON user_device_token(user_id, is_active) WHERE is_active = TRUE;
```

---

## Streak Calculation SQL

### Calculate Current Streak
```sql
-- Streak is calculated from todo_status_history, NOT stored directly
-- Count consecutive days with completed tasks, reset when a day has no completions

WITH completion_dates AS (
    -- Get distinct dates when user completed todos
    SELECT DISTINCT DATE(tsh.changed_at) as completion_date
    FROM todo_status_history tsh
    INNER JOIN todo t ON tsh.todo_id = t.id
    WHERE t.user_id = :user_id 
      AND tsh.new_status = 'completed'
    ORDER BY completion_date DESC
),
date_with_gaps AS (
    -- Assign group numbers based on date gaps
    SELECT 
        completion_date,
        completion_date - (ROW_NUMBER() OVER (ORDER BY completion_date DESC))::int as grp
    FROM completion_dates
),
streaks AS (
    -- Calculate streak lengths for each group
    SELECT 
        grp,
        COUNT(*) as streak_length,
        MAX(completion_date) as streak_end,
        MIN(completion_date) as streak_start
    FROM date_with_gaps
    GROUP BY grp
),
current_streak AS (
    -- Current streak only counts if last completion was today or yesterday
    SELECT 
        CASE 
            WHEN MAX(completion_date) >= CURRENT_DATE - 1 THEN 
                (SELECT streak_length FROM streaks ORDER BY streak_end DESC LIMIT 1)
            ELSE 0
        END as current_streak
    FROM completion_dates
)
SELECT 
    (SELECT current_streak FROM current_streak) as current_streak,
    COALESCE((SELECT MAX(streak_length) FROM streaks), 0) as longest_streak,
    (SELECT COUNT(*) FROM todo_status_history tsh 
     INNER JOIN todo t ON tsh.todo_id = t.id 
     WHERE t.user_id = :user_id AND tsh.new_status = 'completed') as total_completed,
    (SELECT MAX(completion_date) FROM completion_dates) as last_completed_date;
```

### Example Streak Calculation Results
```
Given completions on: 2025-12-11, 2025-12-10, 2025-12-09, 2025-12-07, 2025-12-06

If today is 2025-12-11:
- current_streak: 3 (Dec 9, 10, 11)
- longest_streak: 3
- total_completed: 5
- last_completed_date: 2025-12-11

Note: Dec 8 has no completion, so streak resets
```

---

## Todo API Request/Response Models

### CreateTodoRequest
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "string (optional, default: 'pending')",
  "priority": "string (optional, default: 'medium')",
  "due_date": "datetime (optional)",
  "is_repeat": "bool (optional, default: false)",
  "repeat_type": "string (optional, required if is_repeat=true)",
  "mood": "string (optional)",
  "tag_ids": "[int] (optional, list of tag IDs)"
}
```

### UpdateTodoRequest
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "string (optional)",
  "priority": "string (optional)",
  "due_date": "datetime (optional)",
  "is_repeat": "bool (optional)",
  "repeat_type": "string (optional)",
  "mood": "string (optional)",
  "tag_ids": "[int] (optional)"
}
```

### CreateTodoItemRequest
```json
{
  "content": "string (required)"
}
```

### UpdateTodoItemRequest
```json
{
  "content": "string (optional)",
  "is_done": "bool (optional)"
}
```

### CreateTodoTagRequest
```json
{
  "name": "string (required)",
  "color": "string (optional, hex format)"
}
```

### ShareTodoRequest
```json
{
  "shared_with_user_id": "int (required)",
  "permission": "string (optional, default: 'view')"
}
```

### CreateNotificationRequest
```json
{
  "todo_id": "int (required)",
  "notify_time": "datetime (required, must be in future)",
  "channel": "string (optional, default: 'in_app')",
  "message": "string (optional)"
}
```

### RegisterDeviceTokenRequest
```json
{
  "device_token": "string (required)",
  "platform": "string (required, 'ios'|'android'|'web')"
}
```

### StreakSummary Response
```json
{
  "current_streak": "int",
  "longest_streak": "int",
  "total_completed": "int",
  "last_completed_date": "datetime | null"
}
```

### TodoAnalytics Response
```json
{
  "total_todos": "int",
  "completed_todos": "int",
  "pending_todos": "int",
  "in_progress_todos": "int",
  "cancelled_todos": "int",
  "completion_rate": "float (percentage)",
  "streak": "StreakSummary"
}
```

---


## Redis Queue System

### Overview
The notification system uses Redis sorted sets for delayed job processing.

### Queue Names
- `axionsync:notifications:scheduled` - Jobs waiting to be executed
- `axionsync:notifications:processing` - Jobs currently being processed
- `axionsync:notifications:dead_letter` - Failed jobs after max retries

### Job Payload Structure
```json
{
  "notification_id": 123,
  "todo_id": 456,
  "user_id": 789,
  "channel": "push",
  "message": "Don't forget your todo!",
  "scheduled_at": "2025-12-11T10:00:00Z",
  "retry_count": 0,
  "max_retries": 3,
  "created_at": "2025-12-11T09:00:00Z"
}
```

### Job Lifecycle
1. **Schedule**: When notification created, job added to `scheduled` queue with score = execute_at timestamp
2. **Pickup**: Worker polls for jobs with score <= current time
3. **Process**: Job moved to `processing` queue
4. **Complete**: On success, job removed from all queues, notification marked as sent
5. **Retry**: On failure, retry_count incremented, job rescheduled with exponential backoff
6. **Dead Letter**: After max_retries, job moved to `dead_letter` queue

### Running the Worker
```bash
# Start notification worker
python -m src.workers.notification_worker

# With custom settings
WORKER_POLL_INTERVAL=5 WORKER_BATCH_SIZE=50 python -m src.workers.notification_worker
```

### Worker Features
- Graceful shutdown on SIGINT/SIGTERM
- Exponential backoff for retries (delay * 2^retry_count)
- Dead letter queue for failed jobs
- Health monitoring via `redis_queue.health_check()`
- Support for in_app, email, and push channels

---

## Sample Todo Data

```sql
-- Create sample todos for user_id = 1
INSERT INTO todo (title, description, status, priority, due_date, is_repeat, mood, user_id)
VALUES 
    ('Complete project documentation', 'Write API docs and deployment guide', 'in_progress', 'high', NOW() + INTERVAL '2 days', FALSE, 'focused', 1),
    ('Review pull requests', 'Check pending PRs from team', 'pending', 'medium', NOW() + INTERVAL '1 day', FALSE, 'motivated', 1),
    ('Daily standup meeting', 'Attend daily standup with team', 'pending', 'medium', NOW() + INTERVAL '6 hours', TRUE, NULL, 1),
    ('Fix login bug', 'Users getting 401 on mobile app', 'completed', 'urgent', NOW() - INTERVAL '1 day', FALSE, 'excited', 1)
RETURNING id;
-- Assume todo ids 1,2,3,4

-- Update todo 4 with completed_at
UPDATE todo SET completed_at = NOW() - INTERVAL '1 day' WHERE id = 4;

-- Create checklist items
INSERT INTO todo_item (todo_id, content, is_done)
VALUES
    (1, 'Write introduction section', TRUE),
    (1, 'Document API endpoints', TRUE),
    (1, 'Add code examples', FALSE),
    (1, 'Create deployment guide', FALSE),
    (2, 'Review frontend PR #123', FALSE),
    (2, 'Review backend PR #456', FALSE);

-- Create tags
INSERT INTO todo_tag (name, color, user_id)
VALUES
    ('Work', '#3B82F6', 1),
    ('Personal', '#22C55E', 1),
    ('Urgent', '#EF4444', 1),
    ('Meeting', '#8B5CF6', 1)
RETURNING id;
-- Assume tag ids 1,2,3,4

-- Assign tags to todos
INSERT INTO todo_tag_pivot (todo_id, tag_id)
VALUES
    (1, 1), -- Documentation: Work
    (2, 1), -- PRs: Work
    (3, 1), -- Standup: Work
    (3, 4), -- Standup: Meeting
    (4, 1), -- Bug fix: Work
    (4, 3); -- Bug fix: Urgent

-- Create status history
INSERT INTO todo_status_history (todo_id, old_status, new_status, changed_by, changed_at)
VALUES
    (1, '', 'pending', 1, NOW() - INTERVAL '3 days'),
    (1, 'pending', 'in_progress', 1, NOW() - INTERVAL '2 days'),
    (4, '', 'pending', 1, NOW() - INTERVAL '2 days'),
    (4, 'pending', 'in_progress', 1, NOW() - INTERVAL '1 day'),
    (4, 'in_progress', 'completed', 1, NOW() - INTERVAL '1 day');

-- Share todo 1 with user 2 (assuming user 2 exists)
-- INSERT INTO todo_share (todo_id, shared_with_user_id, permission)
-- VALUES (1, 2, 'edit');

-- Create notification for todo 3 (standup meeting)
INSERT INTO todo_notification (todo_id, user_id, notify_time, channel, message)
VALUES
    (3, 1, NOW() + INTERVAL '5 hours 50 minutes', 'push', 'Standup meeting in 10 minutes!'),
    (1, 1, NOW() + INTERVAL '1 day 23 hours', 'in_app', 'Documentation deadline tomorrow');
```

### Quick Sample Data for Any User
```sql
-- Replace :user_id with actual user ID (e.g., 1, 2, 3, etc.)
-- This script creates basic todo data for testing

-- Create sample tags
INSERT INTO todo_tag (name, color, user_id, created_at)
VALUES 
    ('Work', '#3b82f6', :user_id, NOW()),
    ('Personal', '#10b981', :user_id, NOW()),
    ('Urgent', '#ef4444', :user_id, NOW())
ON CONFLICT (user_id, name) DO NOTHING;

-- Create sample todos
INSERT INTO todo (title, description, status, priority, due_date, user_id, deleted_status, created_at)
VALUES 
    ('Complete project documentation', 'Write comprehensive docs for the new feature', 'in_progress', 'high', NOW() + INTERVAL '2 days', :user_id, FALSE, NOW()),
    ('Review pull requests', 'Review team PRs before EOD', 'pending', 'medium', NOW() + INTERVAL '1 day', :user_id, FALSE, NOW()),
    ('Fix critical bug', 'Address the production issue ASAP', 'pending', 'urgent', NOW() + INTERVAL '3 hours', :user_id, FALSE, NOW())
RETURNING id;
-- Note the returned todo IDs to use below

-- Create checklist items (replace 1 with actual first todo ID)
INSERT INTO todo_item (todo_id, content, is_done, created_at)
VALUES 
    (1, 'Write API documentation', FALSE, NOW()),
    (1, 'Add code examples', FALSE, NOW()),
    (1, 'Review and publish', FALSE, NOW());
```

**Python Script to Create Sample Data:**
```bash
# Run this from AxionSync_Backend directory
python migrations/create_all_sample_data.py
```

---

## Todo Frontend Integration Notes

### Access Control
- **Owner**: Full access to all operations
- **Edit Permission**: Can modify todo, items, tags, mood; cannot delete todo or manage shares
- **View Permission**: Read-only access to todo and its items

### Real-time Updates (Suggested)
For real-time collaboration on shared todos, consider:
- WebSocket connections for live updates
- Optimistic UI updates with server reconciliation
- Conflict resolution for concurrent edits

### Notification Channels
- **in_app**: Display in notification center within the app
- **email**: Send email to user's registered email (requires email field in user table)
- **push**: Send push notification to registered devices

### Streak Display
- Show current streak prominently on dashboard
- Display streak reset warning if user hasn't completed todo today
- Celebrate milestone streaks (7 days, 30 days, etc.)
