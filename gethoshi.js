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



  //https://www.showroom-live.com/api/live/onlives?_=1534505242803
  const downloadUrl = 'https://www.showroom-live.com/api/live/onlives?_=1534505242803';
  const donwloadFilePath = './onlive.json';


  var viewSource = await page.goto(downloadUrl);
  //const html = await page.content();
 let html = await page.evaluate(() => document.body.innerHTML);
  html=html.replace('<pre style="word-wrap: break-word; white-space: pre-wrap;">',"");
  html=html.replace("<pre>","");
  html=html.replace("</pre>","");
  //console.log(html);
  let jsondata = JSON.parse(html);


  var x99_eq_cnt=0;

  for (let onlive of jsondata.onlives[0].lives) {
    if((onlive.genre_id==200 && process.argv[2]=="200" )
     ||(onlive.genre_id!=200 && process.argv[2]=="x200" ))
    {
      console.log(onlive.room_url_key);
      await page.goto('https://www.showroom-live.com/'+onlive.room_url_key);
      await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})

      const title = await page.evaluate(() => {
        const $ = window.$; //otherwise the transpiler will rename it and won't work
        return $('title').text();
     });

     console.log(title);

     const x99_before = await page.evaluate(() => {
       const $ = window.$; //otherwise the transpiler will rename it and won't work

       var ret="";
       ret=$('.room-gift-item').length;
       if($('.room-gift-item').length>0)
       {
         $('.room-gift-item').each(function(i, elem) 
         {
           if(i<=4){
             ret=ret+" "+$(elem).find(".gift-free-num-label").html();
           }
         });
       }
       return ret;
     });

     console.log(x99_before);
     if(x99_before!="0")
     {
       await page.click('#icon-room-twitter-wrapper');
       await sleep(500);


       //await page.type('textarea#twitter-textarea', 'aaa');
       await sleep(500);
       await page.click('#twitter-post-button');
       await sleep(2000);

       const x99_after = await page.evaluate(() => {
         const $ = window.$; //otherwise the transpiler will rename it and won't work

         var ret="";
         ret=$('.room-gift-item').length;
         if($('.room-gift-item').length>0)
         {
           $('.room-gift-item').each(function(i, elem)
           {
             if(i<=4){
               ret=ret+" "+$(elem).find(".gift-free-num-label").html();
             }
           });
         }
         return ret;
       });

       console.log(x99_after);
       if(x99_before==x99_after)
       {
         x99_eq_cnt++;
         console.log("hoshi/tane eq count"+x99_eq_cnt);
       }
       else
       {
         x99_eq_cnt=0;
       }
       if(x99_eq_cnt>25)
       {
         break;
       }
     }

    }
  }


  await browser.close();
})();

