import { useRef, useState } from 'react'
import { api } from './api'

const ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  video: 'video/mp4,video/webm,video/quicktime',
  any: 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime',
}

// A button that opens the file picker, uploads the chosen photo or video, and
// hands back its URL, whether it was an image or a video, and its size in pixels
export default function MediaUpload({ label = 'Upload', accept = 'image', onUploaded, className = 'admin-button' }) {
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const upload = async (event) => {
    const file = event.target.files[0]
    event.target.value = ''            // lets you pick the same file again later
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      const { url, kind, size } = await api.uploadFile(file)
      onUploaded(url, kind, size)
    } catch (problem) {
      setError(problem.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <span className="admin-upload">
      <button type="button" className={className} onClick={() => inputRef.current.click()} disabled={isUploading}>
        {isUploading ? 'Uploading…' : label}
      </button>
      <input ref={inputRef} type="file" accept={ACCEPT[accept]} onChange={upload} hidden />
      {error && <span className="admin-error">{error}</span>}
    </span>
  )
}
