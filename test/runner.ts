const runner = require('@kwsites/test-runner');
const glob = require('glob');
const path = require('path');
const assert = require('assert');

let files: string[] = [];
for (const f of process.argv.slice(3)) {
   files = files.concat(glob.sync(f));
}


function testSuites(file: string, module: any) {
   // @ts-ignore
   describe(file, function () {
      if (typeof module.setUp === 'function') {
         // @ts-ignore
         beforeEach(function () {
            return new Promise(resolve => {
               module.setUp(resolve)
            })
         });

      }
      if (typeof module.tearDown === 'function') {
         // @ts-ignore
         afterEach(function () {
            return new Promise(resolve => {
               module.tearDown(resolve)
            })
         })
      }
      for (const key in module) {
         if (module.hasOwnProperty(key)) {
            if (typeof module[key] === 'object') {
               testSuites(key, module[key]);
            } else if (typeof module[key] === 'function' && !['tearDown', 'setUp'].includes(key)) {
               it(key, () => {
                  return new Promise((resolve, reject) => {
                     return module[key](buildTest(resolve, reject));
                  });
               });
            }
         }
      }
   });
}


files.forEach((file: string) => {
   const module = require(path.join(process.cwd(), file));
   testSuites(file, module);
});

function buildTest(done: () => void, reject: (error: any) => void) {
   return {
      ok(thing: any, message: string) {
         assert.ok(thing, message);
      },
      equal(left: any, right: any, message: string) {
         assert.equal(left, right, message);
      },
      equals(left: any, right: any, message: string) {
         assert.equal(left, right, message);
      },
      deepEqual(left: any, right: any, message: string) {
         assert.deepEqual(left, right, message);
      },
      notEqual(left: any, right: any, message: string) {
         assert.notEqual(left, right, message);
      },
      same(left: any, right: any, message: string) {
         assert.deepEqual(left, right, message);
      },
      throws(callback: any) {
         let isErr;
         try {
            callback();
         } catch (e) {
            isErr = e;
         }
         assert.notStrictEqual(isErr, undefined);
      },
      doesNotThrow(callback: any) {
         let isErr;
         try {
            callback();
         } catch (e) {
            isErr = e;
         }
         assert.strictEqual(isErr, undefined);
      },
      done(err: any) {
         if (err) {
            reject(err);
         }
         done();
      }
   }
}

