import { Octokit } from "@octokit/rest";
import { getAllRepos } from "./repos";
import {RestEndpointMethodTypes} from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";

interface GetContent {
  data: {
    content: any;
  };
}

if (!process.env["API_TOKEN"]) {
  throw new Error("No API_TOKEN envar for GitHub");
}

const decoded = (data: string) => {
  Buffer.from(data, "base64").toString();
};

(async () => {
  const octokit = new Octokit({ auth: process.env["API_TOKEN"] });
  const reposUsingGuCdk: RestEndpointMethodTypes["search"]["code"]["response"] = await octokit.search.code({
    q: `user:guardian filename:package.json "@guardian/cdk"`
  })
  console.log(`${reposUsingGuCdk.data.total_count} using GuCDK`)

  const usingAwsCdk = await octokit.search.code({
    q: `user:guardian filename:package.json "@aws-cdk"`
  })
  console.log(`${usingAwsCdk.data.total_count} using @aws-cdk/core`)

  const usingCfn = await octokit.search.code({
    q: `user:guardian filename:"cloudformation.yaml" filename:"cloudformation.yml" filename:"cfn.yaml" filename:"cfn.yml"`
  })

  console.log(`${usingCfn.data.total_count} using cloudformation`)
})();
