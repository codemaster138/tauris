---
title: 'Example'
description: 'A simple example of how to use Tauris'
---

A simple example to get you up and running:
```js
const { Command } = require('tauris');

const argv = new Command('example')
  .describe('example command')
  .option('v', {
    alias: [ 'version' ],
    description: 'Display the version number',
    type: 'boolean'
  })
  .demandArgument()
  .parse(process.argv.slice(2));

if (argv) { // `argv` is `false` when a subcommand is invoked
  if (argv.v) console.log('version 1.0.0');
}
```
![demo image](/assets/demo/example.png)
<p align="right"><a href="/api">API Reference ➜</a></p>