const {Builder, By, Key, until} = require('selenium-webdriver');
const readline = require('readline');
const shelf = require('./books.json');
require('dotenv').config();


const openOreilly = async (ebook) => {
  const env = process.env;
  let driver = await new Builder().forBrowser('firefox').build();
  try{
    await driver.get(`${env.LOGIN}?user=${env.CARD}&pass=${env.PIN}&url=${env.PORTAL}`);
    await driver.wait(until.elementLocated(By.className('cta')), 3000).click();
    await driver.wait(until.elementLocated(By.className('successModal')), 3000);
    await driver.get(env.LIBRARY+ebook);
  } catch(err){
    console.log(err);
  }
}

const getChapterUri = (num) =>{
  return (Number(num)) ? `/ch${(num.length == 2) ? num : '0'+num}.html` : '';
}

const showBooks = () => {
  for (book in shelf){
    console.log(`${parseInt(book) + 1} ${shelf[book].name}`);
  }
};

const userChoice = (option) =>{
  return new Promise((resolve, reject) => {
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(option, choice => {
      rl.close();
      resolve(choice);
    });
  });
}

const bookChoice = async () => {
  let ebook, selection, chapter = '';
  showBooks(); 
  selection = await userChoice(`enter 1-${shelf.length}: `);
  ebook = getEbookUri(selection);
  if (ebook != '/home'){
    chapter = await userChoice('chapter: ');
  }
  ebook += getChapterUri(chapter);
  return ebook;
};

const getEbookUri = (book) => {
  let uri = '/home';
  if ((Number(book)) && book > 0 && book <= shelf.length){
    const {name, isbn} = shelf[book-1];
    uri = `/library/view/${name}/${isbn}`;
  }
  return uri;
}

(async () => {
  let ebook, argv = num => process.argv.slice(num)[0];
  switch(process.argv.length) {
    case 3:
      ebook = getEbookUri(argv(2));
      break;
    case 4:
      ebook = getEbookUri(argv(2)) + getChapterUri(argv(3));
      break;
    default:
      ebook = await bookChoice().catch((err)=>{
        console.log(`${err}\nsomething went wrong...`);
      });
  }
  // console.log(ebook);
  openOreilly(ebook);
})();  