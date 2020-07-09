import yargs from "yargs";
import { getPullRequestsForOrganisations } from "./github";
import { ConsoleLogger } from "./loggers/console-logger";

const defaultOrganisations = ["Open-Attestation"];

const logger = new ConsoleLogger();

const { argv } = yargs.command("reviews", "Get the status of reviews by organisations", (yarg) =>
  yarg.option("organisation", {
    type: "array",
    alias: "o",
    default: defaultOrganisations,
  })
);

if (argv._[0] === "reviews") {
  const reviews = async () => {
    const organisations = await getPullRequestsForOrganisations({ organisations: argv.organisation });
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
  };
  reviews();
}
