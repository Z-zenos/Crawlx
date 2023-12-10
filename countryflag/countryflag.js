const axios = require("axios");
const cheerio = require("cheerio");
const {writeFileSync} = require("fs");

async function flagScrapper() {
  // Downloading the target web page by performing an HTTP GET req in Axios
  const axiosRes = await axios.request({
    method: "GET",
    url: "https://apps.timwhitlock.info/emoji/tables/iso3166",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    }
  });

  const $ = cheerio.load(axiosRes.data); // data store the HTML source code of the web page

  const countries = [];

  $("table.table")
    .find("tbody tr")
    .each((i, tr) => {
      const code = $(tr).find("td:nth-child(1)").text().trim();
      const flag = $(tr).find(".preview span").text();
      const countryName = $(tr).find("td:nth-child(4)").text().trim();

      countries.push({
        code: code,
        flag: flag,
        name: countryName
      });
    });

  writeFileSync('country-flag.json', JSON.stringify(countries, null, 2));
}

(async () => await flagScrapper())();
