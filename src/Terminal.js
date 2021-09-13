const { COMMANDS } = require("./commands");
const Cd = require("./components/Cd");
const Pwd = require ("./components/Pwd");
const Ls = require('./components/Ls');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("./messages");
const FileManager = require("./components/FileManager");
const FileLoader = require('./FileLoader');
const Cat = require("./components/Cat");


class Terminal {
    currentPath = "";
    fileLoader = new FileLoader();
    commandObjects = {
        ls: null,
        pwd: null,
        cd: null,
        cat: null,
    };

    parseCommand(command) {
        const valuesMatch = command.match(/(?:\s)[^\-][\S]+/g);
        const keysMatch = command.match(/(?<!\w)-\w+/g);

        if (!valuesMatch) {
            return { target: null };
        }

        const options = { target: valuesMatch[0].trim() };
        
        if (keysMatch) {
            const valuesList = valuesMatch.slice(1, valuesMatch.length);
            for (let i = 0; i < keysMatch.length; ++i) {
                if (i < valuesList.length) {
                    const key = keysMatch[i].substr(1);
                    options[key] = valuesList[i].trim();
                } else {
                    break;
                }
            }
        }

        return options;
    }

    runTerminal({ ...options }) {
        const { target } = options;

        if (target) {
            this.fileLoader.loadZip(target, ({ ...response }) => {
                this.setCommandObjects({ ...response, isArchive: true });
            });
        } else {
            return this.setCommandObjects({ success: true });
        }

        return [true, SUCCESS_MESSAGES.runarchive];
    }

    setCommandObjects({ ...response }) {
        const { success, isArchive } = response;
        let fileManager;

        if (success && isArchive) {
            const { zip, zipFiles } = response;
            fileManager = new FileManager({ 
                rootPath: '/', 
                isArchive: true,
                zipFiles: zipFiles,
                zip: zip,
            });
        } else if (success) {
            fileManager = new FileManager({ rootPath: '/' });
        } else {
            return [false, ""];
        }

        this.commandObjects.pwd = new Pwd(fileManager);
        this.commandObjects.cd  = new Cd(fileManager);
        this.commandObjects.ls  = new Ls(fileManager);
        this.commandObjects.cat = new Cat(fileManager);

        this.currentPath = fileManager.getCurrentPath();
        return [true, this.currentPath];
    }

    stopTerminal() {
        this.commandObjects.pwd = null;
        this.commandObjects.cd  = null;
        this.commandObjects.ls  = null;
        this.commandObjects.cat = null;
        this.currentPath = "";
        this.fileLoader.unloadZip();

        return [SUCCESS_MESSAGES.exit, ""];
    }

    executeCommand(commandString) {
        const commandMatch = commandString.match(/[^ ]+/);
        if (!commandMatch) {
            return [this.currentPath, ""];
        } 

        const command = commandMatch[0];
        const options = this.parseCommand(commandString.replace(command, ''));
        
        let path    = this.currentPath,
            message = "",
            success = true;

        switch(command) {
            case COMMANDS.VSHELL:
                [success, path]     = this.runTerminal(options);
                break;
            case COMMANDS.PWD:
                message             = this.commandObjects.pwd.handle(options);
                break;
            case COMMANDS.LS:
                [success, message]  = this.commandObjects.ls.handle(options);
                break;
            case COMMANDS.CD:
                [success, path]     = this.commandObjects.cd.handle(options);
                break;
            case COMMANDS.CAT:
                [success, message]  = this.commandObjects.cat.handle(options);
                break;
            case COMMANDS.EXIT:
                [message, path]     = this.stopTerminal(options);
                break;
            default:
                [success, message]  = [false, ERROR_MESSAGES.default.nocommand];
        }

        if (success) {
            this.currentPath = path;
        } else {
            message =   "vshell: " + command + (options.target ? " " + options.target : "") + 
                        ": " + message;
        }

        return [path, message]; 
    }
}


module.exports = Terminal;