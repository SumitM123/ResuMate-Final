const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Use Open Resume's actual parsing code by calling it directly
 */
async function parseResumeFromPdf(filePath) {
  try {
    // Copy PDF to Open Resume's public directory so it can access it
    const fileName = `temp-${Date.now()}.pdf`;
    const openResumePublicPath = path.join(__dirname, '../../open-resume/public', fileName);
    fs.copyFileSync(filePath, openResumePublicPath);

    // Create a temporary Node.js script that uses Open Resume's parser
    const tempScript = path.join(__dirname, '../../open-resume/temp-parser.mjs');
    const scriptCode = `
import { readPdf } from './src/app/lib/parse-resume-from-pdf/read-pdf.ts';
import { groupTextItemsIntoLines } from './src/app/lib/parse-resume-from-pdf/group-text-items-into-lines.ts';
import { groupLinesIntoSections } from './src/app/lib/parse-resume-from-pdf/group-lines-into-sections.ts';
import { extractResumeFromSections } from './src/app/lib/parse-resume-from-pdf/extract-resume-from-sections/index.ts';

async function main() {
  try {
    // Step 1. Read a pdf resume file into text items to prepare for processing
    const textItems = await readPdf('${fileName}');
    
    // Step 2. Group text items into lines
    const lines = groupTextItemsIntoLines(textItems);
    
    // Step 3. Group lines into sections
    const sections = groupLinesIntoSections(lines);
    
    // Step 4. Extract resume from sections
    const resume = extractResumeFromSections(sections);
    
    console.log(JSON.stringify(resume, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
`;
    
    fs.writeFileSync(tempScript, scriptCode);
    
    // Run the script and get the result using ts-node with ESM support
    // This should properly handle the TypeScript path mappings from tsconfig.json
    const result = execSync(`cd "${path.dirname(tempScript)}" && npx ts-node --esm temp-parser.mjs`, {
      encoding: 'utf8',
      timeout: 30000
    });
    
    // Clean up temporary files
    fs.unlinkSync(tempScript);
    fs.unlinkSync(openResumePublicPath);
    
    // Parse and return the result
    return JSON.parse(result);
  } catch (error) {
    console.error('Error using Open Resume parser:', error);
    throw error;
  }
}

module.exports = {
  parseResumeFromPdf
};
