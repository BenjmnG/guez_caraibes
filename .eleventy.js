const { EleventyI18nPlugin } 
                            = require("@11ty/eleventy"),
      yaml                  = require("js-yaml"),
      { Transform }         = require('readable-stream'),
      { shuffle, 
        uniq, 
        to_charcode, 
        map_range}          = require('./design/modules/_tools.js'),
      videoShortcode        = require('./design/modules/video.js'),
      imageShortcode        = require('./design/modules/image.js'),
      imageShortcodeAsync   = require('./design/modules/async_image.js'),
      markdownLibrary       = require('./design/modules/markdownLibrary.js'),
      minHTML               = require('./design/modules/minHTML.js'),
      minJS                 = require('./design/modules/minJS.js')



function isDateNotPast(date){
  if(Date.parse(date) - Date.parse(new Date()) > 0){
    return true
  } 
}

function simpleDate(date){
  if(!date){return}
  date = new Date(date); 
  let d_fr = new Intl.DateTimeFormat("fr", { month: 'long', year: 'numeric' }).format(date); 
  return d_fr 
}

function parseDate(data){
  
  if(!data){return}

  let start_date, end_date, month_count

  if(data.début && data.fin){
    start_date = new Date(data.début)
    end_date = new Date(data.fin)
    month_count = end_date.getMonth() - start_date.getMonth()
  } else if(data.début && data.durée_en_mois){
    start_date = new Date(data.début)
    month_count = parseFloat(data.durée_en_mois)
    end_date = start_date.setMonth(start_date.getMonth() + month_count)
    end_date = new Date(end_date)
  } else if(data.durée_en_mois && data.fin){
    month_count = parseFloat(data.durée_en_mois)
    end_date = new Date(data.fin)
  }

  let deliver_word = isDateNotPast(end_date) ? 'Livraison' : 'Livré'

  return `${month_count} mois<br>${deliver_word} ${simpleDate(end_date)}`
}

module.exports = config => {
  
  config.addFilter("markdown", content => markdownLibrary.render(content) );
  config.addFilter("debug", (content) => console.log(content));
  config.addFilter('shuffle', shuffle)
  config.addFilter('isArr', something => Array.isArray(something));
  config.addFilter('isObj', something => _.isPlainObject(something))
  config.addFilter("head", (array, n, m) => { if (m) { return array.slice(n, m) } else {return array.slice(n); } });
  config.addFilter("escaP", content => content.replace('<p>', '').replace('</p>', ''));
  config.addFilter("afterSlash", string => string.split("/").pop() );
  config.addFilter("split", (content, character) => { return content.split(character) });
  config.addFilter("int", string => parseFloat(string) );
  config.addFilter("map", (value, low1, high1, low2, high2) => { return map_range(value, low1, high1, low2, high2) });
  config.addFilter("getId", value => {return value.replace(/\W/g,'_')});
  config.addFilter("toCharCode", value => to_charcode(value));
  config.addFilter("reverse", value => value ? [...value].reverse().join("") : value);
  config.addFilter("simpleDate", date => simpleDate(date));
  config.addFilter("isDateNotPast", date => isDateNotPast(date));
  config.addFilter("devise", number => { return new Intl.NumberFormat('fr', { style: 'currency', currency: 'EUR' }).format(number)})
  config.addFilter("spaceNumber", number => { return new Intl.NumberFormat('fr-FR').format(number)})
  config.addFilter("parseDate", data => parseDate(data));
  config.addFilter("setAttribute", (dictionary, key, value) => {dictionary[key] = value; return dictionary;});
  config.addFilter("appendToArray", (dictionary, object) => { dictionary.push(object); return dictionary });
  config.addFilter("isIncludes", (a, b) => { if(a && b){ return a.includes(b) } });
  config.addFilter("startsWith", (a, b) => { return a.startsWith(b) });
  config.addDataExtension("yaml", contents => yaml.load(contents));
  
  config.setLibrary("md", markdownLibrary);

  if(process.env.NODE_ENV  == 'production'){
    config.addShortcode("image", imageShortcode);
  } else {
    config.addAsyncShortcode("image", imageShortcodeAsync);
  }
  config.addShortcode("video", videoShortcode);


  //
  // Collections
  //   
  config.addCollection("projets", function(collection) {
      let projets = collection.getFilteredByGlob("contenu/projets/*.md")
      return projets;
  });

  config.addCollection("savoirFaire", function(collection) {
      let savoirFaire = collection.getFilteredByGlob("contenu/savoir-faire/*.md");
      
      // Sort by number
      savoirFaire.sort((obj1, obj2) => {
        const path1 = obj1.template.inputPath;
        const path2 = obj2.template.inputPath;
        return path1.localeCompare(path2);
      });
      return savoirFaire;
  });

  config.addCollection("equipes", function(collection) {
      let équipes = collection.getFilteredByGlob("contenu/equipes/*.md")

      // sort by filemane (01-NOM)
      équipes = équipes.sort((a, b) => a.data.page.fileSlug.localeCompare(b.data.page.fileSlug));

      return équipes;
  });

  config.addCollection("localisations", function(collection) {
      let localisations = collection.getFilteredByGlob("contenu/equipes/*.md")
      let stBart = { data: { nom: 'Saint-Barthélemy'} }
      localisations.push(stBart)
      return localisations;
  });



  // Sass Watch
  if(process.env.NODE_ENV == 'development'){
    config.addWatchTarget("./design/assets/scss/", "./design/assets/css/");
  }

  // pass through !
  config.addPassthroughCopy({
    './contenu/_media' : '_media',
    './design/assets/font/' : 'assets/font',
    './design/assets/svg/' : 'assets/svg',
    './design/assets/js/' : 'assets/js',
    './design/assets/lib/' : 'assets/lib',
    './design/assets/css/' : 'assets/css',
    './design/assets/social/' : 'assets/social',
    './design/assets/root/' : '/',
    /*'./design/assets/*.htaccess' : '/'*/
  });

  // 
  // Passthrough & minify JS
  // 
  if(process.env.NODE_ENV == 'development'){
  config.addPassthroughCopy({'./design/assets/js/' : 'assets/js'});
  } else {
      config.addPassthroughCopy(
      {'./design/assets/js/' : 'assets/js'}, 
      {
        transform: (src, dest, stats) => {
          return new Transform({
            transform(chunk, enc, done) {
              done(null, minJS(chunk.toString()));
            },
          });
        },
      }
    );
  }

  /*config.on('eleventy.after', ({ dir, results, runMode, outputMode }) => {
  })*/

  // 
  // Minify HTML
  // 
  config.addTransform("htmlmin", minHTML);

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'contenu',
      data: './_data/',
      includes: '../design/layouts',
      output: 'public'
    }

  };
};