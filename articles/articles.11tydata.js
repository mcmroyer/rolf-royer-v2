module.exports = {
  eleventyComputed: {
    // New articles (created via the /admin CMS) get this URL automatically —
    // no one has to think about a permalink. Articles that already set their
    // own `permalink` in front matter (like the existing one) keep it as-is.
    // English articles (lang: en) get an /en/ prefix automatically.
    lang: (data) => data.lang || "fr",
    permalink: (data) => {
      if (data.permalink) return data.permalink;
      const slug = data.page.fileSlug;
      return data.lang === "en"
        ? `/en/points-de-vue-${slug}.html`
        : `/points-de-vue-${slug}.html`;
    },
  },
};
