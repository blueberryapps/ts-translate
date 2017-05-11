import { EditorProps, EditorState } from './types';

export const Editor = ((process.env.TRANSLATE_DISABLE_EDITOR) ? require('./EmptyWrapper') : require('./TranslationEditor')) as React.PureComponent<EditorProps, EditorState>;

export default Editor;
