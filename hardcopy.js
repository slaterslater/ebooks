require('dotenv').config({path: __dirname + '/.env'})
const puppeteer = require('puppeteer');
const { LOGIN, CARD, PIN, PORTAL, LIBRARY } = process.env;
const uri = `${LOGIN}?user=${CARD}&pass=${PIN}&url=${PORTAL}`;

const ebook = '/library/view/javascript-the-definitive/9781491952016/';
const index = '/library/view/javascript-the-definitive/9781491952016/ix01.html';

(async () => {
  try {
    // const browser = await puppeteer.launch({ headless: false });
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const final = await browser.newPage();
    // need to set the width of final to optimize reading
    page.setDefaultNavigationTimeout(0);
    final.setDefaultNavigationTimeout(0);
    await login(page);
    await final.goto(page.url())
    await clearBody(final)
    // get book title and assign to var for pdf filename
    await buildFinal(page, final)
    await final.pdf({ path: 'final.pdf', format: 'a4' });
    await browser.close();
  } catch (err) {
    console.log(err.message) }
})();

async function clearBody (page) {
  console.log('clearing final doc...')
  await page.evaluate(()=>{
    document.body.innerHTML = '';
  })
  console.log('...cleared')
}

const addContent = async (page, final) => {
  await page.waitForSelector('#sbo-rt-content');
  let content = await page.evaluate(()=>{
    return document.querySelector('#sbo-rt-content').outerHTML;
  })
  await final.evaluate((html)=>{
    document.body.innerHTML += html;
  }, content)
}

async function buildFinal(page, final){
  console.log('getting pages...')
  let more = true;
  let count = 0;
    do {
      await page.waitForSelector('.nav-link')
      const next_page = await page.evaluate(()=>{
        let next = document.querySelector('.next')
        return (next) ? next.getAttribute('href') : null;
      })
      console.log('page:', ++count)
      await addContent(page, final)
      if (next_page) { await page.goto(LIBRARY + next_page) } 
      else { more = false; }
    } while (more)
  console.log('...finished')
}

async function login(page) {
  console.log('logging in...')
  await page.goto(uri);
  await page.waitForSelector('.ipVerified')
  await page.click('.cta');
  await page.waitForSelector('.successModal')
  await page.click('.cta');
  await page.goto(LIBRARY + ebook); // this should take the isbn?
  await page.click('.start-reading')
  console.log('...ready')
}
