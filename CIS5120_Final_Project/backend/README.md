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

## NEW: 3D Model Conversion API 🎉

The backend now includes automatic 3D model conversion to GLTF/GLB format!

### Quick Start
```bash
# Server is already running? Test the new endpoints:
curl http://localhost:8000/api/models/categories
curl http://localhost:8000/api/models/list/motors
```

### Features
- Convert STEP, STL, OBJ, and other 3D formats to GLTF/GLB
- Smart caching system (converts once, serves many times)
- REST API endpoints for frontend integration
- Batch conversion support
- Organized by component category

### Documentation
- **API Documentation**: See `MODEL_CONVERSION_API.md` for complete API reference
- **Quick Start**: See `../QUICK_START_MODELS.md` for frontend integration examples
- **Architecture**: See `../ARCHITECTURE_DIAGRAM.md` for system overview
- **Testing**: Run `python3 test_model_conversion.py` to test all endpoints

### Usage in Frontend
```javascript
// Get model URL and use in Babylon.js or Three.js
const modelUrl = `http://localhost:8000/api/models/convert/motors/motor-2207-1750kv.stp?format=glb`;
BABYLON.SceneLoader.Append(modelUrl, '', scene);
```

See `../rotorbench/src/components/ModelConverterExample.js` for a complete React example.

Next steps for dev
- ~~Convert at least one model asset to `.glb`~~  Now automatic via API!
- Use the model conversion API in your 3D viewers (BabylonViewer, etc.)
- If you plan to migrate JSON storage to a DB, scaffold `database.py` and create migrations with Alembic.

Troubleshooting
- If `python3 -m venv .venv` fails, install the system package:
```bash
sudo apt update && sudo apt install python3-venv
```
- If ports are occupied, change `--port` in the uvicorn command.

Contact
- If anything breaks, open an issue or ask for assistance in the repo.
