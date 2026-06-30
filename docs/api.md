### `GET /users/:id`

Get a user's public profile.

**Auth:** Required

**URL Params:**
| Param | Type | Description |
|-------|--------|-------------|
| `id` | string | User UUID |

**Response `200`:**

```json
{
  "id": "uuid",
  "username": "string",
  "avatar_url": "string | null",
  "created_at": "timestamp"
}
```

**Response `404`:**

```json
{ "error": "User not found" }
```

---

### `PATCH /users/:id`

Update the current user's profile.

**Auth:** Required — can only update your own profile.

**URL Params:**
| Param | Type | Description |
|-------|--------|-------------|
| `id` | string | User UUID |

**Request Body** _(all fields optional)_:

```json
{
  "username": "string",
  "avatar_url": "string"
}
```

**Response `200`:**

```json
{
  "id": "uuid",
  "username": "string",
  "avatar_url": "string | null",
  "updated_at": "timestamp"
}
```

**Response `403`:**

```json
{ "error": "Cannot update another user's profile" }
```

---

## 👥 Groups

### `GET /groups`

List all public groups. Supports search and pagination.

**Auth:** Required

**Query Params:**
| Param | Type | Default | Description |
|----------|--------|---------|--------------------------|
| `search` | string | — | Filter by group name |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Results per page (max 50)|

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "creator_id": "uuid",
      "creator_username": "string",
      "member_count": "number",
      "book_count": "number",
      "created_at": "timestamp"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 42
}
```

---

### `POST /groups`

Create a new reading group.

**Auth:** Required — creator is automatically set to the authenticated user.

**Request Body:**

```json
{
  "name": "string", // required
  "description": "string" // optional
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "creator_id": "uuid",
  "created_at": "timestamp"
}
```

**Response `400`:**

```json
{ "error": "Name is required" }
```

---

### `GET /groups/:id`

Get full details of a group, including its members and books.

**Auth:** Required

**URL Params:**
| Param | Type | Description |
|-------|--------|-------------|
| `id` | string | Group UUID |

**Response `200`:**

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "creator_id": "uuid",
  "created_at": "timestamp",
  "members": [
    {
      "user_id": "uuid",
      "username": "string",
      "avatar_url": "string | null",
      "joined_at": "timestamp"
    }
  ],
  "books": [
    {
      "id": "uuid",
      "title": "string",
      "author": "string",
      "cover_url": "string | null",
      "total_pages": "number | null",
      "added_at": "timestamp"
    }
  ]
}
```

**Response `404`:**

```json
{ "error": "Group not found" }
```

---

### `PATCH /groups/:id`

Update a group's details.

**Auth:** Required — **creator only**.

**URL Params:**
| Param | Type | Description |
|-------|--------|-------------|
| `id` | string | Group UUID |

**Request Body** _(all fields optional)_:

```json
{
  "name": "string",
  "description": "string"
}
```

**Response `200`:**

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "updated_at": "timestamp"
}
```

**Response `403`:**

```json
{ "error": "Only the group creator can update it" }
```

---

### `DELETE /groups/:id`

Delete a group and all its data.

**Auth:** Required — **creator only**.

**URL Params:**
| Param | Type | Description |
|-------|--------|-------------|
| `id` | string | Group UUID |

**Response `200`:**

```json
{ "message": "Group deleted successfully" }
```

**Response `403`:**

```json
{ "error": "Only the group creator can delete it" }
```

---

### `POST /groups/:id/join`

Join a reading group.

**Auth:** Required

**URL Params:**
| Param | Type | Description |
|-------|--------|-------------|
| `id` | string | Group UUID |

**Response `200`:**

```json
{
  "group_id": "uuid",
  "user_id": "uuid",
  "joined_at": "timestamp"
}
```

**Response `409`:**

```json
{ "error": "Already a member of this group" }
```

---

### `DELETE /groups/:id/leave`

Leave a reading group.

**Auth:** Required — creator cannot leave (must delete the group instead).

**URL Params:**
| Param | Type | Description |
|-------|--------|-------------|
| `id` | string | Group UUID |

**Response `200`:**

```json
{ "message": "Left the group successfully" }
```

**Response `403`:**

```json
{ "error": "Creator cannot leave — delete the group instead" }
```

**Response `404`:**

```json
{ "error": "You are not a member of this group" }
```

---

### `DELETE /groups/:id/members/:userId`

Remove a member from a group.

**Auth:** Required — **creator only**.

**URL Params:**
| Param | Type | Description |
|----------|--------|--------------------|
| `id` | string | Group UUID |
| `userId` | string | User UUID to remove|

**Response `200`:**

```json
{ "message": "Member removed successfully" }
```

**Response `403`:**

```json
{ "error": "Only the group creator can remove members" }
```

---

## 📖 Books

### `GET /groups/:groupId/books`

List all books in a group.

**Auth:** Required — must be a group member.

**URL Params:**
| Param | Type | Description |
|-----------|--------|-------------|
| `groupId` | string | Group UUID |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "author": "string",
      "cover_url": "string | null",
      "total_pages": "number | null",
      "description": "string | null",
      "added_by": "uuid",
      "added_at": "timestamp"
    }
  ]
}
```

---

### `POST /groups/:groupId/books`

Add a book to a group.

**Auth:** Required — **creator only**.

**URL Params:**
| Param | Type | Description |
|-----------|--------|-------------|
| `groupId` | string | Group UUID |

**Request Body:**

```json
{
  "title": "string", // required
  "author": "string", // required
  "cover_url": "string", // optional
  "total_pages": "number", // optional — used for % progress
  "description": "string" // optional
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "title": "string",
  "author": "string",
  "cover_url": "string | null",
  "total_pages": "number | null",
  "description": "string | null",
  "added_by": "uuid",
  "added_at": "timestamp"
}
```

