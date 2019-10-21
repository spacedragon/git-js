import { StdoutReader } from "../util/stdout_reader";
import { SimpleGit } from "../promise";

export interface FileItem {
   mode: string;
   type: string;
   id: string;
   path: string;
   size: number | undefined;
}

const ItemRegex = /(\d{6})\s(blob|tree|commit)\s([0-9a-f]{40})(\s+\d+)?\s+(.*)/;

export class LsTreeSummary {

   constructor(git: SimpleGit, rev: string, path: string,
               opt: { showTree?: boolean, showSize?: boolean, recursive?: boolean }) {

      var command = ["ls-tree"];
      if (opt.showTree) {
         command.push('-t');
      }
      if (opt.showSize) {
         command.push('-l')
      }
      if (opt.recursive) {
         command.push('-r')
      }
      command.push(rev);
      command.push(path);

      git.newGit().git._run(command, () => {}, {
         stream: {
            stdOut: this.reader
         }
      });
   }

   public readonly reader: StdoutReader = new StdoutReader();

   public async* iterator(): AsyncIterableIterator<FileItem> {
      for await (const line of this.reader.lines()) {
         let m = line.match(ItemRegex);
         if (m) {
            const [, mode, type, id, size, path] = m;
            const item: FileItem = {
               mode,
               type,
               id,
               path,
               size: size ? parseInt(size, 10) : undefined,
            };
            yield item;
         }
      }
   }

   public async allFiles() {
      const files: FileItem[] = [];
      for await (const file of this.iterator()) {
         files.push(file);
      }
      return files;
   }

}
