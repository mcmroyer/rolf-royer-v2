module.exports = {
  eleventyComputed: {
    // New articles (created via the /admin CMS) get this URL automatically —
    // no one has to think about a permalink. Articles that already set their
    // own `permalink` in front matter (like the existing one) keep it as-is.
    permalink: (data) =>
      data.permalink || `/points-de-vue-${data.page.fileSlug}.html`,
  },
};
