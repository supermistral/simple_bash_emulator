const path = require('path');
const fs = require('fs');


class FileManager {
    path = {
        host: "locahost",
        homePath: null,          // путь к домашней папке
        rootPath: "/",           // путь к корню
        currentPath: "/",        // реальный текущий путь 
        separators: {
            end: "$",
            afterHost: ":",
        },
    };
    isArchive = false;
    zip = null;
    zipFiles = [];

    constructor({ rootPath, homePath, isArchive, zip, zipFiles }) {
        if (isArchive && zip && zipFiles) {
            this.isArchive = isArchive;
            this.zip = zip;
            this.zipFiles = zipFiles;
        }

        if (typeof rootPath === "string") {
            rootPath = path.resolve(rootPath);
            if (this.isArchive || this.checkDirPath(rootPath)) {
                this.path.rootPath = rootPath;
            }
        }

        if (typeof homePath === "string") {
            homePath = path.resolve(homePath);
            if (this.checkDirPath(homePath) && this.isContainsRootPath(homePath)) {
                this.path.homePath = homePath;
            }
        }

        if (!this.path.homePath) {
            this.path.homePath = this.path.rootPath;
        }

        this.path.currentPath = this.path.homePath;
    }

    checkDirPath(path) {
        if (this.isArchive) {
            const zipFile = this.getZipFile(path);
            return zipFile && zipFile.isDirectory;
        }

        return (
            fs.existsSync(path) && 
            fs.lstatSync(path).isDirectory()
        );
    }

    getCurrentPath() {
        const { host, rootPath, homePath, currentPath, separators } = this.path;    
        let realPath;

        if (this.isContainsHomePath(currentPath)) {
            const relativePath = this.getRelativePath(homePath, currentPath);
            realPath = '~' + (relativePath ? '/' + relativePath.replace('\\', '/') : "");
        } else {
            realPath = '/' + this.getRelativePath(rootPath, currentPath);
        }

        return host + separators.afterHost + realPath + separators.end;
    }

    getFilesInFolder(pathToFolder) {
        const absPath = this.getAbsolutePath(pathToFolder);

        if (this.isArchive) {
            if (!this.checkDirPath(absPath)) {
                return null;
            }
            const zipFiles = this.getZipFilesInFolder(absPath);
            return zipFiles;
        } 
        
        try {
            const data = fs.readdirSync(absPath);
            return data;
        } catch (e) {
            return null;
        }
    }

    getAbsolutePath(pathToAbs) {
        const normalizedPath = path.normalize(pathToAbs);

        if (path.isAbsolute(normalizedPath)) {
            return path.resolve(this.path.currentPath, normalizedPath.substr(1));
        }

        return path.resolve(this.path.currentPath, normalizedPath);
    }

    isContainsHomePath(path) {
        return this.isChildOfPath(this.path.homePath, path);
    }

    isContainsRootPath(path) {
        return this.isChildOfPath(this.path.rootPath, path);
    }

    isChildOfPath(child, parent) {
        const relativePath = path.relative(child, parent);
        return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    }

    getRelativePath(path1, path2) {
        return path.relative(path1, path2);
    }

    changePath(pathToChange) {
        if (!pathToChange) {
            this.path.currentPath = this.path.rootPath;
            return true;
        }

        if (path.isAbsolute(pathToChange)) {
            pathToChange = this.getAbsolutePath(pathToChange);
        }

        const newPath = path.resolve(this.path.currentPath, pathToChange);

        if (this.isContainsRootPath(newPath) && this.checkDirPath(newPath)) {
            this.path.currentPath = newPath;
            return true;
        }

        return false;
    }

    getZipFile(pathToFile) {
        const relativePath = path.relative(this.path.rootPath, pathToFile) || ".";

        return this.zipFiles.find((file) =>
            relativePath === '.' && path.join(file.name, '..') === '.' ||
            !path.relative(file.name, relativePath)
        );
    }

    getZipFilesInFolder(pathToFolder) {
        const relativePath = path.relative(this.path.rootPath, pathToFolder) || '.';
        const fullZipFiles = 
            this.zipFiles
                .filter(file => !path.relative(path.dirname(file.name), relativePath))
                .map(file => path.basename(file.name));
        
        return fullZipFiles;
    }

    getDataFile(pathToFile) {
        const absPath = this.getAbsolutePath(pathToFile);
        
        if (this.isArchive) {
            const zipFile = this.getZipFile(absPath);
            return this.getDataZipFile(zipFile)
        }

        try {
            const data = fs.readFileSync(absPath, 'utf8');
            return data;
        } catch (e) {
            return null;
        }
    }

    getDataZipFile(zipEntry) {
        if (zipEntry && !zipEntry.isDirectory) {
            return this.zip.entryDataSync(zipEntry).toString('utf8');
        }
        return null;
    }
}


module.exports = FileManager;