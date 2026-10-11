# ParkSmart – Vehicle Parking Slot Monitoring System

A full-stack, production-ready web application for managing vehicle parking slots, reservations, sessions, and analytics.

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React |
| Backend | Java 26, Spring Boot 3.3.5, Maven, Spring Security, Spring Data MongoDB |
| Database | MongoDB (Atlas or local) — `vehicle_parking_db` |
| Auth | JWT (Bearer token via `Authorization` header) |

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Java JDK | 21 or higher (26 tested) |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |
| MongoDB | 6.0+ (local) or MongoDB Atlas |

---

## Quick Start

### 1. Clone / download the project

```bash
git clone <your-repo-url>
cd vechile
```

### 2. Configure environment variables

**Backend** – copy and edit:
```bash
copy backend\.env.example backend\.env
```
Edit `backend/.env`:
```env
SERVER_PORT=8080
MONGODB_URI=mongodb://localhost:27017/vehicle_parking_db
MONGODB_DATABASE=vehicle_parking_db
JWT_SECRET=replace_this_with_a_long_random_secret_at_least_32_chars
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173
SEED_ENABLED=true
ADMIN_EMAIL=admin@parking.local
```

**Frontend** – copy and edit:
```bash
copy frontend\.env.example frontend\.env
```
Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

> ⚠️ **Never commit** `.env` files. They are already in `.gitignore`.

### 3. Start MongoDB

**Local:**
```bash
mongod --dbpath /data/db
```

**MongoDB Atlas:**  
Set `MONGODB_URI` to your Atlas connection string.

---

## Running the Backend

```bash
cd backend
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

On first start (if `SEED_ENABLED=true`), the application automatically:
- Creates 18 parking slots (10 four-wheeler, 5 two-wheeler, 2 electric, 1 accessible)
- Creates an admin user — email from `ADMIN_EMAIL`, password printed to the console
- Creates 2 demo regular users and 3 demo vehicles
- Creates sample parking records

> 📋 **Check the console output** for the generated admin password after first start.

### Running backend tests

```bash
cd backend
mvn test
```

### Building the backend JAR

```bash
cd backend
mvn package -DskipTests
java -jar target/parking-backend-1.0.0.jar
```

---

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

The Vite development server proxies all `/api` requests to `http://localhost:8080`.

### Running frontend tests

```bash
cd frontend
npm test
```

### Building for production

```bash
cd frontend
npm run build
# Output is in frontend/dist/
```

---

## MongoDB Database

- **Database name:** `vehicle_parking_db`
- **Collections:** `users`, `vehicles`, `parking_slots`, `parking_records`, `reservations`, `notifications`, `audit_logs`
- Indexes are created automatically via `@Indexed` annotations and a `MongoIndexCreator` component on startup.

### MongoDB Atlas setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Whitelist your IP (or `0.0.0.0/0` for development).
4. Copy the connection string and set it as `MONGODB_URI` in `backend/.env`.

---

## API Reference

All endpoints (except auth) require `Authorization: Bearer <token>`.

| Group | Endpoint | Auth |
|-------|----------|------|
| Auth | `POST /api/auth/register` | Public |
| Auth | `POST /api/auth/login` | Public |
| Auth | `POST /api/auth/logout` | JWT |
| Auth | `GET /api/auth/me` | JWT |
| Vehicles | `GET/POST /api/vehicles` | JWT |
| Vehicles | `GET/PUT/DELETE /api/vehicles/{id}` | JWT |
| Slots | `GET /api/parking-slots` | JWT |
| Slots | `GET /api/parking-slots/available` | JWT |
| Slots | `GET /api/parking-slots/stats` | JWT |
| Sessions | `POST /api/parking-sessions/entry` | JWT |
| Sessions | `POST /api/parking-sessions/{id}/exit` | JWT |
| Sessions | `GET /api/parking-sessions/active` | JWT |
| Sessions | `GET /api/parking-sessions/history` | JWT |
| Reservations | `POST/GET /api/reservations` | JWT |
| Reservations | `GET /api/reservations/{id}` | JWT |
| Reservations | `POST /api/reservations/{id}/cancel` | JWT |
| Dashboard | `GET /api/dashboard/user` | JWT (USER) |
| Dashboard | `GET /api/dashboard/admin` | JWT (ADMIN) |
| Notifications | `GET /api/notifications` | JWT |
| Notifications | `PATCH /api/notifications/{id}/read` | JWT |
| Notifications | `PATCH /api/notifications/read-all` | JWT |
| Reports | `GET /api/reports/analytics?period=7d` | JWT |
| Reports | `GET /api/reports/export/csv` | JWT |
| Reports | `GET /api/reports/export/pdf` | JWT |
| Admin – Slots | `POST /api/admin/parking-slots` | ADMIN |
| Admin – Slots | `PUT /api/admin/parking-slots/{id}` | ADMIN |
| Admin – Slots | `PATCH /api/admin/parking-slots/{id}/status` | ADMIN |
| Admin – Users | `GET /api/admin/users` | ADMIN |
| Admin – Users | `PATCH /api/admin/users/{id}/activate` | ADMIN |
| Admin – Users | `PATCH /api/admin/users/{id}/deactivate` | ADMIN |
| Admin – Sessions | `GET /api/admin/parking-sessions/active` | ADMIN |
| Admin – Sessions | `GET /api/admin/parking-sessions/history` | ADMIN |
| Admin – Reservations | `GET /api/admin/reservations` | ADMIN |
| Admin – Audit | `GET /api/admin/audit-logs` | ADMIN |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| `USER` | Register vehicles, view/reserve slots, start/end parking sessions, view history and reports |
| `ADMIN` | Everything above + manage all users, slots, sessions; view audit logs; admin reports |

