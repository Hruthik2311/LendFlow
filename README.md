# Loan Recovery System

## Local Development with Docker

### Prerequisites

- Docker & Docker Compose installed

### Running Backend & Database

```
cd backend
# Build and start backend and database
docker-compose up --build
```

- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432 (user: postgres, password: postgres, db: loan_recovery)

### Notes

- Update `.env` as needed.
- Use `npm run dev` in backend for hot-reload (nodemon).
- Connect frontend to backend API at `http://localhost:5000`.
