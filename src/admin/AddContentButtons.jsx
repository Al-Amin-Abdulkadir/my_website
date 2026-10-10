import MediaUpload from './MediaUpload'
import { newBlockContent } from './layouts'

// "+ Heading / + Text / + Image / + Video". Used in the side panel (adds to the
// end of the page) and inside each layout column (adds to that column).
// Images and videos upload first; the block appears once the file is ready.
export default function AddContentButtons({ onAdd, className = 'editor-panel__add', buttonClassName = 'editor-add-button' }) {
  return (
    <div className={className}>
      <button className={buttonClassName} onClick={() => onAdd('heading', newBlockContent('heading'))}>+ Heading</button>
      <button className={buttonClassName} onClick={() => onAdd('text', newBlockContent('text'))}>+ Text</button>
      <MediaUpload
        label="+ Image"
        accept="image"
        className={buttonClassName}
        onUploaded={(src) => onAdd('image', newBlockContent('image', src))}
      />
      <MediaUpload
        label="+ Video"
        accept="video"
        className={buttonClassName}
        onUploaded={(src) => onAdd('video', newBlockContent('video', src))}
      />
    </div>
  )
}
