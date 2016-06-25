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
