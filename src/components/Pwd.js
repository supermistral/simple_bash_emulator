class Pwd {
    fileManager = null; 

    constructor(fileManager) {
        this.fileManager = fileManager;
    }

    handle({ ...options }) {
        const { rootPath, currentPath } = this.fileManager.path;
        return '/' + this.fileManager
                        .getRelativePath(rootPath, currentPath)
                        .replace('\\', '/');
    }
}


module.exports = Pwd;