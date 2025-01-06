<template>
    <div class="login-container">
      <h2>🔑 Admin Login</h2>
      <form @submit.prevent="login" class="login-form">
        <input 
          v-model="username" 
          placeholder="Benutzername" 
          required
        />
        <input 
          v-model="password" 
          type="password" 
          placeholder="Passwort" 
          required
        />
        <button type="submit">Login</button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        error: ''
      };
    },
    methods: {
      async login() {
        try {
          const response = await axios.post(process.env.VUE_APP_API_LOGIN_URL, {
            username: this.username,
            password: this.password,
          });
          localStorage.setItem('token', response.data.token);
          this.$router.push('/admin');
        } catch (err) {
          console.error(err.response?.data?.message || err.message);
          this.error = err.response?.data?.message || '❌ Login fehlgeschlagen.';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Container zentrieren */
  .login-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f9fafc;
    padding: 20px;
  }
  
  /* Titel */
  h2 {
    margin-bottom: 20px;
    font-size: 1.8rem;
    color: #333;
  }
  
  /* Formular-Stil */
  .login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #ffffff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    gap: 15px;
  }
  
  /* Eingabefelder */
  .login-form input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    outline: none;
  }
  
  .login-form input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
  
  /* Login-Button */
  .login-form button {
    width: 100%;
    padding: 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .login-form button:hover {
    background-color: #388e3c;
  }
  
  /* Fehlermeldung */
  .error-message {
    margin-top: 15px;
    color: #d32f2f;
    font-size: 0.9rem;
    text-align: center;
  }
  </style>
  