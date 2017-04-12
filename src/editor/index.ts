if (process.env.DISABLE_TRANSLATE_EDITOR) {
  module.exports = require('./EmptyWrapper');
} else {
  module.exports = require('./TranslationEditor');
}
