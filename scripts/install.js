const { download, unpack } = require('./download');
const fs = require('fs');

function install(platform, downloadTo, unpackTo) {

    return download(platform, downloadTo).then(() => {
        return unpack(downloadTo, unpackTo)
    }).finally(() => {
        fs.unlink(downloadTo, (err) => err && console.error(err));
    })
}

module.exports = install;