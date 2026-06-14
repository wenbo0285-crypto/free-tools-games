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

  private beep(freq: number, dur: number, type: OscillatorType = 'square') {
    const ctx = this.getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + dur)
  }

  place() { this.beep(523, 0.08) }
  clear() { this.beep(659, 0.12) }
  combo() { this.beep(784, 0.18, 'triangle') }
  gameOver() { this.beep(262, 0.4, 'sawtooth') }
  match3swap() { this.beep(440, 0.06) }
  match3clear() { this.beep(660, 0.1, 'triangle') }
}
