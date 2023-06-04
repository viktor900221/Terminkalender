<template>
  <div class="home">
    <h1>Terminkalender</h1>
    <h3>von Viktor Legradi-Göhring</h3>
    <img src="../assets/terminkalender.png" alt="" />
    <h3>{{ this.date2 }}</h3>
    <!--Eintrag für Termin (Form)-->
    <div class="box-input">
      <div class="card-box-eintrag">
        <div class="card">
          <h2 id="tag">Neuer Eintrag</h2>
          <div class="inhalt">
            <input type="date" v-model="newEntryDate" />
            <input
              id="inhaltText"
              type="text"
              v-model="newEntryText"
              placeholder="Eintrag"
            />
          </div>
          <button @click="addEntry">
            <img
              id="update"
              src="../assets/kuli.png"
              class="btnImage"
              alt=""
            />Erstellen
          </button>
        </div>
      </div>
    </div>
    <div class="container">
      <!--Woche Mo-So-->
      <div class="box-days">
        <div
          v-for="(dayName, index) in dayNames"
          v-bind:key="dayName"
          class="card-box"
        >
          <div class="card" :class="{ 'is-current-day': index === currentDay }">
            <h2 id="tag">{{ dayNames[index] }}</h2>
            <h3>{{ formatDate(getNextDay(date2, index)) }}</h3>
            <div class="inhalt">
              <!--Hier verwenden wir :value anstelle von v-model, um den Wert des Eingabefelds festzulegen. @input wird verwendet, um Änderungen im Eingabefeld zu erfassen und den Wert an entries[index].eintrag zuzuweisen.-->
              <input
                id="inhaltText"
                type="text"
                :value="getEntryForDay(getNextDay(date2, index))"
                @input="
                  updateEntryText(
                    getEntryIndexForDay(getNextDay(date2, index)),
                    $event.target.value
                  )
                "
              />
            </div>
            <div class="button-box">
              <!--<button @click="updateEntry(index)">-->
              <button
                @click="
                  updateEntry(getEntryIndexForDay(getNextDay(date2, index)))
                "
              >
                <img
                  id="update"
                  class="btnImage"
                  src="../assets/update.png"
                  alt=""
                />
                Aktualisieren
              </button>
              <!-- <button @click="deleteEntry(index)">-->
              <button
                @click="
                  deleteEntry(getEntryIndexForDay(getNextDay(date2, index)))
                "
              >
                <img
                  id="delete"
                  class="btnImage"
                  src="../assets/entfernen.png"
                  alt=""
                />Löschen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

//die Basis-URL für Axios
axios.defaults.baseURL = "http://localhost:3000";

