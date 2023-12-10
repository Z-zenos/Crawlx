const fs = require('fs');
const { Cluster } = require('puppeteer-cluster');

const urls = [
  'https://www.amazon.com/s?i=fashion-mens-intl-ship&bbn=16225019011&rh=n%3A7141123011%2Cn%3A16225019011%2Cn%3A1040658%2Cp_72%3A2661618011%2Cp_36%3A2661613011%2Cp_89%3AAmazon+Essentials&dc&qid=1699767055&rnid=2528832011&ref=sr_nr_p_89_2&ds=v1%3A%2BI4Vhdd6uaHsGsSmEKMy9WiiPMzprm3JIPVmeibmpLc',
  'https://www.amazon.com/s?i=fashion-girls-intl-ship&bbn=16225020011&rh=n%3A7141123011%2Cn%3A16225020011%2Cn%3A1040664%2Cp_36%3A2661613011%2Cp_72%3A2661618011%2Cp_n_size_four_browse-vebin%3A9939532011&dc&qid=1699767106&rnid=9939531011&ref=sr_nr_p_n_size_four_browse-vebin_1&ds=v1%3A1xuc%2Bsai%2Bm%2FuvWPoaRzZbGHWCeSILX9wPpdlo4IpyqQ'
];

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 2,
    monitor: true,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: './tmp'
    },
    retryLimit: 2,
    skipDuplicateUrls: true
  });

  cluster.on('taskerror', (err, data, willRetry) => {
    if (willRetry) {
      console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`);
    } else {
      console.error(`Failed to crawl ${data}: ${err.message}`);
    }
  });

  const products = [];

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, { waitUntil: 'load' });

    let isBtnDisabled = false;

    while (!isBtnDisabled) {
      await page.waitForSelector('[data-cel-widget="search_result_0"]');

      const productHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');

      for (const productHandle of productHandles) {
        try {
          const title = await page.evaluate(el => el.querySelector('h2 > a > span').textContent, productHandle);
          const price = await page.evaluate(el => el.querySelector('.a-price > .a-offscreen').textContent, productHandle);
          const image = await page.evaluate(el => el.querySelector('.s-image').getAttribute('src'), productHandle);

          if (title) {
            fs.appendFile(
              'amazon.csv',
              `${title.replace(/,/g, "-")},${price},${image}\n`,
              err => {
                if (err) throw err;
              }
            );
          }
        } catch (error) { }
      }

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
  });

  urls.forEach(async (url) => await cluster.queue(url));

  await cluster.idle();
  await cluster.close();
})();