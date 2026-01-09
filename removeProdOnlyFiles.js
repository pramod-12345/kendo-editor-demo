require("babel-register")({
  presets: ["es2015", "react"],
});
require("dotenv").config({ path: "./.env" });
const fs = require("fs");

if (process.env.REACT_APP_NODE_ENV !== "production") {
  try {
    fs.unlinkSync("./build/sitemap.xml");
    fs.unlinkSync("./build/robots.txt");
  } catch (e) {
    console.log("Error in removeProdOnlyFiles.js", e);
  }
}
