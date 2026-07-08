# Media Sharing App — API Reference

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints marked **Auth: Required** expect a JWT token in the header:
```
Authorization: Bearer <token>
```

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| 400    | Bad request — missing or invalid fields |
| 401    | Unauthorized — missing or invalid token |
| 403    | Forbidden — not allowed to do this |
| 404    | Resource not found |
| 409    | Conflict — e.g. already a member |
| 500    | Server error |
| 429    | Too Many Requests |

All errors return:
```json
{ "error": "Human-readable error message" }
```

---
### `POST /auth/login`

login is login

**Auth:** Required

**Request Body:**

```json
{
  "email": "string",
  "password" : "string"
}
```
**Response 200:**

```json
{
  "message": "Logged in successfully"
}
```

**Response 401:**

```json
{
  "message": "Invalid email or password"
}
```
---
### `POST /auth/refresh`

Get a new access token using a refresh token.

**Auth:** Not required

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

**Response 200:**

```json
{
  "token": "string",
  "refreshToken": "string"
}
```
**Response 401:**

```json
{
  "error": "Invalid or expired refresh token"
}
```
---
### `POST /auth/logout`

Revoke the refresh token.

**Auth:** Required

**Request Body:**

```json
{
  "refreshToken": "string"
}
```
**Response 200:**

```json
{
  "message": "Logged out successfully"
}
```
---

## 👤 Users

### `GET /users/:id`
Get a user's public profile.

**Auth:** Required

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | User UUID |

**Response 200:**
```json
{
  "id": "uuid",
  "username": "string",
  "avatar_url": "string | null",
  "created_at": "timestamp"
}
```

**Response 404:**
```json
{ "error": "User not found" }
```

---

### `PATCH /users/:id`
Update the current user's profile.

**Auth:** Required — can only update your own profile.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | User UUID |

**Request Body** (all fields optional):
```json
{
  "username": "string",
  "avatar_url": "string"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "username": "string",
  "avatar_url": "string | null",
  "updated_at": "timestamp"
}
```

**Response 403:**
```json
{ "error": "Cannot update another user's profile" }
```

---

## 👥 Groups

### `GET /groups`
List all groups. Supports search and pagination.

**Auth:** Required

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| search | string | — | Filter by group name |
| page | number | 1 | Page number |
| limit | number | 10 | Results per page (max 50) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "creator_id": "uuid",
      "creator_username": "string",
      "is_public": true,
      "invite_code": "string",
      "member_count": "number",
      "media_item_count": "number",
      "created_at": "timestamp"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 42
}
```
Note: only public groups appear in this listing

---
### `GET /groups/me` 
Get all groups the current user is a member of (both public and private).

**Auth:** Required

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "creator_id": "uuid",
      "creator_username": "string",
      "is_public": true,
      "invite_code": "string",
      "member_count": "number",
      "media_item_count": "number",
      "created_at": "timestamp"
    }
  ]
}
```
---
### `POST /groups`
Create a new group.

**Auth:** Required — creator is automatically set to the authenticated user.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "isPublic": true
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "creator_id": "uuid",
  "is_public": true,
  "invite_code": "string",
  "created_at": "timestamp"
}
```

**Response 400:**
```json
{ "error": "Name is required" }
```

---

### `GET /groups/:id`
Get full details of a group, including its members and media items.

**Auth:** Required

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Group UUID |

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "creator_id": "uuid",
  "is_public": true,
  "invite_code": "string",
  "created_at": "timestamp",
  "members": [
    {
      "user_id": "uuid",
      "username": "string",
      "avatar_url": "string | null",
      "role": "owner | member",
      "joined_at": "timestamp"
    }
  ],
  "media_items": [
    {
      "id": "uuid",
      "type": "book | movie | show | game",
      "title": "string",
      "creator": "string | null",
      "cover_url": "string | null",
      "total_units": "number | null",
      "added_at": "timestamp"
    }
  ]
}
```

**Response 404:**
```json
{ "error": "Group not found" }
```

---

