/// <reference path="LibXOR.ts" />
/// <reference path="../Toadfish/TfSampler.ts" />

namespace XOR {
    export class SoundSystem {
        sampler = new TF.Sampler(this);
        context_: AudioContext;
        private masterVolume: GainNode;

        constructor(private xor: LibXOR) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.context_ = new AudioContext();
                this.masterVolume = this.context_.createGain();
            }
            catch (e) {
                hflog.error('Web Audio API not supported')
            }
        }

        get context(): AudioContext | null { return this.context_; }

        init() {
            if (!this.context_) return;
            this.masterVolume = this.context_.createGain();
            this.masterVolume.connect(this.context_.destination);
            this.masterVolume.gain.value = 0.5;
        }

        get volume(): number { if (!this.context_) return 0; return this.masterVolume.gain.value; }
        set volume(v: number) { if (!this.context_) return; this.masterVolume.gain.value = GTE.clamp(v, 0.0, 1.0); }
        get gainNode(): GainNode { return this.masterVolume; }
    }
}
