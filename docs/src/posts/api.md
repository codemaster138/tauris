---
title: 'API Reference'
description: "A reference to Tauris' API"
---

## Class `Command(name: string[, options: CommandOptions])`
The class `Command` is used for both subcommands and your top-level command. The method `parse` takes in `argv` without the binary path and file path (e.g. process.argv[2]). The command's other methods are used to configure it:
<br/>

### Command.option
The method `Command.option(name: string[, options: CLIOptionOptions])` configures a new option on the command. The *optional* `options` argument has three properties:
- `alias: string[]` An **array** of aliases
- `description: string` A description to be shown in the help message
- `type: 'text' | 'number' | 'boolean'` Option type
  - `text` The following text will be set as the option value
  - `number` Like `text`, but ignored when the value is non-numeric
  - `boolean` The following value is not counted as part of the option. When the option is set as a flag, it's value will be `true`, else `undefined`.

Returns the command it was invoked on.
<br/>

### Command.rootOption
The method `Command.rootOption(name: string[, options: CLIOptionOptions])` works exactly like `Command.option`, except that the option is passed down to all subcommands.

Returns the command it was invoked on.
<br/>

### Command.clearRoot
The method `Command.clearRoot([names: string | string[]])` deletes all root options that were passed on to it. If `names` is provided, only the options whose names were passed to `clearRoot` will be deleted. This also applies to all subcommands.

Returns the command it was invoked on.
<br/>

### Command.describe
The method `Command.describe(message: string)` adds a description to the command. This will be displayed in the help message *if the command is a subcommand*.

Returns the command it was invoked on.
<br/>

### Command.command
The method `Command.command(command: Command)` adds a **subcommand** (!!) to the Command. This subcommand is simply another instance of the `Command` class.

Returns the command it was invoked on.
<br/>

### Command.handler
When the `Command` is intended to be used as a **subcommand**, call this method to add a handler that will be called when the subcommand is invoked.

Signature: `Command.handler(((argv: { [key: string]: any }) => void)): Command`

Returns the command it was invoked on.
<br/>

### Command.demandArgument
Call this method to enforce that at least one option *or* subcommand *or* parameter must be passed and otherwise show a help message.

Returns the command it was invoked on.
<br/>

### Command.header
A message displayed above the help message.

Signature: `Command.header(message: string): Command`

Returns the command it was invoked on.
<br/>

### Command.usage
Override the usage message.

Signature: `Command.usage(message: string): Command`

Return the command it was invoked on.
<br/>

### Command.noHelp
Disable the help message.

Signature: `Command.usage(): Command`

Returns the command it was invoked on.
<br/>

### Command.parse
The method `parse` takes in `argv` without the binary path and file path.

<br/>

Signature: `Command.parse(argv: string[]): { [key: string]: any }`

Example: `... .parse(process.argv.slice(2))`

<br/>

Returns the parsed arguments.
