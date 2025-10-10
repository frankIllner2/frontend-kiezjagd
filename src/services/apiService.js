// src/services/apiService.js
import axios from 'axios';

/**
 * ✅ Basis-URL mit sinnvollen Fallbacks
 * - bevorzugt: VITE_API_BASE (Vite)
 * - dann: VUE_APP_API_BASE_URL (Vue CLI)
 * - fallback: Render-Default
 */
const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  process.env.VUE_APP_API_BASE_URL ||
  'https://backend-kiezjagd.onrender.com/api';

// ✅ Axios-Instanz erstellen
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Generische Fehlerbehandlungsfunktion
function handleApiError(error, methodName) {
  console.error(`❌ Fehler bei ${methodName}:`, error.response?.data || error.message);
  throw error;
}

// ✅ Hilfsfunktion zur Umwandlung der Dauer in Sekunden (robuster)
function convertDurationToSeconds(duration) {
  if (!duration || typeof duration !== 'string') return 0;

  // Formate wie "1h 2m 3s", "2m 10s", "45s"
  const hms = duration.match(/(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i);
  if (hms && (hms[1] || hms[2] || hms[3])) {
    const hours = parseInt(hms[1] || '0', 10);
    const minutes = parseInt(hms[2] || '0', 10);
    const seconds = parseInt(hms[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Fallback: "HH:MM:SS" oder "MM:SS"
  const parts = duration.split(':').map(n => parseInt(n, 10));
  if (parts.every(n => Number.isFinite(n))) {
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }

  return 0;
}

// ✅ performRequest so anpassen, dass GET ≙ params unterstützt
async function performRequest(method, url, data = null) {
  try {
    const m = String(method || 'get').toLowerCase();

    if (m === 'get') {
      // Wenn data ein Objekt ist, als Query-Params verwenden
      const config = data && typeof data === 'object'
        ? { params: data }
        : undefined;
      const response = await axiosInstance.get(url, config);
      return response.data;
    }

    // Für alle anderen Methoden standardmäßig body in data
    const response = await axiosInstance({ method: m, url, data });
    return response.data;
  } catch (error) {
    handleApiError(error, method);
  }
}

// ✅ Normalizer nur für Orders (Pagination/Objekt-Shape)
function normalizeOrdersResponse(out) {
  // Falls performRequest bereits .data returned, ist out das Payload
  if (Array.isArray(out)) {
    // Abwärtskompatibel: alte Route, die ein Array zurückgab
    return { items: out, total: out.length, page: 1, pages: 1 };
  }
  if (out && typeof out === 'object') {
    const items = Array.isArray(out.items) ? out.items : [];
    const total = Number.isFinite(out.total) ? out.total : items.length;
    const page = Number.isFinite(out.page) ? out.page : 1;
    const pages = Number.isFinite(out.pages) ? out.pages : Math.max(Math.ceil(total / (out.limit || items.length || 1)), 1);
    return { items, total, page, pages };
  }
  return { items: [], total: 0, page: 1, pages: 1 };
}

// ✅ API-Service-Objekt
export const apiService = {
  // -----------------------
  // Auth (optional zentral)
  // -----------------------
  login(credentials) {
    return performRequest('post', '/auth/login', credentials)
      .then(data => {
        if (data?.token) localStorage.setItem('token', data.token);
        return data;
      });
  },

  validateToken() {
    return performRequest('get', '/auth/validate');
  },

  logout() {
    localStorage.removeItem('token');
  },

  // -----------------------
  // Games
  // -----------------------

  // Öffentliche Spiele (nicht-admin)
  fetchGames(params = {}) {
    return performRequest('get', '/games', params);
  },

  // Alle Spiele abrufen für Admin — jetzt mit optionaler Projection via fields
  // Beispiel-Aufruf:
  // apiService.fetchAllGames({ fields: '_id,name,city,ageGroup,encryptedId,isDisabled,questionsCount' })
  fetchAllGames({ fields } = {}) {
    const params = { admin: true };
    if (fields) params.fields = fields;
    return performRequest("get", "/games", params); // ?admin=true&fields=...
  },

  // Zwei zufällige Spiele abrufen
  getRandomGames() {
    return performRequest('get', '/games/random');
  },

  // Ein Spiel anhand der encryptedId abrufen
  fetchGameById(encryptedId, isAdmin = false) {
    if (!encryptedId) throw new Error('⚠️ GameId darf nicht leer sein.');
    const params = isAdmin ? { admin: true } : undefined;
    return performRequest('get', `/games/${encodeURIComponent(encryptedId)}`, params);
  },

  // Neues Spiel erstellen
  createGame(game) {
    if (!game) throw new Error('⚠️ Spiel-Objekt darf nicht leer sein.');
    return performRequest('post', '/games', game);
  },

  // Spiel aktualisieren
  updateGame(game) {
    if (!game || !game._id) throw new Error('⚠️ Spiel-Objekt oder _id darf nicht leer sein.');
    return performRequest('put', `/games/${game._id}`, {
      ...game,
      isDisabled: game.isDisabled || false, // Checkbox-Status mit speichern
    });
  },

  // Spiel löschen
  deleteGame(id) {
    if (!id) throw new Error('⚠️ ID darf nicht leer sein.');
    const isConfirmed = window.confirm("Bist du sicher, dass du dieses Spiel löschen möchtest?");
    if (!isConfirmed) return;
    return performRequest('delete', `/games/${id}`);
  },

  // Fragen eines Spiels abrufen
  fetchQuestions(encryptedId) {
    if (!encryptedId) throw new Error('⚠️ encryptedId darf nicht leer sein.');
    return performRequest('get', `/games/${encodeURIComponent(encryptedId)}/questions`);
  },

  // Frage hinzufügen
  addQuestion(encryptedId, question) {
    if (!encryptedId || !question) {
      throw new Error('⚠️ encryptedId und Frage dürfen nicht leer sein.');
    }
    return performRequest('post', `/games/${encodeURIComponent(encryptedId)}/questions`, question);
  },

  // Frage aktualisieren
  updateQuestion(encryptedId, questionId, question) {
    if (!encryptedId || !questionId || !question) {
      throw new Error('⚠️ encryptedId, questionId und Frage dürfen nicht leer sein.');
    }
    return performRequest('put', `/games/${encodeURIComponent(encryptedId)}/questions/${questionId}`, question);
  },

  // Frage löschen
  deleteQuestion(encryptedId, questionId) {
    if (!encryptedId || !questionId) {
      throw new Error('⚠️ encryptedId und questionId dürfen nicht leer sein.');
    }
    const isConfirmed = window.confirm("Bist du sicher, dass du diese Frage löschen möchtest?");
    if (!isConfirmed) return;
    return performRequest('delete', `/games/${encodeURIComponent(encryptedId)}/questions/${questionId}`);
  },

  // Reihenfolge speichern
  updateQuestionOrder(gameId, reordered) {
    if (!gameId || !Array.isArray(reordered) || reordered.length === 0) {
      throw new Error('⚠️ Spiel-ID und Sortierliste dürfen nicht leer sein.');
    }
    return performRequest('post', '/questions/reorder', { gameId, reordered });
  },

  // Spiel kopieren
  copyGame(gameId) {
    if (!gameId) throw new Error("⚠️ Spiel-ID darf nicht leer sein.");
    return performRequest('post', `/games/${gameId}/copy`);
  },

  // -----------------------
  // Ranking / Ergebnisse
  // -----------------------

  // Einzel-Ranking (Kompatibilität)
  fetchRanking(encryptedId, sort = true) {
    if (!encryptedId) throw new Error('⚠️ encryptedId darf nicht leer sein.');
    return performRequest('get', `/games/${encodeURIComponent(encryptedId)}/ranking`)
      .then(ranking => {
        if (sort && Array.isArray(ranking)) {
          return ranking.slice().sort((a, b) => {
            const durationA = convertDurationToSeconds(a.duration);
            const durationB = convertDurationToSeconds(b.duration);
            return durationA - durationB;
          });
        }
        return ranking;
      });
  },

  // 🚀 Batch-Top8 für mehrere Spiele – erwartet Backend-Route /rankings/top8?ids=a,b,c
  // Rückgabe: { [encryptedId]: [{ teamName, duration }, ...] }
  async fetchRankingsBatch(encryptedIds = [], sort = true) {
    if (!encryptedIds.length) return {};
    const data = await performRequest('get', '/rankings/top8', { ids: encryptedIds.join(',') });
    if (!data || typeof data !== 'object') return {};

    if (!sort) return data;

    // pro Spiel sortieren (falls nicht schon sortiert)
    const sorted = {};
    for (const id of Object.keys(data)) {
      const arr = Array.isArray(data[id]) ? data[id] : [];
      sorted[id] = arr.slice().sort((a, b) => {
        const da = convertDurationToSeconds(a.duration);
        const db = convertDurationToSeconds(b.duration);
        return da - db;
      });
    }
    return sorted;
  },

  // Top 8 Teams (bestehender Endpoint)
  getTop8Results(encryptedId) {
    if (!encryptedId) throw new Error('⚠️ encryptedId darf nicht leer sein.');
    return performRequest('get', `/games/${encodeURIComponent(encryptedId)}/top8`);
  },

  // Ergebnis speichern
  saveGameResult(result) {
    if (!result || !result.gameId || !result.teamName || !result.email || !result.startTime || !result.endTime ) {
      throw new Error('⚠️ Fehlende Felder beim Speichern des Ergebnisses.');
    }
    return performRequest('post', `/results`, result);
  },

  // Teamname prüfen
  checkTeamName(teamName, gameId) {
    if (!teamName || !gameId) {
      throw new Error('Teamname und Spiel-ID sind erforderlich.');
    }
    return performRequest('get', `/results/check`, {
      teamName,
      gameId,
    });
  },

  // -----------------------
  // Standortprüfung
  // -----------------------
  verifyLocation(encryptedId, questionId, userCoordinates) {
    if (!encryptedId || !questionId || !userCoordinates) {
      throw new Error('⚠️ encryptedId, questionId und userCoordinates sind erforderlich.');
    }
    return performRequest('post', `/games/${encodeURIComponent(encryptedId)}/verify-location`, {
      questionId,
      userCoordinates,
    });
  },

  // -----------------------
  // Uploads
  // -----------------------
  uploadImage(file) {
    if (!file) throw new Error('Keine Bilddatei zum Hochladen ausgewählt.');
    const formData = new FormData();
    formData.append('image', file);

    return axiosInstance.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(res => res.data.imageUrl)
    .catch(error => handleApiError(error, 'uploadImage'));
  },

  uploadAudio(file) {
    if (!file) throw new Error('⚠️ Keine Audiodatei zum Hochladen ausgewählt.');
    const formData = new FormData();
    formData.append('audio', file); // Feldname muss zu `upload.single('audio')` passen

    return axiosInstance.post('/upload/audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(res => res.data.audioUrl)
    .catch(error => handleApiError(error, 'uploadAudio'));
  },

  // -----------------------
  // Orders / Checkout
  // -----------------------
  fetchOrderStatus(sessionId) {
    if (!sessionId) throw new Error('⚠️ Session-ID darf nicht leer sein.');
    return performRequest('get', `/checkout/order-status/${sessionId}`);
  },

  createCheckoutSession(gameId, email, voucherCode = null) {
    if (!gameId || !email) {
      throw new Error('⚠️ Spiel-ID und E-Mail sind erforderlich.');
    }
    return performRequest('post', '/order/create-checkout-session', { gameId, email, voucherCode });
  },

  verifyPayment(sessionId) {
    if (!sessionId) throw new Error('⚠️ Session-ID ist erforderlich.');
    return performRequest('post', '/order/verify-payment', { sessionId });
  },

  // Alle Bestellungen (mit Pagination/Suche/Sortierung)
  // params: { page, limit, search, searchBy, sort }
  async fetchOrders(params = {}) {
    const raw = await performRequest('get', '/order/orders', params);
    return normalizeOrdersResponse(raw);
  },

  // -----------------------
  // Newsletter (Admin)
  // -----------------------
  fetchNewsletter({ q = "", only = "all" } = {}) {
    return performRequest("get", "/admin-newsletter", { q, only });
  },

  sendNewsletter(payload) {
    // payload: { ids?: string[], subject: string, html?: string, text?: string, testEmail?: string }
    if (!payload || (!payload.testEmail && !payload.subject)) {
      throw new Error("⚠️ Subject fehlt (außer beim Test mit testEmail).");
    }
    return performRequest("post", "/admin-newsletter/send", payload);
  },

  newsletterUnsubscribe(id) {
    if (!id) throw new Error("⚠️ ID fehlt.");
    return performRequest("put", `/admin-newsletter/${id}/unsubscribe`);
  },

  newsletterReactivate(id) {
    if (!id) throw new Error("⚠️ ID fehlt.");
    return performRequest("put", `/admin-newsletter/${id}/reactivate`);
  },

  newsletterDelete(id) {
    if (!id) throw new Error("⚠️ ID fehlt.");
    return performRequest("delete", `/admin-newsletter/${id}`);
  },

  // Optional: CSV-Export für Newsletter-Liste
  exportNewsletterCSV(only = "all") {
    return axiosInstance
      .get(`/admin-newsletter/export?filter=${encodeURIComponent(only)}`, { responseType: "blob" })
      .then(res => res.data)
      .catch(err => handleApiError(err, "exportNewsletterCSV"));
  },
};

export default apiService;
