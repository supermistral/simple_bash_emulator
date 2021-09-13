const ERROR_MESSAGES = {
    default: {
        nocommand: "No such command",
    },
    cd: {
        default: "The path does not exist",
    },
    ls: {
        notfound: "No such dir",
    },
    cat: {
        required: "Path is required",
        unable: "Unable to read file",
    }
};

const SUCCESS_MESSAGES = {
    run: "VSHELL running",
    exit: "VSHELL exit",
    runarchive: "Type new command to refresh",
};


module.exports.ERROR_MESSAGES = ERROR_MESSAGES;
module.exports.SUCCESS_MESSAGES = SUCCESS_MESSAGES;