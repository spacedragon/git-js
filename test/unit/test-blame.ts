import { BlameSummary } from '../../dist/responses/BlameSummary';
const {theCommandRun, restore, Instance, closeWith} = require('./include/setup');
import sinon from 'sinon';
import { SimpleGit } from '../../dist/promise';

let git: any, sandbox: any;

exports.setUp = function (done: any) {
    restore();
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'warn');
    done();
 };
 
 exports.tearDown = function (done: any) {
    restore();
    sandbox.restore();
    done();
 };
 
 exports.blame = {
    setUp: function (done:  any) {
       git = Instance();
       done();
    },

    'parse summary' (test: any) {
        const blames = BlameSummary.parse(`
        8a3b96d768b8ed48313b8cd544a1cfd790dc5a49 110 110 33
        author Author Tester
        author-mail <test@email.com>
        author-time 1565123524
        author-tz -0700
        committer Tester
        committer-mail <noreply@github.com>
        committer-time 1565123524
        committer-tz -0700
        summary some commit message
        previous 077ae4dc652d13f86a01e23f6646fac251006b79 NOTICE.txt
        filename NOTICE.txt
   `).blames;
        
        test.equal(blames.length, 1);
        var blame = blames[0];
        test.equal(blame.sourceLine, 110);
        test.equal(blame.resultLine, 110);
        test.equal(blame.lines, 33);
        test.equal(blame.commit!.author!.name, 'Author Tester');
        test.equal(blame.commit.committer!.email, 'noreply@github.com');

        test.done();
     },
  
     'with summary' (test: any) {
        git.blame('HEAD', 'test.file', (err: any, summary: BlameSummary) => { 
            test.same(['blame', '--incremental', 'HEAD', 'test.file'], theCommandRun());
            const blames = summary.blames;
            test.equal(blames.length, 2);
            var blame = blames[0];
            test.equal(blame.sourceLine, 110);
            test.equal(blame.resultLine, 110);
            test.equal(blame.lines, 33);
            test.equal(blame.commit!.author!.name, 'Author Tester');
            test.done();
        }); 
   
        closeWith(`
            8a3b96d768b8ed48313b8cd544a1cfd790dc5a49 110 110 33
            author Author Tester
            author-mail <test@email.com>
            author-time 1565123524
            author-tz -0700
            summary some commit message
            previous 077ae4dc652d13f86a01e23f6646fac251006b79 NOTICE.txt
            filename NOTICE.txt
            8a3b96d768b8ed48313b8cd544a1cfd790dc5a49 90 80 33
            filename NOTICE.txt
         `);
         
     },
    
}