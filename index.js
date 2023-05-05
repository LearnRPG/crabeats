const request = require('request');

const STARTDATE = '2023/5/8';
const TOTALDAYS = 5;
const RANDSECMIN = 50;
const RANDSECMAX = 70;
const SHOOTVENDOR = ['輪動櫃-悟饕便當', '輪動櫃-姊妹飯桶']; // 輪動櫃-悟饕便當 輪動櫃-姊妹飯桶
const COOKIE = ''; // You must use your browser to find the ordering cookie.

let emptyCnt = 0;

/**
  1: '9：00~9：30',
  3: '11：20~11：40',
  4: '11：45~12：10',
  5: '17：20~18：00', */
const arrivalData = {
  A: 1,
  B: 4,
  C: 5,
};

function randomInt(low, high) {
  return Math.floor((Math.random() * (high - low)) + low);
}

function order(mealInfo) {
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Content-Type': 'application/json;charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
    Origin: 'https://crabeats.realtek.com',
    Connection: 'keep-alive',
    Referer: 'https://crabeats.realtek.com/Food/Index',
    Cookie: COOKIE,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    TE: 'trailers',
  };

  const dataString = `{"data":{"Date":"${mealInfo.EffectiveDate}","Meal":"${mealInfo.Meal}","MealId":"${mealInfo.Id}","Location":"瑞昱二廠","FloorId":"11","FloorName":"1F 醫務室前","Vendor":"${mealInfo.VendorName}","ArriveTimeId":"${arrivalData[mealInfo.Meal]}","Count":"1","MealName":"${mealInfo.Name}","Money":${mealInfo.Price}}}`;

  const options = {
    url: 'https://crabeats.realtek.com/Food/AddMealRegister',
    method: 'POST',
    headers: HEADERS,
    gzip: true,
    body: dataString,
  };

  request(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      if (body.length === 2) {
        console.log(`order: ${mealInfo.EffectiveDate} - ${mealInfo.VendorName} - ${mealInfo.Name} SUCCESS!!`);
      } else {
        console.log(`order: ${mealInfo.EffectiveDate} - ${mealInfo.VendorName} - ${mealInfo.Name} ${body}`);
      }
    } else {
      console.log(body);
    }
  });
}

const handleResponse = (error, response, body) => {
  if (!error && response.statusCode === 200) {
    if (body.length === 2) {
      emptyCnt += 1;
      console.log(`Error: ${emptyCnt} times`);
    }
    if (emptyCnt === TOTALDAYS) {
      const rand = randomInt(RANDSECMIN, RANDSECMAX);
      setTimeout(() => {
        preview(STARTDATE, TOTALDAYS);
      }, 1000 * rand);
      console.log(`Total error: ${TOTALDAYS} times, the next execution time will start in ${rand} seconds`);
      emptyCnt = 0;
    }
    const obj = JSON.parse(body);
    // console.log(obj.length);
    obj.forEach((id, index) => {
      // console.log(id);
      SHOOTVENDOR.forEach((vendor) => {
        if (id.VendorName === vendor) {
          // console.log(id);
          order(id);
        }
      });
    });
  }
};

function preview(startDate, totalDays) {
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    'X-Requested-With': 'XMLHttpRequest',
    Connection: 'keep-alive',
    Referer: 'https://crabeats.realtek.com/Food/Index',
    Cookie: COOKIE,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    TE: 'trailers',
  };

  const dateArray = startDate.split('/');
  const year = parseInt(dateArray[0], 10);
  const month = parseInt(dateArray[1], 10);
  const date = parseInt(dateArray[2], 10);

  for (let i = 0; i < totalDays; i += 1) {
    const datetime = new Date(year, month - 1, date + i);
    const newYear = datetime.getFullYear();
    const newMonth = (`0${datetime.getMonth() + 1}`).slice(-2);
    const newDate = (`0${datetime.getDate()}`).slice(-2);

    const options = {
      url: `https://crabeats.realtek.com/Food/ListTodayMenus?date=${newYear}%2F${newMonth}%2F${newDate}&location=%E7%91%9E%E6%98%B1%E4%BA%8C%E5%BB%A0&_=1678455189597`,
      headers: HEADERS,
      gzip: true,
    };

    // console.log(options);

    request(options, handleResponse);
  }
}

preview(STARTDATE, TOTALDAYS);
