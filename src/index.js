const fs = require('fs');
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();

/**
 * Efficiently loads and parses the JSON file containing trade data using synchronous read.
 * Consider using fs.promises.readFile for asynchronous operation in larger datasets.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON object.
 */
async function loadJsonData(filePath) {
    try {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file at ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * Efficiently loads and parses an Excel file, converting it to a Map for quick lookup.
 * @param {string} filePath - The path to the Excel file.
 * @returns {Promise<Map>} A promise that resolves to a Map with product codes as keys and categories as values.
 */
async function loadExcelData(filePath) {
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        let excelData = new Map();
        worksheet.eachRow((row) => {
            const productCode = row.getCell(1).value;
            const category = row.getCell(2).value;
            if (productCode && category) {
                excelData.set(productCode, category);
            }
        });
        return excelData;
    } catch (error) {
        console.error(`Error reading or parsing Excel file at ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * Merges trade data with category data efficiently using a Map for category data.
 * @param {Array} tradeData - Array of trade data objects.
 * @param {Map} categoryData - A Map of category data objects.
 * @returns {Array} An array of merged data objects.
 */
function mergeData(tradeData, categoryData) {
    return tradeData.map(trade => {
        const category = categoryData.get(trade.productCode) || 'Unknown';
        return { ...trade, category };
    });
}

/**
 * Formats the merged data for use with FastChat, creating user prompts and bot responses.
 * This version introduces variability in the generated prompts.
 * @param {Array} mergedData - The data resulting from merging trade and category data.
 * @returns {Array} An array of objects formatted for FastChat.
 */
function formatForFastChat(mergedData) {
    return mergedData.map(data => {
        // Example of introducing variability. More sophisticated methods could be used.
        const promptIntro = Math.random() > 0.5 ? "What's the category for a product with" : "Can you classify a product having";
        const userPrompt = `${promptIntro} ${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ')}?`;
        const botResponse = `The product belongs to the category: ${data.category}.`;
        return { userPrompt, botResponse };
    });
}

/**
 * Main function orchestrating the loading, merging, and formatting of data, then saves the final dataset.
 * Enhanced to use async/await for file operations and better error handling.
 */
async function main() {
    try {
        const tradeDataPath = '../data/trades 1.json'; // Adjust path as necessary
        const categoryDataPath = '../data/categories 1.xlsx'; // Adjust path as necessary

        const tradeData = await loadJsonData(tradeDataPath);
        const categoryData = await loadExcelData(categoryDataPath);
        const mergedData = mergeData(tradeData.products, categoryData);
        const formattedData = formatForFastChat(mergedData);

        // Ensuring the output directory exists
        const outputDir = '../data/output_data';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Use fs.promises for async operation
        await fs.promises.writeFile(`${outputDir}/output.json`, JSON.stringify(formattedData, null, 2));
        console.log('Dataset created successfully.');
    } catch (error) {
        console.error('Error in main function:', error.message);
    }
}

main();
