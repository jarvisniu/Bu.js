import coffeescript from 'rollup-plugin-coffee-script'
import babel from 'rollup-plugin-babel'

import pkg from './package.json'

export default {
	input: 'src/index.coffee',
	output: {
		file: 'build/bu.js',
		format: 'iife',
		name: 'Bu',
		sourcemap: true,
		banner: '// Bu.js v' + pkg.version + ' - https://github.com/jarvisniu/Bu.js\n',
	},
	plugins: [
		coffeescript(),
		babel({babelrc: false, presets: ['es2015-rollup']}),
	],
}
