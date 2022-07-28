const puppeteer = require("puppeteer")
const mongoose = require("mongoose")
const dip_db = require('./db')



async function pars(tip) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(tip, { timeout: 0 })
  obj = [];
  ingredients = []
  link_start = 'href="'
  link_end = '" title'
  pic_start = 'img src="'
  or_pic_start = 'data-original="'
  pic_end = '" alt='
  name_start = 'alt="'
  name_end = '" title="" class="native'
  for (i = 1; i < 50; i++) {
    try {
      await page.waitForSelector(`#cooking > div.cooking-block > div:nth-child(${i})`)
      seldiv = await page.$eval(`#cooking > div.cooking-block > div:nth-child(${i}) > div.photo.is-relative`, (el) => el.innerHTML)
      seldiv = String(seldiv)
      inh = seldiv.indexOf(link_start) + link_start.length
      ikh = seldiv.indexOf(link_end)
      href = seldiv.substring(inh, ikh)
      href = 'https://1000.menu' + href

      if (seldiv.includes(or_pic_start)) {
        inj = seldiv.indexOf(or_pic_start) + or_pic_start.length
        ikj = seldiv.indexOf(pic_end)
        jpg = seldiv.substring(inj, ikj)
        jpg = 'https:' + jpg
      }
      else {
        inj = seldiv.indexOf(pic_start) + pic_start.length
        ikj = seldiv.indexOf(pic_end)
        jpg = seldiv.substring(inj, ikj)
        jpg = 'https:' + jpg
      }

      inn = seldiv.indexOf(name_start) + name_start.length
      ink = seldiv.indexOf(name_end)
      naz = seldiv.substring(inn, ink)

      href = String(href)
      const page1 = await browser.newPage()
      await page1.goto(href, { timeout: 0 })
      // await page1.waitForSelector(`#recept-list > div:nth-child(${1})`)
      // recep =  await page1.$eval(`#recept-list > div:nth-child(${1})`, (el) => el.innerHTML)
      // recep = String(recep)
      // //if (recep.includes)
      // console.log(recep)
      try {
        for (j = 1; j < 30; j++) {
          await page1.waitForSelector(`#recept-list > div:nth-child(${j})`)
          ingr = await page1.$eval(`#recept-list > div:nth-child(${j}) > div:nth-child(2) > a`, (el) => el.innerText)
          ingredients.push(ingr)
        }
      }
      catch { }
      ingred = String(ingredients)
      obj.push({ hrefkey: href, pic: jpg, name: naz, ingredient: ingred });
    }
    catch { }
    ingredients.length = 0
    console.log(i, obj)
  }
  await browser.close()
  return (obj)
  obj.length = 0
}

async function formir() {
  //zavtrak = await pars('https://1000.menu/catalog/na-zavtrak') //Завтрак
  //await console.log("Завтрак готов")
  //obed = await pars('https://1000.menu/catalog/supj') //Обед
  //await console.log("Обед готов")
  yzhin = await pars('https://1000.menu/catalog/vtoroe-bludo') //Ужин
  await console.log("Ужин готов")
}

function zapis(arr, stat) {
  for (i = 0; i < arr.length; i++) {
    rec = new dip_db({
      status: stat,
      name: arr[i]['name'],
      pic: arr[i]['pic'],
      href: arr[i]['hrefkey'],
      ingredient: arr[i]['ingredient']
    })
    rec.save((err, ok) => {
      if (err) console.log('err', err)
    })
  }
}

async function record() {
  await mongoose.connect('mongodb://localhost/recipes')
    .then(() => console.log("All is ok"))
    .catch(e => console.log(e))

  //await dip_db.deleteMany({})   ОЧИЩАЕТ ВСЮ ТАБЛИЦУ В БД

  //zapis(zavtrak, 'brea')
  //zapis(obed, 'lunch')
  zapis(yzhin, 'dinn')

  console.log("Запись успешно заевршена!")

}

async function vuz() {
  await formir()
  await record()
}

vuz()
