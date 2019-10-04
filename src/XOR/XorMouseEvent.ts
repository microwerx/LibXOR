/// <reference path="../GTE/GTE.ts" />

class XORMouseEvent {
    constructor(
        public button = 0,
        public clicks = 0,
        public buttons = 0,
        public position = Vector2.make(0, 0),
        public screen = Vector2.make(0, 0),
        public delta = Vector2.make(0, 0),
        public ctrlKey = false,
        public altKey = false,
        public shiftKey = false,
        public metaKey = false
    ) { }

    copyMouseEvent(e: MouseEvent) {
        this.delta.x = e.offsetX - this.position.x;
        this.delta.y = e.offsetY - this.position.y;
        this.position.x = e.offsetX;
        this.position.y = e.offsetY;
        this.screen.x = e.screenX;
        this.screen.y = e.screenY;
        this.buttons = e.buttons;
        this.button = e.button;
        this.clicks = e.detail;
        this.ctrlKey = e.ctrlKey;
        this.altKey = e.altKey;
        this.shiftKey = e.shiftKey;
        this.metaKey = e.metaKey;
    }
}
