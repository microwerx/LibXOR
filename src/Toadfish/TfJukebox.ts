/// <reference path="../XOR/XorSoundSystem.ts" />

namespace TF {
    export class Jukebox {
        tracks = new Map<number, HTMLAudioElement>();
        playTrack = -1;

        constructor(public ss: XOR.SoundSystem) {

        }

        add(index: number, url: string, looping: boolean): boolean {
            let el = new Audio();
            el.preload = "auto";
            el.src = url;
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
            let el = this.tracks.get(index);
            if (!el) return;
            el.play();
            this.playTrack = index;
        }

        update(timeInSeconds: number) { }

    }
}