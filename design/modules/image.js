const path = require("path");
const Image = require("@11ty/eleventy-img");

function imageShortcode(src, alt = "", widths, sizes) {
  
  src = './contenu/' + src

  let options = {
    widths: widths || ["auto"],
    formats: ["avif", "webp"],
    outputDir: "./public/_media/",
    urlPath: "/_media/",
    filenameFormat: function (id, src, width, format, options) {
      const extension = path.extname(src)
      const name = path.basename(src, extension)
      return `${name}-${width}w.${format}`
    }
  }

  try{
    Image(src, options);
    let metadata = Image.statsSync(src, options);
  } catch (err) {
    console.error("\u001b[33m❌❌ Il manque l'image " + src + " ❌❌\u001b[0m");
    return "";
  }

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
};

module.exports = imageShortcode