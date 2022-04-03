const { Command } = require("..");

const argv = new Command("example")
  .describe("example command")
  .option("v", {
    alias: ["version"],
    description: "Display the version number",
    type: "boolean",
  })
  .command(
    new Command("sub")
      .describe("A subcommand")
      .option("e", { alias: "exit", description: "Exit code", type: "number" })
      .handler(async (argv) => {
        if (argv.e) return argv.e;
        return 177;
      })
  )
  .demandArgument()
  .parse(process.argv.slice(2), { noExit: true });

(async () => {
  console.log("got argv:  ", argv);
	console.log("await argv:", await argv);

  if (argv) {
    // `argv` is `false` when a subcommand is invoked
    if (argv.v) console.log("version 1.0.0");
  }
})();
