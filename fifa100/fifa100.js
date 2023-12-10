const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const players = [];

async function getDetailPlayer(player_url, i) {
  if(!player_url) {
    players[i] = {
      ...players[i],
      desc: null,
      img: null
    };

    return;
  }

  const axiosPlayer = await axios.request({
    method: "GET",
    url: `https://en.wikipedia.org${player_url}`,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    }
  });

  const $ = cheerio.load(axiosPlayer.data);

  const desc = $(".mw-parser-output table.infobox ~ p").text();
  const img = $(".mw-parser-output table.infobox img").attr("src");

  players[i] = {
    ...players[i],
    desc: desc,
    img: img
  };
}


async function fifa100Scrapper() {
  // Downloading the target web page by performing an HTTP GET req in Axios
  const axiosRes = await axios.request({
    method: "GET",
    url: "https://en.wikipedia.org/wiki/FIFA_100",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    }
  });

  const $ = cheerio.load(axiosRes.data); // data store the HTML source code of the web page


  $("table.wikitable")
    .find("tbody tr")
    .each((i, el) => {
      if(!i || i > 2) return;
      const nation = $(el).find("td:nth-child(1) a").attr("title");
      const playerName = $(el).find("td:nth-child(2) a").text();
      const playerLinkDetail = $(el).find("td:nth-child(2) a").attr("href");
      const position = $(el).find("td:nth-child(3)").text().trim();
      const born = $(el).find("td:nth-child(4)").text().trim();
      const died = $(el).find("td:nth-child(5)").text().trim();

      players.push({
        nation: nation,
        name: playerName,
        linkDetail: playerLinkDetail,
        position: position,
        born: born,
        died: died
      });
    });

  for(let i = 0; i < players.length; i++)
    await getDetailPlayer(players[i].linkDetail, i);

  console.log(players);

  // fs.writeFileSync('player.json', JSON.stringify(players, null, 2));
}

(async () => {
  await fifa100Scrapper();
})();
