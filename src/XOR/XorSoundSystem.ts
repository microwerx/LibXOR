/// <reference path="LibXOR.ts" />
/// <reference path="../Toadfish/TfSampler.ts" />
/// <reference path="../Toadfish/TfJukebox.ts" />

interface Window {
    AudioContext: AudioContext;
    webkitAudioContext: AudioContext;
}

namespace XOR {
    export class SoundSystem {
        sampler = new TF.Sampler(this);
        jukebox = new TF.Jukebox(this);
        private context_!: AudioContext;
        private masterVolume!: GainNode;
        private enabled_ = false;

        constructor(private xor: LibXOR) {
            try {
                window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                this.context_ = new AudioContext();
                this.masterVolume = this.context_.createGain();
                this.enabled_ = true;
            }
            catch (e) {
                hflog.error('Web Audio API not supported')
            }
        }

        get enabled(): boolean { return this.enabled_; }
        get disabled(): boolean { return !this.enabled_; }
        get context(): AudioContext | null { return this.context_; }

        init() {
            if (!this.enabled) return;
            this.masterVolume = this.context_.createGain();
            this.masterVolume.connect(this.context_.destination);
            this.masterVolume.gain.value = 0.5;
            hflog.info("audio initted");
        }

        get volume(): number { if (!this.enabled) return 0; return this.masterVolume.gain.value; }
        set volume(v: number) { if (!this.enabled) return; this.masterVolume.gain.value = GTE.clamp(v, 0.0, 1.0); }
        get gainNode(): GainNode { return this.masterVolume; }

        update() {
            this.sampler.update(this.xor.t1);
            this.jukebox.update(this.xor.t1);
        }
    }
}
