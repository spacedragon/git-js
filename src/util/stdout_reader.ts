import readline from 'readline';
import stream from 'stream';

export class StdoutReader implements ReadableStreamHandler {
   private stream: NodeJS.ReadableStream | null = null;
   public onData: (buf: Buffer) => void = () => { };
   public onEnd: () => void = () => { };
   private attachPromise: Promise<void>;
   private resolve: () => void = () => { };
   constructor() {
      this.attachPromise = new Promise((resolve) => {
         this.resolve = resolve;
      });
   }

   public attach(stream: NodeJS.ReadableStream, _fallback: Buffer[]) {
      this.stream = stream;
      this.stream!.on('data', this.onData);
      this.stream!.on('end', this.onEnd);
      this.resolve();
   }



   // async* iterator(): AsyncIterableIterator<Buffer> {
   //    for await (const chunk of this.stream!) {
   //       yield chunk as Buffer;
   //    }
   // }

   async* lines(): AsyncIterableIterator<string> {
      if (!this.stream) {
         await this.attachPromise;
      }

      const rl = readline.createInterface({
         input: this.stream!
      });
      
      // This is an awkward workaround because 
      // we can't use AsyncIterator yet in current version of nodejs!
      // for await (const line of rl) {
      //    yield line;
      // }
      const lines: string[] = [];
      rl.on("line", line => {
         lines.push(line);
      });
      await new Promise((resolve) => {
         rl.on("close", () => {
            resolve();
         });
      })
      for (const line of lines) {
         yield line;
      }
   }

}


export interface ReadableStreamHandler {
   attach(stream: NodeJS.ReadableStream, fallback: Buffer[]): void
}
