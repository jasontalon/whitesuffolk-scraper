const cheerio = require("cheerio"),
  moment = require("moment");

module.exports = async (page, state, pageNumber) => {
  await page.setDefaultTimeout(60000); //1 minute
  let url = `https://www.whitesuffolk.com.au/members/member-directory/wpbdp_category/${state}/page/${pageNumber}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  let pageTitle = await page.title();

  if (pageTitle.includes("Page not found")) return null;

  const html = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(html);

  let contactList = [];
  console.log(
    `[${moment().format()}] parsing page # ${pageNumber} of ${state}`
  );

  $("div[id^=wpbdp-listing-]").each((itemIndex, itemElement) => {
    let title = $(itemElement)
        .find("div.listing-title > a")
        .text(),
      details = $(itemElement).find("div.listing-details"),
      contact = { state, title };

    $(details)
      .find("span.value")
      .each((valueIndex, valueElement) => {
        let label = $(valueElement)
            .prev()
            .text(),
          valueElementText = $(valueElement).text();

        if (label.includes("Mobile")) contact.mobile = valueElementText;
        else if (label.includes("Phone")) contact.phone = valueElementText;
        else if (label.includes("Email")) contact.email = valueElementText;
      });
      
    contactList.push(contact);
  });
  return contactList;
};
