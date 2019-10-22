const request = require('request');
const util = require('./util')
const targz = require('targz');
const fs = require('fs');
const path = require('path');

function downloadUrl(platform) {
    const pkg = util.pkgVersion(platform);
    const packageName = util.pkgName(platform);
    if (platform === 'linux') {
        return `https://download.elasticsearch.org/code/native-git/${packageName}`;
    } else if (platform === 'win32') {
        return `https://github.com/desktop/dugite-native/releases/download/v${pkg.tag}/${packageName}`
    } else if (platform === 'darwin') {
        return `https://github.com/desktop/dugite-native/releases/download/v${pkg.tag}/${packageName}`
    } else {
        throw new Error('unsupported platform ' + platform);
    }
}

function exists(platform) {
    const url = downloadUrl(platform);
    const options = {
        method: 'HEAD', 
      };
    return new Promise((resolve, reject) => {  
        request.head(url, (err, res) => {
            if(err) {
                reject(err)
            }
            if(res.statusCode === 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

function download(platform, dest) {
    const url = downloadUrl(platform);
    console.log('Downloading package from '+ url)
    return new Promise((resolve, reject) => {  
        const dir = path.dirname(dest);
        fs.mkdirSync(dir, { recursive:true });
        const file = fs.createWriteStream(dest);
        request
            .get(url)
            .on('error', function(err) {
                fs.unlink(dest, console.error);  
                reject(err);
            })
            .pipe(file);
        file.on('finish', () => {
            file.close();
            resolve();
        });
    });
}

function unpack(file, dest) {
    return new Promise((resolve, reject) => {  
        targz.decompress({
            src: file,
            dest
        }, (err) => {
            if(err) reject(err);
            else resolve();
        })
    });
}

module.exports= {
    exists,
    downloadUrl,
    download,
    unpack
}