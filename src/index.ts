import { Ticker, Graphics, Sprite, Container } from 'pixi.js'
import { World, Body, Bodies, Engine, Render, Constraint } from 'matter-js'

export * from 'matter-js'
export const things: any[] = []
export const engine = Engine.create()

export function setGravity({ x, y }: { x: number, y: number }) {
    engine.world.gravity.x = x || 0
    engine.world.gravity.y = y || 0
}

export function createUI(body: any, image?: string) {
    const { position: { x, y }, circleRadius, label } = body
    const isCircle = label === 'Circle Body'
    const ui = image && typeof image === 'string' ? Sprite.from(image) : createGraphics(x, y, circleRadius * 2, circleRadius * 2, isCircle ? circleRadius : 0)
    if (ui.pivot) {
        ui.pivot.x = ui.width / 2
        ui.pivot.y = ui.height / 2
    }
    things.push({
        body,
        sprite: ui,
    })
    return ui
}

function createGraphics(x: number, y: number, width: number, height: number, radius: number = 0, color: number = 0xffffff) {
    const graphic = new Graphics()
    graphic.beginFill(color)
    graphic.drawRoundedRect(0, 0, width, height, radius)
    graphic.endFill()
    graphic.x = x
    graphic.y = y
    return graphic
}

const netContainer = new Container()
export function renderCloth(cloth: any) {
    netContainer.removeChildren()
    const lines = cloth.constraints.map((constraint: any) => {
        const { bodyA: { position: positionA }, bodyB: { position: positionB } } = constraint
        return drawLine(positionA, positionB)
    })
    netContainer.addChild(...lines)
    return netContainer
}

function drawLine(pointA: any, pointB: any) {
    const line = new Graphics()
    line.lineStyle(1, 0xffffff, 1)
    line.moveTo(pointA.x, pointA.y)
    line.lineTo(pointB.x, pointB.y)
    return line
}

export default function physify(options: any = {}) {
    const {
        gravity = { x: 0, y: .98 },
        renderer = false,
    } = options

    setGravity(gravity)

    Engine.run(engine)

    if (renderer) {
        Render.run(Render.create({
            element: document.body,
            engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                showAngleIndicator: true,
            },
        }))
    }

    Ticker.shared.add(() => {
        things.map(({ body, sprite }) => {
            if (body.render.visible) {
                const { position: { x, y }, angle } = body

                sprite.rotation = angle

                sprite.x = x
                sprite.y = y
            }
        })
    })

    return ({ Sprite, Text, Graphics, Container }: any) => {
        const components = [Sprite, Text, Graphics, Container]
        components.map((component) => {
            component.prototype.physify = function physify(options: any = {}) {
                if ([Sprite, Text].includes(component)) {
                    this.anchor.set(.5)
                }
                if ([Graphics].includes(component)) {
                    this.pivot.x = this.width / 2
                    this.pivot.y = this.height / 2
                }
                this.x += this.width / 2
                this.y += this.height / 2
                const { shape = 'rect', ...rest } = options
                const createBody = (shape: 'circle' | 'rect') => {
                    if (shape === 'circle') {
                        return Bodies.circle(this.x, this.y, this.width / 2, rest)
                    } else {
                        return Bodies.rectangle(this.x, this.y, this.width, this.height, rest)
                    }
                }
                this.body = createBody(shape)
                if (this.parent) {
                    World.add(engine.world, [this.body])
                    things.push({
                        body: this.body,
                        sprite: this,
                    })
                }
                return this.body
            }

            component.prototype.bodySet = function bodySet(settings: any, value: any) {
                Body.set(this.body, settings, value)
            }
            component.prototype.setForce = function force(position: number[] = [0, 0], force: number[] = [0, 0]) {
                Body.applyForce(this.body, {
                    x: position[0],
                    y: position[1],
                }, {
                    x: force[0],
                    y: force[1],
                })
            }
            component.prototype.setVelocity = function velocity(velocity: number[] = [0, 0]) {
                Body.setVelocity(this.body, {
                    x: velocity[0],
                    y: velocity[1],
                })
            }
            component.prototype.constraint = function constraint({ pointSelf = [0, 0], pointTarget = [0, 0] }: any) {
                World.add(engine.world, [
                    Constraint.create({
                        bodyA: this.body,
                        pointA: {
                            x: pointSelf[0],
                            y: pointSelf[1],
                        },
                        pointB: {
                            x: pointTarget[0],
                            y: pointTarget[1],
                        },
                    }),
                ])
            }
        })
    }
}
