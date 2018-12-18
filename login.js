const puppeteer = require('puppeteer');
const fs = require('fs');
require('date-utils');

//var $ = require('jquery');

async function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
async function loginWithCookie(page) {
  const cookies = JSON.parse(fs.readFileSync('cookies_amazon.json', 'utf-8'));
  for (let cookie of cookies) {
    await page.setCookie(cookie);
  }
}


(async () => {
  const browser = await puppeteer.launch({
  headless: false,
  appMode: true,
  devtools: false,
  args: [
      '--window-size=1600,950',
      '--window-position=100,50',
      '--no-sandbox'
    ]
});


  const page = await browser.newPage();
  await loginWithCookie(page);
  await page.setViewport({width: 1600, height: 950});



  await page.goto('https://www.showroom-live.com/0dac11119159');
  //await page.screenshot({path: 'example.png' , fullPage:true});
//await new Promise(resolve => setTimeout(resolve, 1000 * 20));

await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})

const title = await page.evaluate(() => {
  const $ = window.$; //otherwise the transpiler will rename it and won't work
 // $("#icon-room-onlive").click();

  return $('title').text();
});

console.log(title);

//await page.click('#icon-room-twitter-wrapper');
await sleep(1000);

//await page.type('input[name="account_id"]', 'nodeexsample');
//await page.type('input[name="password"]', '1ma1works');
//await page.click('#js-login-submit');


//await page.click('#icon-room-twitter-wrapper');
//await sleep(1000);

//twitter-textarea
//await page.click('#twitter-post-button');

await sleep(20000);

const cookies = await page.cookies();
fs.writeFileSync('cookies_amazon.json', JSON.stringify(cookies));


  await browser.close();
})();

