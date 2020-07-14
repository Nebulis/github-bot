#!/usr/bin/env node
import yargs from "yargs";
import { getPullRequestsForOrganisations } from "./github";
import { ConsoleLogger } from "./loggers/console-logger";

const defaultOrganisations = ["Open-Attestation"];

const logger = new ConsoleLogger();

// eslint-disable-next-line no-unused-expressions
yargs
  .command(
    "reviews",
    "Get the status of reviews by organisations",
    (yarg) =>
      yarg.option("organisations", {
        type: "array",
        alias: "o",
        default: defaultOrganisations,
      }),
    async ({ organisations: cliOrganisations }) => {
      const organisations = await getPullRequestsForOrganisations({ organisations: cliOrganisations });
      organisations.forEach((org) => {
        logger.organisation(org.name);

        org.repositories
          .filter((repository) => {
            return repository.pullRequests.length > 0;
          })
          .forEach((repository) => {
            logger.repository(repository.name);

            repository.pullRequests.forEach((pullRequest) => logger.reviewers(pullRequest));
            logger.afterReviewers();
          });
      });
    }
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .help().argv;
