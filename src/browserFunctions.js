//reads a server-side file; note: currently does not work with Chrome (possibly a bug); see source of http://sealevel.info/test_file_read.html for more details
//Actually might work for chrome once we put it on a website: it looks like there's a bug in Chrome where it won't handle cross-origin requests properly, and might only read it correctly if looking at http://...
//basically my web research suggests the best way to do this is via what's called an XMLHttpRequest (or Jquery, but who's got time to learn that...
function file2String(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}

string2Problem(string){


}
