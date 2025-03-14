<template>
    <BaseSlider 
      title="" 
      :items="ageGroups" 
      sliderId="age-group-slider" 
      containerClass="container cards age-group"
    >
      <template v-slot:default="{ item, index }">
      
          <div class="short-description">
            <img :src="item.image" class="image-game" />
            <div class="short">
              <div class="game-infos" @click="toggleInstruction(index)">
                <b>{{ item.ageRange }}</b>
                <b>{{ item.name }}</b>
                <img src="@/assets/img/icons/show-back.svg" />
              </div>
            </div>
          </div>
          <InstructionLayer
            :isActive="activeIndex === index"
            @close="closeInstruction"
            :title="item.title"
            :text="item.text"
          />
     
      </template>
    </BaseSlider>
  </template>
  
  
  <script>
  import BaseSlider from "@/components/BaseSlider.vue";
  import InstructionLayer from "@/components/InstructionLayer.vue";
  
  export default {
    components: { BaseSlider, InstructionLayer },
    props: {
        games: Array,
    },
    data() {
      return {
        activeIndex: null,
        ageGroups: [
          {
            ageRange: "3-5",
            name: "Mini",
            image: new URL("@/assets/img/mini.jpg", import.meta.url).href, 
            title: "Rätsel und Sterne",
            text: `Hier kommt die Anleitung für die Mini-Kategorie hin Hier kommt die Anleitung für die Mini-Kategorie hin cyc
            Hier kommt die Anleitung für die Mini-Kategorie hin Hier kommt die Anleitung für die Mini-Kategorie hin cyc
            Hier kommt die Anleitung für die Mini-Kategorie hin Hier kommt die Anleitung für ie Anleitung für die Mini-Kategorie hin Hier kommt die Anleitung für die Mini-Kategorie hin cyc`,
          },
          {
            ageRange: "5-9",
            name: "Medi",
            image: new URL("@/assets/img/medi.jpg", import.meta.url).href,
            title: "Schnitzeljagd",
            text: `Hier kommt die Anleitung für die Medi-Kategorie hin Hier kommt die Anleitung für die Medi-Kategorie hin
            Hier kommt die Anleitung für die Medi-Kategorie hin Hier kommt die Anleitung für die Medi-Kategorie hin Hier kommt die Anleitung für die Medi-Kategorie hin`,
          },
          {
            ageRange: "9-12",
            name: "Maxi",
            image: new URL("@/assets/img/maxi.jpg", import.meta.url).href,
            title: "Die Besten",
            text: `Hier kommt die Anleitung für die Maxi-Kategorie hin Hier kommt die Anleitung für die Maxi-Kategorie hin Hier kommt die Anleitung für die Maxi-Kategorie hin
            Hier kommt die Anleitung für die Maxi-Kategorie hinHier kommt die Anleitung für die Maxi-Kategorie hinHier kommt die Anleitung für die Maxi-Kategorie hin `,
          },
        ],
      };
    },
    methods: {
      toggleInstruction(index) {
        this.activeIndex = this.activeIndex === index ? null : index;
      },
      closeInstruction() {
        this.activeIndex = null;
      },
    },
  };
  </script>
  
  <style scoped>


  .short-description {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #FAC227;
    border-radius: 20px;
    width: 100%;
    padding-bottom: 15px;
  }
  
  .image-game {
    max-width: 422px;
    width: 100%;
    margin-bottom: 10px;
    border-radius: 20px 20px 0 0;
  }
  
  .short {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
  }
  
  .game-infos {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    b {
      color: #355b4c;
    }
  }
  </style>
  