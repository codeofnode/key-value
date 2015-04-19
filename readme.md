# Key Value Inputer
## Allow client to input key-values pairs for some operations like interactive searching, raw-json etc.

## Features
* Interactive and better usability
* Can set up domain keys, means user can input values only for restrictive keys
* Allow parsing as Number, Boolean etc
* Allow user to input custom string for value

## Demo
  http://jsfiddle.net/nodeofcode/w2v1az8q/19/

## Dependencies
* JQuery
* Select2

## Install

    bower install key-value

## How to use

```html
  <input type="hidden"></input>
  <!-- the element on which select2 will be called -->
```
```javascript
  var DOMAIN = { // You have to provide non-empty domain object, client can input any of for keys pool, alpha, casing or symbols, in this case.
    pool : { userInput : true, userInputMsg : 'Type your characters and press space' }, // for allow user to input his own value use `userInput` : true
    alpha : { parse : 'Boolean', data : ['true','false'] }, // `parse` tells how to compile, parse string to boolean in this case
    casing : { data : ['upper','lower'] },// `data` tells the list of available values for corresponding key
    symbols : { name : 'isSymbolAllowed', parse : 'Boolean', data : ['true','false'] } // put `name` if you want to display user readable key
  };
  var kv = new KV($('input'),DOMAIN); // where KV is result on requiring `key-value`
  //...
  //...
  //...
  //...
  var currentValue = kv.get(); // To extract the current object of key-value pairs
```

## Roadmap
* To support select2 v4
* Trigger custom events whenever a key-value pair added or removed

## Any hurdles?
> Found anything difficult to understand? or some bug or some improvement?. Create an issue [issue](https://github.com/nodeofcode/key-value/issues) for the same.

## License

Key Value Inputer is released under the MIT license:

http://www.opensource.org/licenses/MIT
