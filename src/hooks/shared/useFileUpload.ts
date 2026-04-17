import { useState, useCallback } from 'react'
import uploadApi from '@/lib/api'

interface UploadResult {
  publicUrl: string
}

interface PresignResponse {
  presigned_url: string
  public_url: string
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const UPSTREAM_URL = (import.meta as any).env?.VITE_UPSTREAM_SERVER;

  const upload = useCallback(
    async (file: File, category = 'internal'): Promise<UploadResult> => {
      setIsUploading(true)
      setProgress(0)
      setError(null)

      try {
        // Step 1: Get presigned URL via POST
        const presignRes = await uploadApi.post<PresignResponse>(
          `${UPSTREAM_URL}/admissions/files/presign-upload`,
          null,
          {
            params: { category, filename: file.name },
          },
        )

        const { presigned_url, public_url } = presignRes.data
        setProgress(30)

        // Step 2: PUT file directly to presigned URL
        await fetch(presigned_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        })

        setProgress(100)
        return { publicUrl: public_url }
      } catch (err: any) {
        const message =
          err?.response?.data?.error || err?.message || 'Upload failed'
        setError(message)
        throw new Error(message)
      } finally {
        setIsUploading(false)
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return { upload, isUploading, progress, error, reset }
}
