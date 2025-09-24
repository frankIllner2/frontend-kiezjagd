import axios from 'axios';

// ✅ Axios-Instanz erstellen
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
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

// ✅ Hilfsfunktion zur Umwandlung der Dauer in Sekunden
function convertDurationToSeconds(duration) {
  const match = duration?.match?.(/(\d+)h\s(\d+)m\s(\d+)s/) || null;
  if (match) {
    const hours = parseInt(match[1], 10) || 0;
    const minutes = parseInt(match[2], 10) || 0;
    const seconds = parseInt(match[3], 10) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0; // Fallback
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
  // Alle Spiele abrufen - wird auch fuer den Admin Bereich genutzt
  fetchGames() {
    return performRequest('get', '/games');
  },

  // alle Spiele abrufen für Admin
  fetchAllGames() {
    return performRequest("get", "/games", { admin: true }); // ?admin=true
  },

  // Zwei zufällige Spiele abrufen
  getRandomGames() {
    return performRequest('get', '/games/random');
  },

  // Ein Spiel anhand der encryptedId abrufen, wenn Admin dann mit anderen Bedingungen
  fetchGameById(encryptedId, isAdmin = false) {
    console.log("die Id:" + encryptedId);
    if (!encryptedId) throw new Error('⚠️ GameId darf nicht leer sein.');
    // Hier bleibe ich bei Query-String, damit nichts bricht
    const adminParam = isAdmin ? "?admin=true" : "";
    return performRequest('get', `/games/${encryptedId}${adminParam}`);
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

  // Bestellstatus abrufen
  fetchOrderStatus(sessionId) {
    if (!sessionId) throw new Error('⚠️ Session-ID darf nicht leer sein.');
    return performRequest('get', `/checkout/order-status/${sessionId}`);
  },

  // Frage hinzufügen
  addQuestion(encryptedId, question) {
    if (!encryptedId || !question) {
      throw new Error('⚠️ encryptedId und Frage dürfen nicht leer sein.');
    }
    return performRequest('post', `/games/${encryptedId}/questions`, question);
  },

  // ✅ Alle Bestellungen (mit Pagination/Suche/Sortierung)
  // params: { page, limit, search, searchBy, sort }
  //   - searchBy: 'email' | 'gameId' | 'date'
  //   - sort: z.B. '-createdAt' (neueste zuerst)
  async fetchOrders(params = {}) {
    const raw = await performRequest('get', '/order/orders', params);
    return normalizeOrdersResponse(raw);
  },

  // Frage aktualisieren
  updateQuestion(encryptedId, questionId, question) {
    if (!encryptedId || !questionId || !question) {
      throw new Error('⚠️ encryptedId, questionId und Frage dürfen nicht leer sein.');
    }
    return performRequest('put', `/games/${encryptedId}/questions/${questionId}`, question);
  },

  // Frage löschen
  deleteQuestion(encryptedId, questionId) {
    if (!encryptedId || !questionId) {
      throw new Error('⚠️ encryptedId und questionId dürfen nicht leer sein.');
    }
    const isConfirmed = window.confirm("Bist du sicher, dass du diese Frage löschen möchtest?");
    if (!isConfirmed) return;
    return performRequest('delete', `/games/${encryptedId}/questions/${questionId}`);
  },

  // Ranking eines Spiels abrufen
  fetchRanking(encryptedId, sort = true) {
    if (!encryptedId) throw new Error('⚠️ encryptedId darf nicht leer sein.');
    return performRequest('get', `/games/${encryptedId}/ranking`)
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

  // Top 5 Teams
  getTop5Results(encryptedId) {
    if (!encryptedId) throw new Error('⚠️ encryptedId darf nicht leer sein.');
    return performRequest('get', `/games/${encryptedId}/top5`);
  },

  // Teamname prüfen
  checkTeamName(teamName, gameId) {
    console.log('Name' + teamName);
    if (!teamName || !gameId) {
      throw new Error('Teamname und Spiel-ID sind erforderlich.');
    }
    // hier bleiben wir beim Query-String (bewährt)
    return performRequest('get', `/results/check?teamName=${encodeURIComponent(teamName)}&gameId=${encodeURIComponent(gameId)}`);
  },

  // Stripe-Checkout-Session erstellen
  createCheckoutSession(gameId, email, voucherCode = null) {
    if (!gameId || !email) {
      throw new Error('⚠️ Spiel-ID und E-Mail sind erforderlich.');
    }
    return performRequest('post', '/order/create-checkout-session', { gameId, email, voucherCode });
  },

  // Fragen eines Spiels abrufen
  fetchQuestions(encryptedId) {
    if (!encryptedId) throw new Error('⚠️ encryptedId darf nicht leer sein.');
    return performRequest('get', `/games/${encryptedId}/questions`);
  },

  // Ergebnis speichern
  saveGameResult(result) {
    if (!result || !result.gameId || !result.teamName || !result.email || !result.startTime || !result.endTime ) {
      throw new Error('⚠️ Fehlende Felder beim Speichern des Ergebnisses.');
    }
    return performRequest('post', `/results`, result);
  },

  // Standortprüfung
  verifyLocation(encryptedId, questionId, userCoordinates) {
    if (!encryptedId || !questionId || !userCoordinates) {
      throw new Error('⚠️ encryptedId, questionId und userCoordinates sind erforderlich.');
    }
    return performRequest('post', `/games/${encryptedId}/verify-location`, {
      questionId,
      userCoordinates,
    });
  },

  // Bild hochladen
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

  // Audiodatei hochladen
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

  updateQuestionOrder(gameId, reordered) {
    if (!gameId || !Array.isArray(reordered) || reordered.length === 0) {
      throw new Error('⚠️ Spiel-ID und Sortierliste dürfen nicht leer sein.');
    }
    return performRequest('post', '/questions/reorder', { gameId, reordered });
  },

  // Newsletter (öffentlich)
  subscribeToNewsletter(email) {
    if (!email) throw new Error("E-Mail erforderlich");
    return performRequest("post", "/newsletter/subscribe", { email });
  },

  unsubscribeFromNewsletter(email) {
    if (!email) throw new Error("E-Mail erforderlich");
    return performRequest("post", "/newsletter/unsubscribe", { email });
  },

  // Team speichern
  saveTeam(team) {
    if (!team || !team.name || !team.email || !team.gameId || !Array.isArray(team.players)) {
      throw new Error('⚠️ Teamdaten sind unvollständig.');
    }
    return performRequest('post', '/teams', team);
  },

  // Zahlung verifizieren (Mailversand auslösen)
  verifyPayment(sessionId) {
    if (!sessionId) throw new Error('⚠️ Session-ID ist erforderlich.');
    return performRequest('post', '/order/verify-payment', { sessionId });
  },

  copyGame(gameId) {
    if (!gameId) throw new Error("⚠️ Spiel-ID darf nicht leer sein.");
    return performRequest('post', `/games/${gameId}/copy`);
  },

  // ================================
  // Admin Newsletter (mini)
  // ================================
  fetchNewsletter({ q = "", only = "all" } = {}) {
    // Hier nutze ich GET+params statt Query-String
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
