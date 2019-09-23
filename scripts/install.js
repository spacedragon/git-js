const { paths } = require('./util');
const { download, unpack } = require('./download');

function install(platform) {
    const { packagePath, nativeDir } = paths(platform);

    return download(platform, packagePath).then(() => {
        return unpack(packagePath, nativeDir)
    }).finally(() => {
        fs.unlink(packagePath, console.error);
    })
}

module.exports = install;