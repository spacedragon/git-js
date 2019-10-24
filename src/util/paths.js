const path = require('path');
const os = require('os');


function paths(platform) {
    const nativeDir = path.join(__dirname, '../..', '/native/git');
    if (platform === 'win32') {
        const bin = "git.exe";
        const binPath = path.join(nativeDir ,'cmd', bin)
        return { nativeDir, binPath };
    }
    const bin = 'git';
    const binPath = path.join(nativeDir ,'bin', bin);
    return { nativeDir, binPath };
}


module.exports = paths;