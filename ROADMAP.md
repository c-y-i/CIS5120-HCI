# RotorBench — Roadmap (Now → Mid-term)

This document summarizes the immediate and mid-term priorities to evolve RotorBench from a prototype into a robust, developer-friendly app.

## Goals
- Replace brittle JSON storage with a real DB and migration path
- Replace prebuilt 3D meshes with dynamic Babylon.js glTF loading
- Improve developer experience (venv, pinned deps, docs)
- Add user accounts and per-user data persistence
- Prepare for background analysis tasks and local containerized dev

## Now (next 0–2 weeks)
- Add developer setup docs and ensure dependencies are pinned (`backend/requirements.txt`).
- Create a Python virtual environment for backend development and document activation.
- Convert one representative model to `glb`/`glTF` and validate loading in the frontend.
- Implement a basic dynamic model loader in `rotorbench/src/components/BabylonViewer.jsx` to load `glb` files by component ID.

## Near Term (2–8 weeks)
- Replace JSON file storage with SQLite using `SQLModel` (or SQLAlchemy) and add an Alembic migration setup.
- Create a data import script to migrate existing JSON to the DB.
- Add API versioning (`/api/v1`), Pydantic validation, and pagination for list endpoints.
- Add user authentication (JWT) and per-user build storage.

## Mid-Term (2–4 months)
- Add object storage for models/assets (S3 or MinIO) and signed upload/download endpoints.
- Introduce a background task queue (Redis + RQ/Celery) for heavy build analysis.
- Add unit/integration tests and CI (GitHub Actions).  
- Dockerize backend + add `docker-compose` for local dev (db, redis, minio).

## Acceptance criteria (short-term)
- Developer can clone the repo, follow `backend/README.md` to create a venv and start the backend.
- Frontend can load at least one component `glb` dynamically via `BabylonViewer`.
- Existing saved builds can be migrated into a local SQLite DB via a script.

## Next steps (recommended immediate tasks)
1. Create venv and pin dependencies in `backend/requirements.txt` (if not already pinned).
2. Add `backend/README.md` with setup and run instructions (created).
3. Convert one model to `.glb` and add a loader in the frontend.
4. Scaffold `database.py`, `models_sql.py` and a simple migration script.

---
If you want, I can scaffold the DB models and Alembic config next, or implement the frontend loader prototype.
