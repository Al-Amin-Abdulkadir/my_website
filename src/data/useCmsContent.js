import { useEffect, useState } from 'react'

// Fetches public content from the CMS API (cms-api/) — e.g. useCmsContent('/api/projects-page').
// Returns { data, error, isLoading }. error.isNotFound is true for a 404
// (nothing published at that address).
//
// Everything fetched is remembered for the visit, so a page drawn a second time
// (like the outgoing page during a page slide) appears instantly instead of empty.
const remembered = new Map()

export function useCmsContent(path) {
  const [state, setState] = useState(() => startingState(path))

  useEffect(() => {
    let isStillWanted = true                // ignore the answer if the page moved on meanwhile
    setState(startingState(path))

    loadContent(path)
      .then((data) => {
        remembered.set(path, data)
        if (isStillWanted) setState({ data, error: null, isLoading: false })
      })
      .catch((error) => {
        if (isStillWanted) setState({ data: null, error, isLoading: false })
      })

    return () => { isStillWanted = false }
  }, [path])

  return state
}

function startingState(path) {
  return remembered.has(path)
    ? { data: remembered.get(path), error: null, isLoading: false }
    : { data: null, error: null, isLoading: true }
}

async function loadContent(path) {
  let response
  try {
    response = await fetch(path)
  } catch {
    throw new Error('Couldn’t reach the content server. Check your connection and refresh.')
  }
  if (response.status === 404) {
    const error = new Error('Nothing is published here yet.')
    error.isNotFound = true
    throw error
  }
  if (!response.ok) throw new Error(`The content server had a problem (${response.status}). Please refresh.`)
  return response.json()
}
