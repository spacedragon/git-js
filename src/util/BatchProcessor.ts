import { StdoutReader } from "./stdout_reader";

const EMPTY = Buffer.alloc(0);

export abstract class BatchProcessor<J> {
   public readonly reader: StdoutReader = new StdoutReader();
   public jobs: J[] = [];
   private currentJob: J | undefined = undefined;
   private idle : boolean = true;
   private temp = EMPTY;

   protected constructor() {
      this.reader.onData = this.onData.bind(this);
      this.reader.onEnd = this.onEnd.bind(this);
   }

   private onEnd() {
      let error = new Error('reader ended.');
      this.jobs.forEach(j => this.failJob(j, error));
   }

   protected onData(data: Buffer) {
      if (this.idle) {
         this.process();
         return;
      }
      this.temp = this.temp === EMPTY ? data : Buffer.concat([this.temp, data]);
      if (this.handleData(this.temp, this.currentJob!)) {
         this.idle = true;
         this.temp = EMPTY;
         this.process();
      }
   }

   protected process() {
      if (this.idle) {
         this.currentJob = this.jobs.shift();
         if (this.currentJob) {
            this.idle = false;
            this.startJob(this.currentJob);
         }
      }
   }

   public end() {
   }

   protected abstract handleData(data: Buffer, job: J) : boolean;

   protected abstract startJob(job: J): void;

   protected abstract failJob(job: J, error: Error): void;

   protected enqueueJob(job: J){
      this.jobs.push(job);
      this.process();
   }
}
