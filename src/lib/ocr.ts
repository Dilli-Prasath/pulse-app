/**
 * On-device OCR using Tesseract.js (no API key, runs in the browser).
 * Lazily imported so the ~heavy WASM/lang assets only download when the user
 * actually scans a sheet. Returns the recognised plain text.
 */
export async function ocrImage(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const { default: Tesseract } = await import('tesseract.js')
  const { data } = await Tesseract.recognize(file, 'eng', {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(Math.round(m.progress * 100))
    },
  })
  return (data?.text || '').trim()
}
