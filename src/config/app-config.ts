import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Rovula",
  version: packageJson.version,
  copyright: `© ${currentYear}, Rovula.`,
  meta: {
    title: "Rovula (Thailand) Company Limited.",
    description: "A LEADING PLATFORM SOLUTIONS FOR SUBSEA IRM TO OIL AND GAS",
  },
};
