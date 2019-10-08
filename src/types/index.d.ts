declare module 'matter-js'

declare namespace PIXI {
    export interface Enchance {
        physify(options: any): void
    }
    export interface Sprite extends Enchance { }
    export interface Text extends Enchance { }
    export interface Container extends Enchance { }
    export interface Graphics extends Enchance { }
}

declare module '@amoy/physify' {
    export default function physify(options: any): void
}