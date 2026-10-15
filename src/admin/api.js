// Talks to the CMS API (cms-api/). In development Vite forwards /api and /uploads
// to it (see vite.config.js), so the login cookie works as if it were one site.

// Cloudinary's free plan: biggest file it accepts for each kind
const MAX_UPLOAD_MB = { image: 10, video: 100 }

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

  // Uploads a photo or video straight to Cloudinary; returns { url, kind: 'image' | 'video' }.
  // The API only signs the upload (proof we're logged in) — the file never goes
  // through it, because Vercel functions refuse anything over 4.5 MB.
  async uploadFile(file) {
    const kind = file.type.startsWith('video/') ? 'video' : 'image'
    const limitMb = MAX_UPLOAD_MB[kind]
    if (file.size > limitMb * 1024 * 1024) {
      throw new ApiError(`That ${kind} is ${(file.size / 1024 / 1024).toFixed(0)} MB — the limit is ${limitMb} MB. Please export a smaller one.`, 413)
    }

    const { uploadUrl, fields } = await request('POST', '/api/admin/uploads/signature')
    const form = new FormData()
    Object.entries(fields).forEach(([name, value]) => form.append(name, value))
    form.append('file', file)

    let response
    try {
      response = await fetch(uploadUrl, { method: 'POST', body: form })
    } catch {
      throw new ApiError('Couldn’t reach Cloudinary to upload. Check your connection and try again.', 0)
    }
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new ApiError(`Cloudinary refused the upload: ${data?.error?.message ?? `error ${response.status}`}`, response.status)
    }
    return {
      url: data.secure_url,
      kind: data.resource_type === 'video' ? 'video' : 'image',
      size: { width: data.width ?? null, height: data.height ?? null },   // in pixels
    }
  },
}
