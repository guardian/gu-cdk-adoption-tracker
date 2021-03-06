// This file was autogenerated using @guardian/cdk-cli

import "@aws-cdk/assert/jest";
import { SynthUtils } from "@aws-cdk/assert";
import { App } from "@aws-cdk/core";
import { GuCdkAdoption } from "./gu-cdk-adoption";

describe("The GuCdkAdoption stack", () => {
  it("matches the snapshot", () => {
    const app = new App();
    const stack = new GuCdkAdoption(app, "gu-cdk-adoption", {app: "gu-cdk-adoption", stack: "deploy" });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
