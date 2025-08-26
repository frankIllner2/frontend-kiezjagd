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
            ageRange: "4-6",
            name: "Mini",
            image: new URL("@/assets/img/mini.jpg", import.meta.url).href, 
            title: "So geht's",
            text: `Bist du 3 bis 5 Jahre alt? Dann ist unsere Mini Kiezjagd genau das Richtige für dich! 
            Mit spannenden Rätseln über Formen, Farben, Pflanzen, Bäume und vieles mehr entdeckst du spielerisch deinen Kiez. 
            Mit jedem gelösten Rätsel kommst du dem Ziel näher und sammelst wertvolle Sterne, mit denen du dich auf unserer Mitgemacht-Liste eintragen kannst`,
          },
          {
            ageRange: "7-9",
            name: "Medi",
            image: new URL("@/assets/img/medi.jpg", import.meta.url).href,
            title: "Schnitzeljagd",
            text: `Bist du 6 bis 9 Jahre alt? Dann ist unsere Medi Kiezjagd genau das Richtige für dich! Mit spannenden Rätseln rund um Buchstaben, Zahlen und Codes, 
            Pflanzen, Bäume und vieles mehr entdeckst du spielerisch deinen Kiez. Für jedes gelöste Rätsel kommst du dem Ziel näher und sammelst wertvolle Sterne, mit denen du bei unserer monatlichen Kiezmeisterschaft mitmachen kannst!`,
          },
          {
            ageRange: "10-12",
            name: "Maxi",
            image: new URL("@/assets/img/maxi.jpg", import.meta.url).href,
            title: "So geht's",
            text: `Bist du 9 bis 12 Jahre alt? Dann ist unsere Maxi Kiezjagd genau das Richtige für dich! Mit spannenden Rätseln rund um geheime Zahlencodes, 
            Wortspielen, Kiezgeschichte, und vielem mehr entdeckst du deinen Kiez. Für jedes gelöste Rätsel kommst du dem Ziel näher und sammelst wertvolle Sterne, mit denen du bei unserer monatlichen Kiezmeisterschaft mitmachen kannst! `,
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
      font-size: clamp(1.8rem, 2.5vw, 3em); 
    }
    img {
        margin-top: 10px;
        transition: transform 0.5s ease-in-out;
    }

    img:hover {
        transform: rotate(360deg);
    }

  }
  .slide-position {
    text-align: right;
    
  }
  </style>
  