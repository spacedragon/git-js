
var Git = require('./git');

module.exports = function (baseDir, useSystemGit) {

   var dependencies = require('./util/dependencies');

   if (baseDir && !dependencies.exists(baseDir, dependencies.exists.FOLDER)) {
       throw new Error("Cannot use simple-git on a directory that does not exist.");
    }
    var git = new Git(baseDir || process.cwd(), dependencies.childProcess(), dependencies.buffer());
    if (!useSystemGit) {
        var os = require('os');
        var platform = os.platform();
        var paths = require('./util/paths')(platform);
        var fs = require('fs');
        var git_dir = paths.nativeDir;
        var git_bin = paths.binPath;
        if (fs.existsSync(git_bin)) {
            git.customBinary(git_bin);
            if (platform !== 'win32') {
                const path = require('path');
                git.env({
                    'GIT_TEMPLATE_DIR': path.join(git_dir, 'share/git-core/templates'),
                    'GIT_SSL_CAINFO': path.join(git_dir, 'ssl/cacert.pem'),
                    'GIT_EXEC_PATH': path.join(git_dir, 'libexec/git-core'),
                    'PREFIX': git_dir
                })
            }
        } else {
            throw new Error("Couldn't find embed git binaries.")
        }
    }

    return git;
};

