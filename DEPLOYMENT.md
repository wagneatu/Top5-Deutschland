# Deployment-Anleitung für Hetzner-Server

## 1. Server-Vorbereitung auf Hetzner

### Node.js installieren
```bash
# Node.js 20.x installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Version prüfen
node --version
npm --version
```

## 2. Backend-Server hochladen

### Dateien auf Server kopieren
```bash
# Auf deinem lokalen Rechner
scp -r server/ benutzer@deine-server-ip:/home/benutzer/top5deutschland-server/

# Oder mit SFTP-Client (FileZilla, WinSCP, etc.)
```

### Auf dem Server: Dependencies installieren
```bash
cd /home/benutzer/top5deutschland-server
npm install
```

## 3. Server starten

### Option A: Mit PM2 (empfohlen)
```bash
# PM2 installieren
sudo npm install -g pm2

# Server starten
cd /home/benutzer/top5deutschland-server
pm2 start server.js --name top5-server

# Server automatisch beim Neustart starten
pm2 startup
pm2 save

# Server-Status prüfen
pm2 status
pm2 logs top5-server
```

### Option B: Mit systemd
```bash
# Service-Datei erstellen
sudo nano /etc/systemd/system/top5-server.service
```

Füge folgendes ein:
```ini
[Unit]
Description=Top5Deutschland Backend Server
After=network.target

[Service]
Type=simple
User=benutzer
WorkingDirectory=/home/benutzer/top5deutschland-server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

Dann:
```bash
sudo systemctl daemon-reload
sudo systemctl enable top5-server
sudo systemctl start top5-server
sudo systemctl status top5-server
```

## 4. Firewall konfigurieren

```bash
# Port 3001 öffnen
sudo ufw allow 3001/tcp
sudo ufw reload
```

## 5. Nginx als Reverse Proxy (optional, aber empfohlen)

### Nginx installieren
```bash
sudo apt update
sudo apt install nginx
```

### Nginx-Konfiguration erstellen
```bash
sudo nano /etc/nginx/sites-available/top5deutschland
```

Füge folgendes ein:
```nginx
server {
    listen 80;
    server_name deine-domain.de;  # Oder deine IP-Adresse

    # Upload-Endpoint
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Für große Datei-Uploads
        client_max_body_size 10M;
    }

    # Statische Bilder
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Nginx aktivieren
```bash
sudo ln -s /etc/nginx/sites-available/top5deutschland /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Frontend konfigurieren

### .env-Datei erstellen
Erstelle eine `.env`-Datei im Frontend-Verzeichnis:
```bash
# Lokale Entwicklung
VITE_API_URL=http://localhost:3001

# Produktion (mit deiner Hetzner-Server-Adresse)
# VITE_API_URL=http://deine-server-ip:3001
# Oder mit Domain:
# VITE_API_URL=https://deine-domain.de
```

### Build erstellen
```bash
npm run build
```

Die `dist`-Dateien können dann auf Netlify/Vercel hochgeladen werden.

## 7. SSL-Zertifikat (optional, aber empfohlen)

Mit Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d deine-domain.de
```

## 8. Testen

### Server-Status prüfen
```bash
curl http://localhost:3001/api/health
```

### Upload testen
```bash
curl -X POST -F "image=@testbild.jpg" http://deine-server-ip:3001/api/upload
```

## Troubleshooting

### Server läuft nicht
```bash
# Logs prüfen
pm2 logs top5-server
# oder
sudo journalctl -u top5-server -f
```

### Port bereits belegt
```bash
# Prüfen, welcher Prozess Port 3001 verwendet
sudo lsof -i :3001
```

### Berechtigungen für Uploads-Ordner
```bash
sudo chown -R benutzer:benutzer /home/benutzer/top5deutschland-server/uploads
chmod -R 755 /home/benutzer/top5deutschland-server/uploads
```

## Wichtige Dateipfade

- Server-Code: `/home/benutzer/top5deutschland-server/`
- Uploads: `/home/benutzer/top5deutschland-server/uploads/`
- Logs (PM2): `~/.pm2/logs/`
