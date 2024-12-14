const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    async function getNameOfReview(page) {
      let names = [];

      const elements = await page.$$('.d4r55');
      for (el of elements) {
        const name = await page.evaluate(el => el.textContent, el);
        names.push({ name });
      }
      return names;
    }

    async function getRating(page) {
      let ratings = [];

      const elements = await page.$$('.kvMYJc');
      if (elements && elements.length > 0) {
        for (const el of elements) {
          const getRating = await page.evaluate(el => el.getAttribute('aria-label'), el);
          const rating = getRating ? getRating.replace(' bintang', '') : null;
          ratings.push({ rating });
        }
      }
      return ratings;
    }

    async function getReviews(page) {
      let reviews = [];

      const elements = await page.$$('.wiI7pd');
      if (elements && elements.length > 0) {
        for (const el of elements) {
          const review = await page.evaluate(span => span.textContent, el);

          const cleanedReview = cleanReview(review);

          reviews.push({ review: cleanedReview });
        }
      }
      return reviews;
    }

    function cleanReview(review) {
      review = review.replace(/\s+/g, ' ').trim();
      return review;
    }

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = "https://www.google.com/maps/place/PT+TOTAL+PINDAH/@-6.2126887,106.8505721,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5007849682f:0x97ee44bc061d1fae!8m2!3d-6.212694!4d106.853147!16s%2Fg%2F11vx6q6p4z?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D";

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    } catch (error) {
      console.error('Error navigating to the page:', error);
      await browser.close();
      return;
    }

    const nameReviews = await getNameOfReview(page);
    const ratings = await getRating(page);
    const reviews = await getReviews(page);

    const data = {
      nameReviews,
      ratings,
      reviews,
    };

    try {
      fs.writeFileSync('reviews.json', JSON.stringify(data, null, 2), 'utf-8');
      console.log("Data has been written to reviews.json");
    } catch (error) {
      console.error('Error writing to reviews.json:', error);
    }

    await browser.close();
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
})();