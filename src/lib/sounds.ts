'use client';

// Simple sound utility using Web Audio API
class SoundManager {
    private audioContext: AudioContext | null = null;
    private tickBuffer: AudioBuffer | null = null;
    private dingBuffer: AudioBuffer | null = null;

    async init() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create tick sound (short click)
        this.tickBuffer = await this.createTick();
        // Create ding sound (celebration tone)
        this.dingBuffer = await this.createDing();
    }

    private async createTick(): Promise<AudioBuffer> {
        const sampleRate = this.audioContext!.sampleRate;
        const duration = 0.02;
        const buffer = this.audioContext!.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 100);
        }

        return buffer;
    }

    private async createDing(): Promise<AudioBuffer> {
        const sampleRate = this.audioContext!.sampleRate;
        const duration = 0.5;
        const buffer = this.audioContext!.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Layered harmonics for a pleasant ding
            const freq1 = 880;
            const freq2 = 1318.5;
            data[i] = (
                Math.sin(2 * Math.PI * freq1 * t) * 0.5 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.3
            ) * Math.exp(-t * 4);
        }

        return buffer;
    }

    playTick() {
        if (!this.audioContext || !this.tickBuffer) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.tickBuffer;
        source.connect(this.audioContext.destination);
        source.start();
    }

    playDing() {
        if (!this.audioContext || !this.dingBuffer) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.dingBuffer;
        source.connect(this.audioContext.destination);
        source.start();
    }
}

export const soundManager = new SoundManager();
