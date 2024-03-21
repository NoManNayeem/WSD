const fs = require('fs');
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();

/**
 * Loads and parses the JSON file containing trade data.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON object.
 */
async function loadJsonData(filePath) {
    try {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file at ${filePath}:`, error.message);
        throw error; // Re-throw to handle it in the caller function.
    }
}

/**
 * Loads and parses an Excel file containing category data.
 * @param {string} filePath - The path to the Excel file.
 * @returns {Promise<Array>} A promise that resolves to an array of objects containing product code and category.
 */
async function loadExcelData(filePath) {
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        let excelData = [];
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            excelData.push({
                productCode: row.getCell(1).value,
                category: row.getCell(2).value
            });
        });
        // Filter out any rows without productCode or category to ensure clean data.
        return excelData.filter(data => data.productCode && data.category);
    } catch (error) {
        console.error(`Error reading or parsing Excel file at ${filePath}:`, error.message);
        throw error; // Re-throw to handle it in the caller function.
    }
}

/**
 * Merges trade data with category data based on product codes.
 * @param {Array} tradeData - Array of trade data objects.
 * @param {Array} categoryData - Array of category data objects.
 * @returns {Array} An array of merged data objects.
 */
function mergeData(tradeData, categoryData) {
    return tradeData.map(trade => {
        const category = categoryData.find(c => c.productCode === trade.productCode)?.category || 'Unknown';
        return { ...trade, category };
    });
}

/**
 * Formats the merged data for use with FastChat, creating user prompts and bot responses.
 * @param {Array} mergedData - The data resulting from merging trade and category data.
 * @returns {Array} An array of objects formatted for FastChat.
 */
function formatForFastChat(mergedData) {
    return mergedData.map(data => {
        const userPrompt = `Can you tell me the category of a product with these features: ${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ')}?`;
        const botResponse = `The product belongs to the category: ${data.category}.`;
        return { userPrompt, botResponse };
    });
}

/**
 * The main function to execute the script. It orchestrates loading, merging, and formatting data, and then saves the final dataset.
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
            console.log(`Created directory: ${outputDir}`);
        }

        fs.writeFileSync(`${outputDir}/output.json`, JSON.stringify(formattedData, null, 2));
        console.log('Dataset created successfully.');
    } catch (error) {
        console.error('Error in main function:', error.message);
    }
}

main();
