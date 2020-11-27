const { Command } = require('..');

const argv = new Command('example')
    .describe('example command')
    .option('v', {
        alias: ['version'],
        description: 'Display the version number',
        type: 'boolean',
    })
    .demandArgument()
    .parse(process.argv.slice(2));

if (argv) {
    // `argv` is `false` when a subcommand is invoked
    if (argv.v) console.log('version 1.0.0');
}