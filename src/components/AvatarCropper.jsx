import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

// Canvas crop helper
async function cropImageToBlob(imageSrc, croppedAreaPixels) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas')
      const size = Math.min(croppedAreaPixels.width, croppedAreaPixels.height)
      canvas.width  = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      // Clip to circle
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, size, size
      )

      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      }, 'image/jpeg', 0.92)
    })
    image.addEventListener('error', reject)
    image.src = imageSrc
  })
}

export default function AvatarCropper({ imageSrc, onSave, onCancel }) {
  const [crop,     setCrop]     = useState({ x: 0, y: 0 })
  const [zoom,     setZoom]     = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [saving,   setSaving]   = useState(false)

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setSaving(true)
    try {
      const blob = await cropImageToBlob(imageSrc, croppedAreaPixels)
      await onSave(blob)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Title */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif' }}>
          Adjust Photo
        </p>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
      </div>

      {/* Crop area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: 'transparent' },
            cropAreaStyle: {
              border: '2px solid rgba(255,255,255,0.7)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div style={{ padding: '16px 32px 8px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', marginBottom: 10 }}>Pinch or slide to zoom</p>
        <input
          type="range"
          min={1} max={3} step={0.01}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#fff' }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 20px 36px', flexShrink: 0 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '14px', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent', color: 'rgba(255,255,255,0.5)',
          fontSize: 14, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} style={{
          flex: 2, padding: '14px', borderRadius: 12,
          border: 'none',
          background: saving ? 'rgba(255,255,255,0.15)' : '#fff',
          color: saving ? 'rgba(255,255,255,0.4)' : '#000',
          fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}>
          {saving ? 'Saving…' : 'Save Photo'}
        </button>
      </div>
    </div>
  )
}
