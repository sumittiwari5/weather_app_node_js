🚀 Weather App CI/CD with Canary Deployment

A production-style DevOps project demonstrating end-to-end CI/CD using Jenkins, Docker, Nginx, and AWS EC2, with Canary Deployment strategy for zero-downtime releases.

📌 Project Overview

This project showcases how to:

Build and containerize a Node.js application
Automate CI/CD using Jenkins pipelines
Push Docker images to Docker Hub
Deploy applications on AWS EC2 instances
Implement Canary Deployment using Nginx for traffic splitting
Gradually shift traffic (25% → 50% → 100%) with rollback capability
🏗️ Architecture
Developer → GitHub → Jenkins → Docker Build → Docker Hub → EC2 Instances → Nginx → Users
Components:
App Server 1 (Active) – Currently serving production traffic
App Server 2 (Target) – Receives new deployment (canary)
Nginx Server – Controls traffic distribution
Jenkins – CI/CD automation
⚙️ Tech Stack
Language: Node.js
CI/CD: Jenkins Pipeline (Declarative + Scripted)
Containerization: Docker
Cloud: AWS EC2
Web Server / Load Balancer: Nginx
Version Control: GitHub
🔄 CI/CD Pipeline Stages
1. Clone Repository
Pull latest code from GitHub
2. Build Docker Image
docker build -t <dockerhub-username>/weather-canary:<tag> .
3. Push to Docker Hub
docker push <dockerhub-username>/weather-canary:<tag>
4. Select Target Server
Determines:
Active server (currently serving traffic)
Target server (for new deployment)
5. Deploy Canary Version
Pull latest image on target server
Stop old container
Run new container on port 3042
6. Traffic Shifting via Nginx
Example: 25% Canary Traffic
upstream backend {
    server ACTIVE_SERVER:3042 weight=75;
    server TARGET_SERVER:3042 weight=25;
}
7. Gradual Promotion
25% → Observe
50% → Observe
100% → Full rollout
8. Update Active Server
Target becomes new active server
🧠 Canary Deployment Strategy
Stage	Traffic Split
Initial	0% (new server only deployed)
Canary 25%	75% / 25%
Canary 50%	50% / 50%
Full Rollout	0% / 100%
📂 Project Structure
.
├── src/
│   └── app.js
├── package.json
├── Dockerfile
├── Jenkinsfile
└── README.md
🐳 Docker Configuration
Build Image
docker build -t weather-app .
Run Container
docker run -d -p 3042:3042 -e PORT=3042 weather-app
🌐 Nginx Configuration (Traffic Control)
upstream backend {
    server ACTIVE_SERVER:3042 weight=75;
    server TARGET_SERVER:3042 weight=25;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
🔐 Security Notes
Avoid using plain-text Docker credentials (docker login -p)
Use Jenkins Credentials Store
Use SSH keys for secure server access
⚠️ Known Issues & Fixes
Issue:
No such property: host for class: groovy.lang.Binding
Fix:

Escape Nginx variables in Jenkins pipeline:

\$host
\$remote_addr
🚀 Future Improvements
✅ Multi-stage Docker builds (optimize image size)
✅ Docker Compose for local orchestration
🔄 Kubernetes deployment (EKS / Minikube)
🔄 Auto rollback on health check failure
🔄 Monitoring with Prometheus & Grafana
📸 Demo Flow
Push code to GitHub
Jenkins triggers pipeline
Docker image built & pushed
Deployed to target EC2
Nginx shifts traffic gradually
Full deployment completed
👨‍💻 Author

Sumit Tiwari
B.Tech CSE | DevOps Enthusiast

⭐ If you like this project

Give it a star ⭐ on GitHub and feel free to fork & improve!
