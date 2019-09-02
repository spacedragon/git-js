'use strict';

import Test from "./include/runner";
import { LsTreeSummary, FileItem } from "../../src/responses/LsTreeSummary";

import FS from "fs";
import PATH from "path";
import { BatchFileProcessor } from "../../typings/responses/BatchFileProcessor";
import { StatusResult } from "../../typings/promise";

const setUp = (context : any) => {

   const repo = context.gitP(context.root);
   return repo.init()
      .then(() => context.file('src', 'file.txt', 'file content'))
      .then(() => context.file('src', 'file2.txt', 'file content2'))
      .then(() => context.file('doc', 'README.md', 'readme'))
      .then(() => repo.add('src/file.txt'))
      .then(() => repo.add('src/file2.txt'))
      .then(() => repo.add('doc/README.md'))
      .then(() => repo.addConfig('user.name', 'Some One'))
      .then(() => repo.addConfig('user.email', 'Some@One.com'))
      .then(() => repo.commit('first commit'))
      .then((commit: any) => context.commit = commit)
      ;
};

export default {
   'ls tree can list all files': new Test(setUp, (context: any, assert: any) => {
      const tree = context.git(context.root).lsTree('HEAD', '.', { recursive: true });
      return tree.allFiles().then((files: FileItem[]) => {
            assert.ok(files.find((f: FileItem) => f.path === 'src/file.txt') !== undefined);
            assert.ok(files.find((f: FileItem) => f.path === 'src/file2.txt') !== undefined);
            assert.ok(files.find((f: FileItem) => f.path === 'doc/README.md') !== undefined);
         });
   }),

   'iterate file by batch mode':new Test(setUp, (context: any, assert: any) => {
      const f = async () => {
         const batch: BatchFileProcessor = context.git(context.root).batchFile();
         const tree: LsTreeSummary = context.git(context.root).lsTree('HEAD', '.', { recursive: true });
         for await (const f of tree.iterator()) {
            const content = await batch.getFile(f.id);
            assert.ok(content.length > 0);

         }
         console.log('end');
         batch.end();
      };
      return f();
   }),

   'iterate whole repo by batch mode':new Test(setUp, (context: any, assert: any) => {
      const f = async () => {
         let root = process.cwd();
         const status: StatusResult = await context.gitP(root).status();
         const changed = new Set();
         status.modified.forEach(v => changed.add(v));
         status.deleted.forEach(v => changed.add(v));
         status.not_added.forEach(v => changed.add(v));
         const batch: BatchFileProcessor = context.git(root).batchFile();
         const tree: LsTreeSummary = context.git(root).lsTree('HEAD', '.', { recursive: true });
         for await (const f of tree.iterator()) {
            const p = PATH.join(root, f.path);
            if (!changed.has(f.path) && FS.existsSync(p)) {
               const content = await batch.getFile(f.id);
               const expected = FS.readFileSync(p);
               assert.equal(content.compare(expected), 0);
            }
         }
         console.log('end');
         batch.end();
      };
      return f();
   }),
};
