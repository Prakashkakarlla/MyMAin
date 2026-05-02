# JobFresh.in — Deployment Guide (Hostinger VPS, 1 vCPU / 1GB RAM)

## Prerequisites
- Ubuntu 22.04 VPS
- Domain pointed to VPS IP (A record: jobfresh.in → your_vps_ip)
- SSH access

---

## 1. Initial VPS Setup

```bash
# SSH into VPS
ssh root@your_vps_ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install Docker Compose
apt install -y docker-compose-plugin

# Enable swap (critical for 1GB RAM — prevents OOM kills)
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Optimize swappiness
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl -p
```

---

## 2. Upload Project to VPS

```bash
# On your LOCAL machine:
# Option A — rsync
rsync -avz --exclude 'node_modules' --exclude 'target' \
  ./jobfresh/ root@your_vps_ip:/opt/jobfresh/

# Option B — Git
# Push to GitHub, then on VPS:
# git clone https://github.com/yourusername/jobfresh.git /opt/jobfresh
```

---

## 3. Configure Environment

```bash
cd /opt/jobfresh
cp .env.example .env
nano .env  # Fill in your real values

# Generate JWT secret
openssl rand -hex 32
# Copy output → JWT_SECRET in .env
```

---

## 4. First Deploy

```bash
cd /opt/jobfresh

# Build and start all services
docker compose up -d --build

# Watch logs (wait ~90s for Spring Boot to fully start)
docker compose logs -f backend

# Verify everything is healthy
docker compose ps
```

---

## 5. Free SSL with Let's Encrypt

```bash
# Point your domain to VPS IP first, then:
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d jobfresh.in -d www.jobfresh.in \
  --email your@email.com --agree-tos --no-eff-email

# Uncomment the HTTPS server block in nginx/nginx.conf
# Then reload nginx:
docker compose exec nginx nginx -s reload

# Auto-renewal runs via certbot service (start with ssl profile):
docker compose --profile ssl up -d certbot
```

---

## 6. Useful Commands

```bash
# View all service status
docker compose ps

# View Spring Boot logs
docker compose logs -f backend

# Restart a specific service
docker compose restart backend

# Update after code changes
docker compose up -d --build backend

# Shell into backend container
docker compose exec backend sh

# Redis CLI
docker compose exec redis redis-cli

# MySQL
docker compose exec mysql mysql -u jobfresh -pjobfresh123 jobfresh

# Check memory usage
docker stats --no-stream

# Clear Redis cache
docker compose exec redis redis-cli FLUSHALL
```

---

## 7. GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/jobfresh
            git pull
            docker compose up -d --build
```

---

## 8. Memory Budget

| Service      | Limit  | Actual (~) |
|-------------|--------|-----------|
| OS + Docker  | —      | ~150 MB   |
| Spring Boot  | 320 MB | ~200 MB   |
| MySQL        | 220 MB | ~180 MB   |
| Redis        | 120 MB | ~30 MB    |
| Nginx        | 30 MB  | ~5 MB     |
| Frontend     | 50 MB  | ~5 MB     |
| **Total**    |        | **~570 MB** |
| + Swap       | 1 GB   | Buffer    |

---

## 9. Admin Access

- URL: https://jobfresh.in/admin/login
- Email: admin@jobfresh.in (or whatever you set in .env)
- Password: from ADMIN_PASSWORD in .env

**Change the password after first login!**
