# Deployment Guide

## 1. One-Time GitHub Setup

Before deploying for the first time, change these settings on your repository website:

### A. Enable Bot Permissions
1.  Go to your repository **Settings** tab.
2.  On the left, click **Actions** -> **General**.
3.  Scroll down to **Workflow permissions**.
4.  Select **Read and write permissions**.
5.  Click **Save**.
    *   *This allows the automated script to publish the website for you.*

### B. Configure Pages Source (Do this AFTER your first push)
1.  Go to **Settings** -> **Pages**.
2.  Under **Build and deployment** -> **Source**, choose **Deploy from a branch**.
3.  Under **Branch**, select `gh-pages` (and `/ root` folder).
    *   *Note: If you don't see `gh-pages` yet, wait until the "Deploy to GitHub Pages" action finishes running for the first time, then come back here.*
4.  Click **Save**.

---

## 2. How to Deploy (Frontend)

The website deploys automatically whenever you update the code.

1.  **Check Configuration:**
    Ensure `rotorbench/.env.production` has the correct backend IP:
    ```env
    REACT_APP_API_BASE=http://<YOUR_EC2_IP>:8000
    ```

2.  **Push Changes:**
    ```bash
    git add .
    git commit -m "Update site"
    git push origin main
    ```

3.  **Wait & Verify:**
    *   Go to the **Actions** tab on GitHub to see the build progress.
    *   Once green, your site will be live at: `https://<username>.github.io/<repo-name>/`

---

## 3. Backend Setup (EC2)

**Hosting:** AWS EC2 (Ubuntu)

### A. Installation
Connect to your EC2 and run:
```bash
cd /home/ubuntu/backend 
# (Or wherever you placed the backend folder)

sudo apt update
sudo apt install python3-pip
pip install -r requirements.txt
```

### B. Start as a Service
This makes the server run in the background and crash-proof.

1.  **Copy service file:**
    ```bash
    sudo cp rotorbench.service /etc/systemd/system/
    ```

2.  **Enable and Start:**
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable --now rotorbench
    ```

### C. Maintenance
*   **Check status:** `sudo systemctl status rotorbench`
*   **Restart server:** `sudo systemctl restart rotorbench`
