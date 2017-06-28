
const Application = require("spectron").Application;
const assert = require("assert");
const path = require("path");

const isWindows = process.platform === "win32";
const ext = isWindows ? ".cmd" : "";
const electronPath = path.join(__dirname, "..", "node_modules", ".bin", "electron" + ext);

const appPath = path.join(__dirname, "../_comp");

const app = new Application({
  path: electronPath,
  args: [appPath]
});

console.log("\nno tests");
