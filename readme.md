# Plain Static

A simple static site generator. For those times that you don't need streams or pipes or plugins... you just need a site built quickly.

Currently only works with Markdown, Mustache, and Less.

## Install

`npm install plain-static --save-dev`

## Use

```js
// Options
var opts = {};
// Require and init
var plainStatic = require('plain-static')(opts);

// Build all the things!
plainStatic();
```

### Options

- `opts.src` Build source path. Default is `src`.
- `opts.dest` Build destination path. Default is `dist`.
- `opts.appRoot` Root path. Default is the current working directory.

### Templates

A `JSON` file is parsed and stored in the main data object. The data is mostly left untouched except when it discovers a `markdown` property. Every parsed object is stored in the main object using the file name.

**Markdown property**

The markdown property should be a file name that can be found in the defined source directory. You'll get a nasty error during build if it's not there!

So, if the object looks like:

```json
{
  "title": "hello!",
  "markdown": "index.md"
}
```

The parsed object will look like...

```js
{
  title: "hello!",
  content: 'MARKDOWN PARSED INTO HTML'
}
```

The Markdown file is processed using the data object. The markdown property is stripped from the object. The tool will also do a deep check for nested `markdown` properties.

**Data storage**

If the source directory looks like this:

- src
 - index.json
 - about.json
 - index.mustache

The resulting data object would look like:

```
data: {
  index: {},
  about: {}
}
```

Although, when the tool attempts to build the templates, it will never use the `about` property since there is no `about` template.

## Contact

[Juan Orozco](https://twitter.com/guamaso)

## License
