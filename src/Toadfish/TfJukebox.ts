/// <reference path="../XOR/XorSoundSystem.ts" />

namespace TF {
    export class Jukebox {
        tracks = new Map<number, HTMLAudioElement>();
        playTrack = -1;
        public volume = 1;
        private requestedTracks=1
        private loadedTracks=1

        constructor(public ss: XOR.SoundSystem) {}

        get loaded(): boolean {
            return this.loadedTracks == this.requestedTracks;
        }

        get percentLoaded(): number {
            return this.loadedTracks / this.requestedTracks;
        }

        add(index: number, url: string, looping: boolean, logErrors = false): boolean {
            if (index < 0) return false;
            let el = new Audio();
            el.preload = "auto";
            el.src = url;
            if (logErrors) {
                hflog.info("loading " + url);
            }
            let reportUrl = url;
            let self = this;
            this.requestedTracks++;
            el.onloadeddata = (ev) => {          
                self.loadedTracks++;
                hflog.info('loaded '+ reportUrl);
            };
            el.loop = looping;
            this.tracks.set(index, el);
            return true;
        }

        stop() {
            if (this.playTrack < 0) return;
            let el = this.tracks.get(this.playTrack);
            if (!el) return;
            el.pause();
            this.playTrack = -1;
        }

        play(index: number) {
            this.stop();
            if (index < 0) {
                this.playTrack = -1;
                return;
            }
            let el = this.tracks.get(index);
            if (!el) return;
            el.currentTime = 0;
            el.volume = this.volume;
            el.play();
            this.playTrack = index;
        }

        update(timeInSeconds: number) { }

    }
}