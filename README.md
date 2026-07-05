# TourPlanner

Software Engineering 2 (SWEN) semester project — a full-stack web application for planning tours and logging completed trips, with live routing on an interactive map.

GitHub Repository link: https://github.com/ruzickovamarketa123/SEL2

**Stack:** Spring Boot 4.0 · Java 25 · Angular 21 · PostgreSQL · JPA/Hibernate · Leaflet · OpenRouteService · Log4j2

---

## Features

- **Authentication** — self-registration and login; passwords are BCrypt-hashed, sessions use stateless JWT tokens (24 h expiry).
- **Tour CRUD** — create, read, update and delete tours. On save the backend geocodes the from/to locations and fetches distance and estimated time from OpenRouteService.
- **Tour Logs** — each tour can hold multiple logs (date/time, distance, duration, difficulty, rating 1–5, comment).
- **Interactive map** — the selected tour is drawn on a Leaflet map (CartoDB tiles); the route polyline is fetched live from ORS with a cancellation token so stale routes never flash when switching tours quickly.
- **Computed attributes** — popularity and child-friendliness (each 0–5) are calculated in the business layer and shown as star ratings; both can also be used as search filters.
- **Full-text search** — a single query searches tour name, description, from/to, transport type and log comments, optionally filtered by minimum popularity / child-friendliness. Keystrokes are debounced by 300 ms.
- **Import / Export** — tours and their logs are exported as a versioned JSON file and re-created on import.
- **Profile self-management** — logged-in users can update their username, e-mail and password without logging out.

## Project structure

```
SEL2/
├── backend/            Spring Boot 4 / Java 25 REST API (3-layer architecture)
├── frontend/           Angular 21 single-page app (MVVM via signals)
├── data/               supporting data files
├── docker-compose.yml  PostgreSQL 16 for local development
└── TourPlanner_Protocol_final.docx   full project protocol
```

## Getting started

### Prerequisites

- Java 25 (JDK) and a build tool wrapper (Maven / Gradle) — included in `backend/`
- Node.js + npm and the Angular CLI (Angular 21)
- Docker (for PostgreSQL) — or a local PostgreSQL 16 instance
- An [OpenRouteService](https://openrouteservice.org/) API key (free tier) for geocoding and directions

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 16 with database `tourplanner`, user `admin`, password `password`, on port `5432` — matching the backend's default datasource configuration.

### 2. Run the backend

```bash
cd backend
# add your OpenRouteService API key to src/main/resources/application.properties
./mvnw spring-boot:run       # or ./gradlew bootRun
```

The API starts on `http://localhost:8080` under `/api`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm start                    # or: ng serve
```

The app is served on `http://localhost:4200` (the backend allows CORS from this origin).

## Tests

The backend ships with 42 unit tests (JUnit 5 + Mockito + AssertJ) covering business logic, computed attributes, ownership guards and the controller layer:

```bash
cd backend
./mvnw test                  # or ./gradlew test
```

## Documentation

The full protocol — architecture, design pattern, use-case / class / sequence diagrams, wireframes, tests and time tracking — is in [`TourPlanner_Protocol_final.docx`](./TourPlanner_Protocol_final.docx).
