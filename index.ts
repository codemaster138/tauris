import { cyan, gray, white } from "chalk";

type CLIOptionType = "number" | "text" | "boolean";

interface Opt {
  demandArgument?: boolean;
}

interface CLIOptionConstructorOptions {
  alias?: string[];
  type?: CLIOptionType;
  description?: string;
}

class CLIOption {
  constructor(name: string, options?: CLIOptionConstructorOptions) {
    this.name = name;
    this.alias = options?.alias || [];
    this.type = options?.type || "text";
    this.description = options?.description || "No description provided";
  }

  name: string;
  alias: string[];
  type: CLIOptionType;
  description: string;
}

interface CommandOptions {
  /**
   * When this is set, tauris does not, by default, add a "-h" option.
   * Note that if the option "-h" is passed, tauris will still show a
   * help message unless you also call `.noHelp()` on this command
   * instance later
   */
  noDefaultHelpOption?: boolean;
}

export class Command {
  constructor(name: string, opts: CommandOptions) {
    this.name = name;
    this.usageString = `${this.name} [...options]`;
    if (opts.noDefaultHelpOption) this.options = [];
    else
      this.options = [
        new CLIOption("h", {
          alias: ["help"],
          type: "boolean",
          description: "Display this help message",
        }),
      ];
  }

  /**
   * Add a description
   * @param message description
   */
  describe(message: string) {
    this.description = message;
    return this;
  }

  /**
   * Disable the help message
   */
  noHelp() {
    this.help = false;
    return this;
  }

  /**
   * Override the default usage string
   * @param usageString Usage String
   */
  usage(usageString: string) {
    this.usageString = usageString;
    return this;
  }

  /**
   * Add an option
   * @param name Option names
   * @param alias Optionally any amount of aliases
   */
  option(name: string, options?: CLIOptionConstructorOptions) {
    this.options.push(new CLIOption(name, options));
    return this;
  }

  /**
   * Parse arguments into an object
   * @param argv Raw process arguments, without binary and file location (e.g. `process.argv.slice(2)`)
   */
  parse(argv: string[]): { [key: string]: any } | false {
    var res: { [key: string]: any } = {};
    var index = 0;

    while (index < argv.length) {
      let isOption = false;
      let stripped: string = argv[index];

      while (stripped.startsWith("-")) {
        isOption = true;
        stripped = stripped.slice(1);
      }

      if (isOption) {
        let done = false;
        this.options.forEach((option) => {
          if (option.name === stripped || option.alias.includes(stripped)) {
            done = true;
            if (option.name === "parameters") return;
            if (option.type === "boolean") {
              res[option.name] = true;
            } else if (option.type === "text") {
              res[option.name] = argv[++index];
            } else if (option.type === "number") {
              index++;
              if (isNaN(parseFloat(argv[index]))) {
                this.renderHelp();
                process.exit();
              } else {
                res[option.name] = argv[index];
              }
            }
          }
        });
        if (!done) {
          res[stripped] = argv[++index] || true;
        }
      } else {
        let found = false;
        this.subcommands.forEach((cmd) => {
          if (cmd.name === stripped) {
            found = true;
            cmd.callHandler(cmd.parse(argv.slice(index + 1)));
          }
        });
        if (found) {
          return false;
        } else
          Array.isArray(res.parameters)
            ? res.parameters.push(stripped)
            : (res.parameters = [stripped]);
      }
      index++;
    }

    if (
      this.help &&
      (res.h || (this.opt.demandArgument && Object.keys(res).length === 0))
    ) {
      this.renderHelp();
      process.exit();
    }

    return res;
  }

  /**
   * A message to display above the help message
   * @param message Message
   */
  header(message: string) {
    this.helpHeader = message;
    return this;
  }

  /**
   * Show help and exit when no option or command is provided
   */
  demandArgument(bool?: boolean) {
    this.opt.demandArgument = bool || true;
    return this;
  }

  /**
   * Render the help message to the screen
   */
  private renderHelp() {
    console.log();

    if (this.helpHeader) {
      console.log(this.helpHeader);
      console.log();
    }

    console.log(
      `${white.bold("Usage:")}\n\n  ${gray.bold("$")} ${cyan(
        this.usageString
      )}\n`
    );

    console.log(`${white.bold("Options:")}\n`);

    const optionToString = (option: CLIOption) => {
      return [
        (option.name.length === 1 ? "-" : "--") + option.name,
        option.alias.map(
          (alias: string) => (alias.length === 1 ? " -" : "--") + alias
        ),
      ].join(", ");
    };

    var longest =
      this.options.map(optionToString).sort((a, b) => b.length - a.length)[0]
        ?.length + 5;

    if (
      this.subcommands
        .map((cmd) => cmd.name)
        .sort((a, b) => b.length - a.length)[0]?.length +
        5 >
      longest
    ) {
      longest =
        this.subcommands
          .map((cmd) => cmd.name)
          .sort((a, b) => b.length - a.length)[0]?.length + 5;
    }

    this.options.forEach((option) => {
      console.log(
        `  ${cyan(optionToString(option))} ${gray(".").repeat(
          longest - optionToString(option).length
        )} ${option.description}`
      );
    });

    console.log();

    if (this.subcommands.length > 0) {
      console.log(`${white.bold("Commands:")}\n`);

      this.subcommands.forEach((cmd) => {
        console.log(
          `  ${cyan(cmd.name)} ${gray(".").repeat(longest - cmd.name.length)} ${
            cmd.description
          }`
        );
      });

      console.log();
    }
  }

  /**
   * Called when the command is invoked as a subcommand
   * @param callback Callback
   */
  handler(callback: (argv: { [key: string]: any }) => void) {
    this._handler = callback;
    return this;
  }

  /**
   * Attach a subcommand
   * @param cmd Subcommand to attach
   */
  command(cmd: Command) {
    this.subcommands.push(cmd);
    return this;
  }

  description: string = "No description provided";
  private usageString: string;
  private options: CLIOption[];
  protected name: string;
  private help: boolean = true;
  private helpHeader: string = "";
  private opt: Opt = {};
  private subcommands: Command[] = [];
  protected callHandler(argv: { [key: string]: any } | false) {
    if (argv) this._handler(argv);
  }
  protected _handler: (argv: { [key: string]: any }) => void = () => {};
}
