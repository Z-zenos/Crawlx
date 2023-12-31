# Guide format data

*Below is sample data. Replace them with actual data.*
---

*id*: restaurant id start at 241

## Restaurants


```json
[
  {
    "id": 241,
    "address": "88 Trần Đại Nghĩa, P. Đồng Tâm",
    "name": "Linh",
    "latitude": 20.9984221,
    "longitude": 105.8457486,
    "description": ""
  },
  {
    "id": 242,
    "address": "13 Lê Đại Hành, P. Lê Đại Hành",
    "name": "Sio Sushi",
    "latitude": 21.0098221,
    "longitude": 105.8500011,
    "description": ""
  }
 ]
```

## Food

*period_id*: in range [0, 2]
*id*: food id start at 6000

```json
[
  {
    "id": 6000,
    "name": "Mỳ sốt Bò Xay",
    "description": "",
    "price": 85000,
    "image": "https://images.foody.vn/default/s560x560/shopeefood-deli-dish-no-image.png",
    "restaurant_id": 11,
    "period_id": 3,
    "visit_count": 1
  },
  {
    "id": 6001,
    "name": "Mỳ Xào Hải Sản",
    "description": "",
    "price": 90000,
    "image": "https://images.foody.vn/default/s560x560/shopeefood-deli-dish-no-image.png",
    "restaurant_id": 11,
    "period_id": 2,
    "visit_count": 0
  }
]
```

## Ratings

*note*: user_id in range [2, 3500]

```json
[
  {
    "food_id": 1,
    "user_id": 1527,
    "star": 3,
    "review": "Mình đã tự nhủ đây là tóc nhưng không, là cái lông hu hu :( ăn ở 2 chi nhánh nhiều lần rồi nhưng lần này gọi về thất vọng"
  },
  {
    "food_id": 1,
    "user_id": 1404,
    "star": 4,
    "review": "Xời , cơm bít tết tẩm bột đỉnh quá chời quá đất . Miếng bò bản to, mềm , ngọt thịt, tẩm lớp bột xù rụm không thể nào đỉnh hơn . Đúng là ở đây mấy món áo bột xù đều đỉnh thiệt mừ 🤨 . Còn đĩa kia là cơm mực chiên sốt chua ngọt, hừm, không ngon lắm , mực rán kiểu này bị dai mà sốt hơi dị, mình chưa bao giờ thích sốt chua ngọt ở đây 😢 . Nếu gọi mực thì cơm mực xù ngon hơn nhiềuuu ! \n•\n📍123 😗 \n•\n70-80k / suất"
  }
]
```

## Special_ratings

*note*: user_id in range [3501, 3999]

*video_url*:
1. If you want to add short video -> search on youtube by following keyword:
	`food name #short`
2. Video url must have format: `https://www.youtube.com/watch?v=video_id` (Ex: https://www.youtube.com/watch?v=rppLnbYch6s)


```json
[
  {
    "star": 5,
    "video": "https://www.youtube.com/watch?v=rppLnbYch6s",
    "review": "nhân viên phục vụ nhanh chóng, quán đáng để thử 1 lần, giá cả không làm mình thất vọng",
    "user_id": 3881,
    "food_id": 1
  },
  {
    "star": 4,
    "video": "https://www.youtube.com/watch?v=2S3Q_tplRwQ",
    "review": "giá cả hơi cao, quán nhiều view đẹp",
    "user_id": 3780,
    "food_id": 2
  }
]
```

## End
