
## Users

GET /users/:id
returns: { id, username, avatar_url, created_at }

PATCH /users/:id
expects: { username?, avatar_url? }
returns: { id, username, avatar_url, updated_at }

---

## Groups

GET /groups?search=&page=1&limit=10
returns: { data: [{ id, name, description, creator_id, member_count, book_count }], total }

POST /groups
expects: { name, description? }
returns: { id, name, description, creator_id, created_at }

GET /groups/:id
returns: { id, name, description, creator_id, members: [...], books: [...] }

PATCH /groups/:id  (creator only)
expects: { name?, description? }
returns: { id, name, description, updated_at }

DELETE /groups/:id  (creator only)
returns: { message: "Group deleted" }

POST /groups/:id/join
returns: { group_id, user_id, joined_at }

DELETE /groups/:id/leave
returns: { message: "Left the group" }

DELETE /groups/:id/members/:userId  (creator only)
returns: { message: "Member removed" }

---

## Books

GET /groups/:groupId/books
returns: { data: [{ id, title, author, cover_url, total_pages, added_at }] }

POST /groups/:groupId/books  (creator only)
expects: { title, author, cover_url?, total_pages?, description? }
returns: { id, title, author, cover_url, total_pages, added_at }

GET /groups/:groupId/books/:bookId
returns: { id, title, author, total_pages, progress: [{ user_id, username, current_page, percentage, status, note }] }

DELETE /groups/:groupId/books/:bookId  (creator only)
returns: { message: "Book removed" }

---

## Progress

GET /groups/:groupId/books/:bookId/progress
returns: { data: [{ user_id, username, current_page, percentage, status, note, updated_at }] }

POST /groups/:groupId/books/:bookId/progress
expects: { current_page, status?: "reading"|"finished", note? }
returns: { user_id, book_id, current_page, percentage, status, note, updated_at }

GET /groups/:groupId/books/:bookId/progress/:userId
returns: { user_id, username, current_page, percentage, status, note, updated_at }

---

## Errors

400 bad request — missing or invalid fields
401 unauthorized — bad/missing token
403 forbidden — not allowed
404 not found
409 conflict — e.g. already a member

all errors return: { error: "message" }
