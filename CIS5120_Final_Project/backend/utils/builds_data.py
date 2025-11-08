import json, uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict, Any

DATA_DIR = Path(__file__).resolve().parents[2] / "rotorbench" / "src" / "data"
BUILDS_FILE = DATA_DIR / "builds.json"

def _read() -> List[Dict[str, Any]]:
    if not BUILDS_FILE.exists():
        return []
    with open(BUILDS_FILE, "r") as f:
        return json.load(f)

def _write(items: List[Dict[str, Any]]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(BUILDS_FILE, "w") as f:
        json.dump(items, f, indent=2)

def list_builds(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    items = _read()
    return [b for b in items if b.get("userId") == user_id] if user_id else items

def get_build(bid: str) -> Optional[Dict[str, Any]]:
    for b in _read():
        if b.get("id") == bid:
            return b
    return None

def create_build(data: Dict[str, Any]) -> Dict[str, Any]:
    items = _read()
    now = datetime.utcnow().isoformat()
    data = {**data}
    data["id"] = data.get("id") or f"bld_{uuid.uuid4().hex[:10]}"
    data["createdAt"] = data.get("createdAt") or now
    data["updatedAt"] = now
    items.append(data)
    _write(items)
    return data

def update_build(bid: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    items = _read()
    for i, b in enumerate(items):
        if b.get("id") == bid:
            merged = {**b, **data}
            merged["id"] = bid
            merged["updatedAt"] = datetime.utcnow().isoformat()
            items[i] = merged
            _write(items)
            return merged
    return None

def delete_build(bid: str) -> bool:
    items = _read()
    new_items = [b for b in items if b.get("id") != bid]
    if len(new_items) == len(items):
        return False
    _write(new_items)
    return True
