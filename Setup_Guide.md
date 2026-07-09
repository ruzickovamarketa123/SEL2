# Tour Planner — Setup Guide (Backend Keys & Demo Data)

This short guide explains two things needed to run the project locally:
how to provide the API key / secret the backend needs, and how to load
demo data into the app.

---

## 1. Backend — API key and JWT secret

For security reasons, the OpenRouteService API key and the JWT signing
secret are **not** stored in the versioned `application.properties`
file. They must be provided through a local, git-ignored configuration
file.

**Steps:**

1. Go to `backend/src/main/resources/` — the same folder that contains
   `application.properties`.
2. Create a new file named exactly:
   ```
   application-local.properties
   ```
3. Add the following two lines, generating each value yourself (see
   below for how):
   ```properties
   ors.api.key=<your OpenRouteService API key>
   jwt.secret=<a random string, at least 32 characters>
   ```
4. Save the file — no further configuration is required.
   `application.properties` already contains `spring.profiles.active=local`,
   which tells Spring Boot to automatically load
   `application-local.properties` on startup and merge it with the
   base configuration. You do not need to set any environment variable
   or run configuration option yourself.
5. This file is listed in `.gitignore`, so it will **not** appear when
   you clone the repository — it must be created once, locally, before
   the first run.

**Getting an OpenRouteService API key** (free): sign up at
[openrouteservice.org](https://openrouteservice.org), then go to
**Dashboard → Tokens** and request a free token. Paste it as the value
of `ors.api.key`.

**Generating a JWT secret:** any random string of at least 32
characters works. From a terminal:
```bash
openssl rand -base64 32
```
(on Windows without `openssl`, PowerShell works too:
`[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))`).
Paste the result as the value of `jwt.secret`.

**Database:** the backend expects a local PostgreSQL database named
`tourplanner`, accessible with username `admin`. If your local
PostgreSQL setup uses a different password for that user than our
default, add one more line to the same file:
```properties
DB_PASSWORD=<your local postgres password>
```

---

## 2. Frontend — no key needed

The Angular frontend does not require any API key or secret. All
OpenRouteService calls happen exclusively on the backend; the frontend
only needs to know where the backend is running
(`frontend/src/environments/environment.ts`, `backendUrl`). If you run
the backend locally on the default port (8080), no change is needed
there.

---

## 3. Test accounts and demo data

There is no automatic seed script — accounts are created through the
normal registration flow. To try the app with realistic data:

1. Start the backend and the frontend.
2. In the app, self-register up to 5 accounts, using any
   username/password of your choice.
3. After logging into an account, use the **Import** button in the top
   bar to load one of the 5 ready-made datasets from the `data/`
   folder in the project root: `user1`, `user2`, `user3`, `user4`,
   `user5` (JSON files).
4. There is no fixed pairing between account and file — importing any
   of the 5 files into any account populates it with a complete,
   realistic set of tours and tour logs, useful for trying out search,
   filters, the map, and the statistics dashboard.

You can repeat step 3 for as many of the 5 accounts as you'd like to
explore.
