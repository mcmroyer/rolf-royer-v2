const markdownIt = require("markdown-it")({ html: true });

module.exports = function (eleventyConfig) {
  // Lets front-matter fields (like `intro`) be rendered as markdown too,
  // not just the main page body.
  eleventyConfig.addFilter("markdown", (content) =>
    markdownIt.render(content || "")
  );
  // The 10 hand-written pages stay exactly as-is, copied through untouched.
  // points-de-vue.html and the article are now generated from .njk/.md —
  // named explicitly here (not a *.html glob) so their stale root copies
  // (kept only for GitHub Pages, which can't run this build) never win.
  const staticPages = [
    "a-propos.html",
    "accompagnements.html",
    "cas-clients.html",
    "confidentialite.html",
    "contact.html",
    "index.html",
    "mentions-legales.html",
    "methode.html",
    "parcours.html",
    "pour-les-dirigeants.html",
  ];
  staticPages.forEach((page) => eleventyConfig.addPassthroughCopy(page));
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Pull-quotes: write `> quote` in markdown, get the site's real
  // `<p class="pull">` styling instead of a generic <blockquote><p>...</p></blockquote>.
  eleventyConfig.amendLibrary("md", (mdLib) => {
    let inPullQuote = false;
    mdLib.renderer.rules.blockquote_open = () => {
      inPullQuote = true;
      return '<p class="pull">';
    };
    mdLib.renderer.rules.blockquote_close = () => {
      inPullQuote = false;
      return "</p>";
    };
    mdLib.renderer.rules.paragraph_open = () => (inPullQuote ? "" : "<p>");
    mdLib.renderer.rules.paragraph_close = () => (inPullQuote ? "" : "</p>");
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
