# India Paperwork Guide — Public API v1 Documentation & OpenAPI 3.1 Specification

## 1. Overview

The **Public v1 JSON API** provides read-only programmatic access to verified Indian citizen paperwork guides, statutory fee schedules, procedural steps, document requirements, and state-specific overrides.

### Core Invariants:

- **Zero Authentication Required**: Open read-only civic data for citizens, civil society apps, and the Expo mobile app.
- **Cross-Origin Resource Sharing (CORS)**: Enabled on all endpoints (`Access-Control-Allow-Origin: *`).
- **ETag & HTTP 304 Support**: Automatic MD5 ETag calculation on every payload. Sending `If-None-Match` returns `304 Not Modified` with empty body when data is unchanged.
- **Cache-Control**: `public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400`
- **Rate Limiting**: 100 requests per sliding 60-second window per client IP. Response headers:
  - `X-RateLimit-Limit`: Maximum requests per minute (`100`)
  - `X-RateLimit-Remaining`: Remaining request quota
  - `X-RateLimit-Reset`: Unix epoch timestamp when quota resets
  - `Retry-After`: Seconds to wait when HTTP `429 Too Many Requests` is returned

---

## 2. API Endpoints

### 2.1 `GET /api/v1/categories`

Returns all 10 civic service categories with active task counts and metadata.

#### Response Example (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "vehicles",
      "slug": "vehicles",
      "name": "Vehicles & Driving",
      "description": "Driving licences, vehicle registration, and permits.",
      "displayOrder": 1,
      "taskCount": 2
    }
  ]
}
```

---

### 2.2 `GET /api/v1/states`

Returns all 36 Indian States and Union Territories with codes, names, capitals, official portal links, and launch status.

#### Response Example (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "code": "gj",
      "name": "Gujarat",
      "slug": "gujarat",
      "portalUrl": "https://digitalgujarat.gov.in",
      "launchState": true
    }
  ]
}
```

---

### 2.3 `GET /api/v1/tasks`

Returns a paginated list of task summaries.

#### Query Parameters:

- `page` _(optional, integer, default `1`)_: Page number.
- `limit` _(optional, integer, default `20`, max `100`)_: Items per page.
- `category` _(optional, string)_: Filter by category slug (e.g. `vehicles`).
- `state` _(optional, string)_: Filter by available state code or slug (e.g. `gj` or `gujarat`).

#### Response Example (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "slug": "driving-licence-learner",
      "name": "Learner's Licence (LLR)",
      "description": "First step to get a driving licence in India.",
      "categorySlug": "vehicles",
      "categoryName": "Vehicles & Driving",
      "difficulty": "easy",
      "estimatedTime": "15-30 days",
      "cost": "₹150 – ₹200",
      "availableStates": ["gj"],
      "lastVerifiedAt": "2026-11-14T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 2.4 `GET /api/v1/tasks/{slug}`

Returns the full national baseline guide for the specified task slug.

#### Path Parameters:

- `slug` _(required, string)_: e.g. `driving-licence-learner`

#### Errors:

- `404 NOT_FOUND`: When the task slug does not exist.

---

### 2.5 `GET /api/v1/tasks/{slug}/{state}`

Returns the state-resolved guide variant, merging state-specific procedural steps, fees, and links over the national baseline.

#### Path Parameters:

- `slug` _(required, string)_: e.g. `driving-licence-learner`
- `state` _(required, string)_: State slug or code, e.g. `gujarat` or `gj`

---

### 2.6 `GET /api/v1/search`

Performs fuzzy search across task titles, summaries, keywords, and document names using the in-memory Bitap fuzzy search engine.

#### Query Parameters:

- `q` _(required, string)_: Search keyword (e.g. `driving license`, `tatkal passport`, `aadhaar`)
- `category` _(optional, string)_: Category filter
- `state` _(optional, string)_: State filter
- `page` _(optional, integer, default `1`)_
- `limit` _(optional, integer, default `20`)_

#### Errors:

- `400 MISSING_QUERY`: When `q` is missing or blank.

---

### 2.7 `GET /api/v1/updates`

Returns tasks verified, updated, or revised since a given timestamp. Used by the mobile app and offline clients to synchronize changed content incrementally.

#### Query Parameters:

- `since` _(optional, ISO 8601 date string, default: last 30 days)_: e.g. `2026-01-01` or `2026-11-01T00:00:00Z`

#### Response Example (200 OK):

```json
{
  "success": true,
  "data": {
    "since": "2026-11-01T00:00:00.000Z",
    "serverTime": "2026-11-16T12:00:00.000Z",
    "count": 1,
    "tasks": [
      {
        "slug": "driving-licence-learner",
        "name": "Learner's Licence (LLR)",
        "categorySlug": "vehicles",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "action": "VERIFIED"
      }
    ]
  }
}
```

---

## 3. OpenAPI 3.1.0 Specification

```yaml
openapi: 3.1.0
info:
  title: India Paperwork Guide Public API
  version: 1.0.0
  description: Versioned read-only JSON API delivering verified Indian citizen document checklists, statutory fees, and procedures.
servers:
  - url: /api/v1
    description: Current Environment
paths:
  /categories:
    get:
      summary: List all service categories
      responses:
        "200":
          description: List of categories with active task counts
        "304":
          description: Not Modified (cached via ETag)
        "429":
          description: Rate limit exceeded
  /states:
    get:
      summary: List all Indian states and union territories
      responses:
        "200":
          description: List of 36 Indian states and UTs
        "304":
          description: Not Modified
  /tasks:
    get:
      summary: Paginated list of tasks
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: category
          in: query
          schema:
            type: string
        - name: state
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Paginated tasks list
  /tasks/{slug}:
    get:
      summary: Get full task by slug (national baseline)
      parameters:
        - name: slug
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Complete task guide with documents, fees, and steps
        "404":
          description: Task slug not found
  /tasks/{slug}/{state}:
    get:
      summary: Get state-resolved task guide
      parameters:
        - name: slug
          in: path
          required: true
          schema:
            type: string
        - name: state
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Merged task guide variant with state overrides
        "404":
          description: Task or state not found
  /search:
    get:
      summary: Search paperwork guides
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        "200":
          description: Paginated search results
        "400":
          description: Missing query parameter
  /updates:
    get:
      summary: Incremental sync endpoint for changed content
      parameters:
        - name: since
          in: query
          schema:
            type: string
            format: date-time
      responses:
        "200":
          description: Tasks changed or verified on or after the specified date
        "400":
          description: Invalid date format
```
