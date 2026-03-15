import type * as Monaco from 'monaco-editor';

function getCssVar(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function buildTheme(): Monaco.editor.IStandaloneThemeData {
	const c1 = getCssVar('--color-1');
	const c2 = getCssVar('--color-2');
	const c3 = getCssVar('--color-3');
	const c4 = getCssVar('--color-4');
	const c5 = getCssVar('--color-5');
	const c6 = getCssVar('--color-6');
	const c7 = getCssVar('--color-7');
	const c8 = getCssVar('--color-8');
	const c9 = getCssVar('--color-9');

	const token = (hex: string) => hex.replace('#', '');

	const electricBlue = '0055ff';
	const iceBlue = '0088cc';

	return {
		base: 'vs',
		inherit: true,
		rules: [
			{ token: '', foreground: token(c9) },
			{ token: 'comment', foreground: token(c6), fontStyle: 'italic' },
			{ token: 'keyword', foreground: electricBlue, fontStyle: 'bold' },
			{ token: 'keyword.control', foreground: electricBlue, fontStyle: 'bold' },
			{ token: 'keyword.operator', foreground: token(c7) },
			{ token: 'string', foreground: token(c7) },
			{ token: 'string.escape', foreground: iceBlue },
			{ token: 'number', foreground: iceBlue },
			{ token: 'identifier', foreground: token(c9) },
			{ token: 'entity.name.function', foreground: iceBlue, fontStyle: 'bold' },
			{ token: 'type', foreground: iceBlue, fontStyle: 'bold' },
			{ token: 'delimiter', foreground: token(c6) },
			{ token: 'operator', foreground: token(c7) },
			{ token: 'tag', foreground: electricBlue, fontStyle: 'bold' },
			{ token: 'attribute.name', foreground: iceBlue },
			{ token: 'attribute.value', foreground: token(c7) },
			{ token: 'selector', foreground: electricBlue, fontStyle: 'bold' },
			{ token: 'property', foreground: token(c9) },
		],
		colors: {
			'editor.background': c2,
			'editor.foreground': c9,
			'editorCursor.foreground': electricBlue,
			'editor.lineHighlightBackground': c1,
			'editor.selectionBackground': c4 + '66',
			'editor.inactiveSelectionBackground': c4 + '33',
			'editor.selectionHighlightBackground': c4 + '44',
			'editor.wordHighlightBackground': c4 + '44',
			'editorGutter.background': c2,
			'editorLineNumber.foreground': c5,
			'editorLineNumber.activeForeground': electricBlue,
			'editorIndentGuide.background1': c3,
			'editorIndentGuide.activeBackground1': c6,
			'editorBracketMatch.background': c4 + '44',
			'editorBracketMatch.border': iceBlue,
			'editorWidget.background': c1,
			'editorWidget.border': c4,
			'editorSuggestWidget.background': c1,
			'editorSuggestWidget.border': c4,
			'editorSuggestWidget.selectedBackground': c3,
			'editorSuggestWidget.highlightForeground': electricBlue,
			'editorHoverWidget.background': c1,
			'editorHoverWidget.border': c4,
			'input.background': c1,
			'input.border': c4,
			'input.foreground': c9,
			'list.hoverBackground': c3,
			'list.activeSelectionBackground': c4,
			'scrollbarSlider.background': c5 + '44',
			'scrollbarSlider.hoverBackground': c6 + '66',
			'scrollbarSlider.activeBackground': c7 + '88',
			'minimap.background': c2,
			'editorOverviewRuler.border': c3,
			focusBorder: electricBlue,
		},
	};
}

export const EDITOR_OPTIONS: Monaco.editor.IStandaloneEditorConstructionOptions = {
	theme: 'monster-maker',
	fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
	fontSize: 13,
	lineHeight: 22,
	fontLigatures: true,
	letterSpacing: 0.3,
	minimap: { enabled: false },
	scrollbar: {
		vertical: 'hidden',
		horizontal: 'hidden',
		verticalScrollbarSize: 0,
		horizontalScrollbarSize: 0,
	},
	overviewRulerLanes: 0,
	hideCursorInOverviewRuler: true,
	overviewRulerBorder: false,
	renderLineHighlight: 'line',
	lineNumbers: 'on',
	glyphMargin: false,
	folding: true,
	foldingHighlight: false,
	showFoldingControls: 'mouseover',
	lineDecorationsWidth: 0,
	lineNumbersMinChars: 3,
	wordWrap: 'off',
	smoothScrolling: true,
	cursorBlinking: 'smooth',
	cursorSmoothCaretAnimation: 'on',
	cursorStyle: 'line',
	bracketPairColorization: { enabled: true },
	matchBrackets: 'always',
	autoClosingBrackets: 'always',
	autoClosingQuotes: 'always',
	autoIndent: 'full',
	formatOnPaste: false,
	suggestOnTriggerCharacters: true,
	quickSuggestions: true,
	tabSize: 2,
	padding: { top: 12, bottom: 12 },
};

export function registerLuaCompletions(monaco: typeof Monaco) {
	monaco.languages.registerCompletionItemProvider('lua', {
		provideCompletionItems: (model, position) => {
			const word = model.getWordUntilPosition(position);
			const range = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			};
			const kws = [
				'and',
				'break',
				'do',
				'else',
				'elseif',
				'end',
				'false',
				'for',
				'function',
				'goto',
				'if',
				'in',
				'local',
				'nil',
				'not',
				'or',
				'repeat',
				'return',
				'then',
				'true',
				'until',
				'while',
			];
			const suggestions: Monaco.languages.CompletionItem[] = [
				...kws.map((kw) => ({
					label: kw,
					kind: monaco.languages.CompletionItemKind.Keyword,
					insertText: kw,
					range,
				})),
				{
					label: 'function',
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: 'function ${1:name}(${2:args})\n\t${3}\nend',
					insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					range,
				},
				{
					label: 'if',
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: 'if ${1:condition} then\n\t${2}\nend',
					insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					range,
				},
				{
					label: 'for',
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: 'for ${1:i} = ${2:1}, ${3:10} do\n\t${4}\nend',
					insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					range,
				},
			];
			return { suggestions };
		},
	});
}
