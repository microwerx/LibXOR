/// <reference path="../XOR/XorSoundSystem.ts" />

namespace TF {
    export class DAHDSREnvelope {
        constructor(
            public delay: number = 0.0,    // delay to start
            public delayCV: number = 0.0,  // level at start
            public attack: number = 0.0,   // how long to ramp from 0 to 1
            public attackCV: number = 1.0, // Highest level (normally 1)
            public hold: number = 10.0,     // how long to hold signal at highest amplitude
            public decay: number = 0.0,    // how long to ramp from 1 to sustain
            public sustainCV: number = 1.0,  // level of the sustain
            public release: number = 0.0,  // how long to ramp from sustain to 0
            public releaseCV: number = 0.0 // lowest level of ramp (normally 0)
        ) { }
    }

    export class AttackReleaseEnvelope {
        constructor(
            public delay: number = 0.0,
            public attack: number = 0.0,
            public attackCV: number = 1.0,
            public hold: number = 0.0,
            public release: number = 0.0,
            public releaseCV: number = 0.0
        ) { }
    }

    export class SimpleSamplerPlaySettings {
        constructor(
            public VCFfrequency1 = 1000.0,
            public VCFfrequency2 = 1000.0,
            public VCFsweepTime = 1.0,
            public VCFresonance = 500.0,
            public VCAattack = 0.0,
            public VCAhold = 1.0,
            public VCArelease = 1.0,
            public sampleLoop = true
        ) {}
    }

    export class Sample {
        private VCF: BiquadFilterNode | null = null;
        private VCA: GainNode | null = null;
        public VCAenvelope = new DAHDSREnvelope();
        public VCOenvelope = new DAHDSREnvelope();
        public VCFenvelope = new DAHDSREnvelope();
        public VCFresonance = 1.0;

        constructor(
            public buffer: AudioBuffer | null = null,
            public loaded = false,
            public haderror = false) {
                this.VCFenvelope.attack = 1;
                this.VCFenvelope.decay = 1;
                this.VCFenvelope.release = 1;
                this.VCFenvelope.sustainCV = 0.5;
            }

        play(ss: XOR.SoundSystem, time: number = 0) {
            if (!ss.enabled) return;
            let t = ss.context_.currentTime;
            let source = ss.context_.createBufferSource();
            let VCF = ss.context_.createBiquadFilter();
            let VCA = ss.context_.createGain();

            source.buffer = this.buffer;
            source.loop = true;
            source.connect(VCF);
            VCF.connect(ss.gainNode);
            // source.connect(ss.gainNode);
            // source.connect(VCF);
            // VCF.connect(VCA);
            // VCA.connect(ss.gainNode);

            let detune1 = 8;
            let detune2 = 1;
            let detuneTime = 2;
            source.playbackRate.setValueAtTime(detune1, t);
            source.playbackRate.linearRampToValueAtTime(detune2, t+detuneTime);

            let to = setTimeout(() => {
                source.stop();
            }, detuneTime * 1000);

            VCF.type = 'lowpass';
            VCF.frequency.value = 1440.0;
            VCF.Q.value = 10.0;//100.0;//this.VCFresonance;

            let vcfEnv = this.VCFenvelope;
            vcfEnv.delayCV = 0.0;
            vcfEnv.attack = 1.0;
            vcfEnv.attackCV = 1200.0;
            vcfEnv.hold = 0.0;
            vcfEnv.release = 1.0;
            vcfEnv.releaseCV = 0.0;

            VCF.frequency.setValueAtTime(vcfEnv.delayCV, t);
            t += vcfEnv.delay;
            VCF.frequency.setValueAtTime(vcfEnv.delayCV, t);
            t += vcfEnv.attack;
            VCF.frequency.linearRampToValueAtTime(vcfEnv.attackCV, t);
            t += vcfEnv.hold;
            VCF.frequency.linearRampToValueAtTime(vcfEnv.attackCV, t);
            t += vcfEnv.release;
            VCF.frequency.linearRampToValueAtTime(vcfEnv.releaseCV, t);

            let vcaEnv = this.VCAenvelope;
            t = ss.context_.currentTime;
            VCA.gain.setValueAtTime(this.VCAenvelope.delayCV, t);
            t += vcaEnv.delay;
            VCA.gain.setValueAtTime(this.VCAenvelope.delayCV, t);
            t += vcaEnv.attack;
            VCA.gain.linearRampToValueAtTime(vcaEnv.attackCV, t);
            t += vcaEnv.hold;
            VCA.gain.setValueAtTime(vcaEnv.attackCV, t);
            t += vcaEnv.decay;
            VCA.gain.linearRampToValueAtTime(vcaEnv.sustainCV, t);
            t += vcaEnv.release;
            VCA.gain.linearRampToValueAtTime(vcaEnv.releaseCV, t);

            // configure envelopes

            source.start(time);

            this.VCA = VCA;
            this.VCF = VCF;
        }
    }

    export class Sampler {
        samples = new Map<number, Sample>();

        constructor(private ss: XOR.SoundSystem) {

        }

        loadSample(id: number, url: string, logErrors = true) {
            let self = this;
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
                self.ss.context_.decodeAudioData(xhr.response, (buffer) => {
                    // on success
                    let s = new Sample(buffer, true, false);
                    self.samples.set(id, s);
                    if (logErrors) hflog.info('loaded ', url);
                }, () => {
                    // on error
                    let s = new Sample(null, false, true);
                    self.samples.set(id, s);
                    if (logErrors) hflog.info('failed to load ', url);
                })
            }
            xhr.onabort = () => {
                if (logErrors) hflog.error('Could not load ', url);
                self.samples.set(id, new Sample(null, false, true));
            }
            xhr.onerror = () => {
                if (logErrors) hflog.error('Could not load ', url);
                self.samples.set(id, new Sample(null, false, true));
            }
            this.samples.set(id, new Sample());
            xhr.send();
        }

        playSample(id: number, time: number = 0) {            
            let s = this.samples.get(id);
            if (!s) return;
            s.play(this.ss, time);
        }
    }
}
