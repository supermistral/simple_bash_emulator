const { ERROR_MESSAGES } = require('../messages');


class Cd {
    fileManager = null;

    constructor(fileManager) {
        this.fileManager = fileManager;
    }

    handle({ ...options }) {
        const { target } = options;
        const success = this.fileManager.changePath(target);

        if (success) {
            return [success, this.fileManager.getCurrentPath()];
        }

        return [false, ERROR_MESSAGES.cd.default];
    }
}


module.exports = Cd;