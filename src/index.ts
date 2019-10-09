import { Ticker } from 'pixi.js'
import { World, Bodies, Engine } from 'matter-js'

export default function physify(options: any = {}) {
    const { gravity = { x: 0, y: .98 } } = options
    const things: any[] = []
    const engine = Engine.create()
    engine.world.gravity = gravity
    Engine.run(engine)

    return function ({ Sprite, Text, Graphics, Container }: any) {
        const components = [Sprite, Text, Graphics, Container]
        components.map((component) => {
            component.prototype.physify = function physify(options: any) {
                if ([Sprite, Text].includes(component)) {
                    this.anchor.set(.5)
                    this.x += this.width / 2
                    this.y += this.height / 2
                }
                if ([Graphics].includes(component)) {
                    this.x += this.width / 2
                    this.y += this.height / 2
                }
                const { shape = 'rect', ...rest } = options
                const createBody = (shape: 'circle' | 'rect') => {
                    if (shape === 'circle') {
                        return Bodies.circle(this.x, this.y, this.width / 2, rest)
                    } else {
                        return Bodies.rectangle(this.x, this.y, this.width, this.height, rest)
                    }
                }
                const body = createBody(shape)
                if (this.parent) {
                    World.add(engine.world, [body])
                    things.push({
                        body,
                        sprite: this,
                    })
                }
                return body
            }
        })

        Ticker.shared.add(() => {
            things.map(({ body, sprite }) => {
                if (body.render.visible) {
                    const { position: { x, y }, angle } = body

                    sprite.rotation = angle

                    if (!sprite.anchor) {
                        sprite.x = x - sprite.width / 2
                        sprite.y = y - sprite.height / 2
                    } else {
                        sprite.x = x
                        sprite.y = y
                    }
                }
            })
        })
    }
}
 