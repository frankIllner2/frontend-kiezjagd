import axios from 'axios';

// Axios-Instanz erstellen
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
});

// Generische Fehlerbehandlungsfunktion
function handleApiError(error, methodName) {
  console.error(`Fehler bei ${methodName}:`, error.response?.data || error.message);
  throw error;
}
// Hilfsfunktion zur Umwandlung der Dauer in Sekunden
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


// API-Service-Objekt
export const apiService = {
  // Alle Spiele abrufen
  async fetchGames() {
    return axiosInstance.get('/games')
      .then(res => res.data)
      .catch(error => handleApiError(error, 'fetchGames'));
  },

  // Ein Spiel anhand der ID abrufen
  async fetchGameById(id) {
    if (!id) throw new Error('GameId darf nicht leer sein.');
    try {
      const res = await axiosInstance.get(`/games/${id}`);
      return res.data;
    } catch (error) {
      console.error('Fehler bei fetchGameById:', error.response?.data || error.message);
      throw error;
    }
  },
  async fetchQuestions(id) {
    if (!id) throw new Error('ID darf nicht leer sein.');
    return axiosInstance.get(`/games/${id}/questions`)
      .then(res => res.data)
      .catch(error => handleApiError(error, 'fetchQuestions'));
  },
  // Neues Spiel erstellen
  async createGame(game) {
    if (!game) throw new Error('Spiel-Objekt darf nicht leer sein.');
    return axiosInstance.post('/games', game)
      .then(res => res.data)
      .catch(error => handleApiError(error, 'createGame'));
  },

  // Spiel aktualisieren
  async updateGame(game) {
    if (!game || !game._id) throw new Error('Spiel-Objekt oder _id darf nicht leer sein.');
    return axiosInstance.put(`/games/${game._id}`, game)
      .then(res => res.data)
      .catch(error => handleApiError(error, 'updateGame'));
  },

  // Spiel löschen
  async deleteGame(id) {
    console.log(id);
    if (!id) throw new Error('ID darf nicht leer sein.');
    return axiosInstance.delete(`/games/${id}`)
      .then(res => res.data)
      .catch(error => handleApiError(error, 'deleteGame'));
  },

  // Teamname prüfen
  async checkTeamName(teamName) {
    console.log(teamName);
    if (!teamName || teamName.trim() === '') {
      throw new Error('⚠️ Teamname darf nicht leer sein.');
    }
    try {
      const res = await axios.get(`/teams/check?teamName=${teamName}`);
      console.log('🔄 API Antwort:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Fehler bei checkTeamName:', error.response?.data || error.message);
      throw error;
    }
  },
  // Ranking eines Spiels abrufen
  async fetchRanking(gameId, sort = true) {
    if (!gameId) throw new Error('GameId darf nicht leer sein.');
  
    return axiosInstance.get(`/games/${gameId}/ranking`)
      .then(res => {
        let ranking = res.data;
  
        if (sort) {
          ranking = ranking.sort((a, b) => {
            const durationA = convertDurationToSeconds(a.duration);
            const durationB = convertDurationToSeconds(b.duration);
            return durationA - durationB;
          });
        }
  
        return ranking;
      })
      .catch(error => handleApiError(error, 'fetchRanking'));
  },
  // Frage hinzufuegen
  async addQuestion(gameId, question) {
    return axiosInstance.post(`/games/${gameId}/questions`, question)
      .then(res => res.data)
      .catch(error => {
        console.error('Fehler bei addQuestion:', error.response?.data || error.message);
        throw error;
      });
  },
  // Frage update
  async updateQuestion(encryptedId, questionId, question) {
    if (!encryptedId || !questionId) {
      throw new Error('encryptedId und questionId dürfen nicht leer sein.');
    }
    console.log('encryptedId');
console.log(encryptedId);
console.log('questionId');
console.log(questionId);
console.log('question');
console.log(question);

    return axiosInstance.put(`/games/encrypted/${encryptedId}/questions/${questionId}`, question)
      .then(res => res.data)
      .catch(error => {
        console.error('Fehler bei updateQuestion:', error.response?.data || error.message);
        throw error;
      });
  },
  // Frage loeschen
  async deleteQuestion(gameId, questionId) {
    return axiosInstance.delete(`/games/${gameId}/questions/${questionId}`)
      .then(res => res.data)
      .catch(error => {
        console.error('Fehler bei deleteQuestion:', error.response?.data || error.message);
        throw error;
      });
  },
  // das Ranking
  async fetchGameRanking(gameId) {
    return axiosInstance.get(`/games/${gameId}/ranking`)
      .then(res => res.data)
      .catch(error => {
        console.error('Fehler bei fetchGameRanking:', error.response?.data || error.message);
        throw error;
      });
  },
  async saveGameResult(result) {
    return axiosInstance.post('/results', result)
    .then(res => res.data)
    .catch(error => {
      console.error('Fehler beim Ergebnis speichern:', error.response?.data || error.message);
      throw error;
    });
  },
  // Bild hochladen
  async uploadImage(file) {
    if (!file) throw new Error('⚠️ Keine Datei zum Hochladen ausgewählt.');

    const formData = new FormData();
    formData.append('image', file);

    return axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(res => res.data.imageUrl) // Rückgabe der Bild-URL vom Backend
      .catch(error => {
        console.error('❌ Fehler beim Hochladen des Bildes:', error.response?.data || error.message);
        throw error;
      });
  }


};

export default apiService;
