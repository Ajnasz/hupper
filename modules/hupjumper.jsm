HupJumper = function(win, nextLinks) {
  this.window = win;
  this.nextLinks = nextLinks;
}
HupJumper.prototype = {
  next: function() {
    if(/^#/.test(this.window.location.hash)) {
      var curIndex = this.nextLinks.indexOf(this.window.location.hash.replace(/^#/, ''));
      if(this.nextLinks[curIndex+1]) {
        this.window.location.hash = this.nextLinks[curIndex+1];
      } else if(this.nextLinks[0]) {
        this.window.location.hash = this.nextLinks[0];
      }
    } else if(this.nextLinks.length) {
      this.window.location.hash = this.nextLinks[0];
    }
  },
  prev: function() {
    if(/^#/.test(this.window.location.hash)) {
      var curIndex = this.nextLinks.indexOf(this.window.location.hash.replace(/^#/, ''));
      if(curIndex != 0) {
        this.window.location.hash = this.nextLinks[curIndex-1];
      } else if(this.nextLinks[this.nextLinks.length-1]) {
        this.window.location.hash = this.nextLinks[HUP.w.nextLinks.length-1];
      }
    } else if(this.nextLinks.length) {
      this.window.location.hash = this.nextLinks[this.nextLinks.length-1];
    }
  }
};
let EXPORTED_SYMBOLS = ['HupJumper'];
