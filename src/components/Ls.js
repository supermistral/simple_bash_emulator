const { ERROR_MESSAGES } = require('../messages');


class Ls {
    fileManager = null; 

    constructor(fileManager) {
        this.fileManager = fileManager;
    }

    handle({ ...options }) {
        const { target } = options;
        const files = this.fileManager.getFilesInFolder(target || '');

        if (files === null) {
            return [false, ERROR_MESSAGES.ls.notfound];
        }

        return [true, files.join(' ')];
    }
}


module.exports = Ls;