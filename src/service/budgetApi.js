const BASE_URL = '/api/budget'

async function richiestaJson(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    let messaggio = 'Si è verificato un errore.'

    try {
      const errore = await response.json()

      if (errore.message) {
        messaggio = errore.message
      }
    } catch {
      // Se la risposta non contiene JSON,
      // manteniamo il messaggio generico.
    }

    throw new Error(messaggio)
  }

  if (response.status === 204) {
    return null
  }

  return await response.json()
}

export function getRiepilogo(mese) {
  return richiestaJson(`${BASE_URL}/${mese}`)
}

export function getMovimenti(mese) {
  return richiestaJson(`${BASE_URL}/${mese}/movimenti`)
}

export function aggiornaStipendio(mese, stipendio) {
  return richiestaJson(`${BASE_URL}/${mese}/stipendio`, {
    method: 'PUT',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      stipendio,
    }),
  })
}

export function aggiornaObiettivoRisparmio(mese, obiettivoRisparmio) {
  return richiestaJson(`${BASE_URL}/${mese}/obiettivo-risparmio`, {
    method: 'PUT',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      obiettivoRisparmio,
    }),
  })
}
export function aggiungiMovimento(mese, movimento) {
  return richiestaJson(`${BASE_URL}/${mese}/movimenti`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(movimento),
  })
}
export function modificaMovimento(mese, id, movimento) {
  return richiestaJson(`${BASE_URL}/${mese}/movimenti/${id}`, {
    method: 'PUT',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(movimento),
  })
}

export function eliminaMovimento(mese, id) {
  return richiestaJson(`${BASE_URL}/${mese}/movimenti/${id}`, {
    method: 'DELETE',
  })
}
