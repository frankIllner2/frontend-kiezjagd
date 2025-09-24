<!-- components/admin/NewsletterMini.vue -->
<template>
  <section class="nl-admin">
    <header class="toolbar">
      <div class="inputs">
        <input
          v-model="q"
          @keyup.enter="load"
          placeholder="E-Mail suchen…"
          class="input"
        />
        <select v-model="only" @change="load" class="select">
          <option value="all">Alle</option>
          <option value="subscribed">Nur Abonnierte</option>
          <option value="unsubscribed">Nur Abgemeldete</option>
        </select>
      </div>

      <div class="actions">
        <button class="btn" @click="openComposer()">E-Mail verfassen</button>
        <button
          class="btn outline"
          @click="openComposer(true)"
          :disabled="!selected.length"
        >
          An Auswahl senden
        </button>
      </div>
    </header>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 44px">
              <input type="checkbox" :checked="allChecked" @change="toggleAll" />
            </th>
            <th>E-Mail</th>
            <th>Status</th>
            <th>Seit</th>
            <th style="width: 240px">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in subs" :key="s._id">
            <td><input type="checkbox" v-model="selected" :value="s._id" /></td>
            <td class="mono">{{ s.email }}</td>
            <td>
              <span :class="['badge', s.isUnsubscribed ? 'muted' : 'ok']">
                {{ s.isUnsubscribed ? "abgemeldet" : "abonniert" }}
              </span>
            </td>
            <td>{{ fmt(s.subscribedAt) }}</td>
            <td class="row-actions">
              <button class="btn tiny" @click="toggle(s)">
                {{ s.isUnsubscribed ? "Reaktivieren" : "Abmelden" }}
              </button>
              <button class="btn tiny danger" @click="del(s)">Löschen</button>
            </td>
          </tr>
          <tr v-if="!subs.length">
            <td colspan="5" class="empty">Keine Einträge gefunden.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Composer -->
    <div v-if="showComposer" class="modal" @click.self="showComposer = false">
      <div class="modal-content">
        <h3>E-Mail verfassen</h3>

        <div class="grid">
          <label class="field">
            <span>Betreff</span>
            <input
              v-model="subject"
              class="input"
              placeholder="z. B. Neuigkeiten von Kiezjagd"
            />
          </label>

          <label class="field">
            <span>HTML-Inhalt</span>
            <textarea
              v-model="html"
              rows="7"
              class="textarea"
              placeholder="HTML ({{email}} optional)"
            ></textarea>
          </label>

          <label class="field">
            <span>Text (Fallback)</span>
            <textarea
              v-model="text"
              rows="3"
              class="textarea"
              placeholder="Reiner Text (optional)"
            ></textarea>
          </label>
        </div>

        <div class="composer-actions">
          <div class="test">
            <input v-model="testEmail" class="input" placeholder="Test an…" />
            <button class="btn outline" @click="sendTest">Test senden</button>
          </div>

          <div class="send">
            <button
              class="btn"
              @click="sendSelected"
              :disabled="!subject || !selected.length"
            >
              An Auswahl
            </button>
            <button class="btn accent" @click="sendAll" :disabled="!subject">
              An alle Abonnenten
            </button>
            <button class="btn ghost" @click="showComposer = false">Abbrechen</button>
          </div>
        </div>

        <div v-if="status" class="status">
          <pre>{{ status }}</pre>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiService from "@/services/apiService";

const subs = ref([]);
const q = ref("");
const only = ref("all");
const selected = ref([]);
const showComposer = ref(false);
const subject = ref("");
const html = ref("");
const text = ref("");
const testEmail = ref("");
const status = ref("");

const allChecked = computed(
  () => subs.value.length && selected.value.length === subs.value.length
);
function fmt(d) {
  return d ? new Date(d).toLocaleString() : "";
}

