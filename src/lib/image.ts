export const shrinkImage = async (file: File, size = 640): Promise<Blob> => {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height))
    const canvas = Object.assign(document.createElement('canvas'), {
      width: Math.round(bitmap.width * scale),
      height: Math.round(bitmap.height * scale),
    })
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), 'image/webp', 0.85))
  } catch {
    return file
  }
}