export default {
  name: "HomeView",
  components: {},
  data: () => {
    const date2 = new Date();
    const options = { day: "numeric", month: "long", year: "numeric" };
    const germanDate = date2.toLocaleDateString("de-DE", options);
    const dayNames = [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ];
    let currentDay = date2.getDay();
    let previousDay = currentDay === 0 ? 6 : currentDay - 1;

    const entries = Array(7).fill({ eintrag: "" }); // Array für Einträge, initial mit leeren Strings

    return {
      dayNames,
      date2: germanDate,
      currentDay,
      previousDay,
      newEntryDate: "",
      newEntryText: "",
      entries,
    };
  },
  mounted() {
    this.getEntries();
  },
  methods: {
    formatDate(date) {
      const options = { day: "numeric", month: "long", year: "numeric" };
      return date.toLocaleDateString("de-DE", options);
    },
    getNextDay(date, dayOffset) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + dayOffset);
      return nextDate;
    },
    getEntryIndexForDay(date) {
      const targetDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const currentDate = new Date(this.date2);

      const diffInDays = Math.floor(
        (targetDate - currentDate) / (1000 * 3600 * 24)
      );
      let index = (this.currentDay + diffInDays) % 7;
      if (index < 0) {
        index += 7;
      }
      return index;
    },
    /*getEntryForDay(date) {
      const index = this.getEntryIndexForDay(date);
      return this.entries[index] ? this.entries[index].eintrag : "";
    },*/
    getEntryForDay(date, index) {
      const formattedDate = this.formatDate(date);
      const entry = this.entries.find(
        (entry) => this.formatDate(new Date(entry.datum)) === formattedDate
      );
      return entry ? entry.eintrag : "";
    },
    getEntries() {
      axios
        .get("/eintrag")
        .then((response) => {
          this.entries = response.data;
          console.log(this.entries);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    /*addEntry() {
      if (this.newEntryDate && this.newEntryText) {
        const selectedDate = new Date(this.newEntryDate);

        const index = this.getEntryIndexForDay(selectedDate); // Index-Wert erhalten

        const entry = {
          eintrag: this.newEntryText,
          datum: selectedDate.toISOString(),
        };
        axios
          .post("/eintrag", entry)
          .then((response) => {
            const newEntry = response.data;
            this.entries.splice(index, 1, newEntry); // Eintrag hinzufügen/aktualisieren
            console.log("Eintrag hinzugefügt");

            this.newEntryDate = "";
            this.newEntryText = "";

            const matchingEntry = this.entries.find((entry) => {
              const entryDate = new Date(entry.datum);
              return (
                entryDate.getFullYear() === selectedDate.getFullYear() &&
                entryDate.getMonth() === selectedDate.getMonth() &&
                entryDate.getDate() === selectedDate.getDate()
              );
            });

            if (matchingEntry) {
              this.newEntryText = matchingEntry.eintrag;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },*/
    addEntry() {
      if (this.newEntryDate && this.newEntryText) {
        const selectedDate = new Date(this.newEntryDate);
        const entry = {
          eintrag: this.newEntryText,
          datum: selectedDate.toISOString(),
        };

        axios
          .post("/eintrag", entry)
          .then((response) => {
            const newEntry = response.data;
            newEntry.id = response.data.id; // Setzen der 'id'-Eigenschaft
            this.entries.push(newEntry); // Hinzufügen des Eintrags zur 'entries'-Datenstruktur
            console.log("Eintrag hinzugefügt");

            this.newEntryDate = "";
            this.newEntryText = "";
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },

    updateEntry(index) {
      const entry = this.entries[index];
      axios
        .put(`/eintrag/${entry.id}`, entry)
        .then(() => {
          console.log("Eintrag aktualisiert");
        })
        .catch((error) => {
          console.error(error);
        });
    },
    deleteEntry(index) {
      const entry = this.entries[index];
      axios
        .delete(`/eintrag/${entry.id}`)
        .then(() => {
          this.entries.splice(index, 1);
          console.log("Eintrag gelöscht");
        })
        .catch((error) => {
          console.error(error);
        });
    },
    updateEntryText(index, text) {
      if (this.entries[index]) {
        this.entries[index].eintrag = text;
      }
    },
  },
};
</script>

<style>
body {
  background-color: rgb(23, 7, 34);
}

.container {
  max-width: 1000px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.204);
  border-radius: 20px;
  box-shadow: 25px 25px 75px rgba(0, 0, 0, 0.25),
    10px 10px 70px rgba(0, 0, 0, 0.25), inset -5px -5px 15px rgba(0, 0, 0, 0.25),
    inset 5px 5px 15px rgba(0, 0, 0, 0.25);
}
.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card-box {
  margin: 20px;
  color: azure;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: rgb(37, 30, 30);

  max-width: 200px;
  min-height: 100px;
  padding: 40px 30px 30px;
  border-radius: 20px;
  box-shadow: 25px 25px 75px rgba(0, 0, 0, 0.25),
    10px 10px 70px rgba(0, 0, 0, 0.25), inset -5px -5px 15px rgba(0, 0, 0, 0.25),
    inset 5px 5px 15px rgba(0, 0, 0, 0.25);
  position: relative;
}

.card-box-eintrag {
  margin: auto;
  margin-bottom: 10px;
  color: azure;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: rgb(37, 30, 30);

  max-width: 200px;
  min-height: 100px;
  padding: 40px 30px 30px;
  border-radius: 20px;
  box-shadow: 25px 25px 75px rgba(0, 0, 0, 0.25),
    10px 10px 70px rgba(0, 0, 0, 0.25), inset -5px -5px 15px rgba(0, 0, 0, 0.25),
    inset 5px 5px 15px rgba(0, 0, 0, 0.25);
  position: relative;
}
.card-box h2 {
  color: rgb(223, 138, 28);
}

.box-days {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
}

button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 55px;
  width: 95px;

  font-size: 14px;
  font-weight: 400;
  border-radius: 10px;
  box-shadow: inset -8px 0 8px rgba(0, 0, 0, 0.15),
    inset 0 -8px 8px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(0, 0, 0, 0.75),
    10px 20px 25px rgba(0, 0, 0, 0.4);
  margin: 10px;
}

.button-box {
  display: flex;
}

h1 {
  color: azure;
}

h3 {
  color: azure;
}

img {
  max-width: 100px;
}

input {
  margin-bottom: 5px;
}
.btnImage {
  max-width: 20px;
}

#inhaltText {
  height: 60px;
  background-color: rgba(255, 255, 255, 0.316);
}
</style>