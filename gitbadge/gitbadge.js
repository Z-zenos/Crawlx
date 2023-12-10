const axios = require("axios");
const cheerio = require("cheerio");
const {writeFileSync} = require("fs");

async function badgeScrapper() {
  // Downloading the target web page by performing an HTTP GET req in Axios
  const axiosRes = await axios.request({
    method: "GET",
    url: "https://ileriayo.github.io/markdown-badges/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    }
  });

  const $ = cheerio.load(axiosRes.data); // data store the HTML source code of the web page

  const badges = [];

  $("section")
    .find("table")
    .each((i, table) => {
      $(table)
        .find("tbody tr")
        .each((j, row) => {
          const badgeName = $(row).find("td:nth-child(1)").text();
          const badge = $(row).find("td:nth-child(2) img").attr("src");
          const markdown = $(row).find("td:nth-child(3) code").text();

          badges.push({
            name: badgeName,
            badge: badge,
            markdown: markdown
          });
        });
    });

  writeFileSync('badges.json', JSON.stringify(badges, null, 2));
}

(async () => await badgeScrapper())();
