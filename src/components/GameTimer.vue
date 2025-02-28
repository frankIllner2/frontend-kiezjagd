<template>
  <div class="timer-container">
    <div class="icon">
      <img src="@/assets/img/icons/uhr.png" />
      <span>{{ gameDuration }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['gameDuration']
};
</script>

<style scoped>
.timer-container {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin: 10px 0;
}

p {
  margin: 0;
  padding: 5px;
}
</style>
