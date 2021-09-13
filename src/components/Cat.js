const { ERROR_MESSAGES } = require('../messages');
const fs = require('fs');
const path = require('path');


class Cat {
    fileManager = null;

    constructor(fileManager) {
        this.fileManager = fileManager;
    }

    handle({ ...options }) {
        const { target } = options;

        if (!target) {
            return [false, ERROR_MESSAGES.cat.required];
        }
        
        const data = this.fileManager.getDataFile(target);

        if (data === null) {
            return [false, ERROR_MESSAGES.cat.unable];
        }

        return [true, data];
    }
}


module.exports = Cat;