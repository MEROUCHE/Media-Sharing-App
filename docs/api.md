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

```sql
-- Users (extends Supabase auth.users)
profiles (
  id          uuid primary key references auth.users,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamp default now(),
  updated_at  timestamp default now()
)

-- Groups
groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  creator_id  uuid references profiles(id) on delete cascade,
  created_at  timestamp default now(),
  updated_at  timestamp default now()
)

-- Group Members
group_members (
  group_id    uuid references groups(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  joined_at   timestamp default now(),
  primary key (group_id, user_id)
)

-- Books
books (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid references groups(id) on delete cascade,
  title       text not null,
  author      text not null,
  cover_url   text,
  total_pages integer,
  description text,
  added_by    uuid references profiles(id),
  added_at    timestamp default now()
)

-- Reading Progress
reading_progress (
  user_id      uuid references profiles(id) on delete cascade,
  book_id      uuid references books(id) on delete cascade,
  current_page integer not null default 0,
  status       text check (status in ('not_started','reading','finished')) default 'not_started',
  note         text,
  updated_at   timestamp default now(),
  primary key  (user_id, book_id)
)
```
