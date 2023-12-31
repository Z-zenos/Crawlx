const fs = require('fs');

const fetch = require('node-fetch');
const { faker } = require('@faker-js/faker');

/* --- INIT --- */
const periods = [1, 2, 3];
const excludedDishes = ['đồ gọi thêm', 'combo', 'uống', 'nước', 'sốt', 'rượu', 'bia', 'đồ sống', 'topping', 'deal', 'cà phê', 'milk', 'tea', 'trà', 'quà', 'sữa', 'soju', 'sinh tố', 'coffee', 'drink'];

let res_id = 1;
let food_id = 1;
const restaurants = [];
const foods = [];
const ratings = [];

/* --- RATINGS --- */
async function getRatings(real_restaurant_id) {
  try {
    const response = await fetch(`https://www.foody.vn/__get/Review/ResLoadMore?ResId=${real_restaurant_id}&Count=10
    `, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
    });

    const data = await response.json();

    return data.Items.map(review => ({
      star: Math.ceil(review.AvgRating / 2) ,
      review: review.Description,
    }));

  } catch (error) {
    console.error(error);
    return [];
  }
}

/* --- FOODS --- */
async function getMenuAndRatings(fake_restaurant_id, real_restaurant_id) {
  try {
    const response = await fetch(`https://gappapi.deliverynow.vn/api/dish/get_delivery_dishes?request_id=${real_restaurant_id}&id_type=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'X-Foody-App-Type': '1004',
        'X-Foody-Api-Version': '1',
        'X-Foody-Client-Type': '1',
        'X-Foody-Client-Version': '1',
        'X-Foody-Client-Id': '',
        'X-Foody-Client-Language': 'vi',
        'Origin': 'https://www.foody.vn',
        'Referer': 'https://www.foody.vn/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'TE': 'trailers',
      },
    });

    const data = await response.json();
    const menu_infos = data.reply.menu_infos;

    if(!menu_infos.length) return [];

    const food_id_list = [];

    // Iterating all menu of a restaurant
    for (const menu_info of menu_infos) {
      // Excluding some drink, combo, food...
      if(!excludedDishes.some(ed => menu_info.dish_type_name.toLowerCase().includes(ed))) {
        for (const dish of menu_info.dishes) {
          foods.push({
            id: food_id,
            name: dish.name,
            description: `${dish.description?.replace(/\n| /g, '')}`,
            price: Math.floor(dish.price.value),
            image: dish.photos[3] ? dish.photos[3].value : dish.photos[0].value,
            restaurant_id: fake_restaurant_id,
            period_id: periods[Math.floor(Math.random() * periods.length)],
            visit_count: faker.number.int({ min: 0, max: 10 }),
          });
  
          // Create food id list for random rating
          food_id_list.push(food_id);
          food_id++;
        }
      }
    }

    // Get ratings of a restaurant
    const rating_list = await getRatings(real_restaurant_id);

    if(food_id_list.length) {
      if(rating_list.length) {
        food_id_list.forEach(fid => {
          faker
            .helpers
            .arrayElements(rating_list, {
              min: rating_list.length > 1 ? 2 : 1,
              max: rating_list.length > 5 ? 5 : rating_list.length
            })
            .forEach(rv => {
              ratings.push({
                food_id: fid,
                user_id: faker.number.int({ min: 2, max: 3000 }),
                ...rv
              });
            });
        });
      }
    }
  }
  catch (error) {
    console.error(error);
  }
}

/* --- RESTAURANTS --- */
(async () => {
  try {

    for(let page = 1; page <= 20; page++) {
      const response = await fetch(`https://www.foody.vn/ha-noi/food/dia-diem?ds=Restaurant&vt=row&st=1&dtids=24&c=1,39,11,56,3,6&page=${page}&provinceId=218&categoryId=null`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'Copy from browser HTTP header',
          'X-Requested-With': 'XMLHttpRequest'
        },
      });

      const data = await response.json();
      const dataRestaurants = data.searchItems;

      const links = [];

      for (const restaurant of dataRestaurants) {
        // Normalizing needed restaurant data
        restaurants.push({
          id: res_id,
          address: restaurant.Address,
          name: restaurant.Name.includes(' - ') 
            ? restaurant.Name.slice(0, restaurant.Name.lastIndexOf('-')).trim()
            : restaurant.Name,
          latitude: restaurant.Latitude,
          longitude: restaurant.Longitude,
          description: "",
        });
      
        // Get restaurant's detail
        links.push({
          fake_restaurant_id: res_id,
          real_restaurant_id: restaurant.Id
        });

        res_id++;
      }

      await Promise.all(links.map(link => getMenuAndRatings(link.fake_restaurant_id, link.real_restaurant_id)));
    }

    fs.writeFileSync(`restaurants.json`, JSON.stringify(restaurants, null, 2));
    fs.writeFileSync(`foods.json`, JSON.stringify(foods, null, 2));
    fs.writeFileSync(`ratings.json`, JSON.stringify(ratings, null, 2));
  } catch (error) {
    console.error(error);
  }
})();