### `PATCH /groups/:id`
Update a group's details.

**Auth:** Required — creator only.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Group UUID |

**Request Body** (all fields optional):
```json
{
  "name": "string",
  "description": "string",
  "isPublic": false
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "updated_at": "timestamp"
}
```

**Response 403:**
```json
{ "error": "Only the group creator can update it" }
```

---

### `DELETE /groups/:id`
Delete a group and all its data.

**Auth:** Required — creator only.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Group UUID |

**Response 200:**
```json
{ "message": "Group deleted successfully" }
```

**Response 403:**
```json
{ "error": "Only the group creator can delete it" }
```

---

### `POST /groups/join/:code`
Join a group.

**Auth:** Required

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| code | string | 8-character invite code |

**Response 200:**
```json
{
  "group_id": "uuid",
  "user_id": "uuid",
  "joined_at": "timestamp"
}
```

**Response 409:**
```json
{ "error": "Already a member of this group" }
```

---
### `POST /groups/:id/refresh-code`
Regenerate the invite code for a group. Old code immediately becomes invalid.

**Auth:** Required — creator only.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Group UUID |

**Response 200:**

```json
{
  "inviteCode": "string"
}
```

**Response 403:**

```json
{
  "error": "Only the group creator can refresh the invite code"
}
```

---
### `DELETE /groups/:id/leave`
Leave a group.

**Auth:** Required — creator cannot leave (must delete the group instead).

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Group UUID |

**Response 200:**
```json
{ "message": "Left the group successfully" }
```

**Response 403:**
```json
{ "error": "Creator cannot leave — delete the group instead" }
```

**Response 404:**
```json
{ "error": "You are not a member of this group" }
```

---

### `DELETE /groups/:id/members/:userId`
Remove a member from a group.

**Auth:** Required — creator only.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Group UUID |
| userId | string | User UUID to remove |

**Response 200:**
```json
{ "message": "Member removed successfully" }
```

**Response 403:**
```json
{ "error": "Only the group creator can remove members" }
```

---

## 🎬 Media Items

### `GET /groups/:groupId/media`
List all media items in a group.

