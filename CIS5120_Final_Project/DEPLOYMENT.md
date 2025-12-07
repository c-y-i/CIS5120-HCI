# Deployment Guide

## 1. Frontend (GitHub Pages)

Hosting: GitHub Pages
Connects to: EC2 Backend

### How to deploy

1. Open a terminal in the `rotorbench` folder:
   ```bash
   cd rotorbench
   ```

2. Run the deploy command:
   ```bash
   npm run deploy
   ```
   *This builds the app and flings it to the `gh-pages` branch. Give it a minute to update.*

### If Backend IP changes

1. Open `rotorbench/.env.production`
2. Update the IP:
   ```env
   REACT_APP_API_BASE=http://<NEW_IP>:8000
   ```
3. Run `npm run deploy` again.

---

## 2. Backend (EC2)

Hosting: AWS EC2 (Ubuntu/Linux)

### First time setup

Connect to your EC2 and run:

```bash
# Get the code (assuming you git clone or scp it over)
cd backend

# Install dependencies
sudo apt update
sudo apt install python3-pip
pip install -r requirements.txt
```

### Run the server

Use `nohup` so it stays running when you disconnect:

```bash
nohup python3 main.py > server.log 2>&1 &
```

*Server listens on port 8000. Make sure your EC2 Security Group allows Inbound TCP on port 8000.*

### Stop/Restart

```bash
# Find the process
ps aux | grep main.py

# Kill it
kill <PID>

# Start again
nohup python3 main.py > server.log 2>&1 &
```
