if (process.env.TRANSLATE_DISABLE_EDITOR) {
  module.exports = require('./EmptyWrapper');
} else {
  module.exports = require('./TranslationEditor');
}
