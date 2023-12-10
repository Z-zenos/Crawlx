const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs');

request('https://123job.vn/tuyen-dung', (error, response, html) => { // gửi request đến trang
  console.log(response.statusCode); // 200, kiểm tra xem kết nối thành công không :D

  if(!error && response.statusCode === 200) {
    const $ = cheerio.load(html); // Load HTML
    let jobs = [];
    $('.job__list-item').each((i, el) => { // lặp từng phần tử có class là job__list-item
      // lấy tên job, được nằm trong thẻ a < .job__list-item-title
      const job = $(el).find('.job__list-item-title a').text();
      const company = $(el).find('.job__list-item-company span').text();
      const address = $(el).find('.job__list-item-info .address span').text();
      const salary = $(el).find('.job__list-item-info .salary b').text();
      const desc = $(el).find('.job__list-item-teaser').text();

      // console.log(job, company, address, salary);
      jobs.push({ job, company, address, salary, desc });
    });
    fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2));
  }
  else {
    console.error(error);
  }
});
