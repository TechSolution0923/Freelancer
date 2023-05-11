import puppeteer from "puppeteer";
import { appendFileSync } from "fs";

class Contact {
    constructor(username = "", email = "", location = "") {
        this.username = username;
        this.email = email;
        this.location = location;
    }

    saveAsCSV() {
        const csv = `${this.username},${this.location},${this.email}\n`;
        try {
            appendFileSync("./contacts.csv", csv);
        } catch (err) {
            console.error(err);
        }
    }
}

const startApp = (csvData) => {
    for (let i = 0; i < csvData.length; i++) {
        const data = csvData[i];
        const contact1 = new Contact(data['username'], data['username'] + "@gmail.com", data['location']);
        contact1.saveAsCSV();
    }
}

const getQuotes = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    // Open a new page
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0)
    await page.goto("https://www.freelancer.com/search/users");

    let results = [];
    let lastPageNumber = 10;
    for (let index = 0; index < lastPageNumber; index++) {
        await page.waitForTimeout(5000);
        results = results.concat(await extractedEvaluateCall(page));
        if (index !== lastPageNumber - 1) {
            await page.click('button[aria-label="Next page"]');
            await page.waitForTimeout(5000);
        }
    }

    // Close the browser
    await browser.close();

    startApp(results);
};

async function extractedEvaluateCall(page) {
    // Get page data
    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll("fl-list-item.ng-star-inserted");

        return Array.from(quoteList).map((quote) => {
            const username = quote.querySelector("fl-text.Username-displayName > span").innerText;
            const mail = quote.querySelector("fl-text.Username-userId > span").innerText;
            const location = quote.querySelector("fl-bit.UserLocation > fl-text > div.NativeElement").innerText;

            return { username, mail, location };
        });
    });

    return quotes;
}

// Start the scraping
getQuotes();