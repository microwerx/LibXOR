/// <reference path="LibXOR.ts" />

namespace XOR {
    export class Trigger {
        public triggerTime = 0;
        public triggered_ = false;

        /**
         * TriggerTool(resetTime)
         * @param {number} resetTime How often the timer should be allowed to trigger
         */
        constructor(public resetTime = 0) {
            this.resetTime = resetTime || 0;
            this.triggerTime = 0;
            this.triggered_ = false;
        }

        /**
         * triggered() returns 1 if trigger went off and resets it
         */
        get triggered(): boolean { let t = this.triggered_; this.triggered_ = false; return t; }

        /**
         * wait(t1) sets the new trigger time. It does not reset the trigger
         * @param {number} t1 Sets the new trigger time
         */
        wait(t1: number): void {
            this.triggerTime = t1 + this.resetTime;
        }

        /**
         * tick(t1) returns true if the trigger went off and resets the timer
         * @param {number} t1 Time in seconds
         */
        tick(t1: number): boolean {
            this.update(t1)
            let result = false;
            if (this.triggered) {
                result = true;
                this.wait(t1);
            }
            return result;
        }

        /**
         * update(t1) 
         * @param {number} t1 Time in seconds
         */
        update(t1: number): void {
            this.triggered_ = t1 > this.triggerTime;
        }
    }
}