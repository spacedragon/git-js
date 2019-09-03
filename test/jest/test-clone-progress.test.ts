'use strict';

import newContext from "../integration/include/context";
import { Progress } from "../../src/responses/ProgressProcessor";

let context = newContext();

test('clone repo will receive progress',  async() => {
   const git: any = context.gitP(context.root);
   let progress: Progress | null = null;
   const progressCallback = (p: Progress) => {
      progress = p;
   };
   await git.clone('https://github.com/elastic/simple-git', context.root, { progressCallback });

   expect(progress!.percentage).toBeGreaterThan(0);
   expect(progress!.total).toBeGreaterThan(0);
   expect(progress!.count).toBeGreaterThan(0);
   expect(progress!.state.length).toBeGreaterThan(0);
},10000);
