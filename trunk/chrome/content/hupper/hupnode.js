var HUPNode = function(node) {
  var header = HUP.El.GetFirstTag('h2', node);
  var submitData = node.childNodes[3];
  var cont = node.childNodes[5];
  var footer = HUP.El.HasClass(node.childNodes[7], 'links') ? node.childNodes[7] : false;
  var sender = HUP.El.GetByAttrib(submitData, 'a', 'title', 'Felhasználói profil megtekintése.');
  var taxonomy = HUP.El.GetByAttrib(submitData, 'a', 'rel', 'tag');
  this.element = node;
  this.id = parseInt(node.id.replace('node-', ''));
  this.header = header;
  this.path = Stringer.trim(HUP.El.GetFirstTag('a', header).getAttribute('href'));
  this.submitData = submitData;
  this.cont = cont;
  this.footer = footer;
  this.newc = HUP.El.GetByClass(footer, 'comment_new_comments', 'li').length > 0 ? true : false;
  this.taxonomy = taxonomy.length > 0 ? taxonomy[0].innerHTML : false;
  this.sender = sender.length ? {
    name: sender[0].innerHTML,
    id: parseInt(sender[0].href.replace('http://hup.hu/user/', '')),
    url: sender[0].href
  } : false;
  var hideTaxonomies = Stringer.trim(HupperPrefs.hidetaxonomy());
  if(hideTaxonomies.length && hideTaxonomies.indexOf(this.taxonomy) != -1) {
    this.hide();
  }
  this.builder = new NodeHeaderBuilder();
  this.addNnewSpan();
};
HUPNode.prototype = {
  hidden: false,
  next: false,
  previous: false,
  hide: function() {
    HUP.El.AddClass(this.element, 'hidden');
    this.hidden = true;
  },
  addNnewSpan: function() {
    this.sp = HUP.El.Span();
    HUP.El.AddClass(this.sp, 'nnew');
    HUP.El.Insert(this.sp, this.header.firstChild);
  },
  /**
   * @param {Integer} i node index
   * @param {Integer} nl number of the nodes
   */
  addNewNodeLinks: function() {
    this.addNameLink();
    this.addMarkAsRead();
    this.addNewText();
    this.addPrev();
    this.addNext();
  },
  addMarkAsRead: function() {
    var mread = this.builder.buildMarker(this.path, this.id);
    HUP.markReadNodes.push(mread);
    HUP.El.Add(mread, this.sp);
  },
  addNewText: function() {
    HUP.El.Add(this.builder.buildNewText(), this.sp);
  },
  addNameLink: function() {
    // HUP.El.Insert(this.builder.buildNameLink('node-' + this.id), this.header);
    HUP.El.Insert(this.builder.buildNameLink(this.id, 'node'), this.header);
  },
  addNext: function() {
    this.next === false ? HUP.El.Add(this.builder.buildLastLink(), this.sp) : HUP.El.Add(this.builder.buildNextLink('node-' + this.next), this.sp);
  },
  addPrev: function() {
    this.previous === false ? HUP.El.Add(this.builder.buildFirstLink(), this.sp) : HUP.El.Add(this.builder.buildPrevLink('node-' + this.previous), this.sp);
  }
};
