<template>
  <form @submit.prevent="$emit('submitAnswer', userAnswer)" class="answer-form">
    <input v-model="userAnswer" placeholder="Deine Antwort" class="answer-input" />
    <button type="submit" class="btn-submit">Antwort senden</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      userAnswer: "",
    };
  },
  emits: ["submitAnswer"],
};
</script>

<style scoped>
.answer-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.answer-input {
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.answer-input:focus {
  outline: none;
  border-color: #4caf50;
}

.btn-submit {
  padding: 10px 15px;
  font-size: 1rem;
  color: white;
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit:hover {
  background-color: #388e3c;
}
</style>
