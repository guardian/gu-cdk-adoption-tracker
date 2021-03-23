import { Octokit } from "@octokit/rest";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";
import CloudWatch from "aws-sdk/clients/cloudwatch";

if (!process.env["API_TOKEN"]) {
  throw new Error("No API_TOKEN envar for GitHub");
}

async function putMetric({ name, value }: { name: string; value: number }) {
  const cw = new CloudWatch({ region: "eu-west-1" });
  // @ts-ignore
  cw.putMetricData({
    MetricData: [
      {
        MetricName: "gu-cdk-adoption",
        Dimensions: [{ Name: "Type", Value: name }],
        Timestamp: new Date(),
        Unit: "Count",
        Value: value,
      },
    ],
    Namespace: "GitHub",
  }).promise();
}

export async function handler() {
  const octokit = new Octokit({ auth: process.env["API_TOKEN"] });
  const reposUsingGuCdk: RestEndpointMethodTypes["search"]["code"]["response"] = await octokit.search.code(
    {
      q: `user:guardian filename:package.json "@guardian/cdk"`,
    }
  );
  console.log(`${reposUsingGuCdk.data.total_count} using GuCDK`);
  await putMetric({
    name: "Repositories using @guardian/cdk",
    value: reposUsingGuCdk.data.total_count,
  });

  const usingAwsCdk = await octokit.search.code({
    q: `user:guardian filename:package.json "@aws-cdk"`,
  });
  console.log(`${usingAwsCdk.data.total_count} using @aws-cdk/core`);

  await putMetric({
    name: "Repositories using @aws-cdk/core",
    value: usingAwsCdk.data.total_count,
  });

  const usingCfn = await octokit.search.code({
    q: `user:guardian filename:"cloudformation.yaml" filename:"cloudformation.yml" filename:"cfn.yaml" filename:"cfn.yml"`,
  });
  console.log(`${usingCfn.data.total_count} using cloudformation`);

  await putMetric({
    name: "Repositories using Cloudformation",
    value: usingCfn.data.total_count,
  });
}

if (require.main === module) {
  (async () => await handler())();
}
