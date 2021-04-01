import { Octokit } from "@octokit/rest";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";
import CloudWatch from "aws-sdk/clients/cloudwatch";
import axios from "axios";

if (!process.env["API_TOKEN"]) {
  throw new Error("No API_TOKEN envar for GitHub");
}

async function putMetric({ name, value }: { name: string; value: number }) {
  const cw = new CloudWatch({ region: "eu-west-1" });
  const pmd = await cw
    .putMetricData({
      MetricData: [
        {
          MetricName: "gu-cdk-adoption",
          Dimensions: [{ Name: "AdoptionLevel", Value: name }],
          Timestamp: new Date(),
          Unit: "Count",
          Value: value,
        },
      ],
      Namespace: "gu-cdk-adoption",
    })
    .promise();
  console.log("putMetricData response", pmd);
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

  const reposUsingAwsCdk = await octokit.search.code({
    q: `user:guardian filename:package.json "@aws-cdk"`,
  });
  console.log(`${reposUsingAwsCdk.data.total_count} using @aws-cdk/core`);
  await putMetric({
    name: "Repositories using @aws-cdk/core",
    value: reposUsingAwsCdk.data.total_count,
  });

  const reposUsingCloudFormation = await octokit.search.code({
    q: `user:guardian filename:"cloudformation.yaml" filename:"cloudformation.yml" filename:"cfn.yaml" filename:"cfn.yml"`,
  });
  console.log(`${reposUsingCloudFormation.data.total_count} using cloudformation`);
  await putMetric({
    name: "Repositories using Cloudformation",
    value: reposUsingCloudFormation.data.total_count,
  });

  interface AppWithCoreTags {
    app: string;
    stack: string;
    stage: string;
    guCdkVersion: string;
  }
  
  const prismResponse = await axios.get(`${process.env.PRISM_URL}/apps-with-cdk-version`);
  const allApps: AppWithCoreTags[] = prismResponse.data.data['apps-with-cdk-version']
  const appsUsingGuCdk = allApps.filter(app => app.guCdkVersion != "n/a")

  const numberOfAppsAlreadyUsingGuCdk = appsUsingGuCdk.length
  const numberOfAppsLeftToMigrate = allApps.length - appsUsingGuCdk.length

  console.log(`Prism data shows that ${numberOfAppsAlreadyUsingGuCdk} apps are using @guardian/cdk.`)
  await putMetric({
    name: "Apps using @guardian/cdk",
    value: numberOfAppsAlreadyUsingGuCdk,
  });

  console.log(`Prism data shows that there are ${numberOfAppsLeftToMigrate} apps left to migrate.`)
  await putMetric({
    name: "Apps which need to migrate to @guardian/cdk",
    value: numberOfAppsLeftToMigrate,
  });

}

if (require.main === module) {
  (async () => await handler())();
}
