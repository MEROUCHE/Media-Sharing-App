# Media Sharing App — API & Database Reference

This document provides a simple, complete guide to the Media Sharing App backend, including the database schema (tables, fields, constraints, relationships) and every API endpoint with its requirements, expected request payload, and return payload.

---

## 🗄️ Database Architecture (PostgreSQL & Spring Boot JPA)

The application uses PostgreSQL managed through Spring Boot JPA/Hibernate (`ddl-auto=validate`).

### Tables & Relationships

```text
users (id) ──1:N──< groups (creator_id)
users (id) ──1:N──< group_members (user_id) >──N:1── groups (id)
groups (id) ──1:N──< media_items (group_id)
users (id) ──1:N──< media_items (added_by)
users (id) ──1:N──< progress (user_id) >──N:1── media_items (media_item_id)
users (id) ──1:N──< refresh_tokens (user_id)
users (id) ──1:N──< password_reset_tokens (user_id)
users (id) ──1:N──< email_verification_tokens (user_id)
```

### Table Definitions

#### 1. `users`

Stores user profile credentials and email verification state.

- `id` (UUID, Primary Key, auto-generated)
- `username` (VARCHAR, Unique, Not Null, max 30 chars)
- `email` (VARCHAR, Unique, Not Null, normalized to lowercase)
- `password_hash` (VARCHAR, Not Null, BCrypt encrypted)
- `avatar_url` (VARCHAR, Nullable, max 500 chars)
- `email_verified` (BOOLEAN, Not Null, default `false`)
- `created_at` (TIMESTAMP, Not Null, auto-set on create)
- `updated_at` (TIMESTAMP, auto-set on update)

#### 2. `groups`

Stores shared media groups / clubs created by users.

- `id` (UUID, Primary Key, auto-generated)
- `name` (VARCHAR, Not Null, max 100 chars)
- `description` (VARCHAR, Nullable, max 500 chars)
- `creator_id` (UUID, Foreign Key -> `users.id`, Not Null)
- `invite_code` (VARCHAR, Unique, Not Null, 8-character uppercase code)
- `is_public` (BOOLEAN, Not Null, default `false`)
- `created_at` (TIMESTAMP, Not Null, auto-set on create)
- `updated_at` (TIMESTAMP, auto-set on update)

#### 3. `group_members`

Many-to-many relationship linking users to groups with membership roles.

- `group_id` (UUID, Composite PK, FK -> `groups.id`)
- `user_id` (UUID, Composite PK, FK -> `users.id`)
- `role` (VARCHAR, Not Null: `OWNER` or `MEMBER`)
- `joined_at` (TIMESTAMP, Not Null, auto-set on create)

#### 4. `media_items`

Polymorphic table storing items tracked within groups (books, movies, shows, games).

- `id` (UUID, Primary Key, auto-generated)
- `group_id` (UUID, FK -> `groups.id`, Not Null)
- `type` (VARCHAR, Not Null: `BOOK`, `MOVIE`, `SHOW`, `GAME`)
- `title` (VARCHAR, Not Null, max 200 chars)
- `creator` (VARCHAR, Nullable, max 100 chars — author, director, studio)
- `cover_url` (VARCHAR, Nullable, max 500 chars)
- `total_units` (INTEGER, Nullable — pages for books, runtime in mins for movies, episodes for shows)
- `description` (VARCHAR, Nullable, max 1000 chars)
- `added_by` (UUID, FK -> `users.id`, Nullable)
- `added_at` (TIMESTAMP, Not Null, auto-set on create)

#### 5. `progress`

Tracks a user's completion progress on a specific media item.

- `user_id` (UUID, Composite PK, FK -> `users.id`)
- `media_item_id` (UUID, Composite PK, FK -> `media_items.id`)
- `current_unit` (INTEGER, Not Null, default `0` — e.g. page number, minutes watched, episode reached)
- `status` (VARCHAR, Not Null: `NOT_STARTED`, `IN_PROGRESS`, `FINISHED`)
- `note` (VARCHAR, Nullable, max 500 chars)
- `updated_at` (TIMESTAMP, auto-updated on save)

#### 6. `refresh_tokens`

Stores JWT refresh tokens for persistent sessions.

