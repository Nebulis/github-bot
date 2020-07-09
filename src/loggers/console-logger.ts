/* eslint-disable no-console */
import chalk from "chalk";
import { Logger } from "./logger";
import { PullRequest } from "../github";

const orange = chalk.hsl(39, 100, 50);
const yellow = chalk.hsl(53, 100, 50);
const red = chalk.hsl(360, 100, 50);
const green = chalk.hsl(123, 100, 50);
const blue = chalk.hsl(201, 100, 50);

export class ConsoleLogger implements Logger {
  organisation = (name: string): void => console.log(orange.bold(name));

  afterReviewers = (): void => console.log(); // new line

  repository = (name: string): void => console.log(blue(name));

  reviewers = (pullRequest: PullRequest): void =>
    console.log(
      `${
        pullRequest.approved
          ? green(`[#${pullRequest.number}] ${pullRequest.title}`)
          : `[#${pullRequest.number}] ${pullRequest.title}`
      } - ${
        pullRequest.requested_reviewers.length === 0
          ? red("No reviewers")
          : yellow(pullRequest.requested_reviewers.map((reviewer) => reviewer.login).join(","))
      }`
    );
}
