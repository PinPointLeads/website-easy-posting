import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

// Get next screenshot number
function getNextScreenshotNumber() {
    const files = fs.readdirSync(screenshotDir);
    const numbers = files
        .filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
        .map(f => {
            const match = f.match(/screenshot-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

async function takeScreenshot(url, label = '') {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        const num = getNextScreenshotNumber();
        const filename = label ? `screenshot-${num}-${label}.png` : `screenshot-${num}.png`;
        const filepath = path.join(screenshotDir, filename);

        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`Screenshot saved: ${filepath}`);
    } catch (error) {
        console.error('Error taking screenshot:', error.message);
    } finally {
        await browser.close();
    }
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

takeScreenshot(url, label);
