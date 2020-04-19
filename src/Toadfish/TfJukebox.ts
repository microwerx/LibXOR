/// <reference path="../XOR/XorSoundSystem.ts" />

namespace TF {
    export class Jukebox {
        tracks = new Map<number, HTMLAudioElement>();
        playTrack = -1;
        volume = 1;

        constructor(public ss: XOR.SoundSystem) {

        }

        add(index: number, url: string, looping: boolean, logErrors = false): boolean {
            if (index < 0) return false;
            let el = new Audio();
            el.preload = "auto";
            el.src = url;
            if (logErrors) {
                hflog.info("loading " + url);
            }
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