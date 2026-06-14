'use client'

export class GameSound {
  private ctx: AudioContext | null = null
  private enabled: boolean

  constructor(enabled: boolean = true) {
    this.enabled = enabled
  }

  setEnabled(val: boolean) { this.enabled = val }

  private getCtx(): AudioContext | null {
    if (!this.enabled) return null
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'sine', volume: number = 0.2, delay: number = 0) {
    const ctx = this.getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    const t = ctx.currentTime + delay
    gain.gain.setValueAtTime(volume, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur)
  }

  private chord(freqs: number[], dur: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    for (let i = 0; i < freqs.length; i++) {
      this.tone(freqs[i], dur, type, volume, i * 0.03)
    }
  }

  private sweep(startFreq: number, endFreq: number, dur: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    const ctx = this.getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + dur)
  }

  place() { this.tone(660, 0.06, 'sine', 0.15) }

  clear() {
    this.tone(880, 0.08, 'sine', 0.2)
    this.tone(1100, 0.06, 'sine', 0.1, 0.04)
  }

  combo() {
    this.tone(1047, 0.12, 'triangle', 0.2)
    this.tone(1319, 0.12, 'triangle', 0.15, 0.06)
    this.tone(1568, 0.18, 'triangle', 0.12, 0.12)
  }

  gameOver() {
    this.tone(392, 0.3, 'sawtooth', 0.12)
    this.tone(330, 0.3, 'sawtooth', 0.1, 0.15)
    this.tone(262, 0.5, 'sawtooth', 0.12, 0.3)
  }

  match3swap() { this.tone(523, 0.05, 'sine', 0.1) }

  match3clear() {
    this.chord([660, 880, 1100], 0.1, 'triangle', 0.15)
  }

  specialCreate() {
    this.chord([1047, 1319, 1568], 0.2, 'sine', 0.12)
  }

  specialLineH() {
    this.sweep(440, 880, 0.3, 'sawtooth', 0.1)
    this.tone(880, 0.2, 'sine', 0.12, 0.1)
  }

  specialLineV() {
    this.sweep(550, 1100, 0.3, 'sawtooth', 0.1)
    this.tone(1100, 0.2, 'sine', 0.12, 0.1)
  }

  specialBomb() {
    this.tone(200, 0.15, 'sawtooth', 0.2)
    this.tone(150, 0.2, 'square', 0.15, 0.05)
    this.tone(100, 0.3, 'sawtooth', 0.1, 0.1)
  }

  specialColorBomb() {
    this.sweep(400, 2000, 0.4, 'sine', 0.12)
    this.chord([1047, 1245, 1397, 1760], 0.3, 'sine', 0.08)
  }

  specialWrapped() {
    this.tone(300, 0.1, 'square', 0.15)
    this.tone(250, 0.15, 'triangle', 0.12, 0.05)
    this.tone(200, 0.2, 'sawtooth', 0.1, 0.1)
  }

  failSwap() { this.tone(200, 0.12, 'square', 0.1) }

  highScore() {
    this.tone(1047, 0.15, 'triangle', 0.2)
    this.tone(1319, 0.15, 'triangle', 0.15, 0.1)
    this.tone(1568, 0.15, 'triangle', 0.12, 0.2)
    this.tone(2093, 0.3, 'triangle', 0.15, 0.3)
  }

  chainBonus(chainLevel: number) {
    const baseFreq = 523 + chainLevel * 100
    this.tone(baseFreq, 0.1, 'triangle', 0.15)
    this.tone(baseFreq + 200, 0.15, 'triangle', 0.12, 0.05)
    this.tone(baseFreq + 400, 0.2, 'triangle', 0.1, 0.1)
  }
}
