import puppeteer from "puppeteer";
import fs from "fs";
import { faker } from "@faker-js/faker";
import * as yt from 'youtube-search-without-api-key';

const foods = [];
const steps = [];
const ingredients = [];
let food_id = 1;
let ingredient_id = 1;
let step_id = 1;
const ingredient_suggestion_list = [];
const TOTAL_PAGE = +process.argv.slice(2) || 1;

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
  return str;
}


async function getRecipeDetail(browser, link) {
  const pageDetail = await browser.newPage();
  try {
    await pageDetail.goto(
      link,
      { waitUntil: 'load' }
    );

    await pageDetail.waitForSelector('.detail_main');
    const detail = await pageDetail.$('.detail_main');

    const deleted_flag = 0;
    const name = await detail.$eval('div.row:nth-child(1) h1', el => el.textContent);
    const description = await detail.$eval('div.row:nth-child(5)', el => el.textContent?.replace(/(\n|\t)+/g, ''));

    const views = await detail.$eval('.rating .view-maxwith', el => +el.textContent?.trim()?.split(' ')[0]);

    const total_like = faker.number.int({ min: 0, max: 1000 });

    const thumbnail = await detail.$eval('.detail_img img', el => el.getAttribute('src'));

    
    const prep_time = faker.number.int({ min: 10, max: 50 });
    const cooking_time = faker.number.int({ min: 10, max: 150 });
    const servings = await detail.$eval('.number', el => +el.textContent);

    const ingredient_list = await detail.$$eval('div.row:nth-child(6) ul li span', spans => spans.map(span => {
      let ingredient = span.textContent.toLowerCase();
      if(
        ingredient.includes('gia vị') || 
        ingredient.includes('ăn kèm') || 
        !ingredient.includes(':')
      ) 
        return [" ", ingredient.trim()];

      if(ingredient.includes(':')) {
        return ingredient.split(':').map(x => x.trim()).reverse();
      }
    }));

    const instructions = [
      ...await detail.$$eval('div.row:nth-child(7) p', el => el.map(
          x => {
            if(x.textContent.startsWith('–')) {
              return x.textContent.slice(1).trim();
            } else return x.textContent;
          })),
      ...await detail.$$eval('div.row:nth-child(8) p', el => el.map(
          x => {
            if(x.textContent.startsWith('–')) {
              return x.textContent.slice(1).trim();
            } else return x.textContent;
          })),
      ...await detail.$$eval('div.row:nth-child(9) p', el => el.map(
          x => {
            if(x.textContent.startsWith('–')) {
              return x.textContent.slice(1).trim();
            } else return x.textContent;
          })),
    ]; 

    const videos = await yt.search(`hướng dẫn làm món ${name}`);
    const video_url = videos[0]?.url || '';

    foods.push({
      id: food_id,
      users_id: faker.number.int({ min: 1, max: 10 }),
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      deleted_flag,
      name,
      name_no_accent: removeVietnameseTones(name),
      description: description.includes('Xem thêm') 
        ? description.replace('Xem thêm', '') 
        : description,
      views,
      total_like,
      food_category_regions_id: faker.number.int({ min: 1, max: 6 }),
      food_categories_id: faker.number.int({ min: 1, max: 6 }),
      thumbnail,
      video: video_url,
      prep_time,
      cooking_time,
      servings,
    });

    steps.push(...instructions
      .filter(s => !s.includes('Món ăn ngon đi kèm'))
      .map((ins, i) => ({
        id: step_id,
        number: i + 1,
        foods_id: food_id,
        content: ins.replace(/(\n|\t)+/g, ' '),
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }
    )));

    ingredients.push(...ingredient_list.map(ingredient => ({
      id: ingredient_id,
      foods_id: food_id,
      name: ingredient[1].replace(/(\n|\t)+/g, ' '),
      name_no_accent: removeVietnameseTones(ingredient[1].replace(/(\n|\t)+/g, ' ')),
      quantity: ingredient[0],
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })));

    ingredient_suggestion_list.push(
      ...ingredient_list
        .map(ingredient => ingredient[1].replace(/(\n|\t)+/g, ' '))
    );
    
    food_id++;
    step_id++;
    ingredient_id++;
  }
  catch (err) {
    console.log(err);
    console.log("\nReload link: ", link);
    await getRecipeDetail(browser, link);
    console.log("\n");
  }
  finally {
    await pageDetail.close();
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: './tmp'
  });

  // Open new page
  const page = await browser.newPage();

  await page.goto(`https://monngonmoingay.com/tim-kiem-mon-ngon/`, {
    waitUntil: 'load'
  });

  
  let pages = 1;
  
  while (pages <= TOTAL_PAGE) {
    const food_links = [];
    const foodHandles = await page.$$('.list-recipes.row .col-sm-3');

    for (const foodHandle of foodHandles) {
      try {
        const food_link = await page.evaluate(
          el => el
            .querySelector('.info-list a')
            .getAttribute('href')
          , 
          foodHandle
        );

        if (food_link) food_links.push(food_link);

      } catch (error) {
        console.log(error);
      }
    }

    await Promise.all(food_links
      .map(link => getRecipeDetail(browser, link))
    );

    // Wait until selector visible in webpage
    await page.waitForSelector('.next.page-numbers', { visible: true });
    pages++;
    if(pages <= TOTAL_PAGE) {
      await Promise.all([
        page.click('.next.page-numbers'),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);
    }
  }

  fs.writeFileSync('foods.json', JSON.stringify(foods, null, 2));
  fs.writeFileSync('ingredients.json', JSON.stringify(ingredients, null, 2));
  fs.writeFileSync('steps.json', JSON.stringify(steps, null, 2));
  fs.writeFileSync('ingredient_suggestions.json', JSON.stringify(ingredient_suggestion_list, null, 2));

  await browser.close();
})();
