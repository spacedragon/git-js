export class BlameSummary {
    private commitCache: Map<string, Commit> = new Map();
    public readonly blames: Blame[] = [];

    public static parse(result: string) {
        const blameSummary = new BlameSummary();
        const lines = result.split('\n');
        let blame: Blame | null = null;
        let commitLines: string[] = [];
        for (let line of lines) {
            line = line.trim()
            if (blame) {
                if (line.startsWith('filename ')) {
                    blameSummary.parseCommit(commitLines, blame.commit);
                    blameSummary.blames.push(blame);
                    blame = null;
                    commitLines = [];
                } else {
                    commitLines.push(line);
                }
            } else {
                blame = blameSummary.parseHeadLine(line);
            }
        }
        return blameSummary;
    }

    private parseCommit(lines: string[], commit: Commit) {
        let properties: { [key: string]: any } = {};
        for (const line of lines) {
            let idx = line.indexOf(' ');
            if (idx >= 0) {
                const key = line.slice(0, idx);
                properties[key] = line.slice(idx + 1).trim()
            }
        }
        if (properties.hasOwnProperty('summary')){
            commit.message = properties['summary'];
        }
        if (properties.hasOwnProperty('author')) {
            commit.author = this.parseSingature(properties, 'author');
        }
        if (properties.hasOwnProperty('committer')) {
            commit.committer = this.parseSingature(properties, 'committer');
        }
    }
    private parseSingature(properties: { [key: string]: any; }, key: string): Singature | undefined { 
        const name = properties[key];
        const email = properties[`${key}-mail`].slice(1, -1);
        const time = parseInt(properties[`${key}-time`]);
        const tz = parseInt(properties[`${key}-tz`]);
        return {
            name,
            email,
            time,
            tz
        } 
    }


    private parseHeadLine(line: string) {
        const m = line.match(/([0-9a-z]{40}) (\d+) (\d+) (\d+)/);
        if (m) {
            const [, commitId, sourceLine, resultLine, lines] = m;
            let commit = this.commitCache.get(commitId);
            if (!commit) {
                commit = {
                    id: commitId
                }
                this.commitCache.set(commitId, commit);
            }
            return {
                resultLine: parseInt(resultLine, 10),
                sourceLine: parseInt(sourceLine, 10),
                lines: parseInt(lines, 10),
                commit,
            };
        }
        return null;
    }
}
export interface Singature {
    name: string;
    email: string;
    time: number;
    tz: number
}

export interface Commit {
    id: string;
    message?: string;
    committer?: Singature;
    author?: Singature;
}

export interface Blame {
    sourceLine: number;
    resultLine: number;
    lines: number;
    commit: Commit;
}