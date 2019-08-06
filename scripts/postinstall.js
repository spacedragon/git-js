const fs = require('fs');
const os = require('os');

const platform = os.platform();

const { download, unpack } = require('./download');


const { paths } = require('./util');

const { binPath, packagePath, nativeDir } = paths(platform);

if (fs.existsSync(binPath)) {
    console.log('existing binary founded, skipping download.')
} else {
    let code = 0
    download(platform, packagePath).then(() => {
        return unpack(packagePath, nativeDir)
    })
    .catch((error) => { 
        console.error(error);
        code = 1 
    })
    .finally(() => {
        fs.unlink(packagePath, console.error);
        process.exit(code);
    });
}