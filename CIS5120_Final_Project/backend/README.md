# RotorBench Backend — Developer README

This README describes how to set up a local development environment for the backend and run the API.

Prerequisites
- Python 3.10+ (3.11 recommended)
- `python3-venv` system package (for `venv`) if your environment does not already have venv support

Quick start
1. Open a terminal and change to the backend folder:
```bash
cd CIS5120_Final_Project/backend
```
2. Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```
3. Upgrade pip and install dependencies from the included `requirements.txt`:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```
4. Run the server locally (development, with reload):
```bash
# from backend/ and with venv active
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Notes
- The project already contains a minimal `requirements.txt` pinned to expected packages. After adding or upgrading packages, update the file with `pip freeze > requirements.txt`.
- The FastAPI app entrypoint is `main.py` and the FastAPI instance is named `app` (run as `main:app`).
- For production deployments consider using a WSGI/ASGI server configuration such as `gunicorn` with `uvicorn` workers, and switch to a production DB (Postgres) and object storage for large model assets.

Next steps for dev
- Convert at least one model asset to `.glb` and place it under `rotorbench/public/models` (or configure an S3/minio bucket for assets).
- If you plan to migrate JSON storage to a DB, scaffold `database.py` and create migrations with Alembic.

Troubleshooting
- If `python3 -m venv .venv` fails, install the system package:
```bash
sudo apt update && sudo apt install python3-venv
```
- If ports are occupied, change `--port` in the uvicorn command.

Contact
- If anything breaks, open an issue or ask for assistance in the repo.
