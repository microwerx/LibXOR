/// <reference path="LibXOR.ts" />
/// <reference path="../Toadfish/TfSampler.ts" />

namespace XOR
{
    export class SoundSystem {
        sampler = new TF.Sampler(this);
        context = new AudioContext();
        private masterVolume = this.context.createGain();

        constructor(private xor: LibXOR) {
            // let self = this;
            // window.addEventListener("load", (e) => {
            //     self.context = new AudioContext();
            // }, false);
        }
    
        init() {
            this.masterVolume.connect(this.context.destination);
            this.masterVolume.gain.value = 0.5;
        }

        get volume(): number { return this.masterVolume.gain.value; }
        set volume(v: number) { this.masterVolume.gain.value = GTE.clamp(v, 0.0, 1.0); }
        get gainNode(): GainNode { return this.masterVolume; }
    }    
}
