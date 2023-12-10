const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Try logging to gmail -> then successfully login, save the cookies -> reuse it
(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: false,
    executablePath: "/opt/google/chrome/google-chrome",
    userDataDir: "/home/fuurinkazan/.config/google-chrome",
  });

  const page = await browser.newPage();

  /*
    networkidle0 comes handy for SPAs that load resources with fetch requests.
    networkidle2 comes handy for pages that do long-polling or any other side activity.
  */

  // 1. Copy + paste link that we used to connect our google account
  await page.goto("https://accounts.google.com/signin/v2/identifier", {
    waitUntil: "networkidle2",
  });

  await page.type("#identifierId", "hoanganhtuanbk2001@gmail.com");
  await page.click("#identifierNext");

  await page.waitForSelector("#password", {
    visible: true,
    hidden: false,
  });

  await page.type(
    "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input",
    "YOUR_PASSWORD"
  );

  await sleep(1000);
  await page.click("#passwordNext > div > button");

  await sleep(10000);

  //save cookies
  const cookies = await page.cookies();
  await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
})();