'use strict';
const FS = require('fs');
const PATH = require('path');
const os = require('os');

module.exports = function () {
   let context = {
      dir(path) {
         const dir = PATH.join(context.root, path);
         if (!FS.existsSync(dir)) {
            FS.mkdirSync(dir);
         }

         return dir;
      },
      file(dir, path, content) {
         const file = PATH.join(context.dir(dir), path);
         FS.writeFileSync(file, content, 'utf8');

         return file;
      },
      rename(dir, path, path2) {
          FS.renameSync(PATH.join(context.dir(dir), path), PATH.join(context.dir(dir), path2));
      },
      root: FS.mkdtempSync(PATH.join(process.env.TMPDIR || os.tmpdir(), 'simple-git-test-')),
      get rootResolvedPath() {
         return FS.realpathSync(context.root);
      },
      git: require('../../../dist/init'),
      gitP: require('../../../dist/promise'),
      deferred: function () {
         let d = {};
         d.promise = new Promise((resolve, reject) => {
            d.resolve = resolve;
            d.reject = reject;
         });

         return d;
      }
   };
   return context;
};
