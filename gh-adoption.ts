import { Octokit } from "@octokit/rest";
import { getAllRepos } from "./repos";

interface GetContent {
  data: {
    content: any;
  };
}

if (!process.env["APIToken"]) {
  throw new Error("No APIToken envar for GitHub");
}

const decoded = (data: string) => {
  Buffer.from(data, "base64").toString();
};

(async () => {
  const octokit = new Octokit({ auth: process.env["APIToken"] });
  const repos = await getAllRepos(octokit);
  console.log(repos.map((r) => r.name));
  console.log(repos.length);

  // Compare: https://docs.github.com/en/rest/reference/repos/#list-organization-repositories
  const res = (await octokit.repos.getContent({
    owner: "guardian",
    repo: "cdk",
    path: "package.json",
  })) as GetContent;

  console.log(decoded(res.data.content));
})();
