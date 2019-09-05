'use strict';

import { Progress } from "../../src/responses/ProgressProcessor";
import Test from "./include/runner";

export default {
   'clone repo will receive progress': new Test(()=> {}, async (context: any, assert: any) => {
      const git: any = context.gitP(context.root);
      let progress: Progress | null = null;
      const progressCallback = (p: Progress) => {
         progress = p;
      };
      await git.clone('https://github.com/elastic/simple-git', context.root, { progressCallback });

      assert.ok(progress!.percentage > 0);
      assert.ok(progress!.total > 0);
      assert.ok(progress!.count > 0);
      assert.ok(progress!.state.length > 0);
   }),
}
