const puppeteer = require("puppeteer"),
  whiteSuffolk = require("./white-suffolk"),
  fs = require("fs"),
  _ = require("lodash"),
  states = ["NSW", "SA", "WA", "TAS", "QLD", "VIC"],
  height = 927,
  width = 1278,
  headless = true,
  { Parser } = require("json2csv"),
  moment = require("moment");

(async () => {
  console.log(`[${moment().format()}] begin`);
  let results = [];
  let pages = Array.from(Array(25).keys());

  browser = await puppeteer.launch({
    headless,
    defaultViewport: { height, width }
  });

  let page = await browser.newPage({});

  await asyncForEach(states, async state => {
    try {
      await asyncForEach(pages, async pageNum => {
        var stateResult = await whiteSuffolk(page, state, pageNum + 1);
        if (stateResult == null) throw Exception("Page not found");
        else results.push(stateResult);
      });
    } catch (err) {
      //moving on...
    }
  });
  console.log(`[${moment().format()}] finished`);
  browser.close();
  const parser = new Parser();
  const csv = parser.parse(_.flatten(results));

  fs.writeFile("./whiteSuffolk.csv", csv, "utf-8", console.log);
})();

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    try {
      await callback(array[index], index, array);
    } catch (err) {
      break;
    }
  }
}
