export class StdoutReader implements ReadableStreamHandler{
   private stream: NodeJS.ReadableStream | null = null;
   public onData: (buf: Buffer) => void = () => {};
   public onEnd: () => void = () => {};

   constructor() {
   }

   public attach(stream: NodeJS.ReadableStream, _fallback: Buffer[]) {
      this.stream = stream;
      this.stream!.on('data', this.onData);
      this.stream!.on('data', this.onEnd);
   }



   async* iterator(): AsyncIterableIterator<Buffer> {
      for await (const chunk of this.stream!) {
         yield chunk as Buffer;
      }
   }
}


export interface ReadableStreamHandler {
   attach(stream: NodeJS.ReadableStream, fallback: Buffer[]): void
}
