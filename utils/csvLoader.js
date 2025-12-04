const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

let cachedData = null;

function loadCSV() {
  return new Promise((resolve, reject) => {
    if (cachedData) return resolve(cachedData); // <-- return instantly

    const FILE_PATH = path.join(
      __dirname,
      "..",
      "company_master_data2025-05-30.csv"
    );

    
    const results = [];

    fs.createReadStream(FILE_PATH)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        cachedData = results; // <-- cache full CSV
        resolve(cachedData);
      })
      .on("error", reject);
  });
}

module.exports = loadCSV;