async function load() {
  subs.value = await apiService.fetchNewsletter({ q: q.value, only: only.value });
  selected.value = [];
}
function toggleAll(e) {
  selected.value = e.target.checked ? subs.value.map((s) => s._id) : [];
}
async function toggle(s) {
  if (s.isUnsubscribed) await apiService.newsletterReactivate(s._id);
  else await apiService.newsletterUnsubscribe(s._id);
  await load();
}
async function del(s) {
  if (!confirm("Wirklich löschen?")) return;
  await apiService.newsletterDelete(s._id);
  await load();
}
function openComposer(useSelection = false) {
  if (useSelection && !selected.value.length) return alert("Keine Empfänger ausgewählt.");
  showComposer.value = true;
  status.value = "";
}
async function sendTest() {
  if (!testEmail.value) return alert("Test-Adresse fehlt.");
  status.value = "Sende Test…";
  try {
    const res = await apiService.sendNewsletter({
      testEmail: testEmail.value,
      subject: subject.value || "(Test)",
      html: html.value,
      text: text.value,
    });
    status.value = JSON.stringify(res, null, 2);
  } catch (e) {
    const msg =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e.message ||
      "Unbekannter Fehler";
    status.value = "Fehler: " + msg;
  }
}
async function sendSelected() {
  if (!selected.value.length) return alert("Keine Empfänger.");
  status.value = "Sende an Auswahl…";
  try {
    const res = await apiService.sendNewsletter({
      ids: selected.value,
      subject: subject.value,
      html: html.value,
      text: text.value,
    });
    status.value = JSON.stringify(res, null, 2);
    showComposer.value = false;
    await load();
  } catch (e) {
    const msg = e?.response?.data?.error || e?.response?.data?.message || e.message;
    status.value = "Fehler: " + msg;
  }
}
async function sendAll() {
  if (!confirm("An alle Abonnenten senden?")) return;
  status.value = "Sende an alle…";
  try {
    const res = await apiService.sendNewsletter({
      subject: subject.value,
      html: html.value,
      text: text.value,
    });
    status.value = JSON.stringify(res, null, 2);
    showComposer.value = false;
    await load();
  } catch (e) {
    const msg = e?.response?.data?.error || e?.response?.data?.message || e.message;
    status.value = "Fehler: " + msg;
  }
}
onMounted(load);
</script>

<style lang="scss" scoped>
/* Deine Farben */
$primary-text-color: #355b4c; // dunkelgrün
$secondary-text-color: #fac227; // gelb

$gray-50: #fafafa;
$gray-100: #f4f4f5;
$gray-200: #e6e6e7;
$gray-300: #d4d4d8;
$gray-400: #a1a1aa;

:root {
  --c-primary: #355b4c;
  --c-accent: #fac227;
  --c-border: #e6e6e7;
  --c-text: #1f1f1f;
  --c-muted: #6b7280;
}

.nl-admin {
  display: grid;
  gap: 16px;
  color: var(--c-text);
  width: 100%;
  padding: 1em 0 3em;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: #fff;

  .inputs {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    min-width: 280px;
  }
  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
}

/* Table */
.table-wrap {
  border: 1px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background: $gray-100;
    th {
      text-align: left;
      padding: 12px 14px;
      font-weight: 700;
      color: var(--c-primary);
      border-bottom: 1px solid var(--c-border);
    }
  }

  tbody {
    tr {
      &:nth-child(2n) {
        background: #fff;
      }
      &:nth-child(2n + 1) {
        background: #fcfcfc;
      }
      &:hover {
        background: #f9faf9;
      }
    }
    td {
      padding: 10px 14px;
      vertical-align: middle;
      border-bottom: 1px solid $gray-100;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .row-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      .btn {
        padding: 6px 18px;
        font-size: 12px;
      }
    }
    .empty {
      text-align: center;
      color: var(--c-muted);
      padding: 26px 10px;
      font-style: italic;
    }
  }
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid $gray-300;
  &.ok {
    color: $primary-text-color;
    border-color: rgba(53, 91, 76, 0.35);
    background: rgba(53, 91, 76, 0.08);
  }
  &.muted {
    color: #6b7280;
    background: #f3f4f6;
  }
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  padding: 16px;
  z-index: 50;
}
.modal-content {
  width: min(920px, 100%);
  background: #fff;
  border-radius: 14px;
  border: 1px solid var(--c-border);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 18px;

  h3 {
    margin: 0 0 10px;
    color: var(--c-primary);
  }

  .grid {
    display: grid;
    gap: 12px;
    .field {
      display: grid;
      gap: 6px;
    }
    @media (min-width: 780px) {
      grid-template-columns: 1fr;
    }
  }

  .composer-actions {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
    margin-top: 8px;

    .test {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .send {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      .test,
      .send {
        justify-content: flex-start;
      }
    }
  }

  .status {
    margin-top: 10px;
    background: #f9fafb;
    border: 1px solid var(--c-border);
    border-radius: 10px;
    padding: 8px;
    max-height: 220px;
    overflow: auto;
  }
}

/* Responsives Tuning für Toolbar */
@media (max-width: 720px) {
  .toolbar {
    .inputs,
    .actions {
      width: 100%;
    }
  }
}
</style>
