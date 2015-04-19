
(function (factory) {

  // CommonJS
  if (typeof exports == "object") {
    module.exports = factory(module.exports,
                             require("jquery"),
                             require("select2"));
  }
  // Browser
  else factory(this, window.$);
}(function (root, $) {

  "use strict";
  var SPLIT_ID_ON = '$';
  if(typeof $ !== 'function'){ // find out if jquery available. TODO : improve
    throw new Error('Jquery not found.');
  }

  if(typeof $('select').select2 !== 'function'){ // find out if select2 available. TODO : improve
    throw new Error('Select2 not found.');
  }

  var util = {
    isObject : function(obj, allowEmpty, allowArrray, allowNull){
      return ((typeof obj === 'object') && (allowNull || obj) &&
          (allowArrray || !Array.isArray(obj)) && (allowEmpty || Object.keys(obj).length));
    },

    isString : function(str, allowEmpty){
      return ((typeof str === 'string') && (allowEmpty || str.length));
    },

    isFunction : function(func){
      return (typeof func === 'function');
    }
  };

  var convert = function(domain){
    var res, two;
    for(var tk in domain){
      two = domain[tk];
      if(util.isString(two)) {
        one[tk] = { name : two, userInput : true };
      } else if(util.isObject(two) && two) {
        if(Array.isArray(two)){ domain = two = { name : tk, data : two }; }
        if(two.data){
          if(Array.isArray(two.data)){
            res = { results : [] };
            two.data.forEach(function(th,ind){
              res.results.push({ id : tk+SPLIT_ID_ON+th, text : th, locked : true, forKey : tk });
            });
            two.data = res;
          } else {
            if(util.isObject(two.data) && two.data && Array.isArray(two.data.results)){
              two.data.results.forEach(function(th,ind){
                if(util.isString(th)){
                  two.data.results[ind] = { id : tk+SPLIT_ID_ON+th, text : th, locked : true, forKey : tk };
                } else if(util.isObject(th) && th){
                  th.id = tk+SPLIT_ID_ON+th.id;
                  th.locked = true;
                  th.forKey = tk;
                }
              });
            }
          }
        }
        if(!two.name) two.name = tk;
      }
    }
  };

  var defaults = {
    placeholder : 'Search for available various options, If option values not available, type your value and press space.',
    userInputMsg : 'Type your value and press space.',
    userInputSeparator : ' ',
    noOptionMsg : 'No options available for this type.'
  };

  function InputKeyValue(el,domain,opts){
    if(!el) throw new Error('JQuery element not found.');
    if(!util.isObject(domain)) throw new Error('Domain options not found : second parameter must be a "object".');
    if(util.isString(opts)) opts = { key : opts };
    else if(!(util.isObject(opts) && util.isString(opts.key))) opts = { key : Object.keys(domain)[0] };
    convert(domain);
    for(var dk in defaults){
      this[dk] = defaults[dk];
    }
    for(dk in opts){
      this[dk] = opts[dk];
    }
    this.el = el;
    this.domain = domain;
    this.init();
  };

  InputKeyValue.prototype.init = function(){
    var self = this;
    this.el.select2({
      placeholder : this.placeholder,
      tokenSeparators : Array.isArray(this.userInputSeparator) ? this.userInputSeparator : [this.userInputSeparator],
      createSearchChoice : function(term, data) {
        var ok = false;
        try { ok = (self.queryOn === 'value' && self.domain[self.key].userInput); } catch(e){ }
        if(ok){
          if ($(data).filter(function() {
            return this.text.localeCompare(term) === 0;
          }).length === 0) {
            return { id: self.setId(term), locked : true, forKey : self.key, text: term };
          }
        }
      },
      formatNoMatches : function(){
        if(self.queryOn === 'key') return self.noOptionMsg;
        else {
          var empmsg = null;
          try { empmsg = self.domain[self.key].userInputMsg; } catch(e){ }
          return empmsg || self.userInputMsg;
        }
      },
      query : this.getAllowedOpts.bind(this),
      multiple : true
    }).on('select2-selecting', this.added.bind(this))
    .on('select2-removed', this.removed.bind(this))
    .on('select2-close', this.closed.bind(this));
    this.valInit();
  };

  InputKeyValue.prototype.valInit = function(){
    this.mainOpts = [];
    for(var dk in this.domain){
      this.mainOpts.push({ id : dk, text : this.domain[dk].name + ' : ' });
    }
    this.resultValue = {};
    this.key = 'NONE';
    this.queryOn = 'key';
  };

  InputKeyValue.prototype.getId = function(val){
    return val.split(SPLIT_ID_ON)[1];
  };
  InputKeyValue.prototype.setId = function(val){
    return this.key + SPLIT_ID_ON + val;
  };

  InputKeyValue.prototype.removed = function(ele){
    if(!(ele.choice.forKey && ele.choice.locked)){
      var what = ele.val, allVal = this.el.select2('data');
      this.key = what;
      var self = this;
      var rw = self.resultValue[what];
      if(rw || rw === 0 || rw === false){
        var new_data = $.grep(allVal, function (value, index){
          var pass = (value.id !== self.setId(String(rw)));
          if(index === (allVal.length-1)){ self.key = self.getId(value.id); }
          return pass;
        });
        this.el.select2('data', new_data, false);
      } else {
        this.queryOn = 'key';
      }
    }
    if(this.resultValue.hasOwnProperty(what)) delete this.resultValue[what];
  };
  InputKeyValue.prototype.added = function(ele){
    if(ele.object.forKey){
      var vl = this.getId(ele.val);
      var ps = null, nv = undefined;
      try { ps = (this.domain[this.key].parse); } catch(e){}
      if(ps){
        if(ps === 'Boolean') nv = (vl === 'true');
        else {
          nv = window[ps](vl);
          if(ps === 'Number' && (!Number.isInteger(nv) || !Number.isFinite(nv))) nv = undefined;
        }
      }
      this.resultValue[ele.object.forKey] = (nv !== undefined) ? nv : vl;
      this.queryOn = 'key';
    } else {
      this.key = ele.val;
      this.queryOn = 'value';
    }
  };

  InputKeyValue.prototype.closed = function(ele){
    if(this.queryOn === 'value') this.el.select2('open');
  };

  InputKeyValue.prototype.getAllowedOpts = function(query){
    var callback = query.callback;
    if(this.queryOn === 'value'){
      var ch = this.domain[this.key];
      if(ch){
        var tgar = ch.userInput;
        if(tgar){
          if(Array.isArray(tgar)) callback({ results : tgar});
          else callback({ results : [] });
        } else if(ch.data && Array.isArray(ch.data.results)){
          callback(ch.data);
        }
      }
    } else if(this.queryOn === 'key') {
      if(this.domain){
        callback({ results : this.mainOpts});
      }
    }
  };

  InputKeyValue.prototype.get = function(){
    if(util.isObject(this.resultValue)) return this.resultValue;
    else return {};
  };

  return InputKeyValue;
}));
