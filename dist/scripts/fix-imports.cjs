"use strict";
const { readFileSync, writeFileSync } = require("fs");
const { resolve } = require("path");
const filePath = resolve(__dirname, "../dist/lib/db.js");
console.log(`Running fix-imports script for: ${filePath}`);
try {
    let content = readFileSync(filePath, "utf-8");
    // Check for ES module imports first
    const esImportRegex = /import \* as schema from "(.*?)"/;
    const esMatch = content.match(esImportRegex);
    if (esMatch && esMatch[1]) {
        console.log("Found ES module import:", esMatch[0]);
        let importPath = esMatch[1];
        // Remove any existing .js extensions from the end
        importPath = importPath.replace(/\.js$/, "");
        importPath = importPath.replace(/\.js$/, "");
        importPath = importPath.replace(/\.js$/, ""); // Handle up to three .js extensions
        // Add a single .js extension
        importPath += ".js";
        // Replace the original import line with the corrected one
        const newImportLine = `import * as schema from "${importPath}";`;
        content = content.replace(esImportRegex, newImportLine);
        writeFileSync(filePath, content, "utf-8");
        console.log("Successfully updated ES module import path in dist/lib/db.js");
        console.log("New import line:", newImportLine);
    }
    else {
        // Check for CommonJS require statements
        const cjsRequireRegex = /const schema = __importStar\(require\("(.*)"\)\);/;
        const cjsMatch = content.match(cjsRequireRegex);
        if (cjsMatch) {
            console.log("Found CommonJS require statement - no modification needed for CommonJS format");
            console.log("File is using CommonJS format, which should work correctly");
        }
        else {
            console.log("No schema import found in either ES module or CommonJS format");
            console.log("This might be expected - continuing without error");
        }
    }
}
catch (error) {
    console.error("Error reading/updating import path:", error);
    process.exit(1);
}
