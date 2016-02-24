Bu.js
=====

A JavaScript 2D graphics library based on HTML5 Canvas

![](logo.png)

[Demos](http://jarvisniu.com/Bu.js/) -
[Guides](https://github.com/jarvisniu/Bu.js/wiki/Guides) -
[API](https://github.com/jarvisniu/Bu.js/wiki/API)

## Features

- Easy-to-use API
- Rich shape types and geometry algorithm
- High-definition screen supported
- Modularization design make it easy to customise and extend


## Prerequisites

1. [Node](https://nodejs.org/)
2. CoffeeScript: `npm install -g coffee-script`
3. UglifyJS: `npm install -g uglify-js`
4. Jade: `npm install -g jade`
5. Stylus: `npm install -g stylus`


## How to use

Run the examples:

- Use command `npm run examples` or `node tools/run-examples.js`

Build the lib file:

- Use command `npm run build` or `node tools/build.js`


## Code Layout

- `build/` - Built `bu.coffee`, `bu.js` and `bu.min.js` lib file
- `examples/` - Examples using this lib
    - `js/` - 3rd lib
    - `lib/` - Extension code of this lib
        - `a-star/` - A* algorithm
        - `morph/` - Morph algorithm
        - `reactor/` - Deal with the logic of mouse/keyboard input
    - `style/` - Example style
    - `texture/` - Bitmap images used in the examples
    - `vue/` - Vue.js single-file components used in some examples
    - `index.jade(html)` - Entry file of examples
- `src/` - Source code of this lib
    - `core/` - Core components
    - `math/` - Math related stuff like vector and matrix
    - `shapes/` - Shape representation and geometry computation algorithm
    - `drawable/` - Other thing like Image, Text etc. that can be displayed on the screen
    - `renderer/` - Render the shapes to the screen
    - `extra/` - Utils components
    - `Bu.coffee(js)` - Namespace, constants, util functions and polyfills
    - `Bu.dev.coffee(js)` - Dev edition of this lib
- `tools/` - Util tools for this project
    - `concat-tool/` - Node concat tool
    - `build.js` - Node script for build this lib
    - `build-examples.js` - Node script for build the examples
    - `clean.js` - Clean all the output files like `js`, `html` and `css`


## Credits

- **Node.js** for JavaScript runtime
- **CoffeeScript** for elegant grammar
- **Jade** for elegant HTML
- **Stylus** for enhancement of CSS
- **UglifyJS** for JavaScript code minifying
- **Three.js** for inspirations and API style


## License

MIT
