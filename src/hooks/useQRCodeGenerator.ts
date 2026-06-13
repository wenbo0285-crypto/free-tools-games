'use client'

import { useState, useCallback, useRef } from 'react'
import QRCode from 'qrcode'

export type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'line' | 'social' | 'vcard'

export interface WifiConfig {
  ssid: string
  encryption: 'WPA/WPA2' | 'WEP' | 'none'
  password: string
}

export interface EmailConfig {
  email: string
  subject: string
  body: string
}

export interface PhoneConfig {
  number: string
}

export interface SmsConfig {
  number: string
  message: string
}

export interface SocialConfig {
  platform: string
  url: string
}

export interface VCardConfig {
  name: string
  company: string
  title: string
  phone: string
  email: string
  website: string
  address: string
  note: string
}

export interface QRStyle {
  foregroundColor: string
  backgroundColor: string
  size: number
  margin: number
  transparentBg: boolean
}

export interface QRState {
  type: QRType
  url: string
  text: string
  wifi: WifiConfig
  email: EmailConfig
  phone: PhoneConfig
  sms: SmsConfig
  line: string
  social: SocialConfig
  vcard: VCardConfig
  style: QRStyle
}

const defaultQRState: QRState = {
  type: 'url',
  url: '',
  text: '',
  wifi: { ssid: '', encryption: 'WPA/WPA2', password: '' },
  email: { email: '', subject: '', body: '' },
  phone: { number: '' },
  sms: { number: '', message: '' },
  line: '',
  social: { platform: 'instagram', url: '' },
  vcard: { name: '', company: '', title: '', phone: '', email: '', website: '', address: '', note: '' },
  style: {
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    size: 300,
    margin: 2,
    transparentBg: false,
  },
}

function buildQRContent(state: QRState): string | null {
  switch (state.type) {
    case 'url': {
      let url = state.url.trim()
      if (!url) return null
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url
      return url
    }
    case 'text': {
      const t = state.text.trim()
      return t || null
    }
    case 'wifi': {
      const { ssid, encryption, password } = state.wifi
      if (!ssid.trim()) return null
      if (encryption === 'none') return `WIFI:T:nopass;S:${ssid};;`
      return `WIFI:T:${encryption === 'WPA/WPA2' ? 'WPA' : 'WEP'};S:${ssid};P:${password};;`
    }
    case 'email': {
      const { email, subject, body } = state.email
      if (!email.trim()) return null
      let mailto = `mailto:${email}`
      const params: string[] = []
      if (subject.trim()) params.push(`subject=${encodeURIComponent(subject)}`)
      if (body.trim()) params.push(`body=${encodeURIComponent(body)}`)
      if (params.length) mailto += '?' + params.join('&')
      return mailto
    }
    case 'phone': {
      const n = state.phone.number.trim()
      return n ? `tel:${n}` : null
    }
    case 'sms': {
      const { number, message } = state.sms
      if (!number.trim()) return null
      let sms = `sms:${number}`
      if (message.trim()) sms += `?body=${encodeURIComponent(message)}`
      return sms
    }
    case 'line': {
      const l = state.line.trim()
      return l || null
    }
    case 'social': {
      const u = state.social.url.trim()
      return u || null
    }
    case 'vcard': {
      const v = state.vcard
      if (!v.name.trim() && !v.phone.trim() && !v.email.trim()) return null
      let card = 'BEGIN:VCARD\nVERSION:3.0\n'
      if (v.name.trim()) card += `FN:${v.name}\nN:${v.name};;;\n`
      if (v.company.trim()) card += `ORG:${v.company}\n`
      if (v.title.trim()) card += `TITLE:${v.title}\n`
      if (v.phone.trim()) card += `TEL:${v.phone}\n`
      if (v.email.trim()) card += `EMAIL:${v.email}\n`
      if (v.website.trim()) card += `URL:${v.website}\n`
      if (v.address.trim()) card += `ADR:;;${v.address};;;\n`
      if (v.note.trim()) card += `NOTE:${v.note}\n`
      card += 'END:VCARD'
      return card
    }
    default:
      return null
  }
}

export function useQRCodeGenerator() {
  const [state, setState] = useState<QRState>(defaultQRState)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const updateState = useCallback(<K extends keyof QRState>(key: K, value: QRState[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateStyle = useCallback(<K extends keyof QRStyle>(key: K, value: QRStyle[K]) => {
    setState(prev => ({ ...prev, style: { ...prev.style, [key]: value } }))
  }, [])

  const updateNested = useCallback(<
    K extends 'wifi' | 'email' | 'phone' | 'sms' | 'social' | 'vcard',
    V extends keyof QRState[K]
  >(key: K, subKey: V, value: QRState[K][V]) => {
    setState(prev => ({
      ...prev,
      [key]: { ...prev[key], [subKey]: value },
    }))
  }, [])

  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('圖片載入失敗'))
      img.src = URL.createObjectURL(file)
    })
  }

  const generateQR = useCallback(async (logoFile?: File | null) => {
    setError(null)
    const content = buildQRContent(state)
    if (!content) {
      setQrDataUrl(null)
      return
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = state.style.size
      canvas.height = state.style.size
      canvasRef.current = canvas

      await QRCode.toCanvas(canvas, content, {
        width: state.style.size,
        margin: state.style.margin,
        color: {
          dark: state.style.foregroundColor,
          light: state.style.transparentBg ? '#FFFFFF00' : state.style.backgroundColor,
        },
        errorCorrectionLevel: logoFile ? 'H' : 'M',
      })

      if (logoFile) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const logoSize = Math.floor(state.style.size * 0.2)
          const logoX = Math.floor((state.style.size - logoSize) / 2)
          const logoY = Math.floor((state.style.size - logoSize) / 2)

          const img = await loadImage(logoFile)
          ctx.fillStyle = state.style.backgroundColor
          ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8)
          ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
        }
      }

      setQrDataUrl(canvas.toDataURL())
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '產生 QR Code 時發生錯誤'
      setError(msg)
    }
  }, [state])

  const downloadPNG = useCallback(() => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `qrcode-${state.type}-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }, [qrDataUrl, state.type])

  const reset = useCallback(() => {
    setState(defaultQRState)
    setQrDataUrl(null)
    setError(null)
  }, [])

  return {
    state,
    qrDataUrl,
    error,
    updateState,
    updateStyle,
    updateNested,
    generateQR,
    downloadPNG,
    reset,
  }
}
