<template>
    <div class="form-group" :class="{ 'has-image': previewImage }">
      <label for="gameImage">Spielbild</label>
      <input type="file" @change="handleImageResize" id="gameImage" accept="image/*" />
      <img v-if="previewImage" :src="previewImage" alt="Vorschau" class="image-preview" />
      <button v-if="previewImage" type="button" @click="removeImage" class="btn btn--delete-image">
        Bild entfernen
      </button>
    </div>
</template>
  
<script>
    export default {
    props: {
      modelValue: File
    },
    data() {
      return {
        previewImage: null,
        resizedFile: null,
      };
    },
    mounted() { 
      console.log("👀 modelValue bei Mount:", this.modelValue);
      if (this.modelValue) {
        this.previewImage = typeof this.modelValue === "string"
          ? this.modelValue
          : URL.createObjectURL(this.modelValue);
      }
    },
    watch: {
  modelValue(newVal) {
    if (!newVal) {
      this.previewImage = null;
    } else {
      this.previewImage = typeof newVal === "string"
        ? newVal
        : URL.createObjectURL(newVal);
    }
  }
},
    methods: {
      handleImageResize(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxWidth = 354;
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
              if (blob) {
                const webpFile = new File([blob], file.name.replace(/\.(jpe?g|png)$/i, ".webp"), {
                  type: "image/webp",
                });
                this.previewImage = URL.createObjectURL(blob);
                this.$emit("update:modelValue", webpFile); // ← das ist entscheidend!
                
              }
            }, "image/webp", 0.85);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      },
      removeImage() {
        this.previewImage = null;
        this.$emit("update:modelValue", null);
      },
    },
  };

</script>
  
<style scoped>
  .image-preview {
    max-width: 100%;
    margin-top: 10px;
    border-radius: 8px;
  }
</style>  