**Auth:** Required — must be a group member.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| groupId | string | Group UUID |

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | — | Filter by type: `book`, `movie`, `show`, `game` |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "book | movie | show | game",
      "title": "string",
      "creator": "string | null",
      "cover_url": "string | null",
      "total_units": "number | null",
      "description": "string | null",
      "added_by": "uuid",
      "added_at": "timestamp"
    }
  ]
}
```

---

### `POST /groups/:groupId/media`
Add a media item to a group.

**Auth:** Required — must be a group member.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| groupId | string | Group UUID |

**Request Body:**
```json
{
  "type": "book | movie | show | game",
  "title": "string",
  "creator": "string",
  "cover_url": "string",
  "total_units": "number",
  "description": "string"
}
```

`type` and `title` are required. All other fields are optional.

`total_units` is generic — it represents pages for books, minutes for movies, episodes for shows, etc.

`creator` is generic — it represents author for books, director for movies, studio for games, etc.

**Response 201:**
```json
{
  "id": "uuid",
  "type": "book | movie | show | game",
  "title": "string",
  "creator": "string | null",
  "cover_url": "string | null",
  "total_units": "number | null",
  "description": "string | null",
  "added_by": "uuid",
  "added_at": "timestamp"
}
```

**Response 403:**
```json
{ "error": "any member can add media items" }
```

---

### `GET /groups/:groupId/media/:mediaId`
Get details of a specific media item, including all members' progress.

**Auth:** Required — must be a group member.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| groupId | string | Group UUID |
| mediaId | string | Media item UUID |

**Response 200:**
```json
{
  "id": "uuid",
  "type": "book | movie | show | game",
  "title": "string",
  "creator": "string | null",
  "cover_url": "string | null",
  "total_units": "number | null",
  "description": "string | null",
  "added_at": "timestamp",
  "progress": [
    {
      "user_id": "uuid",
      "username": "string",
      "avatar_url": "string | null",
      "current_unit": "number",
      "percentage": "number | null",
      "status": "not_started | in_progress | finished",
      "note": "string | null",
      "updated_at": "timestamp"
    }
  ]
}
```

`percentage` is `null` when `total_units` is not set.

**Response 404:**
```json
{ "error": "Media item not found" }
```
---
### `GET /media/search`

Search for media items from external APIs to pre-fill the add media form.

**Auth:** Required

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| query | string | Search term |
| type | string | book, movie, show, or game |

**Response 200:**

```json
[
  {
    "title": "Dune",
    "creator": "Frank Herbert",
    "coverUrl": "https://covers.openlibrary.org/...",
    "totalUnits": 412,
    "description": "string | null",
    "type": "book",
    "externalId": "/works/OL102749W"
  }
]
```

**Response 400:**

```json
{
  "error": "Invalid type: xyz. Must be book, movie, show or game"
}
```

---

### `GET /media/search/details`

Fetch full details for a specific media item after user selects from search dropdown.

**Auth:** Required

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| query | string | External API ID from search result |
| type | string | book, movie, show, or game |

**Response 200:**

```json
{
  "title": "Interstellar",
  "creator": "Christopher Nolan",
  "coverUrl": "https://image.tmdb.org/t/p/w500/...",
  "totalUnits": 169,
  "description": "A team of explorers...",
  "type": "movie",
  "externalId": "157336"
}
```

---

### `DELETE /groups/:groupId/media/:mediaId`
Remove a media item from a group (also removes all progress for that item).

**Auth:** Required — must be a group member.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| groupId | string | Group UUID |
| mediaId | string | Media item UUID |

**Response 200:**
```json
{ "message": "Media item removed successfully" }
```

**Response 403:**
```json
{ "error": "membrs can remove media items" }
```

---

## 📊 Progress

### `GET /groups/:groupId/media/:mediaId/progress`
Get all members' progress on a media item.

**Auth:** Required — must be a group member.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| groupId | string | Group UUID |
| mediaId | string | Media item UUID |

**Response 200:**
```json
{
  "media_item_id": "uuid",
  "data": [
    {
      "user_id": "uuid",
      "username": "string",
      "avatar_url": "string | null",
      "current_unit": "number",
      "percentage": "number | null",
      "status": "not_started | in_progress | finished",
      "note": "string | null",
      "updated_at": "timestamp"
    }
  ]
}
```

---

### `POST /groups/:groupId/media/:mediaId/progress`
Create or update your own progress on a media item.

**Auth:** Required — must be a group member.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| groupId | string | Group UUID |
| mediaId | string | Media item UUID |

**Request Body:**
```json
{
  "current_unit": "number",
  "status": "not_started | in_progress | finished",
  "note": "string"
}
```

`current_unit` is required. `status` and `note` are optional.

If `status` is omitted, it is auto-set:
- `0` → `not_started`
- `> 0 and < total_units` → `in_progress`
- `= total_units` → `finished`

**Response 200:**
```json
{
  "user_id": "uuid",
  "media_item_id": "uuid",
  "current_unit": "number",
  "percentage": "number | null",
  "status": "not_started | in_progress | finished",
  "note": "string | null",
  "updated_at": "timestamp"
}
```

**Response 400:**
```json
{ "error": "current_unit cannot exceed total_units" }
```

---

### `GET /groups/:groupId/media/:mediaId/progress/:userId`
Get a specific member's progress on a media item.

**Auth:** Required — must be a group member.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| groupId | string | Group UUID |
| mediaId | string | Media item UUID |
| userId | string | User UUID |

**Response 200:**
```json
{
  "user_id": "uuid",
  "username": "string",
  "media_item_id": "uuid",
  "current_unit": "number",
  "percentage": "number | null",
  "status": "not_started | in_progress | finished",
  "note": "string | null",
  "updated_at": "timestamp"
}
```

**Response 404:**
```json
{ "error": "No progress found for this user on this media item" }
```
```
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