declare module 'typewriter-effect/dist/core' {
  export default class Typewriter {
    constructor(element: HTMLElement, options?: Record<string, unknown>);
    typeString(text: string): Typewriter;
    deleteAll(speed?: number): Typewriter;
    pauseFor(ms: number): Typewriter;
    callFunction(cb: () => void): Typewriter;
    start(): Typewriter;
    stop(): Typewriter;
  }
}
