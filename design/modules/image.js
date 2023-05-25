const path = require("path");
const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt = "", widths, sizes) {

  src = './contenu/_media/' + src
  let metadata = await Image(src, {
    widths: widths || ["auto"],
    formats: ["avif", "webp"],
    outputDir: "./public/_media/",
    urlPath: "./media/",
    filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
      }

  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on a missing alt (alt="" works okay)
  return await Image.generateHTML(metadata, imageAttributes);
};

module.exports = imageShortcode