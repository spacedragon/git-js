
export class StdinWriter {
   private stream: NodeJS.WritableStream| null = null;

   constructor() {
   }

   public write(line: string) {
       if (this.stream) {
          this.stream.write(line)
       }
   }

   public end() {
      if (this.stream) {
         this.stream.end()
      }
   }

   public attach(stream: NodeJS.WritableStream) {
      this.stream = stream;
   }
}
