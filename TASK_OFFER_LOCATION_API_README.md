# FixPay Task & Offer Location API Reference

This document describes the backend API endpoints and request payloads for task location and offer workflows, intended for Flutter integration.

## Base URL
`http://localhost:2001/api`

## Authentication
Protected routes require the header:

`Authorization: bearer <JWT_TOKEN>`

---

## Task Endpoints

### Create a Task
`POST /api/tasks`

Request body:
```json
{
  "title": "Fix my AC",
  "description": "AC is leaking water and not cooling.",
  "categoryId": "<categoryId>",
  "budget": 1500,
  "location": "Maadi, Cairo",
  "locationCoords": {
    "lat": 29.9602,
    "lng": 31.2569
  }
}
```

Notes:
- `location` is a string address or place description.
- `locationCoords` is required for geolocation matching and distance calculations.
- Images may be uploaded as multipart form-data using the `images` field.

---

### Update a Task
`PATCH /api/tasks/:taskId`

Request body can include any of the following:
- `title`
- `description`
- `categoryId`
- `budget`
- `location`
- `locationCoords`

Example:
```json
{
  "location": "New Maadi, Cairo",
  "locationCoords": {
    "lat": 29.9610,
    "lng": 31.2575
  }
}
```

---

### List Open Tasks
`GET /api/tasks/open`

Response tasks include both:
- `location`
- `locationCoords`

---

### Get Task Offers
`GET /api/tasks/:taskId/offers`

Use this endpoint to retrieve all offers submitted for a specific task.

---

### Get Recommended Workers
`GET /api/tasks/:taskId/recommend-workers`

Response includes:
- `taskLocation`: the task's `locationCoords`
- `recommendations`: list of workers with their `locationCoords`, distances, and estimated driving times

---

## Offer Endpoints

### Create an Offer
`POST /api/offers`

Request body:
```json
{
  "taskId": "<taskId>",
  "price": 1200,
  "message": "I can do it today and finish in 3 hours."
}
```

Notes:
- Offer creation does not send separate location data.
- Estimated travel distance and time may be returned automatically if both the worker and task have `locationCoords`.

---

### Accept an Offer
`PATCH /api/offers/:offerId/accept`

Used by the customer to accept an offer and assign the worker.

---

### Counter an Offer
`PATCH /api/offers/:offerId/counter`

Request body:
```json
{
  "price": 1100,
  "message": "Please confirm if you can do it for 1100."
}
```

---

### Respond to a Counter
`PATCH /api/offers/:offerId/respond`

Request body:
```json
{
  "price": 1150,
  "message": "I can accept 1150 and start immediately."
}
```

---

## Task Location Field Summary

### Task location object
- `location`: string
- `locationCoords`: object
  - `lat`: number
  - `lng`: number

Example:
```json
{
  "location": "Maadi, Cairo",
  "locationCoords": {
    "lat": 29.9602,
    "lng": 31.2569
  }
}
```

### Offer location behavior
- Offers do not include separate location fields.
- Worker travel calculations use:
  - task `locationCoords`
  - worker `locationCoords` stored in the worker user profile

---

## Recommended Flutter Flow

1. Customer creates a task with `location` and `locationCoords` using `POST /api/tasks`.
2. Worker fetches open tasks via `GET /api/tasks/open`.
3. Worker submits an offer via `POST /api/offers`.
4. Customer views offers for the task via `GET /api/tasks/:taskId/offers`.
5. Customer accepts an offer via `PATCH /api/offers/:offerId/accept`.
6. To show nearby recommended workers, use `GET /api/tasks/:taskId/recommend-workers`.
