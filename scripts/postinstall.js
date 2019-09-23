const fs = require('fs');
const os = require('os');

const platform = os.platform();

const { paths } = require('./util');

const { binPath } = paths(platform);

const install = require('./install');

if (fs.existsSync(binPath)) {
    console.log('binary founded, skipping download.')
} else {
    let code = 0
    install(platform)
    .catch((error) => { 
        console.error(error);
        code = 1 
    })
    .finally(() => {
        process.exit(code);
    });
}

module.exports = install;
