
var Git = require('./git');

module.exports = function (baseDir, useSystemGit) {

   var dependencies = require('./util/dependencies');

   if (baseDir && !dependencies.exists(baseDir, dependencies.exists.FOLDER)) {
       throw new Error("Cannot use simple-git on a directory that does not exist.");
    }
    var git = new Git(baseDir || process.cwd(), dependencies.childProcess(), dependencies.buffer());
    if(!useSystemGit) {
        var path = require('path');
        var fs = require('fs');
        var git_dir = path.resolve(__dirname ,".." ,"native/git");
        var git_bin = path.join(git_dir, "bin/git");
        if (fs.existsSync(git_bin)) {
            git.customBinary(git_bin);
            git.env({
                'GIT_TEMPLATE_DIR': path.join(git_dir, 'share/git-core/templates'),
                'GIT_SSL_CAINFO': path.join(git_dir, 'ssl/cacert.pem'),
                'GIT_EXEC_PATH': path.join(git_dir, 'libexec/git-core'),
                'PREFIX': git_dir
            })
        }
    }

    return git;
};

