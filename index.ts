import { cyan, gray, white } from "chalk";

type CLIOptionType = "number" | "text" | "boolean";

interface Opt {
  demandArgument?: boolean;
}

interface CLIOptionConstructorOptions {
  alias?: string[] | string;
  type?: CLIOptionType;
  description?: string;
}

class CLIOption {
  constructor(
    name: string,
    options?: CLIOptionConstructorOptions,
    isRoot?: boolean,
    isDefaultOption?: boolean
  ) {
    this.name = name;
    this.alias = (<string[]>[]).concat(options?.alias || []);
    this.type = options?.type || "text";
    this.description = options?.description || "No description provided";
    this.isRoot = isRoot || false;
    // For i18n reasons, see usage later in the code:
    this.isDefaultOption = isDefaultOption || false;
  }

  name: string;
  alias: string[];
  type: CLIOptionType;
  description: string;
  isRoot: boolean;
  isDefaultOption: boolean;
}

interface Lang {
  "Usage:": string;
  "Commands:": string;
  "Root Options:": string;
  "Options:": string;
  "Display this help message": string;
}

interface CommandOptions {
  /**
   * When this is set, tauris does not, by default, add a "-h" option.
   * Note that if the option "-h" is passed, tauris will still show a
   * help message unless you also call `.noHelp()` on this command
   * instance later
   */
  noDefaultHelpOption?: boolean;
  /**
   * Translations of the default UI text
   */
  language?: Lang;
}

export class UsageError extends Error {}

export class Command {
  constructor(
    name: string,
    /**
     * @deprecated use `.language()` and `.noHelp` instead
     */
    opts?: CommandOptions
  ) {
    this.name = name;
    this.usageString = `${this.name} [...options]`;
    this.opts = opts || {};
    if (opts?.noDefaultHelpOption) this.options = [];
    else
      this.options = [
        new CLIOption(
          "h",
          {
            alias: ["help"],
            type: "boolean",
            description: this._translate("Display this help message"),
          },
          false,
          true
        ),
      ];
  }

  clone(): Command {
    const c = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    return c;
  }

  private _translate(english: keyof Lang): string {
    return this.opts?.language?.[english] || english;
  }

  language(lang: Lang) {
    this.opts.language = lang;
    return this;
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
    this.options = this.options.filter(
      (x) => !(x.isDefaultOption && x.name === "h")
    );
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
   * Add an option that is automatically carried through to all subcommands and
   * their subcommands, etc.
   * @param name Option name
   * @param options Configuration for option
   * @returns this
   */
  rootOption(name: string, options?: CLIOptionConstructorOptions) {
    const opt = new CLIOption(name, options, true);
    this.options.push(opt);
    return this;
  }

  /**
   * Delete a specific root option, list of root options or (if no argument is
   * given) all root options for this command and all its children
   * @param names Name(s) of the root options to delete
   */
  clearRoot(name?: string): this;
  /**
   * Delete a specific root option, list of root options or (if no argument is
   * given) all root options for this command and all its children
   * @param names Name(s) of the root options to delete
   */
  clearRoot(names?: string[]): this;
  /**
   * Delete a specific root option, list of root options or (if no argument is
   * given) all root options for this command and all its children
   * @param names Name(s) of the root options to delete
   */
  clearRoot(names?: string | string[]) {
    this.options = this.options.filter(
      (x) =>
        !(
          x.isRoot &&
          (names ? (<string[]>[]).concat(names).includes(x.name) : true)
        )
    );
    this.clearedRoots = this.clearedRoots.concat(names || []);
    return this;
  }

  /**
   * Parse arguments into an object. If a command is called, returns a promise so you can await the command.
   * @param argv Raw process arguments, without binary and file location (e.g. `process.argv.slice(2)`)
   */
  parse(
    argv: string[],
    options?: {
      /**
       * Throw an error instead of exiting
       */
      noExit?: boolean;
      noPromise?: boolean;
    }
  ): { [key: string]: any } | false | Promise<void> {
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
                if (options?.noExit)
                  throw new UsageError(
                    `Expected a number for option ${
                      option.name.length > 1 ? "-" : "--"
                    }${option.name}`
                  );
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
        const promise = this.subcommands
          .map((cmd) => {
            if (cmd.name === stripped) {
              return cmd.callHandler(
                cmd.parse(argv.slice(index + 1), {
                  noPromise: options?.noPromise,
                  noExit: options?.noExit,
                })
              );
            }
            return null;
          })
          .find((x) => !!x)
          ?.then((x) => (options?.noExit ? x : process.exit(x || 0)));
        if (promise) return options?.noPromise ? false : promise;
        else
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
      return false;
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
      `${white.bold(this._translate("Usage:"))}\n\n  ${gray.bold("$")} ${cyan(
        this.usageString
      )}\n`
    );

    console.log(`${white.bold(this._translate("Options:"))}\n`);

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

    this.options
      .filter((x) => !x.isRoot)
      .forEach((option) => {
        console.log(
          `  ${cyan(optionToString(option))} ${gray(".").repeat(
            longest - optionToString(option).length
          )} ${option.description}`
        );
      });

    console.log();

    if (this.options.filter((x) => x.isRoot).length) {
      console.log(`${white.bold(this._translate("Root Options:"))}\n`);

      this.options
        .filter((x) => x.isRoot)
        .forEach((option) => {
          console.log(
            `  ${cyan(optionToString(option))} ${gray(".").repeat(
              longest - optionToString(option).length
            )} ${option.description}`
          );
        });

      console.log();
    }

    if (this.subcommands.length > 0) {
      console.log(`${white.bold(this._translate("Commands:"))}\n`);

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
  handler(
    callback: (
      this: Command,
      argv: { [key: string]: any }
    ) => number | void | Promise<number | void>
  ) {
    this._handler = callback;
    return this;
  }

  /**
   * Attach a subcommand
   * @param cmd Subcommand to attach
   */
  command(cmd: Command) {
    cmd.parent = this;
    cmd.options = cmd.options.concat(
      this.options.filter((x) => x.isRoot && !cmd.clearedRoots.includes(x.name))
    );
    if (!cmd.opts?.language) {
      cmd.opts = { ...(cmd.opts || {}), language: this.opts?.language };
      cmd.options.forEach((x) => {
        if (!x.isDefaultOption) return;
        x.description = cmd._translate(x.description as keyof Lang);
      });
    }
    this.subcommands.push(cmd);
    return this;
  }

  root(): Command {
    return this.parent ? this.parent.root() : this;
  }

  description: string = "No description provided";
  private usageString: string;
  private options: CLIOption[];
  protected name: string;
  private clearedRoots: string[] = [];
  public parent: Command | undefined;
  private help: boolean = true;
  private helpHeader: string = "";
  private opt: Opt = {};
  private subcommands: Command[] = [];
  protected opts: CommandOptions;
  protected async callHandler(
    argv: { [key: string]: any } | false | Promise<void>
  ): Promise<number | void> {
    const args = await argv;
    if (args && typeof args !== "number") return await this._handler(args);
  }
  protected _handler: (
    this: Command,
    argv: { [key: string]: any }
  ) => number | void | Promise<number | void> = () => {};
}
