import { ReadableStreamHandler } from "../util/stdout_reader";
import readline from 'readline';

export interface Progress {
   state: string,
   percentage: number,
   count: number,
   total: number
}

export type ProgressCallback = (progress: Progress) => void

const RE = /\s(.*:)\s+(\d+%)\s+\((\d+)\/(\d+)\)/;

export class ProgressProcessor implements ReadableStreamHandler {
   private rl: readline.Interface | undefined = undefined;

   constructor(public readonly callback: ProgressCallback) {
   }

   attach(stream: NodeJS.ReadableStream, fallback: Buffer[]) {
      this.rl = readline.createInterface({
         input: stream
      });
      this.rl.on('line', line => this.onLine(line, fallback));
   }

   onLine(line: string, fallback: Buffer[]) {
      const m = line.match(RE);
      if (m) {
         const [,state, percentage, count, total] = m;
         this.callback({
            state,
            percentage: parseInt(percentage),
            count: parseInt(count),
            total: parseInt(total)
         });
      } else {
         fallback.push(Buffer.from(line +"\n"));
      }
   }

}
