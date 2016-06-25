# ache

```
npm i ache -g
```

## Why?

I was sick and tired of build tools available. I simply want to leverage bash / and shell scripts and add a templating component on top of them using node. Named `ache` because the existing tools are a headache, and it rhymes with `make`, `jake`, `rake`, you get the idea.

## How it works

Add a `achefile.js` to your project.

```js
export let helloWorld = `
echo 'hello world'
`
```

Then run `ache hello-world` and your done.

## Ache Spec

I designed `ache` to inevitably support three distinct syntax types. Providing some versatility.

### Syntax 1

Export values can return a `execString` directly.

```js
export let helloWorld = `
echo 'hello-world'
`
```

### Syntax 2

Export values can return a special ache-specific `Cmd` class, where you can pass a `execString`.

```js
export let helloWorld = new Cmd(`
echo 'hello-world'
`)
```

The benefit here is that you can add optional params to `helloWorld` for instance `helloWorld.usage`.

### Syntax 3

Export values can return that same `Cmd` class, when a function is passed you have access to global data from the root `ache` consumer. This allows the most amount of uniformity between scripts and modularity because you don't need to use globals.

```js
export let echo = new Cmd(({argv}) => `
echo '${argv._[1]}'
`)
```

Another benefit of this approach is that you can preform validation like this.

```js
export let helloWorld = new Cmd(({argv}) => {
  if (argv._[1] !== 'please') throw new Error('ask nicely')
  return `
    echo 'hello-world'
  `
})
```

## Ache Specific

There are unfortunately some reserved sub-commands and flags here's a list and what they do.

* `ache list` lists all the commands in the ache scope
* `ache -C {path-to-directory}` changes the current working directory CWD to a specified path

## Examples

```
examples$ npm i ache -g
/Users/thomasreggi/.nvm/versions/node/v6.2.2/bin/ache -> /Users/thomasreggi/.nvm/versions/node/v6.2.2/lib/node_modules/ache/lib/bin.js
/Users/thomasreggi/.nvm/versions/node/v6.2.2/lib
└── ache@0.0.1

examples$ cd 01_example/
01_example$ ache
01_example$ ache list
[ 'meow-mix' ]
01_example$ ache meow-mix
meow meow meow meow meow meow

01_example$ cd ..
examples$ cd 02_example/
02_example$ ache list
[ 'bar', 'baz', 'foo', 'hello-world' ]
02_example$ ache bar
bar

02_example$ ache hello-world
hello-world

02_example$ cd ..
examples$ cd 03_example/
03_example$ ache list
[ 'bar', 'baz', 'foo', 'hello-world', 'meow-mix' ]
03_example$ ache hello-world
hello-world

03_example$
```
