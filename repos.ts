import { Octokit } from "@octokit/rest";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";

type GetAllRepos = RestEndpointMethodTypes["teams"]["listReposInOrg"]["response"]["data"]

export async function getRepos(
  octokit: Octokit,
  page: number
): Promise<
  RestEndpointMethodTypes["teams"]["listReposInOrg"]["response"]["data"]
> {
  const result = await octokit.repos.listForOrg({
    org: "guardian",
    per_page: 100,
    page: page,
    sort: "full_name",
  });
  return result.data;
}

export async function getAllRepos(octokit: Octokit): Promise<GetAllRepos> {
  const records: RestEndpointMethodTypes["teams"]["listReposInOrg"]["response"]["data"] = [];
  let keepGoing = true;
  let offset = 0;
  while (keepGoing) {
    const response = await getRepos(octokit, offset);
    await records.push.apply(records, response);
    offset += 1;
    if (response.length === 0) {
      keepGoing = false;
      console.log(`Fetched all ${records.length} repositories`);
    }
  }
  return records;
}