**Response `403`:**

```json
{ "error": "Only the group creator can add books" }
```

---

### `GET /groups/:groupId/books/:bookId`

Get details of a specific book, including all members' progress.

**Auth:** Required — must be a group member.

**URL Params:**
| Param | Type | Description |
|-----------|--------|-------------|
| `groupId` | string | Group UUID |
| `bookId` | string | Book UUID |

**Response `200`:**

```json
{
  "id": "uuid",
  "title": "string",
  "author": "string",
  "cover_url": "string | null",
  "total_pages": "number | null",
  "description": "string | null",
  "added_at": "timestamp",
  "progress": [
    {
      "user_id": "uuid",
      "username": "string",
      "avatar_url": "string | null",
      "current_page": "number",
      "percentage": "number",
      "status": "not_started | reading | finished",
      "note": "string | null",
      "updated_at": "timestamp"
    }
  ]
}
```

---

### `DELETE /groups/:groupId/books/:bookId`

Remove a book from a group (also removes all progress for that book).

**Auth:** Required — **creator only**.

**URL Params:**
| Param | Type | Description |
|-----------|--------|-------------|
| `groupId` | string | Group UUID |
| `bookId` | string | Book UUID |

**Response `200`:**

```json
{ "message": "Book removed successfully" }
```

**Response `403`:**

```json
{ "error": "Only the group creator can remove books" }
```

---

## 📊 Reading Progress

### `GET /groups/:groupId/books/:bookId/progress`

Get all members' progress on a book.

**Auth:** Required — must be a group member.

**URL Params:**
| Param | Type | Description |
|-----------|--------|-------------|
| `groupId` | string | Group UUID |
| `bookId` | string | Book UUID |

**Response `200`:**

```json
{
  "book_id": "uuid",
  "data": [
    {
      "user_id": "uuid",
      "username": "string",
      "avatar_url": "string | null",
      "current_page": "number",
      "percentage": "number",
      "status": "not_started | reading | finished",
      "note": "string | null",
      "updated_at": "timestamp"
    }
  ]
}
```

---

### `POST /groups/:groupId/books/:bookId/progress`

Create or update your own progress on a book.

**Auth:** Required — must be a group member.

**URL Params:**
| Param | Type | Description |
|-----------|--------|-------------|
| `groupId` | string | Group UUID |
| `bookId` | string | Book UUID |

**Request Body:**

```json
{
  "current_page": "number", // required
  "status": "reading | finished", // optional — auto-set if omitted
  "note": "string" // optional — e.g. "Just finished chapter 3!"
}
```

**Response `200`:**

```json
{
  "user_id": "uuid",
  "book_id": "uuid",
  "current_page": "number",
  "percentage": "number",
  "status": "not_started | reading | finished",
  "note": "string | null",
  "updated_at": "timestamp"
}
```

**Response `400`:**

```json
{ "error": "current_page cannot exceed total_pages" }
```

---

### `GET /groups/:groupId/books/:bookId/progress/:userId`

Get a specific member's progress on a book.

**Auth:** Required — must be a group member.

**URL Params:**
| Param | Type | Description |
|-----------|--------|----------------|
| `groupId` | string | Group UUID |
| `bookId` | string | Book UUID |
| `userId` | string | User UUID |

**Response `200`:**

```json
{
  "user_id": "uuid",
  "username": "string",
  "book_id": "uuid",
  "current_page": "number",
  "percentage": "number",
  "status": "not_started | reading | finished",
  "note": "string | null",
  "updated_at": "timestamp"
}
```

**Response `404`:**

```json
{ "error": "No progress found for this user on this book" }
```

---

## ⚠️ Common Error Responses

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| `400`  | Bad request — missing or invalid fields |
| `401`  | Unauthorized — missing or invalid token |
| `403`  | Forbidden — not allowed to do this      |
| `404`  | Resource not found                      |
| `409`  | Conflict — e.g. already a member        |
| `500`  | Server error                            |

All errors return:

```json
{ "error": "Human-readable error message" }
```

---

## 🗄️ Database Schema (Supabase)

# Media Tracker Database Schema & Spring Boot Configuration Guide

This guide details a unified PostgreSQL relational schema using a polymorphic architecture mapped to a Spring Boot (JPA/Hibernate) backend using `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)`. By collapsing specific tables (like `books` and `movies`) into a single `media_items` table, we simplify the schema, eliminate redundancy, and gain ultra-fast polymorphic query performance.

---

## 1. PostgreSQL Schema Definition



```sql
-- Enable UUID generation (only needed once per database)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT UNIQUE NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url    TEXT,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Groups Table
CREATE TABLE groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    creator_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Group Members Table (Many-to-Many Bridge)
CREATE TABLE group_members (
    group_id  UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    role      TEXT CHECK (role IN ('owner','member')) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Media Items Table (Unified Single-Table for Polymorphism)
CREATE TABLE media_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
    type        TEXT CHECK (type IN ('book','movie','show','game')) NOT NULL,
    title       TEXT NOT NULL,
    creator     TEXT,        -- Generic mapping: author, director, developer, studio
    cover_url   TEXT,
    total_units INTEGER,     -- Generic mapping: pages, total minutes, episodes
    description TEXT,
    added_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at    TIMESTAMP DEFAULT NOW()
);

-- Progress Table (Many-to-Many Bridge tracking item metrics)
CREATE TABLE progress (
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    current_unit  INTEGER NOT NULL DEFAULT 0,
    status        TEXT CHECK (status IN ('not_started','in_progress','finished')) DEFAULT 'not_started',
    note          TEXT,
    updated_at    TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, media_item_id)
);
```