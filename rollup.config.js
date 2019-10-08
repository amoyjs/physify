import alias from 'rollup-plugin-alias'
import minify from 'rollup-plugin-babel-minify'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'

const isProd = process.env.NODE_ENV === 'production'
const { moduleName, name: fileName } = require('./package.json')
const getFilePath = (type = '') => `dist/${fileName}${type == '' ? '' : '.'}${type}.js`
const output = options => ({
    name: moduleName,
    sourcemap: true,
    ...options,
    globals: {
        'matter-js': 'MatterJS',
        'pixi.js': 'PIXI',
    },
})

const configure = {
    input: 'src/index.ts',
    output: [output({
        file: getFilePath(),
        format: 'umd',
    }), output({
        file: getFilePath('es'),
        format: 'es',
    })],
    plugins: [
        alias({
            common: './common',
        }),
        typescript(),
        commonjs({
            namedExports: {
                'matter-js': ['Engine', 'Bodies', 'World'],
            },
        }),
        resolve(),
    ],
    external: ['pixi.js'],
}

if (isProd) {
    configure.output = configure.output.map(output => {
        const format = output.format == 'umd' ? '' : `.${output.format}`
        output.file = `dist/${fileName}${format}.min.js`
        return output
    })
    configure.plugins.push(minify())
}

module.exports = configure
