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

### Mood Validation Rules
- Maximum 5 moods per bookmark
- Each mood must be from the valid mood list
- Backend returns 400 error if validation fails

### CreateTagRequest
```
name: str (required, unique)
tag_priority: int (optional, default: 0)
```

### UpdateTagRequest
```
name: str (optional)
tag_priority: int (optional)
```

---

## Bookmark API Endpoints

### Tag Endpoints

#### GET /tags/
Get all tags.
- **Auth:** Bearer token required
- **Response:** Array of Tag objects

#### POST /tags/
Create a new tag.
- **Auth:** Bearer token required
- **Body:** CreateTagRequest
- **Response:** Tag object

#### PUT /tags/{tag_id}
Update a tag.
- **Auth:** Bearer token required
- **Body:** UpdateTagRequest
- **Response:** Tag object

#### DELETE /tags/{tag_id}
Delete a tag (hard delete).
- **Auth:** Bearer token required
- **Response:** `{ success: true, message: "Tag deleted" }`

### Bookmark Endpoints

#### GET /bookmarks/
Get all bookmarks for the authenticated user.
- **Auth:** Bearer token required
- **Query params:** 
  - `type` (optional): Filter by type
  - `status` (optional): Filter by status
  - `include_deleted` (optional): Include soft-deleted bookmarks
- **Response:** Array of Bookmark objects with tags and user info

#### GET /bookmarks/{bookmark_id}
Get a single bookmark by ID.
- **Auth:** Bearer token required
- **Response:** Bookmark object with tags and user info

#### POST /bookmarks/
Create a new bookmark.
- **Auth:** Bearer token required
- **Body:** CreateBookmarkRequest
- **Response:** Bookmark object with tags
- **Behavior:** Sets `review_version = 1` automatically

#### PUT /bookmarks/{bookmark_id}
Update a bookmark.
- **Auth:** Bearer token required
- **Body:** UpdateBookmarkRequest
- **Response:** Bookmark object with tags
- **Behavior:** Auto-increments `review_version` by 1

#### DELETE /bookmarks/{bookmark_id}
Soft delete a bookmark.
- **Auth:** Bearer token required
- **Response:** `{ success: true, message: "Bookmark deleted" }`

#### DELETE /bookmarks/{bookmark_id}/permanent
Permanently delete a bookmark (hard delete).
- **Auth:** Bearer token required
- **Response:** `{ success: true, message: "Bookmark permanently deleted" }`

#### POST /bookmarks/{bookmark_id}/cover
Upload cover image for a bookmark.
- **Auth:** Bearer token required
- **Body:** multipart/form-data with `file` field
- **Allowed types:** JPEG, PNG, GIF, WebP
- **Response:** `{ success: true, cover_image: string, bookmark: Bookmark }`

#### PATCH /bookmarks/{bookmark_id}/restore
Restore a soft-deleted bookmark.
- **Auth:** Bearer token required
- **Response:** Bookmark object

#### GET /bookmarks/public
Get all public bookmarks.
- **Auth:** Bearer token required
- **Query params:** `type` (optional)
- **Response:** Array of public Bookmark objects

#### GET /bookmarks/tag/{tag_id}
Get bookmarks by tag.
- **Auth:** Bearer token required
- **Response:** Array of Bookmark objects with the specified tag

---

## Bookmark Frontend UX Flow

### Create Bookmark Flow
1. User clicks "Add Bookmark" button
2. **TypeSelector** opens with blur backdrop showing 7 type cards
3. User selects a type (Game, Movie, Novel, etc.)
4. **BookmarkFormModal** opens with:
   - Type pre-selected (disabled, cannot change)
   - Collapsible sections: Basic Info, Source, Progress, Ratings, Mood, Reviews, Additional
   - Only type-relevant fields are shown (e.g., no sound_rating for Novel)
   - Mood multi-select with max 5 items
   - Cover image upload with preview
5. Submit creates bookmark with `review_version = 1`

### Edit Bookmark Flow
1. User clicks edit on a bookmark card
2. **BookmarkFormModal** opens directly (no TypeSelector)
3. Type field is disabled (cannot change type after creation)
4. All current values pre-filled
5. Submit auto-increments `review_version`

### Detail View
1. User clicks on bookmark card to open **BookmarkDetailDrawer**
2. Shows:
   - Cover image (if exists)
   - Type and Status badges
   - Reviewer info: "Reviewed by {firstname || username}", version number
   - Type-filtered rating fields
   - Mood tags (displayed as purple tags)
   - Watch From with clickable link (if siteURL provided)
   - Reviews and metadata

