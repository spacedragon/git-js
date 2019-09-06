const path = require('path');

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
    const { nativeDir, binPath } = nativePaths(platform);
    const packagePath = path.join(nativeDir,'..' , pkgName(platform));
    return { nativeDir, binPath, packagePath }
}

module.exports= {
    pkgName,
    pkgVersion,
    paths
};

function nativePaths(platform) {
   const nativeDir = path.join(__dirname, '../', '/native/git');
   if (platform === 'win32') {
      const bin = "git.exe";
      const binPath = path.join(nativeDir ,'cmd', bin);
      return { nativeDir, binPath };
   }
   const bin = 'git';
   const binPath = path.join(nativeDir ,'bin', bin);
   return { nativeDir, binPath };
}