---

## Frontend Routes

| Path | Role | Description |
|------|------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/dashboard` | USER | User dashboard |
| `/slots` | USER | Parking map / slot monitor |
| `/vehicles` | USER | My vehicles |
| `/vehicles/new` | USER | Register vehicle |
| `/vehicles/:id` | USER | Vehicle detail |
| `/reserve` | USER | Reserve a slot |
| `/reservations` | USER | My reservations |
| `/sessions` | USER | Active session |
| `/history` | USER | Parking history |
| `/notifications` | USER | Notifications |
| `/reports` | USER | Analytics & reports |
| `/profile` | USER | Profile settings |
| `/admin` | ADMIN | Admin dashboard |
| `/admin/users` | ADMIN | User management |
| `/admin/slots` | ADMIN | Slot management |
| `/admin/vehicles` | ADMIN | Vehicle records |
| `/admin/sessions` | ADMIN | All sessions |
| `/admin/history` | ADMIN | All history |
| `/admin/reservations` | ADMIN | All reservations |
| `/admin/reports` | ADMIN | Admin analytics |
| `/admin/audit` | ADMIN | Audit logs |
| `/admin/settings` | ADMIN | System settings |

---

## Slot Status Colors

| Status | Color |
|--------|-------|
| AVAILABLE | 🟢 Green |
| OCCUPIED | 🔴 Red |
| RESERVED | 🟡 Yellow |
| MAINTENANCE | ⬜ Gray |

---

## Security Notes

- Passwords are hashed with BCrypt (strength 12).
- JWT tokens are signed with HS256 and expire after 24 hours (configurable).
- Backend enforces role checks on every protected endpoint — frontend role hiding is UI-only.
- Object-level access: users can only access their own vehicles, sessions, and reservations.
- Audit logs record sensitive admin actions.
- `JWT_SECRET` must be at least 32 characters. Use a cryptographically random value in production.

---

## Deployment

### Backend (e.g., Railway, Render, AWS EC2)

1. Build: `mvn package -DskipTests`
2. Set all environment variables in your hosting platform.
3. Run: `java -jar target/parking-backend-1.0.0.jar`
4. Set `CORS_ALLOWED_ORIGINS` to your frontend production URL.

### Frontend (e.g., Vercel, Netlify)

1. Set `VITE_API_BASE_URL` to your backend production URL.
2. Build: `npm run build`
3. Deploy the `dist/` folder.
4. Configure rewrite rules: all paths → `index.html` (for React Router).

### MongoDB Atlas (Production)

1. Use a dedicated Atlas cluster (M10+).
2. Enable network peering or IP whitelist for your backend.
3. Create a dedicated database user with least-privilege access.
4. Enable Atlas backups.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend won't start | Check `MONGODB_URI` is valid and MongoDB is running |
| JWT errors | Ensure `JWT_SECRET` is set and is at least 32 chars |
| CORS errors | Set `CORS_ALLOWED_ORIGINS` to the exact frontend origin (no trailing slash) |
| Lombok errors | This project uses plain Java (no Lombok) — no action needed |
| Frontend API 404 | Ensure backend is running on port 8080 and Vite proxy is configured |
| Admin password | Check backend console output on first start for the generated password |
| Seed not running | Set `SEED_ENABLED=true` in `.env` or environment variables |

---

## Project Structure

```
vechile/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/java/com/parking/
│   │   │   ├── ParkingApplication.java
│   │   │   ├── controller/    # REST controllers
│   │   │   ├── service/       # Business logic
│   │   │   ├── repository/    # MongoDB repositories
│   │   │   ├── model/         # MongoDB documents & enums
│   │   │   ├── dto/           # Request & response DTOs
│   │   │   ├── security/      # JWT, UserDetails, SecurityConfig
│   │   │   └── exception/     # Exception handling
│   │   ├── resources/
│   │   │   └── application.properties
│   │   └── test/              # JUnit 5 + Mockito tests
│   ├── pom.xml
│   └── .env.example
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios client + typed API functions
│   │   ├── components/        # Reusable UI + layout components
│   │   ├── context/           # Auth context
│   │   ├── hooks/             # Custom hooks (polling, pagination, debounce)
│   │   ├── pages/             # All user and admin pages
│   │   ├── types/             # TypeScript interfaces
│   │   └── test/              # Vitest + React Testing Library tests
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## License

MIT
