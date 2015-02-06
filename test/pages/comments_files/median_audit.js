function median_webaudit() {
  var d=document,s=screen?screen.width+'x'+screen.height:"";
  var u=d.URL?new String(d.URL):"";
  var r=d.referrer?new String(d.referrer):"";
  return "@s="+s+"@u="+escape(u.substring(0,183))+"@r="+escape(r.substring(0,127));
}
var same=Math.floor(Math.random()*100000000)+median_webaudit();


