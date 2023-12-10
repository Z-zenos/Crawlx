const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: './tmp'
  });

  const page = await browser.newPage();
  await page.goto('https://www.amazon.com/s?i=fashion-mens-intl-ship&bbn=16225019011&rh=n%3A7141123011%2Cn%3A16225019011%2Cn%3A1040658%2Cp_89%3AAmazon+Essentials&dc&qid=1699715052&rnid=2528832011&ref=sr_nr_p_89_1&ds=v1%3Ar1%2BMJxwwKF2SQCcbgcQgdfxKTPUp%2FwVQJ5AD2jMe5Rk', {
    waitUntil: 'load'
  });

  const products = [];

  let isBtnDisabled = false;

  while (!isBtnDisabled) {
    await page.waitForSelector('[data-cel-widget="search_result_0"]');

    const productHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');

    for (const productHandle of productHandles) {
      try {
        // pass the single handle below, productHandle is selector of each product
        /*
          ! 1. Inspect title and copy selector:
          #search > div.s-desktop-width-max.s-desktop-content.s-wide-grid-style-t1.s-opposite-dir.s-wide-grid-style.sg-row > div.sg-col-20-of-24.s-matching-dir.sg-col-16-of-20.sg-col.sg-col-8-of-12.sg-col-12-of-16 > div > span.rush-component.s-latency-cf-section > div.s-main-slot.s-result-list.s-search-results.sg-row > div:nth-child(6) > div > div > div > div > div > div > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-title-instructions-style > h2 > a > span 
    
          ! 2. Because this selector is really huge and not dynamic. As you see, in this have a number such as 'div:nth-child(6)' -> We need to do it dynamically
    
          ! 3. Get only last three elements in that selector
        */
        const title = await page.evaluate(el => el.querySelector('h2 > a > span').textContent, productHandle);

        const price = await page.evaluate(el => el.querySelector('.a-price > .a-offscreen').textContent, productHandle);

        const image = await page.evaluate(el => el.querySelector('.s-image').getAttribute('src'), productHandle);

        if (title) products.push({ title, price, image });

        // do whatever you want with the data
        // ...
      } catch (error) {

      }
    }
    
    // Wait until selector visible in webpage
    await page.waitForSelector('.s-pagination-item.s-pagination-next', { visible: true });
    const is_disabled = await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;
    isBtnDisabled = is_disabled;
    if (!is_disabled) {
      await Promise.all([
        page.click('.s-pagination-item.s-pagination-next'),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);
    }
  }

  console.log("products: ", products);
  await browser.close();
})();