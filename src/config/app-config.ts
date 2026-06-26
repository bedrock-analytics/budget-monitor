import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Bedrock Analytics",
  version: packageJson.version,
  copyright: `© ${currentYear}, Bedrock Analytics Co., Ltd.`,
  meta: {
    title: "Bedrock Analytics",
    description: "Enterprise analytics platform",
  },
};
