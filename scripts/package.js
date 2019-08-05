var targz = require('targz');
var path = require('path');
var child_process = require('child_process');

module.exports = function (src, dest) {
    return new Promise((resolve, reject)=> {
        var gitDir = src || path.resolve(__dirname, '../native/git')
    var gitBin = path.join(gitDir, 'bin/git');

    var stdout = child_process.execFileSync(gitBin, ['--version'], { encoding: 'utf8'});
    var ver = 'unknown';
    var VER_PREFIX= 'git version ';
    if(stdout.startsWith(VER_PREFIX)) {
        ver = stdout.substring(VER_PREFIX.length).trim();
    }
    var packageName = "git-" + ver + "-linux.tar.gz" ;
    var destFile = dest || path.resolve(__dirname, '../native/', packageName);
    // compress files into tar.gz archive
    targz.compress({
            src: gitDir,
            dest: destFile,
        }, function(err){
            if(err) {
                reject(err);
            } else {
                resolve(destFile);
            }
        });
    });
}
 