- `id` (UUID, Primary Key, auto-generated)
- `token` (VARCHAR, Unique, Not Null)
- `user_id` (UUID, FK -> `users.id`, Not Null)
- `expires_at` (TIMESTAMP, Not Null)
- `revoked` (BOOLEAN, Not Null, default `false`)

#### 7. `email_verification_tokens`

Tokens generated during registration and sent via email (expires in 24 hours).

- `id` (UUID, Primary Key, auto-generated)
- `token` (VARCHAR, Unique, Not Null)
- `user_id` (UUID, FK -> `users.id`, Not Null)
- `expires_at` (TIMESTAMP, Not Null)
- `used` (BOOLEAN, default `false`)

#### 8. `password_reset_tokens`

Tokens generated for forgotten passwords (expires in 1 hour).

- `id` (UUID, Primary Key, auto-generated)
- `token` (VARCHAR, Unique, Not Null)
- `user_id` (UUID, FK -> `users.id`, Not Null)
- `expires_at` (TIMESTAMP, Not Null)
- `used` (BOOLEAN, default `false`)

---

## 🔐 General API Specifications

### Base URL

```text
http://localhost:8080
```

(or your production server URL, e.g. `https://your-domain.com`)

### Authentication

Protected endpoints require a Bearer token in the request header:

```http
Authorization: Bearer <jwt_access_token>
```

### Rate Limiting

- **External Media Search:** 20 requests per minute per IP
- **General Endpoints:** 60 requests per minute per IP
- Exceeding the limit returns `429 Too Many Requests`.

### Common Error Format

All errors return JSON with an `error` field:

```json
{
  "error": "Error description here"
}
```

---

## 📡 API Endpoints

### Summary Table

| Category | Method | Endpoint | Auth | Description |
|----------|--------|----------|------|-------------|
| Auth | POST | `/api/auth/login` | None | Authenticate and obtain tokens |
| Auth | POST | `/api/auth/refresh` | None | Refresh expired access token |
| Auth | POST | `/api/auth/logout` | Required | Revoke refresh token |
| Auth | GET | `/api/auth/verify-email` | None | Verify account via email token |
| Auth | POST | `/api/auth/forgot-password` | None | Request password reset link |
| Auth | POST | `/api/auth/reset-password` | None | Reset password using token |
| Users | POST | `/api/users/register` | None | Register a new user |
| Users | GET | `/api/users/{id}` | Required | Get user public profile |
| Users | GET | `/api/users` | Required | List all users |
| Users | PATCH | `/api/users/{id}` | Required | Update own profile |
| Users | DELETE | `/api/users/{id}` | Required | Delete user account |
| Groups | GET | `/api/groups` | Required | List public groups (search & paged) |
| Groups | GET | `/api/groups/me` | Required | List user's joined/created groups |
| Groups | POST | `/api/groups` | Required | Create a new group |
| Groups | GET | `/api/groups/{id}` | Required | Get group details, members & items |
| Groups | PATCH | `/api/groups/{id}` | Required | Update group (creator only) |
| Groups | DELETE | `/api/groups/{id}` | Required | Delete group & cascade data (creator only) |
| Groups | POST | `/api/groups/join/{code}` | Required | Join group via invite code |
| Groups | DELETE | `/api/groups/{id}/leave` | Required | Leave group (members only) |
| Groups | POST | `/api/groups/{id}/refresh-code` | Required | Regenerate invite code (creator only) |
| Members | GET | `/api/groups/{groupId}/members` | Required | List members of a group |
| Members | GET | `/api/groups/{groupId}/members/{userId}` | Required | Get single member info in group |
| Members | DELETE | `/api/groups/{groupId}/members/{userId}` | Required | Kick member from group (creator only) |
| Media | GET | `/api/groups/{groupId}/media` | Required | List media items in group |
| Media | POST | `/api/groups/{groupId}/media` | Required | Add media item to group |
| Media | GET | `/api/groups/{groupId}/media/{mediaId}` | Required | Get media item details & progress |
| Media | DELETE | `/api/groups/{groupId}/media/{mediaId}` | Required | Remove media item from group |
| Progress | GET | `/api/groups/{groupId}/media/{mediaId}/progress` | Required | Get all member progress for item |
| Progress | POST | `/api/groups/{groupId}/media/{mediaId}/progress` | Required | Create or update my progress |
| Progress | GET | `/api/groups/{groupId}/media/{mediaId}/progress/{userId}` | Required | Get a user's progress for item |
| Search | GET | `/api/media/search` | Required | Search external books, movies, shows, games |
| Search | GET | `/api/media/search/details` | Required | Get external item details by ID |

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Login

- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates user credentials. If email is verified, returns JWT access token and refresh token.
- **Auth:** None (Public)
- **Expects (JSON Body):**

```json
{
  "email": "user@example.com",
  "password": "secretPassword"
}
```

- **Returns:**
  - `200 OK`:

```json
{
  "token": "eyJhbGciOi...",
  "refreshToken": "48b64b18-...",
  "userId": "23b097b4-...",
  "username": "johndoe",
  "email": "user@example.com"
}
```

  - `401 Unauthorized`: `{"error": "Invalid email or password"}`
  - `403 Forbidden`: `{"error": "Email not verified. Check your inbox for the verification link."}`

### 1.2 Refresh Access Token

- **Endpoint:** `POST /api/auth/refresh`
- **Description:** Uses an existing refresh token to generate a new short-lived JWT access token without re-entering credentials.
- **Auth:** None (Public)
- **Expects (JSON Body):**

```json
{
  "refreshToken": "48b64b18-..."
}
```

- **Returns:**
  - `200 OK`:

```json
{
  "token": "eyJhbGciOi...",
  "refreshToken": "48b64b18-..."
}
```

  - `400 Bad Request`: `{"error": "refreshToken is required"}`
  - `401 Unauthorized`: `{"error": "Invalid or expired refresh token"}`

### 1.3 Logout

- **Endpoint:** `POST /api/auth/logout`
- **Description:** Revokes the user's refresh token so it cannot be used again.
- **Auth:** Required (`Bearer <token>`)
- **Expects (JSON Body):**

```json
{
  "refreshToken": "48b64b18-..."
}
```

- **Returns:**
  - `200 OK`:

```json
{
  "message": "Logged out successfully"
}
```

### 1.4 Verify Email

- **Endpoint:** `GET /api/auth/verify-email`
- **Description:** Validates an email token clicked by the user from their registration email and marks the account as verified.
- **Auth:** None (Public)
- **Expects (Query Parameter):**
  - `token` (String, required): UUID verification token
  - Example: `GET /api/auth/verify-email?token=8f3e5b12-...`
- **Returns:**
  - `200 OK`:

```json
{
  "message": "Email verified successfully"
}
```

  - `400 Bad Request`: `{"error": "Invalid verification token"}` / `{"error": "Token already used"}` / `{"error": "Verification token expired"}`

### 1.5 Forgot Password

- **Endpoint:** `POST /api/auth/forgot-password`
- **Description:** Sends a password reset email if the account exists. Always returns success to protect against user enumeration.
- **Auth:** None (Public)
- **Expects (JSON Body):**

```json
{
  "email": "user@example.com"
}
```

- **Returns:**
  - `200 OK`:

```json
{
  "message": "If that email exists, a reset link has been sent"
}
```

### 1.6 Reset Password

- **Endpoint:** `POST /api/auth/reset-password`
- **Description:** Sets a new password using the reset token received via email.
- **Auth:** None (Public)
- **Expects (JSON Body):**

```json
{
  "token": "reset-token-uuid",
  "newPassword": "newSecretPassword123"
}
```

  (Password must be at least 6 characters.)
- **Returns:**
  - `200 OK`:

```json
{
  "message": "Password reset successfully"
}
```

  - `400 Bad Request`: `{"error": "Invalid reset token"}` / `{"error": "Token already used"}` / `{"error": "Reset token expired"}` / password too short

---

## 2. User Management Endpoints (`/api/users`)

### 2.1 Register User

- **Endpoint:** `POST /api/users/register`
- **Description:** Creates a new user in the database (unverified by default) and triggers an email verification link.
- **Auth:** None (Public)
- **Expects (JSON Body):**

```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "secretPassword123"
}
```

  (Username: 3–30 chars; valid email; Password: min 6 chars.)
- **Returns:**
  - `201 Created`:

```json
{
  "id": "23b097b4-...",
  "username": "johndoe",
  "email": "johndoe@example.com"
}
```

  - `400 Bad Request`: Validation errors on fields
  - `409 Conflict`: `{"error": "Email ... already exists"}` or `{"error": "Username ... already exists"}`

