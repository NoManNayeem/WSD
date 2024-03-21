# Product Categorization Dataset Generator

This Node.js script processes and combines data from two sources to create a training dataset for a digital assistant. The assistant's goal is to provide users with relevant product categories based on given product data. This dataset is formatted for compatibility with FastChat, following the Vicuna training format for fine-tuning.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have Node.js installed on your system. You can download it from [Node.js official website](https://nodejs.org/).

### Installing

First, clone the repository `https://github.com/nomannayeem/` or download the source code to your local machine. Navigate to the project directory, and install the required dependencies by running:

```bash
npm install
```

### This command installs all the necessary dependencies, including exceljs for handling Excel file operations.

Running the Script
To run the script, execute the following command in the terminal:
```bash
    cd src

    node index.js
```
This will process the input files and generate the output.json in the data directory, containing the formatted dataset.


# Script Overview
The script performs several key operations:

- Data Extraction: Reads and parses data from a JSON file (trade-specific information) and an Excel spreadsheet (product categorization).
- Data Transformation and Merging: Combines the data based on product codes, ensuring each product is associated with its correct category.
- Dataset Creation: Formats the merged data to simulate a dialogue between a user and the chatbot, with the user asking about product categories based on product features, and the chatbot providing the category.
- Output Generation: Outputs the final dataset in JSON format, suitable for training conversational AI models.


# File Structure
src/index.js - The main script file.
BonusActivtivities/bonusActivities.js - The main script file implemented with bonus requirements.
data/ - Directory where input files (trades 1.json, categories 1.xlsx) are stored and output.json is generated.
# Built With
- Node.js - The JavaScript runtime used
- ExcelJS - A library for reading, manipulating and writing Excel files

# Authors
Nayeem Islam - Initial work
License


This project is licensed under the MIT License - see the LICENSE.md file for details.