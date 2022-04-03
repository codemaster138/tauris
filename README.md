<div align="center">
<h3>Tauris</h1>
<p><b>Better Node.js CLIs</b></p>
<p>
<img alt="npm" src="https://img.shields.io/npm/v/tauris?color=red&style=for-the-badge">
<img alt="NPM" src="https://img.shields.io/npm/l/tauris?color=orange&style=for-the-badge">
<img alt="npm" src="https://img.shields.io/npm/dt/tauris?color=yellow&style=for-the-badge">
<img alt="GitHub issues" src="https://img.shields.io/github/issues/codemaster138/tauris?color=green&style=for-the-badge">
</p>
<p>Built with ❤️ by <a href="https://github.com/codemaster138">@codemaster138</a></p>
</div>

![Tauris demonstrated in a terminal](/assets/cover.png)

---

# Table of contents

- [Quickstart](#-quickstart)
- [Features](#-features)
- [Installation](#-installation)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

# ⚡️ Quickstart

```js
import { Command } from "tauris";

const mycommand = new Command("mycommand")
  .option("v", {
    alias: "version",
    description: "Display the version number",
    type: "boolean",
  })
  .demandArgument();

const options = mycommand.parse(process.argv.slice(2));

if (options?.v) console.log("versin 1.0.0");
```

# 🎨 Features

- 🍃 Lightweight: Weighs in just under `7.5kb`
- ⚡️ Typescript Compatible: Provides typings out of the box
- ✨ Clean User Interface: Render friendly, scannable help menus

# 🚀 Installation

```bash
$ npm i tauris # or: yarn add tauris
```

# 🧑‍💻 API Reference

## `new Command(name: string)`

Creates a new command or subcommand:

```js
import { Command } from "tauris";

const mycommand = new Command("mycommand");
```

### Configuring Commands

A command can be configured with its "configuration methods" (`.usage`, `.describe`, `.option`, etc.). These methods will apply a configuration change to the command and then return the command they were called on to allow chaining them together. For example:

```js
mycommand.describe("Description").usage("mycommand <subcommand>");
```

will first add a description, then set the usage string, and then return the command.

### Basic Configuration

- You can override the usage string using `.usage(usage: string)`.
- You can give your command a description using `.description(description: string)` (This description will be displayed in the help menu of the parent command, so if your command is not a subcommand, this option isn't useful.).
- `.header(header: string)` adds a string that displays above the help message.

### Options

You can add an option to a command using `.option(nams: string[, options: CLIOptionOptions])`:

```js
mycommand.option(
  // Option name. If you want your option to have a short and long name, like
  // "-v" and "--version", use the short one here and make the longer one an
  // alias.
  "v",
  {
    // A single alias or list of alias names for the option
    alias: "version",
    // A short description to display in the help menu
    description: "Display version number",
    // Data type of the option (defaults to 'text')
    type: "boolean",
  }
);
```

The optional `type` option allows you to set one of three data types for your option: `boolean`, `number` or `text` (default is `text`). These will treat the given value differently:

- Boolean will treat the option as a flag which is `true` if the option is present and `false` if it isn't, therefore

### Root Options

If you need a command to pass options down to its subcommands, use `.rootOption`. This method takes the same arguments as `.option`. By using `.clearRoot([names: string | string[]])`, you can remove root options from a subcommand and its subcommands:

```js
// Now, `mysubcommand` no longer has the `-s` root option, but other
// subcommands still do:
mysubcommand.clearRoot("s");
```

### Subcommands

You can add any command as a subcommand by running `parentCommand.command(subcommand)` (This adds `subcommand` as a subcommand of `parentCommand`).

> **Note**: Setting a command as a subcommand mutates said subcommand. Therefore, the same subcommand instance cannot be added as a subcommand to multiple different commands. **Use `command.copy()` to create a copy of the command in order to set multiple subcommands.**

You can get any command's parent command using `command.parent` or the root command using `.root()` (In `git remote add origin`, `add` is the deepest subcommand, its parent is `remote` and the root command is `git`. Note that the root command is always the same no matter what command we start at (`git.root() === remote.root() === add.root() === git`)).

**Every subcommand needs a handler:** The handler is the code that runs when the subcommand is invoked. You can add the handler using `.handler(async function handler(args) {})`:

```js
mysubcommand.handler(async function (args) {
  console.log("You ran `mysubcommand`!");
});
```

Inside the handler function, `this` is the command the handler was applied to (remember: [this doesn't work in arrow functions](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-runtime-semantics-instantiatearrowfunctionexpression)!) and `args` are all the options passed to the subcommand. Note that tauris only invokes the handler of the deepest subcommand, i.e. if the command `rootcommand` has a subcommand `foo` that has a sub-subcommand `bar` and the user runs `rootcommand foo bar`, only the handler for `bar` will be invoked.

Note that handlers _may_ be asynchronous, but they don't have to.

### Exiting from subcommands

When writing CLIs, it's often useful to be able to exit prematurely from a program or control the exit code it returns. For this, the `process.exit()` function is commonly used. However, this approach has its issues: We can only call `.parse()` once, then the handler _may_ force the program to exit, but there's no way to know for sure.

Instead, when you need to exit, simply return the desired exit code from your handler. Usually, this will immediately cause your program to exit, but it can also be surpressed by passing `noExit: true` to `.parse` (see [parsing arguments](#parsing–arguments)).

### The Help Menu

- `.demandArgument()` – Show the help menu if the command is called without arguments
- `.noHelp()` – Disable the help menu entirely

#### Internationalisation

The help menu (see screenshot at top) contains some template text like `"Usage:"` and `"Options:"`, which is in english by default. If your tool is intended for users more familiar with another language, you can use the `.language()` method:

```js
// Apply german translation
mycommand.language({
  "Usage:": "Nutzung:",
  "Commands:": "Befehle:",
  "Root Options:": "Root-Optionen:",
  "Options:": "Optionen:",
  "Display this help message": "Diese Hilfsinformationen anzeigen",
});
```

For a different language, simply replace the strings on the right with the correct translation for the desired language. The language is passed down to all subcommands.

### Parsing arguments

Once you've used the above methods to describe your command, run `.parse()` to parse command line arguments:

```js
const command = new Command("command")
	.option('v', {alias: 'version', type: 'boolean', description: ''});
	.option('o', {alias: 'output', type: 'text', description: ''});

command.parse([]);
command.parse(['-v']); 											// { v: true }
command.parse(['--version']); 							// { v: true }
command.parse(['-o']); 											// { o: undefined }
command.parse(['-o', 'output.txt']); 				// { o: 'output.txt' }
command.parse(['--output', 'output.txt']); 	// { o: 'output.txt' }

// Parse arguments from `argv`
command.parse(process.argv.slice(2));
```

To parse the arguments given to the script when it was run, use `.parse(process.argv.slice(2))` rather than `.parse(process.argv)`. This is because process argv always begins with the path to the nodejs binary running the script, then the path to the script, and only after that the actual arguments.

If, while parsing the arguments, tauris detects that a subcommand is being invoked, it will automatically invoke the subcommand's handler and return a promise that resolves to the subcommand's exit code once the handler is done. If tauris detects invalid input, it will return false.

The `.parse` method additionally takes an `options` argument:

```js
command.parse([], {
	noExit: true,
	noPromise: true
})
```

Set `noExit` to make the `exit` method a no-op (see [exiting from subcommands](#exiting-from-subcommands)) and instead return the exit code (if a subcommand is invoked).

Set `noPromise` to return false and let the handler run in the background rather than returning a promise (if a subcommand is invoked)

# 🛸 Contributing

You can contribute to `tauris` in many ways like creating new features, fixing buges and improving documentation or examples. [Find more information in CONTRIBUTING.md](/CONTRIBUTING.md)

# ⚖️ License

<p align="center">Copyright © 2020-present – John Sarjeant</p>
<p align="center"><img alt="MIT license" src="https://img.shields.io/badge/license-mit-orange?style=for-the-badge"/></p>