### 2.2 Get User Profile by ID

- **Endpoint:** `GET /api/users/{id}`
- **Description:** Fetches public profile details of a user by UUID.
- **Auth:** Required
- **Expects (Path Variable):**
  - `id`: User UUID
- **Returns:**
  - `200 OK`:

```json
{
  "id": "23b097b4-...",
  "username": "johndoe",
  "avatarUrl": "https://example.com/avatar.png",
  "createdAt": "2026-10-17T12:00:00",
  "updatedAt": "2026-10-17T12:00:00"
}
```

  - `404 Not Found`: `{"error": "User not found with id: ..."}`

### 2.3 Get All Users

- **Endpoint:** `GET /api/users`
- **Description:** Returns a list of all registered users in the database.
- **Auth:** Required
- **Expects:** None
- **Returns:**
  - `200 OK`: Array of user profiles:

```json
[
  {
    "id": "23b097b4-...",
    "username": "johndoe",
    "avatarUrl": "https://example.com/avatar.png",
    "createdAt": "2026-10-17T12:00:00",
    "updatedAt": "2026-10-17T12:00:00"
  }
]
```

### 2.4 Update User Profile

- **Endpoint:** `PATCH /api/users/{id}`
- **Description:** Updates the profile (`username`, `avatarUrl`) of the authenticated user. Users cannot update another user's profile.
- **Auth:** Required (Must match `{id}`)
- **Expects (Path Variable & JSON Body):**
  - Path: `id` (User UUID)
  - Body (all fields optional):

```json
{
  "username": "newname",
  "avatarUrl": "https://example.com/new-avatar.png"
}
```

- **Returns:**
  - `200 OK`: Updated profile object
  - `403 Forbidden`: `{"error": "Cannot update another user's profile"}`
  - `404 Not Found`: User not found

### 2.5 Delete User Profile

- **Endpoint:** `DELETE /api/users/{id}`
- **Description:** Deletes a user account.
- **Auth:** Required
- **Expects (Path Variable):**
  - `id`: User UUID
- **Returns:**
  - `204 No Content`: Empty body
  - `404 Not Found`: User not found

---

## 3. Group Endpoints (`/api/groups`)

### 3.1 List Public Groups (Search & Pagination)

- **Endpoint:** `GET /api/groups`
- **Description:** Returns a paginated list of all public groups, with optional name search.
- **Auth:** Required
- **Expects (Query Parameters):**
  - `search` (String, optional): Case-insensitive name filter
  - `page` (Integer, default `1`): 1-indexed page
  - `limit` (Integer, default `10`, max `50`): Results per page
  - Example: `GET /api/groups?search=books&page=1&limit=10`
- **Returns:**
  - `200 OK`:

