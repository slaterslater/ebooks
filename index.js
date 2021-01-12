require('dotenv').config();
const env = process.env;
const {Builder, By, Key, until} = require('selenium-webdriver');

(async function oreilly() {
  let driver = await new Builder().forBrowser('firefox').build();
  let chapter = getChapter();
  try{
    await driver.get(`${env.LOGIN}?user=${env.LIBRARY_CARD}&pass=${env.PIN}&url=${env.PORTAL}`);
    driver.findElement(By.className('cta')).click();
    await driver.wait(until.elementLocated(By.className('successModal')), 3000);
    await driver.get(env.BOOK + chapter);
  } catch(err){
    console.log(err);
  }
})();

function getChapter() {
  let num = process.argv.slice(2)[0];
  if (Number(num)){
    let apter = (num.length == 2) ? num : '0'+num;
    return `ch${apter}.html`
  }
  return '';  
}

// console.log(getChapter())