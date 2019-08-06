const path = require('path');
const os = require('os');

const packageJson = require('../package.json');

function pkgVersion(platform) {
    return packageJson.git_natives[platform];
}

function pkgName(platform) {
    const pkg = pkgVersion(platform);
    switch (platform) {
        case 'linux':
            return `git-v${pkg.version}-${pkg.build}-linux.tar.gz`;
        case 'win32':
            return `dugite-native-v${pkg.version}-${pkg.build}-windows-x64.tar.gz`;
        case 'darwin':
            return `dugite-native-v${pkg.version}-${pkg.build}-macOS.tar.gz`;
        default:
            throw new Error('unsupported platform ' + platform);
    }
}

function paths(platform) {
    const nativeDir = path.join(__dirname, '..', '/native/git');
    const bin = (platform || os.platform()) === 'win32' ? 'git.exe' : 'git';
    const binPath = path.join(nativeDir ,'bin', bin);
    const packagePath = path.join(nativeDir, pkgName(platform));
    return { nativeDir, binPath, packagePath }
}

module.exports= {
    pkgName,
    pkgVersion,
    paths
}

