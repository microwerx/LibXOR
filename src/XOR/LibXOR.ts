import { MemorySystem } from './MemorySystem'
import { GraphicsSystem } from './GraphicsSystem'

export module LibXOR {
    export class LibXORInstance {
        public Memory = new MemorySystem();
        public Graphics = new GraphicsSystem(this.Memory);
        public Sound = new GraphicsSystem(this.Memory);
        public Input = new GraphicsSystem(this.Memory);
    }
}