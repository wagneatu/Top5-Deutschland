# Top5Deutschland Backend Server

Backend-Server für Bild-Uploads auf Hetzner-Server.

## Installation

```bash
npm install
```

## Konfiguration

Erstelle eine `.env` Datei (optional):
```
PORT=3001
```

## Starten

```bash
npm start
```

Für Entwicklung mit Auto-Reload:
```bash
npm run dev
```

## Endpoints

- `POST /api/upload` - Einzelnes Bild hochladen
- `POST /api/upload-multiple` - Mehrere Bilder hochladen (max. 10)
- `GET /uploads/:filename` - Bild abrufen
- `GET /api/health` - Server-Status prüfen

## Deployment auf Hetzner

1. Server-Dateien auf Hetzner hochladen
2. `npm install` ausführen
3. Mit PM2 oder systemd als Service starten
4. Nginx als Reverse Proxy konfigurieren (optional)

## Nginx Konfiguration (Beispiel)

```nginx
server {
    listen 80;
    server_name deine-domain.de;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```
