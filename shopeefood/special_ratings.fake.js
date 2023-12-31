import * as yt from 'youtube-search-without-api-key';
import fs from "fs";
import { faker } from '@faker-js/faker';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const foods = Array.from(JSON.parse(fs.readFileSync(`${__dirname}/foods.json`)));
const food_name_list = foods.map(c => c.name);
const special_ratings = [];

const randomReview = {
  food: {
    vi: "đồ ăn",
    sentence: ["ngon", "tuyệt vời", "ok", "ngon tuyệt cú mèo", "có màu sắc bắt mắt", "thơm", "uy tín", "siêu ngon", "ngon tuyệt", "có hương vị đặc trưng", "hấp dẫn", "đáng thử", "tươi ngon", "đáng đồng tiền bát gạo", "đúng chất hà nội", "có hương vị độc đáo", "rất ngon", "ngon khó cưỡng"]
  },
  price: {
    vi: "giá cả",
    sentence: ["rẻ", "hợp lý", "vừa túi tiền", "ok", "okela", "không làm mình thất vọng", "hơi cao", "phù hợp với túi tiền sinh viên"]
  },
  waiter: {
    vi: "nhân viên phục vụ",
    sentence: ["nhiệt tình", "nhanh nhẹn", "thân thiện", "nhanh chóng", "chuyên nghiệp", "niềm nở"],
  },
  restaurant: {
    vi: "quán",
    sentence: ["có view đẹp", "ở ngay mặt đường", "sạch sẽ", "thoáng đãng", "mang phong cách cổ điển", "phù hợp với sinh viên", "có âm nhạc nhẹ nhàng", "nhiều view đẹp", "là điểm đến tuyệt vời vào ngày nghỉ", "có menu đa dạng", "đáng để thử 1 lần", "thực sự tuyệt vời"],
  }
};

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  try {
    let i = 1;
    for(const fname of food_name_list) {
      const videos = await yt.search(`review món ${fname} #shorts`);
      const video_url = videos[0]?.url || '';

      let star = faker.number.int({ min: 4, max: 5 });
      let food_id = i;
      let user_id = faker.number.int({ min: 3501, max: 3999 });
    
      let randKeys = faker.helpers.arrayElements(Object.keys(randomReview));
      let review = randKeys.map(k => `${randomReview[k].vi} ${faker.helpers.arrayElement(randomReview[k].sentence)}`).join(', ');
    
      special_ratings.push({
        star: star,
        video: video_url,
        review: review,
        user_id: user_id,
        food_id: food_id
      });

      i++;
    }
  } catch (error) {
    console.error(error);
  } finally {
    fs.writeFileSync('special_ratings.json', JSON.stringify(special_ratings, null, 2));
  }
})();

