import { StdoutReader } from "../util/stdout_reader";

export interface FileItem {
   mode: string;
   type: string;
   id: string;
   path: string;
   size: number | undefined;
}

const ItemRegex = /(\d{6})\s(blob|tree|commit)\s([0-9a-f]{40})(\s+\d+)?\s+(.*)/;

export class LsTreeSummary  {
   public readonly reader: StdoutReader = new StdoutReader();

   private async *lines() {
      let previous = '';
      for await (const chunk of this.reader.iterator()) {
         previous += chunk.toString('utf-8');

         let eolIndex;
         while ((eolIndex = previous.indexOf('\n')) >= 0) {
            const line = previous.slice(0, eolIndex+1);
            yield line;
            previous = previous.slice(eolIndex+1);
         }
      }
      if (previous.length > 0) {
         yield previous;
      }
   }

   public async *iterator() {
      for await (const line of this.lines()) {
         let m = line.match(ItemRegex);
         if (m) {
            const [, mode, type, id, size, path] = m;
            const item: FileItem =  {
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
