const config = {
    build: {
        input: "./posts",
        output: "../",
        sassEntry: './scss/index.scss',
        sassFolder: './scss',
        sassOutput: 'index.css',
        templates: {
            home: './templates/home.ejs',
            post: './templates/post.ejs'
        }
    },
    blogName: `Tauris Docs`,
    ownerName: `Tauris`,
    description: `Create beautiful CLIs with ease`,
    gitHub: `https://github.com/codemaster138/node-tauris`,
    navLinks: [{
            href: '/',
            text: 'Home'
        },
        {
            href: '/docs',
            text: 'Docs'
        },
        {
            href: 'https://github.com/codemaster138/node-tauris',
            text: 'Source'
        },
        {
            hreg: '/contact',
            text: 'Contact'
        }
    ],
    plugins: ['plugin.js'],
    assets: './assets',
    sidebar: [{
        type: 'heading',
        text: 'Getting Started'
    }, {
        type: 'link',
        href: '/introduction',
        text: 'Intro'
    }, {
        type: 'link',
        href: '/example',
        text: 'Example'
    },{
        type: 'heading',
        text: 'API Reference'
    },{
        type: 'link',
        href: '/api#',
        text: 'API Reference'
    }, {
        type: 'link',
        href: '/api#class-command',
        text: 'Class: \'Command\''
    }, {
        type: 'link',
        href: '/api#commandoption',
        text: 'Command.option()'
    }, {
        type: 'link',
        href: '/api#commanddescribe',
        text: 'Command.describe()'
    }, {
        type: 'link',
        href: '/api#commandcommand',
        text: 'Command.command()'
    }, {
        type: 'link',
        href: '/api#commandhandler',
        text: 'Command.handler()'
    }, {
        type: 'link',
        href: '/api#commanddemandargument',
        text: 'Command.demandArgument()'
    }, {
        type: 'link',
        href: '/api#commandheader',
        text: 'Command.header()'
    }, {
        type: 'link',
        href: '/api#commandusage',
        text: 'Command.usage()'
    }, {
        type: 'link',
        href: '/api#commandnohelp',
        text: 'Command.noHelp()'
    }, {
        type: 'link',
        href: '/api#commandparse',
        text: 'Command.parse()'
    }]
}

module.exports = config;