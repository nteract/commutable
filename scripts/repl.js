require.extensions['.ipynb'] = require.extensions['.json'];
global.commutable = require('..');
global.toyNotebook = require('../test/multiples.ipynb');

(() => {
  const chalk = require('chalk');
  const util = require('util');

  // Quick helper functions
  const codeLog = (s) => console.log(chalk.white(chalk.bgBlack(s)));
  const insp = o => util.inspect(o, { colors: true });

  codeLog('\nrequire.extensions[\'.ipynb\'] = require.extensions[\'.json\']');
  codeLog('\nvar toyNotebook = require(\'../test/multiples.ipynb\')');
  console.log(insp(global.toyNotebook));

  codeLog('\nconsole.log(commutable)');
  console.log(insp(global.commutable));

  console.log(chalk.green('\nHINT: ') + chalk.white('var notebook = commutable.fromJS(toyNotebook)\n'));
})();

require('repl').start('> ');
