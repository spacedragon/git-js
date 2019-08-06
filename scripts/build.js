const os = require('os');
const { exists } = require('./download');
const { spawn } = require('child_process');

async function build(platform) {
    if (platform !== 'linux') {
        throw new Error('only build on linux platfrom.')
    }
    if (await exists(platform)) {
        console.log('existing package found, skip building');
        return;
    }
    return await new Promise(resolve => {
        const docker = spawn('docker', ['run',
            '-v',
            `${process.cwd()}:/build`,
            '--rm',
            'spacedragon/git_builder:v1',
            '/build/native/build.sh'],
            { stdio: 'inherit' }
        );
        docker.on('close', (code) => {
            resolve(code);
        });
    })
}

build(os.platform()).then(code => {
    process.exit(code);
});