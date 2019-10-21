import Test from "./include/runner";
import { DiffTreeSummary } from "../../dist";

let commit1: any;
let commit2: any;
let commit3: any;
const setUp = (context : any) => {

   const repo = context.gitP(context.root);
   return repo.init()
      .then(() => context.file('src', 'file.txt', 'file content'))
      .then(() => repo.add('src/file.txt'))
      .then(() => repo.addConfig('user.name', 'Some One'))
      .then(() => repo.addConfig('user.email', 'Some@One.com'))
      .then(() => repo.commit('first commit'))
      .then((commit: any) => commit1 = commit)
      .then(() => context.file('src', 'file.txt', 'file content\n file content line 2'))
      .then(() => context.rename('src', 'file.txt', 'file2.txt'))
      .then(() => repo.add('src/file.txt'))
      .then(() => repo.add('src/file2.txt'))
      .then(() => repo.commit('second commit'))
      .then((commit: any) => commit2 = commit)
      .then(() => context.file('src', 'readme.md', 'readme'))
      .then(() => repo.add('src/readme.md'))
      .then(() => repo.commit('third commit'))
      .then((commit: any) => commit3 = commit)
      ;
};

export default {
   'show one tree diff': new Test(setUp, async (context: any, test: any) => {
      const ref = await context.gitP(context.root).revparse([commit3.commit]);

      const git = context.gitP(context.root);
      const diff: DiffTreeSummary = new DiffTreeSummary(git, ref, undefined, {
         showTree: true,
         recursive: true,
         detectRename: true
      });
      const diffs = await diff.all();
      test.ok(diffs.length > 0);
   }),
   'with summary' : new Test(setUp, async (context: any, test: any) => {
      const git = context.gitP(context.root);
      const diff: DiffTreeSummary = new DiffTreeSummary(git, "HEAD~2", "HEAD", {
         showTree: true,
         recursive: true,
         detectRename: true,
         summary: true
      });
      const diffs = await diff.all();
      test.ok(diffs.length > 0);
      test.equal(diff.summary!.fileChanged, 1)
      test.equal(diff.summary!.insertions, 3)
      test.equal(diff.summary!.deletions, 3)
   }),
}
