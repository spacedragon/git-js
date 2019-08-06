const runner = require('@kwsites/test-runner');
const glob = require('glob');

let files = []
for (const f of process.argv.slice(3)) {
    files = files.concat(glob.sync(f));
};

runner.run(files);