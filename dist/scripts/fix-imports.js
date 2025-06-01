import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
const filePath = resolve(__dirname, "../dist/lib/db.js");
try {
    let content = readFileSync(filePath, "utf-8");
    // Replace ./schema with ./schema.js
    content = content.replace(/\.\/schema/g, "./schema.js");
    writeFileSync(filePath, content, "utf-8");
    console.log("Successfully updated import path in dist/lib/db.js");
}
catch (error) {
    console.error("Error updating import path:", error);
    process.exit(1);
}
