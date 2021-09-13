const StreamZip = require('node-stream-zip');
const path = require('path');


class FileLoader {
    zip = null;

    loadZip(file, callback) {
        const absPath = path.resolve(file);

        this.zip = new StreamZip({
            file: absPath
        });

        this.zip.on('error', e => { 
            callback && callback({
                success: false,
            });
            alert('Error: ' + e);
        });

        this.zip.on('ready', () => {
            callback && callback({
                success: true,
                zip: this.zip,
                zipFiles: Object.values(this.zip.entries())
            });
        });
    }

    unloadZip() {
        this.zip.close();
    }
}


module.exports = FileLoader;