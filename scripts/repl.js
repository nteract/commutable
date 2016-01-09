require.extensions['.ipynb'] = require.extensions['.json'];
global.commutable = require('..');
global.toyNotebook = require('../test/multiples.ipynb');

console.log('console.log(toyNotebook)');
console.log(global.toyNotebook);

console.log('');
console.log('console.log(commutable)');
console.log(global.commutable);

require('repl').start('> ');
