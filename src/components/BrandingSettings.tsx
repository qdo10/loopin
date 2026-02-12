'use client'

import { useState, useRef } from 'react'
import { Upload, Palette, Loader2, Check, Image as ImageIcon, X } from 'lucide-react'

interface BrandingSettingsProps {
  userId: string
  currentLogo: string | null
  currentColor: string
  isPro: boolean
  onUpdate: (logoUrl: string | null, brandColor: string) => void
}

const PRESET_COLORS = [
  '#6366f1', // Indigo (default)
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
]

export default function BrandingSettings({ 
  userId, 
  currentLogo, 
  currentColor, 
  isPro,
  onUpdate 
}: BrandingSettingsProps) {
  const [logo, setLogo] = useState<string | null>(currentLogo)
  const [color, setColor] = useState(currentColor || '#6366f1')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !isPro) return
    
    const file = e.target.files[0]
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', 'branding') // Special bucket path
      formData.append('type', 'logo')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        setLogo(url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    onUpdate(logo, color)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  const removeLogo = () => {
    setLogo(null)
  }

  if (!isPro) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-white">Custom Branding</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Upload your logo and choose your brand color to customize how your portals look.
        </p>
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <p className="text-indigo-300 text-sm">
            ✨ Upgrade to Pro to unlock custom branding
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Custom Branding</h3>
      </div>

      {/* Logo Upload */}
      <div className="mb-6">
        <label className="block text-slate-300 text-sm font-medium mb-3">
          Logo
        </label>
        
        {logo ? (
          <div className="relative inline-block">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-16 w-auto rounded-lg border border-slate-600"
            />
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-3 bg-slate-900 border border-dashed border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
            <div className="text-left">
              <p className="text-slate-300 text-sm">Upload your logo</p>
              <p className="text-slate-500 text-xs">PNG, JPG up to 2MB</p>
            </div>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {/* Color Picker */}
      <div className="mb-6">
        <label className="block text-slate-300 text-sm font-medium mb-3">
          Brand Color
        </label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => setColor(presetColor)}
              className={`w-8 h-8 rounded-full border-2 transition ${
                color === presetColor 
                  ? 'border-white scale-110' 
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: presetColor }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border-0"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-28 uppercase"
            placeholder="#6366f1"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <label className="block text-slate-300 text-sm font-medium mb-3">
          Preview
        </label>
        <div className="bg-white rounded-lg p-4 flex items-center gap-3">
          {logo ? (
            <img src={logo} alt="Logo preview" className="h-8 w-auto" />
          ) : (
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
          <span className="font-semibold text-slate-900">Your Business</span>
          <div 
            className="ml-auto px-3 py-1 rounded-full text-white text-sm"
            style={{ backgroundColor: color }}
          >
            Button
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <Check className="w-4 h-4" />
        ) : (
          <Palette className="w-4 h-4" />
        )}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Branding'}
      </button>
    </div>
  )
}
