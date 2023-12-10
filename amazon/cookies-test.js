const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require("fs").promises;

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: false,
    executablePath: "/opt/google/chrome/google-chrome",
    userDataDir: "/home/fuurinkazan/.config/google-chrome",
  });

  const page = await browser.newPage();

  //load cookies
  const cookiesString = await fs.readFile("./cookies.json");
  const cookies = JSON.parse(cookiesString);
  await page.setCookie(...cookies);

  await page.goto("http://gmail.com", {
    waitUntil: 'networkidle2'
  });

  //await browser.close();
})();