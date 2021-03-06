var dysel = function(options) {
  // get options
  var links = options.links;
  var callback = options.callback;
  var nocache = options.nocache;
  var debug = options.debug;

  // starting point, i nest the final callback at the deepest
  // (callbacks will be stacked in reverse order)
  var totalScript = callback;

  // js and css file loader
  var loadjscssfile = function(filename, cb) {
    filename = filename.toString();
    var ext = filename.split('.').pop();
    var fileref = null;
    if (ext == "js") {
      // for Javascript
      fileref = document.createElement('script');
      fileref.setAttribute("type", "text/javascript");
      fileref.setAttribute("src", filename);
    } else if (ext == "css" || filename.indexOf('googleapis.com/css?') > -1) {
      // for CSS + google fonts
      fileref = document.createElement("link");
      fileref.setAttribute("rel", "stylesheet");
      fileref.setAttribute("type", "text/css");
      fileref.setAttribute("href", filename);
    }
    // callback trigger (w/debug if needed)
    if (typeof fileref != "undefined") {
      if (cb) {
        var mycallback = cb;
        if(debug) { // if debug redefine callback and add console.log
          mycallback = function() {
            console.log('Loaded NOW ' + (this.src || this.href) + ' >>');
            cb(); 
          }
        }

        fileref.onreadystatechange = mycallback;
        fileref.onload = mycallback
      }
      if(debug) {console.log('Armed ' + filename);}
      // push it into the header
      document.getElementsByTagName("head")[0].appendChild(fileref);
    }
  }

  // create nested functions as callbacks,
  // at the end, if needed, the callback from options is executed
  // like func_1(loadfile_1, func_2(loadfile_2, func_3(loadfile_3, cbFromOptions)))
  for (var i = links.length - 1; i >= 0; i--) {
    var old = totalScript;
    currentLink = links[i];
    if(nocache){
      currentLink += '?' + + new Date().getTime();
    }
    totalScript = function(oldcb) {
      loadjscssfile(this, oldcb);
    }.bind(currentLink, old);
  }
  // execute the nested callbacks
  totalScript();
}