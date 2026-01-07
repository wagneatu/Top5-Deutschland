// Server-Konfiguration
// Ändere diese URL zu deiner Hetzner-Server-Adresse
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Upload-Endpoints
export const UPLOAD_ENDPOINTS = {
  single: `${API_BASE_URL}/api/upload`,
  multiple: `${API_BASE_URL}/api/upload-multiple`,
};
