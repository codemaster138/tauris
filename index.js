"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.UsageError = void 0;
var chalk_1 = require("chalk");
var CLIOption = /** @class */ (function () {
    function CLIOption(name, options, isRoot) {
        this.name = name;
        this.alias = [].concat((options === null || options === void 0 ? void 0 : options.alias) || []);
        this.type = (options === null || options === void 0 ? void 0 : options.type) || "text";
        this.description = (options === null || options === void 0 ? void 0 : options.description) || "No description provided";
        this.isRoot = isRoot || false;
    }
    return CLIOption;
}());
var UsageError = /** @class */ (function (_super) {
    __extends(UsageError, _super);
    function UsageError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UsageError;
}(Error));
exports.UsageError = UsageError;
var Command = /** @class */ (function () {
    function Command(name, opts) {
        this.description = "No description provided";
        this.rootOptions = [];
        this.help = true;
        this.helpHeader = "";
        this.opt = {};
        this.subcommands = [];
        this._handler = function () { };
        this.name = name;
        this.usageString = this.name + " [...options]";
        if (opts === null || opts === void 0 ? void 0 : opts.noDefaultHelpOption)
            this.options = [];
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
    Command.prototype.describe = function (message) {
        this.description = message;
        return this;
    };
    /**
     * Disable the help message
     */
    Command.prototype.noHelp = function () {
        this.help = false;
        return this;
    };
    /**
     * Override the default usage string
     * @param usageString Usage String
     */
    Command.prototype.usage = function (usageString) {
        this.usageString = usageString;
        return this;
    };
    /**
     * Add an option
     * @param name Option names
     * @param alias Optionally any amount of aliases
     */
    Command.prototype.option = function (name, options) {
        this.options.push(new CLIOption(name, options));
        return this;
    };
    /**
     * Add an option that is automatically carried through to all subcommands and
     * their subcommands, etc.
     * @param name Option name
     * @param options Configuration for option
     * @returns this
     */
    Command.prototype.rootOption = function (name, options) {
        var opt = new CLIOption(name, options, true);
        this.options.push(opt);
        this.rootOptions.push(opt);
        return this;
    };
    /**
     * Delete a specific root option, list of root options or (if no argument is
     * given) all root options for this command and all its children
     * @param names Name(s) of the root options to delete
     */
    Command.prototype.clearRoot = function (names) {
        this.options = this.options.filter(function (x) { return x.isRoot && names && [].concat(names).includes(x.name); });
        this.rootOptions = this.rootOptions.filter(function (x) { return x.isRoot && names && [].concat(names).includes(x.name); });
        return this;
    };
    /**
     * Parse arguments into an object. If a command is called, returns a promise so you can await the command.
     * @param argv Raw process arguments, without binary and file location (e.g. `process.argv.slice(2)`)
     */
    Command.prototype.parse = function (argv, options) {
        var _this = this;
        var res = {};
        var index = 0;
        var _loop_1 = function () {
            var isOption = false;
            var stripped = argv[index];
            while (stripped.startsWith("-")) {
                isOption = true;
                stripped = stripped.slice(1);
            }
            if (isOption) {
                var done_1 = false;
                this_1.options.forEach(function (option) {
                    if (option.name === stripped || option.alias.includes(stripped)) {
                        done_1 = true;
                        if (option.name === "parameters")
                            return;
                        if (option.type === "boolean") {
                            res[option.name] = true;
                        }
                        else if (option.type === "text") {
                            res[option.name] = argv[++index];
                        }
                        else if (option.type === "number") {
                            index++;
                            if (isNaN(parseFloat(argv[index]))) {
                                _this.renderHelp();
                                if (options === null || options === void 0 ? void 0 : options.noExit)
                                    throw new UsageError("Expected a number for option " + (option.name.length > 1 ? "-" : "--") + option.name);
                                process.exit();
                            }
                            else {
                                res[option.name] = argv[index];
                            }
                        }
                    }
                });
                if (!done_1) {
                    res[stripped] = argv[++index] || true;
                }
            }
            else {
                var promise = this_1.subcommands
                    .map(function (cmd) {
                    if (cmd.name === stripped) {
                        return cmd.callHandler(cmd.parse(argv.slice(index + 1), {
                            noPromise: options === null || options === void 0 ? void 0 : options.noPromise,
                            noExit: options === null || options === void 0 ? void 0 : options.noExit,
                        }));
                    }
                    return null;
                })
                    .find(function (x) { return !!x; });
                if (promise)
                    return { value: (options === null || options === void 0 ? void 0 : options.noPromise) ? false : promise };
                else
                    Array.isArray(res.parameters)
                        ? res.parameters.push(stripped)
                        : (res.parameters = [stripped]);
            }
            index++;
        };
        var this_1 = this;
        while (index < argv.length) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
        if (this.help &&
            (res.h || (this.opt.demandArgument && Object.keys(res).length === 0))) {
            this.renderHelp();
            return false;
        }
        return res;
    };
    /**
     * A message to display above the help message
     * @param message Message
     */
    Command.prototype.header = function (message) {
        this.helpHeader = message;
        return this;
    };
    /**
     * Show help and exit when no option or command is provided
     */
    Command.prototype.demandArgument = function (bool) {
        this.opt.demandArgument = bool || true;
        return this;
    };
    /**
     * Render the help message to the screen
     */
    Command.prototype.renderHelp = function () {
        var _a, _b, _c;
        console.log();
        if (this.helpHeader) {
            console.log(this.helpHeader);
            console.log();
        }
        console.log(chalk_1.white.bold("Usage:") + "\n\n  " + chalk_1.gray.bold("$") + " " + chalk_1.cyan(this.usageString) + "\n");
        console.log(chalk_1.white.bold("Options:") + "\n");
        var optionToString = function (option) {
            return [
                (option.name.length === 1 ? "-" : "--") + option.name,
                option.alias.map(function (alias) { return (alias.length === 1 ? " -" : "--") + alias; }),
            ].join(", ");
        };
        var longest = ((_a = this.options.map(optionToString).sort(function (a, b) { return b.length - a.length; })[0]) === null || _a === void 0 ? void 0 : _a.length) + 5;
        if (((_b = this.subcommands
            .map(function (cmd) { return cmd.name; })
            .sort(function (a, b) { return b.length - a.length; })[0]) === null || _b === void 0 ? void 0 : _b.length) +
            5 >
            longest) {
            longest =
                ((_c = this.subcommands
                    .map(function (cmd) { return cmd.name; })
                    .sort(function (a, b) { return b.length - a.length; })[0]) === null || _c === void 0 ? void 0 : _c.length) + 5;
        }
        this.options
            .filter(function (x) { return !x.isRoot; })
            .forEach(function (option) {
            console.log("  " + chalk_1.cyan(optionToString(option)) + " " + chalk_1.gray(".").repeat(longest - optionToString(option).length) + " " + option.description);
        });
        console.log(chalk_1.white.bold("Root Options:") + "\n");
        this.options
            .filter(function (x) { return x.isRoot; })
            .forEach(function (option) {
            console.log("  " + chalk_1.cyan(optionToString(option)) + " " + chalk_1.gray(".").repeat(longest - optionToString(option).length) + " " + option.description);
        });
        console.log();
        console.log();
        if (this.subcommands.length > 0) {
            console.log(chalk_1.white.bold("Commands:") + "\n");
            this.subcommands.forEach(function (cmd) {
                console.log("  " + chalk_1.cyan(cmd.name) + " " + chalk_1.gray(".").repeat(longest - cmd.name.length) + " " + cmd.description);
            });
            console.log();
        }
    };
    /**
     * Called when the command is invoked as a subcommand
     * @param callback Callback
     */
    Command.prototype.handler = function (callback) {
        this._handler = callback;
        return this;
    };
    /**
     * Attach a subcommand
     * @param cmd Subcommand to attach
     */
    Command.prototype.command = function (cmd) {
        cmd.parent = this;
        cmd.options.concat(this.rootOptions); // Add rootOptions as options for command
        cmd.rootOptions.concat(this.rootOptions); // Then make sure it carries them through to children
        this.subcommands.push(cmd);
        return this;
    };
    Command.prototype.root = function () {
        return this.parent ? this.parent.root() : this;
    };
    Command.prototype.callHandler = function (argv) {
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, argv];
                    case 1:
                        args = _a.sent();
                        if (!args) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._handler(args)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Command;
}());
exports.Command = Command;
