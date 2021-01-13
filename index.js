const {Builder, By, Key, until} = require('selenium-webdriver');
const readline = require('readline');
const shelf = require('./books.json');
// const { env } = require('process');
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
  console.log(ebook);
  // openOreilly(ebook);
};

const argv = (num) => {
  return process.argv.slice(num)[0];
}

const getEbookUri = (book) => {
  let uri = '/home';
  if ((Number(book)) && book > 0 && book <= shelf.length)
    uri = `/library/view/${shelf[book-1].name}/${shelf[book-1].isbn}`;
  return uri;
}

const start = (async () => {
  switch(process.argv.length) {
    case 3:
      ebook = getEbookUri(argv(2));
      console.log(ebook);
      break;
    case 4:
      ebook = getEbookUri(argv(2)) + chpt(argv(3));
      console.log(ebook);
      break;
    default:
      bookChoice();
  }
})();  

/* 2Do
save favourite book
save current chapter for each book

go to current chapter
*/
