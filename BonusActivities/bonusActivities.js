const fs = require('fs');
const path = require('path'); // Import the path module
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();

// Correctly use path.join to create absolute paths
const outputPath = path.join(__dirname, '../data/BonusActivitiesOutputData/output.json');
const tradeDataPath = path.join(__dirname, '../data/trades 1.json');
const categoryDataPath = path.join(__dirname, '../data/categories 1.xlsx');

async function loadJsonData(filePath) {
    try {
        const rawData = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
        throw error;
    }
}

async function loadExcelData(filePath, sheetName = 1) {
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(sheetName);
        let categoryMap = new Map();
        worksheet.eachRow((row) => {
            const productCode = row.getCell(1).value;
            const category = row.getCell(2).value;
            if (productCode && category) {
                categoryMap.set(productCode, category);
            }
        });
        return categoryMap;
    } catch (error) {
        console.error(`Error reading or parsing Excel file at ${filePath}:`, error);
        throw error;
    }
}

function dynamicPrefix(trade) {
    if (!trade.type) return trade.productName || 'Unknown Product';
    const prefixes = {
        'type1': 'Autocallable',
        'type2': 'Issuer Callable'
    };
    return `${prefixes[trade.type] || ''} ${trade.productName || 'Unknown Product'}`.trim();
}


function mergeData(tradeData, categoryMap) {
    return tradeData.map(trade => {
        const category = categoryMap.get(trade.productCode) || deriveCategory(trade);
        const productName = dynamicPrefix(trade);
        return { ...trade, category, productName: productName.trim() };
    });
}

function deriveCategory(trade) {
    if (trade.specificProperty === 'certainValue') {
        return 'DerivedCategory';
    }
    return 'Unknown';
}

function formatForFastChat(mergedData) {
    return mergedData.map(({ productName, category }) => {
        const userPrompt = `Could you tell me which category a product named "${productName}" falls into?`;
        const botResponse = category !== 'Unknown' ?
            `The product "${productName}" belongs to the category: ${category}.` :
            "I'm not sure about the category. Could you provide more details?";
        return { userPrompt, botResponse };
    });
}

async function main() {
    try {
        console.log('Loading trade data...');
        const tradeData = await loadJsonData(tradeDataPath); // Use the corrected path variable
        console.log('Loading category data...');
        const categoryMap = await loadExcelData(categoryDataPath); // Use the corrected path variable
        console.log('Merging data...');
        const mergedData = mergeData(tradeData.products, categoryMap);
        const formattedData = formatForFastChat(mergedData);

        console.log('Creating output directory if it does not exist...');
        if (!fs.existsSync(path.dirname(outputPath))) { // Correct directory check
            await fs.promises.mkdir(path.dirname(outputPath), { recursive: true }); // Ensure the parent directory exists
        }

        console.log('Writing output file...');
        await fs.promises.writeFile(outputPath, JSON.stringify(formattedData, null, 2)); // Use the outputPath variable
        console.log('Dataset created successfully in BonusActivitiesOutputData folder.');
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();
