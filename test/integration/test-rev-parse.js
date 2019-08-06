'use strict';

const Test = require('./include/runner');
const fs = require('fs');

const setUp = (context) => {

   const repo = context.gitP(context.root);
   return repo.init()
      .then(() => context.file('src', 'file.txt', 'fie content'))
      .then(() => repo.add('src/file.txt'))
      .then(() => repo.addConfig('user.name', 'Some One'))
      .then(() => repo.addConfig('user.email', 'Some@One.com'))
      .then(() => repo.commit('first commit'))
      .then((commit) => context.commit = commit)
      ;
};

module.exports = {

   'gets the commit hash for HEAD': new Test(setUp, (context, assert) => {
      return context.gitP(context.root).revparse(['HEAD'])
         .then((actual) => {
            assert.same(typeof actual, 'string');
            assert.same(actual, actual.trim());
         });

   }),

   'gets the repo root': new Test(setUp, (context, assert) => {
      return context.gitP(context.root).revparse(['--show-toplevel'])
         .then((actual) => {

            assert.same(fs.realpathSync(actual), fs.realpathSync(context.rootResolvedPath));
         });

   }),

};
