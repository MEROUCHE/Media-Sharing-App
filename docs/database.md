# Database MLD

## profiles
| column     | type      | constraint |
|------------|-----------|------------|
| id         | uuid      | PK         |
| username   | text      | unique, not null |
| avatar_url | text      |            |
| created_at | timestamp | default now() |

## groups
| column      | type      | constraint |
|-------------|-----------|------------|
| id          | uuid      | PK         |
| name        | text      | not null   |
| description | text      |            |
| creator_id  | uuid      | FK -> profiles.id |
| created_at  | timestamp | default now() |

## group_members
| column    | type      | constraint |
|-----------|-----------|------------|
| group_id  | uuid      | PK, FK -> groups.id |
| user_id   | uuid      | PK, FK -> profiles.id |
| joined_at | timestamp | default now() |

## books
| column      | type      | constraint |
|-------------|-----------|------------|
| id          | uuid      | PK         |
| group_id    | uuid      | FK -> groups.id |
| title       | text      | not null   |
| author      | text      | not null   |
| cover_url   | text      |            |
| total_pages | integer   |            |
| added_by    | uuid      | FK -> profiles.id |
| added_at    | timestamp | default now() |

## reading_progress
| column       | type      | constraint |
|--------------|-----------|------------|
| user_id      | uuid      | PK, FK -> profiles.id |
| book_id      | uuid      | PK, FK -> books.id |
| current_page | integer   | default 0  |
| status       | text      | 'not_started' / 'reading' / 'finished' |
| note         | text      |            |
| updated_at   | timestamp | default now() |

## Relations

- profiles ||--o{ groups : one profile creates many groups
- profiles ||--o{ group_members : one profile joins many groups
- groups ||--o{ group_members : one group has many members
- groups ||--o{ books : one group has many books
- profiles ||--o{ books : one profile adds many books
- profiles ||--o{ reading_progress : one profile tracks progress on many books
- books ||--o{ reading_progress : one book has progress from many readers