const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: './tmp'
  });

  const page = await browser.newPage();
  await page.goto('https://www.amazon.com/s?i=fashion-mens-intl-ship&bbn=16225019011&rh=n%3A7141123011%2Cn%3A16225019011%2Cn%3A1040658&page=400&qid=1699701309&ref=sr_pg_3', {
    waitUntil: 'load'
  });

  const is_disabled = await page.$('.s-pagination-item.s-pagination-disabled') !== null;

  console.log(is_disabled);
  
})();