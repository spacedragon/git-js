import { StdinWriter } from "../util/stdin_writer";
import { SimpleGit } from "../promise";
import { StdoutReader } from "../util/stdout_reader";

interface Job {
   line: string,
   resolve: (buffer: TreeDiff[]) => void,
   reject: (error: Error) => void,
}


export interface TreeDiff {
   srcMode?: number,
   dstMode?: number,
   srcId?: string,
   dstId?: string,
   type: DiffKind,
   path: string,
   insertions?: number,
   deletions?: number,
   changes?: number,
   binary?: boolean,
   beforePath?: string
}

export enum DiffKind {
   ADDED = 'ADDED',
   DELETED = 'DELETED',
   MODIFIED = 'MODIFIED',
   RENAMED = 'RENAMED',
}


export class DiffTreeSummary {
   public readonly reader: StdoutReader = new StdoutReader();

   public summary: { insertions: number, deletions: number, fileChanged: number } | null = null;
   constructor(readonly git: SimpleGit, revA: string, revB?: string,
      readonly opt: {
         showTree?: boolean,
         showSize?: boolean,
         recursive?: boolean,
         detectRename?: boolean,
         summary?: boolean
      } = {}) {

      var command = ["diff-tree", '-c'];
      if (opt.showTree) {
         command.push('-t');
      }
      if (opt.recursive) {
         command.push('-r');
      }
      if (opt.detectRename) {
         command.push('-M');
      }
      if (opt.summary) {
         command.push('--stat=4096');
         command.push('--compact-summary');
      } else {
         command.push('--raw');
      }
      command.push(revA);
      if (revB) {
         command.push(revB);
      }
      let self = this;
      git.newGit().git._run(command, () => {
      }, {
         stream: {
            stdOut: this.reader
         },
         onError(exitCode:number, error: string) {
            self.errorMsg = error
         }
      });
   }

   private errorMsg: string | null = null;

   protected handleRaw(line: string) {
      const diff_pattern = /:(\d{6}) (\d{6}) ([a-h0-9]{40}) ([a-h0-9]{40}) ([ACDMRTUX])\d*\s+(.*)/;
      const arr = line.match(diff_pattern);
      if (arr) {
         const [, srcMode, dstMode, srcId, dstId, typeStr, path] = arr;
         let type: DiffKind;
         switch (typeStr[0]) {
            case 'A':
               type = DiffKind.ADDED;
               break;
            case 'D':
               type = DiffKind.DELETED;
               break;
            case 'R':
               type = DiffKind.RENAMED
               break;
            default:
               type = DiffKind.MODIFIED
         }
         return {
            srcMode: parseInt(srcMode),
            dstMode: parseInt(dstMode),
            srcId,
            dstId,
            type,
            path
         } as TreeDiff;
      }
      return null;
   }

   public handleSummaryLine(line: string) {
      let [left, right] = line.split('|');
      left = left.trim();
      const idx = left.indexOf(' => ');
      const ret = {
         path: left,
         type: DiffKind.MODIFIED

      } as TreeDiff;
      if (idx >= 0) {
         ret.beforePath = left.slice(0, idx);
         ret.path = left.slice(idx + 4);
         ret.type = DiffKind.RENAMED;
      }
      if (left.endsWith(' (gone)')) {
         ret.path = left.slice(0, -7);
         ret.type = DiffKind.DELETED;
      } else {
         const idx = left.indexOf(' (new');
         if (idx >=0) {
            ret.path = left.slice(0, idx);
            ret.type = DiffKind.ADDED;
         }
      }
      right = right.trim();
      if (right.startsWith('Bin')) {
         ret.binary = true;
      } else {
         const [changes, pm] = right.split(' ');
         ret.changes = parseInt(changes, 10);
         ret.insertions = pm.replace('-', '').length;
         ret.deletions = pm.replace('+', '').length;
      }
      return ret;
   }

   public handleSummary(line: string) {      
      const p = /(\d+) files? changed, (\d+) insertions?\(\+\), (\d+) deletions?\(\-\)/;
      const m = line.match(p);
      if (m) {
         return {
            insertions: parseInt(m[1]),
            deletions: parseInt(m[2]),
            fileChanged: parseInt(m[3])
         }
      }
      return null;
   }

   public async* iterator(): AsyncIterableIterator<TreeDiff> {
      for await (const line of this.reader.lines()) {
         if (this.errorMsg) {
            throw new Error(this.errorMsg);
         }
         if (this.opt.summary) {
            if (line.includes('|')) {
               const diff = this.handleSummaryLine(line);
               if (diff) {
                  yield diff;
               }
            } else {
               this.summary = this.handleSummary(line);
            }
         } else {
            const diff = this.handleRaw(line);
            if (diff) {
               yield diff;
            }
         }
      }
   }

   public async all(): Promise<TreeDiff[]> {
      const ret: TreeDiff[] = [];
      for await (const d of this.iterator()) {
         ret.push(d);
      }
      return ret;
   }



}
