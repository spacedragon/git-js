import { StdinWriter } from "../util/stdin_writer";
import { BatchProcessor } from "../util/BatchProcessor";
import { SimpleGit } from "../promise";

interface Job {
   line: string,
   resolve: (buffer: TreeDiff[]) => void,
   reject: (error: Error) => void,
}


export interface TreeDiff {
   srcMode: number,
   dstMode: number,
   srcId: string,
   dstId: string,
   type: string,
   path: string
}

export class DiffTreeSummary extends BatchProcessor<Job> {
   public readonly writer: StdinWriter = new StdinWriter();

   constructor(git: SimpleGit,
               opt: { showTree?: boolean, showSize?: boolean, recursive?: boolean, detectRename?:boolean }) {
      super();
      var command = ["diff-tree", '--raw', '--shortstat', '--stdin', '--no-commit-id'];
      if (opt.showTree) {
         command.push('-t');
      }
      if (opt.recursive) {
         command.push('-r');
      }
      if (opt.detectRename) {
         command.push('-M');
      }

      git.git._run(command, () => {}, {
         stream: {
            stdOut: this.reader,
            stdIn: this.writer
         }
      });
   }

   protected failJob(job: Job, error: Error) {
      job.reject(error);
   }

   protected handleData(data: Buffer, job: Job): boolean {
      const str = data.toString('utf-8');
      if (str.trim() === "") { // no diff
         job.resolve([]);
         return true;
      } else if (str.startsWith(job.line)) {
         job.reject(new Error(`invalid id `+job.line));
         return true;
      }
      const p = /\d+ files? changed/g;
      if (p.test(str)) {
         const diff_pattern = /:(\d{6}) (\d{6}) ([a-h0-9]{40}) ([a-h0-9]{40}) ([ACDMRTUX])\d*\s+(.*)/g;
         let arr;
         let diffs = [];
         while ((arr = diff_pattern.exec(str)) !== null) {
            const [, srcMode, dstMode, srcId, dstId, type, path] = arr;
            diffs.push({
               srcMode: parseInt(srcMode),
               dstMode: parseInt(dstMode),
               srcId,
               dstId,
               type,
               path
            } as TreeDiff);
         }
         job.resolve(diffs);
         return true;
      }
      return false;
   }

   protected startJob(job: Job) {
      this.writer.write(job.line+'\n');
   }

   public getDiff(revA: string, revB?: string) {
      return new Promise<TreeDiff[]>((resolve, reject) => {
         const job = {
            line: revA + (revB ? " " + revB : ""),
            resolve,
            reject
         };
         this.enqueueJob(job);
      })
   }

   public end() {
      this.writer.end();
   }
}
