const markdownIt = require("markdown-it")({ html: true });

module.exports = function (eleventyConfig) {
  // Lets front-matter fields (like `intro`) be rendered as markdown too,
  // not just the main page body.
  eleventyConfig.addFilter("markdown", (content) =>
    markdownIt.render(content || "")
  );

  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));

  // Turns a plain YouTube/Vimeo link (what someone actually pastes) into an
  // embeddable player URL.
  eleventyConfig.addFilter("embedUrl", (url) => {
    if (!url) return "";
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return url;
  });
  // All pages are now Eleventy templates (.njk), so their titles can be
  // driven from _data/pageTitles.json and made editable via the CMS.
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("admin");

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
