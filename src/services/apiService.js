import axios from 'axios';

// ✅ Axios-Instanz erstellen
const axiosInstance = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
    timeout: 5000,
});

// ✅ Generische Fehlerbehandlungsfunktion
function handleApiError(error, methodName) {
    console.error(`❌ Fehler bei ${methodName}:`, error.response?.data || error.message);
    throw error;
}

// ✅ Hilfsfunktion zur Umwandlung der Dauer in Sekunden
function convertDurationToSeconds(duration) {
    const match = duration.match(/(\d+)h\s(\d+)m\s(\d+)s/);
    if (match) {
        const hours = parseInt(match[1], 10) || 0;
        const minutes = parseInt(match[2], 10) || 0;
        const seconds = parseInt(match[3], 10) || 0;
        return hours * 3600 + minutes * 60 + seconds;
    }
    return 0; // Fallback, falls das Format nicht korrekt ist
}
// ✅ Generische Methode für CRUD-Operationen
async function performRequest(method, url, data = null) {
    try {
        const response = await axiosInstance({ method, url, data });
        return response.data;
    } catch (error) {
        handleApiError(error, method);
    }
}
// ✅ API-Service-Objekt
export const apiService = {
    // Alle Spiele abrufen - wird auch fuer den Admin Bereich genutzt
    fetchGames() {
        return performRequest('get', '/games');
    },
    // alle Spiele abrufen für Admin
    fetchAllGames() {
        return performRequest("get", "/games?admin=true"); // Spezieller Admin-Parameter
    },
    // Zwei zufällige Spiele abrufen
    getRandomGames() {
        return performRequest('get', '/games/random');
    },
    // Ein Spiel anhand der encryptedId abrufen, wenn Admin dann mit anderen Bedingungen
    fetchGameById(encryptedId, isAdmin = false) {    // isAdmin als zweiten Parameter hinzufügen
        if (!encryptedId) throw new Error('⚠️ GameId darf nicht leer sein.');
        const adminParam = isAdmin ? "?admin=true" : ""; // Jetzt wird isAdmin definiert
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
    // alle Bestellungen
    fetchOrders() {
        return performRequest('get', "/order/orders");
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
        return performRequest('delete', `/games/${encryptedId}/questions/${questionId}`);
    },
    // Ranking eines Spiels abrufen
    fetchRanking(encryptedId, sort = true) {
    if (!encryptedId) throw new Error('⚠️ encryptedId darf nicht leer sein.');
    return performRequest('get', `/games/${encryptedId}/ranking`)
        .then(ranking => {
            if (sort) {
                return ranking.sort((a, b) => {
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
        if (!teamName || !gameId) {
            throw new Error('Teamname und Spiel-ID sind erforderlich.');
        }
        return performRequest('get', `/teams/check?teamName=${encodeURIComponent(teamName)}&gameId=${encodeURIComponent(gameId)}`);
    },
    // prüfen ob Link abgelaufen ist
    validateLink(sessionId) {
        if (!sessionId) throw new Error('⚠️ encryptedId ist erforderlich.');
        return this.performRequest('get', `/order/validate-link/${sessionId}`);
    },
    // Stripe-Checkout-Session erstellen
    createCheckoutSession(gameId, email) {
        if (!gameId || !email) {
            throw new Error('⚠️ Spiel-ID und E-Mail sind erforderlich.');
        }
        return performRequest('post', '/order/create-checkout-session', { gameId, email });
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
      console.log(encryptedId);
      console.log(questionId);
      console.log(userCoordinates);
   

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
    if (!file) throw new Error('⚠️ Keine Datei zum Hochladen ausgewählt.');
    const formData = new FormData();
    formData.append('image', file);

    return axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(res => res.data.imageUrl)
      .catch(error => handleApiError(error, 'uploadImage'));
  },

  
};
export default apiService;