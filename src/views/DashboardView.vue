<script setup>
import { onMounted, reactive, ref } from 'vue'
import * as budgetApi from '@/service/budgetApi'

const mese = ref('2026-10')
const stipendioInput = ref(0)
const salvataggioStipendio = ref(false)
const messaggioStipendio = ref(null)
const riepilogo = ref(null)
const movimenti = ref([])
const obiettivoRisparmioInput = ref(0)
const salvataggioObiettivo = ref(false)
const messaggioObiettivo = ref(null)
const movimentoInModifica = ref(null)

const modificaMovimentoForm = reactive({
  data: '',
  tipo: 'SPESA',
  categoria: '',
  descrizione: '',
  importo: null,
})

const salvataggioModifica = ref(false)
const messaggioModifica = ref(null)

const caricamento = ref(false)
const errore = ref(null)
const nuovoMovimento = reactive({
  data: '',
  tipo: 'SPESA',
  categoria: '',
  descrizione: '',
  importo: null,
})

const salvataggioMovimento = ref(false)
const messaggioMovimento = ref(null)

async function caricaRiepilogo() {
  const dati = await budgetApi.getRiepilogo(mese.value)

  riepilogo.value = dati
  stipendioInput.value = dati.stipendio
  obiettivoRisparmioInput.value = dati.obiettivoRisparmio
}

async function caricaMovimenti() {
  movimenti.value = await budgetApi.getMovimenti(mese.value)
}

async function caricaDashboard() {
  riepilogo.value = null
  movimenti.value = []
  caricamento.value = true
  errore.value = null

  try {
    await caricaRiepilogo()
    await caricaMovimenti()
  } catch (error) {
    errore.value = error.message
  } finally {
    caricamento.value = false
  }
}

async function aggiornaStipendio() {
  salvataggioStipendio.value = true
  messaggioStipendio.value = null

  try {
    riepilogo.value = await budgetApi.aggiornaStipendio(mese.value, stipendioInput.value)

    messaggioStipendio.value = 'Stipendio aggiornato correttamente.'
  } catch (error) {
    messaggioStipendio.value = error.message
  } finally {
    salvataggioStipendio.value = false
  }
}
async function aggiornaObiettivoRisparmio() {
  salvataggioObiettivo.value = true
  messaggioObiettivo.value = null

  try {
    riepilogo.value = await budgetApi.aggiornaObiettivoRisparmio(
      mese.value,
      obiettivoRisparmioInput.value,
    )

    messaggioObiettivo.value = 'Obiettivo di risparmio aggiornato correttamente.'
  } catch (error) {
    messaggioObiettivo.value = error.message
  } finally {
    salvataggioObiettivo.value = false
  }
}

function preparaModifica(movimento) {
  movimentoInModifica.value = movimento.id

  modificaMovimentoForm.data = movimento.data
  modificaMovimentoForm.tipo = movimento.tipo
  modificaMovimentoForm.categoria = movimento.categoria
  modificaMovimentoForm.descrizione = movimento.descrizione
  modificaMovimentoForm.importo = movimento.importo

  messaggioModifica.value = null
}

async function salvaModificaMovimento() {
  salvataggioModifica.value = true
  messaggioModifica.value = null

  try {
    await budgetApi.modificaMovimento(mese.value, movimentoInModifica.value, {
      data: modificaMovimentoForm.data,
      tipo: modificaMovimentoForm.tipo,
      categoria: modificaMovimentoForm.categoria,
      descrizione: modificaMovimentoForm.descrizione,
      importo: modificaMovimentoForm.importo,
    })

    messaggioModifica.value = 'Movimento modificato correttamente.'

    movimentoInModifica.value = null

    await caricaDashboard()
  } catch (error) {
    messaggioModifica.value = error.message
  } finally {
    salvataggioModifica.value = false
  }
}

function annullaModifica() {
  movimentoInModifica.value = null
  messaggioModifica.value = null
}

async function eliminaMovimento(id) {
  const conferma = window.confirm('Vuoi davvero eliminare questo movimento?')

  if (!conferma) {
    return
  }

  try {
    await budgetApi.eliminaMovimento(mese.value, id)

    await caricaDashboard()
  } catch (error) {
    errore.value = error.message
  }
}
async function aggiungiMovimento() {
  salvataggioMovimento.value = true
  messaggioMovimento.value = null

  try {
    await budgetApi.aggiungiMovimento(mese.value, {
      data: nuovoMovimento.data,
      tipo: nuovoMovimento.tipo,
      categoria: nuovoMovimento.categoria,
      descrizione: nuovoMovimento.descrizione,
      importo: nuovoMovimento.importo,
    })

    messaggioMovimento.value = 'Movimento aggiunto correttamente.'

    nuovoMovimento.data = ''
    nuovoMovimento.tipo = 'SPESA'
    nuovoMovimento.categoria = ''
    nuovoMovimento.descrizione = ''
    nuovoMovimento.importo = null

    await caricaDashboard()
  } catch (error) {
    messaggioMovimento.value = error.message
  } finally {
    salvataggioMovimento.value = false
  }
}

onMounted(() => {
  caricaDashboard()
})
</script>

