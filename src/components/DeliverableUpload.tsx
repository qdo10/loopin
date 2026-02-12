'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'

interface DeliverableUploadProps {
  projectId: string
  onUploadComplete: () => void
}

export default function DeliverableUpload({ projectId, onUploadComplete }: DeliverableUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      setName(file.name)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setName(file.name)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !name.trim()) return

    setUploading(true)

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('projectId', projectId)
      formData.append('type', 'deliverable')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      const { url, size } = await uploadRes.json()

      // Create deliverable record
      const deliverableRes = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: name.trim(),
          description: description.trim() || null,
          fileUrl: url,
          fileSize: size,
        }),
      })

      if (!deliverableRes.ok) throw new Error('Failed to create deliverable')

      // Reset form
      setSelectedFile(null)
      setName('')
      setDescription('')
      onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!selectedFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer
            ${dragActive 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-slate-600 hover:border-slate-500'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-300 text-sm">
            Drag & drop a file, or click to select
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Max 50MB per file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{selectedFile.name}</p>
              <p className="text-slate-500 text-xs">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null)
                setName('')
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Deliverable name"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Description (optional)"
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !name.trim()}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Deliverable
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
