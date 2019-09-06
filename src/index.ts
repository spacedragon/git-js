import gitPromise from './promise';
export { DiffTreeSummary, TreeDiff } from './responses/DiffTreeSummary'
export { ProgressProcessor, Progress, ProgressCallback } from './responses/ProgressProcessor'
export { LsTreeSummary, FileItem } from './responses/LsTreeSummary'
export { BatchFileProcessor } from './responses/BatchFileProcessor'
export { StatusResult, FetchResult, DiffResult, TagResult, PullResult, BranchSummary, CommitSummary,
   LogOptions, Options, outputHandler
} from './promise'

export function simplegit(baseDir?: string, useSystemGit?: boolean): gitPromise.SimpleGit {
   return gitPromise(baseDir, useSystemGit)
}

