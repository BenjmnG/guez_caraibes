async function videoShortcode(src, alt = ""){
  let file_name = src.split("/").pop()
  return '<video muted loop controls autoplay title="'+(alt)+'"><source src="./media/'+file_name+'" type="video/webm"><source src="./media/'+file_name+'.mp4" type="video/mp4"></video>'
}
module.exports = videoShortcode
