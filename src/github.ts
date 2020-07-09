import fetch from "node-fetch";

const headers = {
  authorization: `token ${process.env.GITHUB_TOKEN}`,
};

type Organisation = {
  name: string;
  repositories: Repository[];
};
type Repository = {
  name: string;
  pullRequests: PullRequest[];
};
export type PullRequest = {
  number: number;
  title: string;
  // eslint-disable-next-line camelcase
  requested_reviewers: GithubReviewer[];
  approved: boolean;
  user: {
    type: string;
  };
};
export type GithubReviewer = {
  login: string;
};
type GithubReviewStatus = {
  state: "DISMISSED" | "APPROVED";
};
type GithubPullRequest = {
  number: number;
  title: string;
  // eslint-disable-next-line camelcase
  requested_reviewers: GithubReviewer[];
  user: {
    type: string;
  };
};

export const getReviewStatus = ({
  organisation,
  repository,
  pullRequest,
}: {
  organisation: string;
  repository: string;
  pullRequest: number;
}): Promise<boolean> => {
  return fetch(`https://api.github.com/repos/${organisation}/${repository}/pulls/${pullRequest}/reviews`, {
    headers,
  })
    .then((res) => res.json())
    .then((reviewStatuses: GithubReviewStatus[]) => !!reviewStatuses.find((review) => review.state === "APPROVED"));
};

export const getPullRequests = ({
  organisation,
  repository,
}: {
  organisation: string;
  repository: string;
}): Promise<PullRequest[]> => {
  return fetch(`https://api.github.com/repos/${organisation}/${repository}/pulls`, { headers })
    .then((res) => res.json())
    .then((pullRequests: GithubPullRequest[]) => pullRequests.filter((pullRequest) => pullRequest.user.type !== "Bot"))
    .then((pullRequests: GithubPullRequest[]) => {
      return Promise.all(
        pullRequests.map((pullRequest) =>
          getReviewStatus({ organisation, repository, pullRequest: pullRequest.number }).then((status) => {
            return { ...pullRequest, approved: status };
          })
        )
      );
    });
};

export const getRepositories = ({ organisation }: { organisation: string }): Promise<{ name: string }[]> => {
  return fetch(`https://api.github.com/orgs/${organisation}/repos`, { headers }).then((res) => res.json());
};

export const getPullRequestsForOrganisations = async ({
  organisations,
}: {
  organisations: string[];
}): Promise<Organisation[]> => {
  return Promise.all(
    organisations.map((organisation) =>
      getRepositories({ organisation }).then(async (repositories) => {
        const pullRequests = await Promise.all(
          repositories.map((repository) => getPullRequests({ organisation, repository: repository.name }))
        );
        return {
          name: organisation,
          repositories: repositories.map((repository, index) => ({
            name: repository.name,
            pullRequests: pullRequests[index],
          })),
        };
      })
    )
  );
};
