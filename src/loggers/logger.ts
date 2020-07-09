import { PullRequest } from "../github";

export interface Logger {
  organisation: (name: string) => void;
  repository: (name: string) => void;
  reviewers: (pullRequest: PullRequest) => void;
  afterReviewers: () => void;
}
