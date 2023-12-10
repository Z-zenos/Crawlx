const puppeteer = require('puppeteer');
const fs = require('fs');
const { faker } = require("@faker-js/faker");

const restaurants = [];
const foods = [];
const periods = [0, 1, 2];
const food_types = ['food', 'drink', 'hotpot', 'streetfood', 'sushi,pizza-pasta-burger']

const food_type = process.argv.slice(2);

async function getMenu(browser, link, restaurant_id) {
  const pageDetail = await browser.newPage();
  try {
    await pageDetail.goto(
      link,
      { waitUntil: 'networkidle2' }
    );

    pageDetail.on('response', async (response) => {
      const request = response.request();
      if (request.url().includes('get_delivery_dishes') && request.method() === 'GET') {
        const data = await response.json();
        if (!data) return;
        for (const menu_info of data.reply.menu_infos) {
          for (const dish of menu_info.dishes) {
            foods.push({
              name: dish.name,
              description: `${dish.description?.replace(/\n/g, '')}`,
              price: dish.price.value,
              image: dish.photos[3] ? dish.photos[3].value : dish.photos[0].value,
              restaurant_id: restaurant_id,
              period_id: periods[Math.floor(Math.random() * periods.length)],
              visit_count: 0,
            });
          }
        }
      }
    });

    await sleep(10000);
  }
  catch (err) {
    console.log(err);
  }
  finally {
    await pageDetail.close();
  }
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: './tmp'
  });

  // Open new page
  const page = await browser.newPage();

  await page.goto(`https://shopeefood.vn/ha-noi/food/danh-sach-dia-diem-phuc-vu-${food_type}-tai-khu-vuc-quan-hai-ba-trung-giao-tan-noi`, {
    waitUntil: 'load'
  });

  let i = 1;

  page.on('response', async (response) => {
    const request = response.request();
    if (request.url() === 'https://gappapi.deliverynow.vn/api/delivery/get_infos' && request.method() === 'POST') {
      const data = await response.json();
      const links = [];
      for (const restaurant of data.reply.delivery_infos) {
        restaurants.push({
          address: restaurant.address,
          name: restaurant.name,
          latitude: restaurant.position.latitude,
          longitude: restaurant.position.longitude,
          description: faker.lorem.paragraphs({ min: 1, max: 1 }),
        });

        links.push({
          url: restaurant.url,
          id: i
        });
        i++;
      }

      await Promise.all(links.map(link => getMenu(browser, link.url, link.id)));

      try {
        await page.waitForSelector('.pagination .icon-paging-next', { visible: true });
        const is_disabled = await page.$('.pagination .disabled .icon-paging-next') !== null;
        await sleep(1000);
        if (!is_disabled) {
          await Promise.all([
            page.click('.pagination .icon-paging-next'),
            page.waitForNavigation({ waitUntil: "load", timeout: 500000 }),
          ]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        fs.writeFileSync(
          `${food_type}_restaurants.json`,
          JSON.stringify(
            {
              count: restaurants.length,
              data: restaurants
            },
            null,
            2
          )
        );

        fs.writeFileSync(
          `${food_type}.json`,
          JSON.stringify(
            {
              count: foods.length,
              data: foods
            },
            null,
            2
          )
        );

        await page.close();
        process.exit(1);
      }
    }
  });
})();