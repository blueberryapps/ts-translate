export const Editor = (
  (process.env.TRANSLATE_DISABLE_EDITOR)
    ? require('./EmptyWrapper').default
    : require('./TranslationEditor').default
) as any;

export default Editor;
