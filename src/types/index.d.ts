declare module 'matter-js'

declare namespace PHYSIFY {
    interface Constraint {
        pointSelf: number[],
        pointTarget: number[],
        bodyTarget?: object
    }
}

declare namespace PIXI {
    export interface Enchance {
        body: any
        physify(options?: any): void
        bodySet(settings: any, value: any): void
        setForce(position: number[], force: number[]): void
        setVelocity(velocity: number[]): void
        constraint(options: PHYSIFY.Constraint): any
    }
    export interface Sprite extends Enchance { }
    export interface Text extends Enchance { }
    export interface Container extends Enchance { }
    export interface Graphics extends Enchance { }
}

declare module '@amoy/physify' {
    export default function physify(options?: any): (options: any) => any
}