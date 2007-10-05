/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @license GPL v2
 */
/**
 * Creates an AJAX request
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @param {Object} pars object to overwrite the default parameters
 */
var HupAjax = function(pars, el)
{
  if(typeof pars.url == 'undefined')
  {
    return false;
  }

  var stChg = function(ob, p)
  {
    return function() { ob.handler(p); }
  }

  this.el = el;
  this.url = pars.url;
  this.pars = typeof pars.pars != 'undefined' ? pars.pars : this.pars;
  this.handler = typeof pars.handler != 'undefined' ? pars.handler : this.handler;
  this.method = typeof pars.method != 'undefined' ? pars.method : 'get';
  this.successHandler = typeof pars.successHandler != 'undefined' ? pars.successHandler : this.successHandler;
  this.errorHandler = typeof pars.errorHandler != 'undefined' ? pars.errorHandler : this.errorHandler;
  this.loadHandler = typeof pars.loadHandler != 'undefined' ? pars.loadHandler : this.loadHandler;

  this.req = new XMLHttpRequest();
  this.req.open(this.method, this.url, true);
  this.req.setRequestHeader('User-Agent', this.agent);
  this.req.setRequestHeader('Accept-Charset','utf-8');
  this.req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

  this.req.onreadystatechange = stChg(this, false);
  this.req.send(this.pars); 
};
HupAjax.prototype =
{
  url: null,
  pars: null,
  req: null,
  el: null,
  method: 'get',
  agent: 'Hupper Firefox extension 0.0.4.6',
  handler: function(pars)
  {
    try
    {
      if (this.req.readyState == 4)
      {
        if(this.req.status != 'undefined')
        {
          if(this.req.status == 200)
          {
            return this.successHandler();
          }
          else
          {
            return this.errorHandler('status code - ' + this.req.status);
          }
        }
        else
        {
          return this.errorHandler('no status code');

        }
      }
      else
      {
        return this.loadHandler();
      }
    }
    catch(e)
    {
      return this.errorHandler('no readyState', e);
    }
  },
  successHandler: function()
  {
    return this.req.responseText;
  },
  errorHandler: function(msg, er)
  {
    Hog.log('Ajax error: ' + msg + ' || ' + er);
    HLog.log(this.url);
    return false;
  },
  loadHandler: function()
  {
    return true;
  }
};
