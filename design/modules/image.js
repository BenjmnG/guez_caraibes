const path = require("path");
const Image = require("@11ty/eleventy-img");

function imageShortcode(src, alt = "", widths, sizes) {

  src = './contenu/_media/' + src
  let baseURL = process.env.NODE_ENV  == 'production' ? 'https://benjmng.github.io/guez_caraibes/' : './'
  let metadata = Image.statsSync(src, {
    widths: widths || ["auto"],
    formats: ["avif", "webp"],
    outputDir: "./public/_media/",
    urlPath: baseURL + "media/",
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
  return Image.generateHTML(metadata, imageAttributes);
};

module.exports = imageShortcode