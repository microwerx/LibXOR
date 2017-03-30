module XOR
{
    export enum SpriteInstanceState
    {
        Hidden,
        Visible,
    }

    export class SpriteInstance
    {
        public x: number = 0
        public y: number = 0
        public state: SpriteInstanceState = SpriteInstanceState.Hidden
    };

    export class Sprite {

        private images: HTMLImageElement[]
        public Instances: SpriteInstance[]

        constructor()
        {

        }
    }
}