```json
{
  "data": [
    {
      "id": "6eebd98d-...",
      "name": "Fantasy Readers",
      "description": "Epic fantasy club",
      "creatorId": "23b097b4-...",
      "creatorUsername": "johndoe",
      "isPublic": true,
      "inviteCode": "8CHARCOD",
      "memberCount": 4,
      "mediaItemCount": 8,
      "createdAt": "2026-10-17T12:00:00"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

### 3.2 Get Current User's Groups

- **Endpoint:** `GET /api/groups/me`
- **Description:** Returns all groups (both public and private) that the authenticated user is currently a member of.
- **Auth:** Required
- **Expects:** None
- **Returns:**
  - `200 OK`: Array of group summaries:

```json
[
  {
    "id": "6eebd98d-...",
    "name": "Fantasy Readers",
    "description": "Epic fantasy club",
    "creatorId": "23b097b4-...",
    "creatorUsername": "johndoe",
    "isPublic": true,
    "inviteCode": "8CHARCOD",
    "memberCount": 4,
    "mediaItemCount": 8,
    "createdAt": "2026-10-17T12:00:00"
  }
]
```

### 3.3 Create Group

- **Endpoint:** `POST /api/groups`
- **Description:** Creates a new group. The authenticated caller is automatically set as creator, added to group members with the `OWNER` role, and an 8-character invite code is generated.
- **Auth:** Required
- **Expects (JSON Body):**

```json
{
  "name": "Sci-Fi Watchers",
  "description": "Watching Sci-Fi movies together",
  "isPublic": true
}
```

  (`name` is required; `description` and `isPublic` are optional, `isPublic` defaults to `false`.)
- **Returns:**
  - `201 Created`:

```json
{
  "id": "6eebd98d-...",
  "name": "Sci-Fi Watchers",
  "description": "Watching Sci-Fi movies together",
  "isPublic": true,
  "inviteCode": "A9B2C3D4",
  "creatorId": "23b097b4-...",
  "createdAt": "2026-10-17T12:00:00"
}
```

  - `400 Bad Request`: `{"error": "Name is required"}`

### 3.4 Get Group Details by ID

- **Endpoint:** `GET /api/groups/{id}`
- **Description:** Returns detailed group info including full list of members and summary of media items.
- **Auth:** Required
- **Expects (Path Variable):**
  - `id`: Group UUID
- **Returns:**
  - `200 OK`:

```json
{
  "id": "6eebd98d-...",
  "name": "Sci-Fi Watchers",
  "description": "Watching Sci-Fi movies together",
  "creatorId": "23b097b4-...",
  "isPublic": true,
  "inviteCode": "A9B2C3D4",
  "createdAt": "2026-10-17T12:00:00",
  "members": [
    {
      "userId": "23b097b4-...",
      "username": "johndoe",
      "avatarUrl": "https://example.com/avatar.png",
      "joinedAt": "2026-10-17T12:00:00"
    }
  ],
  "mediaItems": [
    {
      "id": "1a2b3c4d-...",
      "title": "Interstellar",
      "type": "movie",
      "creator": "Christopher Nolan",
      "coverUrl": "https://example.com/poster.jpg",
      "totalUnits": 169,
      "addedAt": "2026-10-17T12:00:00"
    }
  ]
}
```

  - `404 Not Found`: Group not found

### 3.5 Update Group

- **Endpoint:** `PATCH /api/groups/{id}`
- **Description:** Modifies group name, description, or public visibility. Can only be done by the group creator.
- **Auth:** Required (Creator only)
- **Expects (Path Variable & JSON Body):**
  - Path: `id` (Group UUID)
  - Body (all fields optional):

```json
{
  "name": "Sci-Fi & Cyberpunk",
  "description": "Updated group description",
  "isPublic": false
}
```

- **Returns:**
  - `200 OK`:

```json
{
  "id": "6eebd98d-...",
  "name": "Sci-Fi & Cyberpunk",
  "description": "Updated group description",
  "updatedAt": "2026-10-17T12:15:00"
}
```

  - `403 Forbidden`: `{"error": "Only the group creator can update it"}`
  - `404 Not Found`: Group not found

### 3.6 Delete Group

- **Endpoint:** `DELETE /api/groups/{id}`
- **Description:** Deletes a group and cascades deletion to all member records, media items, and tracking progress. Only the creator can perform this.
- **Auth:** Required (Creator only)
- **Expects (Path Variable):**
  - `id`: Group UUID
- **Returns:**
  - `200 OK`:

```json
{
  "message": "Group deleted successfully"
}
```

  - `403 Forbidden`: `{"error": "Only the group creator can delete it"}`
  - `404 Not Found`: Group not found

### 3.7 Join Group by Invite Code

- **Endpoint:** `POST /api/groups/join/{code}`
- **Description:** Adds the authenticated user to the group with the given 8-character invite code as a `MEMBER`.
- **Auth:** Required
- **Expects (Path Variable):**
  - `code`: 8-character string invite code
- **Returns:**
  - `200 OK`:

```json
{
  "groupId": "6eebd98d-...",
  "userId": "23b097b4-...",
  "joinedAt": "2026-10-17T12:20:00"
}
```

  - `404 Not Found`: Group not found with code
  - `409 Conflict`: `{"error": "You are already a member of this group"}`

### 3.8 Leave Group

- **Endpoint:** `DELETE /api/groups/{id}/leave`
- **Description:** Removes the authenticated user from the group. Creators cannot leave (they must delete the group instead).
- **Auth:** Required
- **Expects (Path Variable):**
  - `id`: Group UUID
- **Returns:**
  - `200 OK`:

```json
{
  "message": "Left the group successfully"
}
```

  - `403 Forbidden`: `{"error": "Group creator cannot leave the group. Delete the group instead."}`
  - `404 Not Found`: Caller is not a member of the group

### 3.9 Refresh Invite Code

- **Endpoint:** `POST /api/groups/{id}/refresh-code`
- **Description:** Generates a new random 8-character invite code for the group. The old code immediately stops working.
- **Auth:** Required (Creator only)
- **Expects (Path Variable):**
  - `id`: Group UUID
- **Returns:**
  - `200 OK`:

```json
{
  "inviteCode": "NEW8CODE"
}
```

  - `403 Forbidden`: `{"error": "Only the group creator can refresh the invite code"}`
  - `404 Not Found`: Group not found

---

## 4. Group Member Endpoints (`/api/groups/{groupId}/members`)

### 4.1 List Members of a Group

- **Endpoint:** `GET /api/groups/{groupId}/members`
- **Description:** Returns all members enrolled in the specified group.
- **Auth:** Required
- **Expects (Path Variable):**
  - `groupId`: Group UUID
- **Returns:**
  - `200 OK`:

```json
{
  "groupId": "6eebd98d-...",
  "members": [
    {
      "userId": "23b097b4-...",
      "username": "johndoe",
      "avatarUrl": "https://example.com/avatar.png",
      "role": "owner",
      "joinedAt": "2026-10-17T12:00:00"
    }
  ]
}
```

  - `404 Not Found`: Group not found

### 4.2 Get Specific Member Details

- **Endpoint:** `GET /api/groups/{groupId}/members/{userId}`
- **Description:** Returns membership details for a specific user in the group.
- **Auth:** Required
- **Expects (Path Variables):**
  - `groupId`: Group UUID
  - `userId`: User UUID
- **Returns:**
  - `200 OK`:

```json
{
  "userId": "23b097b4-...",
  "username": "johndoe",
  "avatarUrl": "https://example.com/avatar.png",
  "role": "member",
  "joinedAt": "2026-10-17T12:00:00"
}
```

  - `403 Forbidden`: `{"error": "You must be a member of this group"}`
  - `404 Not Found`: Group or user not found

### 4.3 Remove Member from Group

- **Endpoint:** `DELETE /api/groups/{groupId}/members/{userId}`
- **Description:** Kicks a member out of a group. Only the group creator can perform this.
- **Auth:** Required (Creator only)
- **Expects (Path Variables):**
  - `groupId`: Group UUID
  - `userId`: Target user UUID
- **Returns:**
  - `200 OK`:

```json
{
  "message": "Member removed successfully"
}
```

  - `403 Forbidden`: `{"error": "Only the group creator can remove members"}`
  - `404 Not Found`: Group, user, or membership not found

---

## 5. Media Item Endpoints (`/api/groups/{groupId}/media`)

### 5.1 List Media Items in Group

- **Endpoint:** `GET /api/groups/{groupId}/media`
- **Description:** Returns all media items tracked in the group, optionally filtered by type (`BOOK`, `MOVIE`, `SHOW`, `GAME`).
- **Auth:** Required
- **Expects (Path & Query Parameters):**
  - Path: `groupId` (Group UUID)
  - Query: `type` (String, optional: `book`, `movie`, `show`, `game`)
  - Example: `GET /api/groups/{groupId}/media?type=movie`
- **Returns:**
  - `200 OK`:

```json
{
  "data": [
    {
      "id": "1a2b3c4d-...",
      "type": "movie",
      "title": "Interstellar",
      "creator": "Christopher Nolan",
      "coverUrl": "https://image.tmdb.org/t/p/w500/...",
      "totalUnits": 169,
      "description": "Explorers travel through a wormhole",
      "addedBy": "23b097b4-...",
      "addedAt": "2026-10-17T12:00:00"
    }
  ]
}
```

  - `400 Bad Request`: If `type` is invalid
  - `404 Not Found`: Group not found

### 5.2 Add Media Item to Group

- **Endpoint:** `POST /api/groups/{groupId}/media`
- **Description:** Adds a new media item to track in the group. Any group member can add items.
- **Auth:** Required (Must be a group member)
- **Expects (Path Variable & JSON Body):**
  - Path: `groupId` (Group UUID)
  - Body:

```json
{
  "type": "BOOK",
  "title": "Dune",
  "creator": "Frank Herbert",
  "coverUrl": "https://covers.openlibrary.org/b/id/123-L.jpg",
  "totalUnits": 412,
  "description": "Epic science fiction novel"
}
```

  - `type`: Required (`BOOK`, `MOVIE`, `SHOW`, `GAME`)
  - `title`: Required (max 200 chars)
  - `creator`: Optional (author / director / developer / studio, max 100 chars)
  - `coverUrl`: Optional image URL (max 500 chars)
  - `totalUnits`: Optional (pages, runtime in minutes, or episode count)
  - `description`: Optional text (max 1000 chars)
- **Returns:**
  - `201 Created`:

```json
{
  "id": "2b3c4d5e-...",
  "type": "book",
  "title": "Dune",
  "creator": "Frank Herbert",
  "coverUrl": "https://covers.openlibrary.org/b/id/123-L.jpg",
  "totalUnits": 412,
  "description": "Epic science fiction novel",
  "addedBy": "23b097b4-...",
  "addedAt": "2026-10-17T12:00:00"
}
```

  - `400 Bad Request`: Validation failure (missing required `title` or `type`)
  - `403 Forbidden`: `{"error": "You must be a member of this group"}`
  - `404 Not Found`: Group not found

### 5.3 Get Media Item Details by ID

- **Endpoint:** `GET /api/groups/{groupId}/media/{mediaId}`
- **Description:** Returns full details for a media item, including all member tracking progress and percentages.
- **Auth:** Required
- **Expects (Path Variables):**
  - `groupId`: Group UUID
  - `mediaId`: Media Item UUID
- **Returns:**
  - `200 OK`:

```json
{
  "id": "2b3c4d5e-...",
  "type": "book",
  "title": "Dune",
  "creator": "Frank Herbert",
  "coverUrl": "https://covers.openlibrary.org/b/id/123-L.jpg",
  "totalUnits": 412,
  "description": "Epic science fiction novel",
  "addedAt": "2026-10-17T12:00:00",
  "progress": [
    {
      "userId": "23b097b4-...",
      "username": "johndoe",
      "avatarUrl": "https://example.com/avatar.png",
      "currentUnit": 206,
      "percentage": 50.0,
      "status": "in_progress",
      "note": "Halfway through!",
      "updatedAt": "2026-10-17T12:30:00"
    }
  ]
}
```

  - `404 Not Found`: Group or media item not found

### 5.4 Remove Media Item from Group

- **Endpoint:** `DELETE /api/groups/{groupId}/media/{mediaId}`
- **Description:** Deletes a media item and all associated progress from the group. Any group member can remove an item.
- **Auth:** Required (Must be a group member)
- **Expects (Path Variables):**
  - `groupId`: Group UUID
  - `mediaId`: Media Item UUID
- **Returns:**
  - `200 OK`:

```json
{
  "message": "Media item removed successfully"
}
```

  - `403 Forbidden`: Caller is not a group member
  - `404 Not Found`: Group or media item not found

---

## 6. Progress Tracking Endpoints (`/api/groups/{groupId}/media/{mediaId}/progress`)

### 6.1 Get All Members' Progress on Media Item

- **Endpoint:** `GET /api/groups/{groupId}/media/{mediaId}/progress`
- **Description:** Retrieves the progress tracking records of all group members on the given media item.
- **Auth:** Required
- **Expects (Path Variables):**
  - `groupId`: Group UUID
  - `mediaId`: Media Item UUID
- **Returns:**
  - `200 OK`:

```json
{
  "mediaItemId": "2b3c4d5e-...",
  "data": [
    {
      "userId": "23b097b4-...",
      "username": "johndoe",
      "avatarUrl": "https://example.com/avatar.png",
      "currentUnit": 206,
      "percentage": 50.0,
      "status": "in_progress",
      "note": "Halfway through!",
      "updatedAt": "2026-10-17T12:30:00"
    }
  ]
}
```

  - `404 Not Found`: Group or media item not found

### 6.2 Upsert My Progress

- **Endpoint:** `POST /api/groups/{groupId}/media/{mediaId}/progress`
- **Description:** Creates or updates the authenticated user's current progress on a media item.
  - Automatically calculates `percentage` based on item `totalUnits`.
  - Automatically computes `status` if omitted:
    - `0` → `not_started`
    - `> 0` and `< totalUnits` → `in_progress`
    - `>= totalUnits` → `finished`
- **Auth:** Required (Must be a group member)
- **Expects (Path Variables & JSON Body):**
  - Path: `groupId` (Group UUID), `mediaId` (Media Item UUID)
  - Body:

```json
{
  "currentUnit": 206,
  "status": "IN_PROGRESS",
  "note": "Halfway through!"
}
```

  - `currentUnit`: Required integer (`>= 0`, cannot exceed item `totalUnits`).
  - `status`: Optional (`NOT_STARTED`, `IN_PROGRESS`, `FINISHED`).
  - `note`: Optional string (max 500 chars).
- **Returns:**
  - `200 OK`:

```json
{
  "userId": "23b097b4-...",
  "mediaItemId": "2b3c4d5e-...",
  "currentUnit": 206,
  "percentage": 50.0,
  "status": "in_progress",
  "note": "Halfway through!",
  "updatedAt": "2026-10-17T12:30:00"
}
```

  - `400 Bad Request`: `{"error": "current_unit cannot exceed total_units (412)"}`
  - `403 Forbidden`: `{"error": "You must be a member of this group"}`
  - `404 Not Found`: Group or media item not found

### 6.3 Get Specific User's Progress on Media Item

- **Endpoint:** `GET /api/groups/{groupId}/media/{mediaId}/progress/{userId}`
- **Description:** Fetches the progress record of a specific user on a given media item.
- **Auth:** Required
- **Expects (Path Variables):**
  - `groupId`: Group UUID
  - `mediaId`: Media Item UUID
  - `userId`: Target user UUID
- **Returns:**
  - `200 OK`:

```json
{
  "userId": "23b097b4-...",
  "username": "johndoe",
  "mediaItemId": "2b3c4d5e-...",
  "currentUnit": 206,
  "percentage": 50.0,
  "status": "in_progress",
  "note": "Halfway through!",
  "updatedAt": "2026-10-17T12:30:00"
}
```

  - `404 Not Found`: `{"error": "Progress not found for user: ... on media item: ..."}`

---

## 7. External Media Search Endpoints (`/api/media/search`)

These endpoints query external APIs (Open Library, TMDB, RAWG) to provide auto-fill data when users add media to a group.

### 7.1 Search External Media

- **Endpoint:** `GET /api/media/search`
- **Description:** Searches external sources by query keyword and media type.
- **Auth:** Required
- **Expects (Query Parameters):**
  - `query` (String, required): Search query term
  - `type` (String, required): `book`, `movie`, `show`, or `game`
  - Example: `GET /api/media/search?query=Dune&type=book`
- **Returns:**
  - `200 OK`: Array of search results:

```json
[
  {
    "title": "Dune",
    "creator": "Frank Herbert",
    "coverUrl": "https://covers.openlibrary.org/b/id/123-L.jpg",
    "totalUnits": 412,
    "description": null,
    "type": "book",
    "externalId": "/works/OL102749W"
  }
]
```

  - `400 Bad Request`: `{"error": "Invalid type: xyz. Must be book, movie, show or game"}`
  - `429 Too Many Requests`: `{"error": "Too many requests — slow down"}`
  - `502 Bad Gateway`: External API connection failure

### 7.2 Get External Media Details

- **Endpoint:** `GET /api/media/search/details`
- **Description:** Fetches enriched details (e.g. director, full description, runtime/episode count) for a specific external ID selected from search results.
- **Auth:** Required
- **Expects (Query Parameters):**
  - `id` (String, required): External ID / key from the search result (e.g. TMDB movie ID or Open Library work key)
  - `type` (String, required): `book`, `movie`, `show`, or `game`
  - Example: `GET /api/media/search/details?id=157336&type=movie`
- **Returns:**
  - `200 OK`:

```json
{
  "title": "Interstellar",
  "creator": "Christopher Nolan",
  "coverUrl": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "totalUnits": 169,
  "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  "type": "movie",
  "externalId": "157336"
}
```

  - `400 Bad Request`: Invalid `type` parameter
  - `429 Too Many Requests`: `{"error": "Too many requests — slow down"}`
  - `502 Bad Gateway`: External API error