<template>
  <main>
    <h1>Budget Manager</h1>

    <div>
      <label for="mese">Mese:</label>

      <input id="mese" v-model="mese" type="month" @change="caricaDashboard" />
    </div>
    <section>
      <h2>Impostazioni mese</h2>

      <form @submit.prevent="aggiornaStipendio">
        <label for="stipendio"> Stipendio: </label>

        <input
          id="stipendio"
          v-model.number="stipendioInput"
          type="number"
          min="0"
          step="0.01"
          required
        />

        <button type="submit" :disabled="salvataggioStipendio">
          {{ salvataggioStipendio ? 'Salvataggio...' : 'Salva stipendio' }}
        </button>
      </form>

      <form @submit.prevent="aggiornaObiettivoRisparmio">
        <label for="obiettivo-risparmio"> Obiettivo di risparmio: </label>

        <input
          id="obiettivo-risparmio"
          v-model.number="obiettivoRisparmioInput"
          type="number"
          min="0"
          step="0.01"
          required
        />

        <button type="submit" :disabled="salvataggioObiettivo">
          {{ salvataggioObiettivo ? 'Salvataggio...' : 'Salva obiettivo' }}
        </button>
      </form>

      <p v-if="messaggioObiettivo">
        {{ messaggioObiettivo }}
      </p>

      <p v-if="messaggioStipendio">
        {{ messaggioStipendio }}
      </p>
    </section>
    <section>
      <h2>Nuovo movimento</h2>

      <form @submit.prevent="aggiungiMovimento">
        <div>
          <label for="data-movimento"> Data: </label>

          <input id="data-movimento" v-model="nuovoMovimento.data" type="date" required />
        </div>

        <div>
          <label for="tipo-movimento"> Tipo: </label>

          <select id="tipo-movimento" v-model="nuovoMovimento.tipo" required>
            <option value="SPESA">Spesa</option>

            <option value="ENTRATA">Entrata</option>
          </select>
        </div>

        <div>
          <label for="categoria-movimento"> Categoria: </label>

          <input id="categoria-movimento" v-model="nuovoMovimento.categoria" type="text" required />
        </div>

        <div>
          <label for="descrizione-movimento"> Descrizione: </label>

          <input
            id="descrizione-movimento"
            v-model="nuovoMovimento.descrizione"
            type="text"
            required
          />
        </div>

        <div>
          <label for="importo-movimento"> Importo: </label>

          <input
            id="importo-movimento"
            v-model.number="nuovoMovimento.importo"
            type="number"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <button type="submit" :disabled="salvataggioMovimento">
          {{ salvataggioMovimento ? 'Salvataggio...' : 'Aggiungi movimento' }}
        </button>
      </form>

      <p v-if="messaggioMovimento">
        {{ messaggioMovimento }}
      </p>
    </section>

    <p v-if="caricamento">Caricamento...</p>

    <p v-else-if="errore">
      {{ errore }}
    </p>

    <template v-else>
      <section v-if="riepilogo">
        <h2>Riepilogo</h2>

        <p>Mese: {{ riepilogo.mese }}</p>
        <p>Stipendio: € {{ riepilogo.stipendio }}</p>
        <p>Obiettivo risparmio: € {{ riepilogo.obiettivoRisparmio }}</p>
        <p>Spese totali: € {{ riepilogo.speseTotali }}</p>
        <p>Entrate extra: € {{ riepilogo.entrateExtra }}</p>
        <p>Budget rimanente: € {{ riepilogo.budgetRimanente }}</p>
        <p>Budget medio giornaliero: € {{ riepilogo.budgetMedioGiornaliero }}</p>
      </section>

      <section>
        <h2>Movimenti</h2>

        <p v-if="movimenti.length === 0">Nessun movimento presente.</p>

        <ul v-else>
          <li v-for="movimento in movimenti" :key="movimento.id">
            <div v-if="movimentoInModifica !== movimento.id">
              {{ movimento.data }}
              -
              {{ movimento.descrizione }}
              -
              {{ movimento.tipo }}
              -
              {{ movimento.categoria }}
              - € {{ movimento.importo }}

              <button type="button" @click="preparaModifica(movimento)">Modifica</button>

              <button type="button" @click="eliminaMovimento(movimento.id)">Elimina</button>
            </div>

            <form v-else @submit.prevent="salvaModificaMovimento">
              <input v-model="modificaMovimentoForm.data" type="date" required />

              <select v-model="modificaMovimentoForm.tipo" required>
                <option value="SPESA">Spesa</option>

                <option value="ENTRATA">Entrata</option>
              </select>

              <input v-model="modificaMovimentoForm.categoria" type="text" required />

              <input v-model="modificaMovimentoForm.descrizione" type="text" required />

              <input
                v-model.number="modificaMovimentoForm.importo"
                type="number"
                min="0.01"
                step="0.01"
                required
              />

              <button type="submit" :disabled="salvataggioModifica">
                {{ salvataggioModifica ? 'Salvataggio...' : 'Salva' }}
              </button>

              <button type="button" @click="annullaModifica">Annulla</button>
            </form>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>
