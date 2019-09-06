import { StdinWriter } from "../util/stdin_writer";
import { StdoutReader } from "../util/stdout_reader";
import { SimpleGit } from "../promise";

interface Job {
   id: string,
   resolve: (buffer: Buffer) => void,
   reject: (error: Error) => void,
   size?: number
}

enum State {
   IDLE,
   HEAD,
   DATA
}

const LF = '\n'.charCodeAt(0);

export class BatchFileProcessor {
   public readonly writer: StdinWriter = new StdinWriter();
   public readonly reader: StdoutReader = new StdoutReader();
   public jobs: Job[] = [];
   private state: State = State.IDLE;
   private temp: Buffer = Buffer.alloc(0);
   private data: Buffer[] = [];
   private currentJob: Job | undefined = undefined;

   constructor(git: SimpleGit) {

      this.reader.onData = this.onData.bind(this);
      this.reader.onEnd = this.onEnd.bind(this);
      var command = ['cat-file', '--batch'];
      // @ts-ignore
      git.git._run(command, () => {}, {
         format: 'buffer',
         stream: {
            stdIn: this.writer,
            stdOut: this.reader
         }
      });
   }

   private onEnd() {
      let error = new Error('process ended.');
      this.jobs.forEach(j => j.reject(error));
   }

   private onData(data: Buffer) {
      switch (this.state) {
         case State.IDLE:
            break;
         case State.HEAD:
            this.temp = this.temp.length === 0 ? data : Buffer.concat([this.temp, data]);
            const idx = this.temp.indexOf(LF);
            if (idx >= 0) {
               const line = this.temp.toString('utf8', 0, idx);
               this.temp = this.temp.slice(idx + 1);
               const [id, , size] = line.split(' ');
               const job = this.currentJob!;
               if (job.id !== id) {
                  console.error(line);
                  job.reject(new Error('illegal state, id doesn\'t match!'));
                  return;
               }
               job.size = parseInt(size);
               this.state = State.DATA;
               if (this.temp.length > 0) {
                  let data = this.temp;
                  this.temp = Buffer.alloc(0);
                  this.onData(data);
               }
            }
            break;
         case State.DATA:
            this.data.push(data);

            const total = this.data.reduce((sum, c) => sum + c.length, 0);
            const job = this.currentJob!;
            if (total >= job.size! + 1) {
               job.resolve(Buffer.concat(this.data, job.size));
               this.data = [];
               this.state = State.IDLE;
               this.process();
            }
            break;

      }
   };

   private process() {
      if (this.state === State.IDLE) {
         this.currentJob = this.jobs.shift();
         if (this.currentJob) {
            this.state = State.HEAD;
            this.writer.write(this.currentJob!.id + "\n");
         }
      }
   }

   public getFile(id: string): Promise<Buffer> {
      const p = new Promise<Buffer>((resolve, reject) => {
         this.jobs.push({ id, resolve, reject });
         this.process();
      });
      return p;
   }

   public end() {
      this.writer.end();
   }
}
