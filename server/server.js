import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS aktivieren (für Frontend-Zugriff)
app.use(cors());
app.use(express.json());

// Uploads-Ordner erstellen, falls nicht vorhanden
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer-Konfiguration für Datei-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Eindeutigen Dateinamen erstellen: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB Limit
  },
  fileFilter: (req, file, cb) => {
    // Nur Bilder erlauben
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilddateien sind erlaubt!'), false);
    }
  }
});

// Upload-Endpoint für einzelne Bilder
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei hochgeladen' });
  }

  // URL für das hochgeladene Bild zurückgeben
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    success: true, 
    url: imageUrl,
    filename: req.file.filename
  });
});

// Upload-Endpoint für mehrere Bilder (Galerie)
app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
  }

  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ 
    success: true, 
    urls: imageUrls,
    filenames: req.files.map(f => f.filename)
  });
});

// Statische Dateien bereitstellen (Bilder)
app.use('/uploads', express.static(uploadsDir));

// Health-Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📁 Uploads werden gespeichert in: ${uploadsDir}`);
  console.log(`🌐 Upload-Endpoint: http://localhost:${PORT}/api/upload`);
});
