// shuffle array
function shuffle(values) {
  return values.sort((a, b) => 0.5 - Math.random());
}

// clear double value
function uniq(a) {
    a = a.flat()
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

function map_range(value, low1, high1, low2, high2) {
    //return  {value, low1, high1, low2, high2}
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


function to_charcode(value = ''){
  console.log(value)
  let result = ''; 
  value.split('').forEach(letter => {
    result = result.concat('\\u00', letter.charCodeAt(0) )
  })
  return result
}



module.exports = {shuffle, uniq, map_range, to_charcode}