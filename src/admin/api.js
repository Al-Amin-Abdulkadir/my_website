// Talks to the CMS API (cms-api/). In development Vite forwards /api and /uploads
// to it (see vite.config.js), so the login cookie works as if it were one site.

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(method, path, body) {
  const options = { method, headers: {} }
  if (body instanceof FormData) {
    options.body = body                      // the browser sets the upload headers itself
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(path, options)
  } catch {
    throw new ApiError('Can’t reach the CMS server. Is it running? (in cms-api/: .venv/bin/uvicorn app.main:app --port 8000)', 0)
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(readableError(data) ?? `The server answered ${response.status}`, response.status)
  }
  return data
}

// FastAPI sends either a sentence or a list of field problems — turn both into plain text
function readableError(data) {
  if (!data?.detail) return null
  if (typeof data.detail === 'string') return data.detail
  return data.detail.map((problem) => `${problem.loc.slice(1).join(' → ')}: ${problem.msg}`).join('\n')
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),

  // Uploads a photo or video; returns { url, kind: 'image' | 'video' }
  uploadFile(file) {
    const form = new FormData()
    form.append('file', file)
    return request('POST', '/api/admin/uploads', form)
  },
}
