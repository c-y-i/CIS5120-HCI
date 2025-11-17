# RotorBench — Roadmap

## Goals
- Replace JSON storage with SQLite DB + migrations
- Replace prebuilt 3D meshes with dynamic glTF loading
- Improve developer experience (venv, pinned deps, docs)
- Add user accounts and per-user data persistence
- Prepare for background tasks and containerized dev

## Now (0–2 weeks)
- Pin dependencies and add `backend/README.md` with venv setup
- Convert one model to `.glb` and implement dynamic loader in `BabylonViewer.jsx`

## Near Term (2–8 weeks)
- Migrate JSON storage to SQLite (SQLModel/SQLAlchemy + Alembic)
- Add API versioning (`/api/v1`), Pydantic validation, pagination
- Add JWT authentication and per-user build storage

## Mid-Term (2–4 months)
- Add object storage (S3/MinIO) for models/assets
- Background task queue (Redis + RQ/Celery) for analysis
- Unit/integration tests + CI (GitHub Actions)
- Dockerize backend + `docker-compose` for local dev

## Acceptance Criteria
- Developer can clone, setup venv, and start backend via `backend/README.md`
- Frontend loads component `.glb` files dynamically
- Existing builds migrate to SQLite via script
