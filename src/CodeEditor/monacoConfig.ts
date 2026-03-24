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
	const c9 = getCssVar('--color-9');
	const linecolor = getCssVar('--editor-line');

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
			'editor.lineHighlightBackground': linecolor,
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
			'editorSuggestWidget.background': c2,
			'editorSuggestWidget.border': c4,
			'editorSuggestWidget.selectedBackground': c3,
			'editorSuggestWidget.selectedForeground': electricBlue,
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
	stickyScroll: { enabled: false },
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
	quickSuggestions: {
		other: true,
		comments: false,
		strings: true,
	},
	tabSize: 2,
	padding: { top: 12, bottom: 12 },
};

let _liveCssContent = '';
let _luaRegistered = false;
let _htmlCssClassesRegistered = false;
let _htmlEmmetRegistered = false;
let _luaTags: Record<string, string> = {};

export function updateLiveCssContent(css: string) {
	_liveCssContent = css;
}

export function updateLuaTags(tags: Record<string, string>) {
	_luaTags = tags;
}

function extractCssClasses(css: string): string[] {
	const classes = new Set<string>();
	for (const m of css.matchAll(/\.([a-zA-Z][\w-]*)/g)) classes.add(m[1]);
	return Array.from(classes);
}

function snippet(
	monaco: typeof Monaco,
	label: string,
	insertText: string,
	detail: string,
	range: Monaco.IRange
): Monaco.languages.CompletionItem {
	return {
		label,
		kind: monaco.languages.CompletionItemKind.Snippet,
		insertText,
		insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
		detail,
		range,
	};
}

export function registerHtmlCssClassCompletions(monaco: typeof Monaco) {
	if (_htmlCssClassesRegistered) return;
	_htmlCssClassesRegistered = true;

	monaco.languages.registerCompletionItemProvider('html', {
		triggerCharacters: ['"', ' '],
		provideCompletionItems: (model, position) => {
			const word = model.getWordUntilPosition(position);
			const range: Monaco.IRange = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			};

			const lineUpToCursor = model.getValueInRange({
				startLineNumber: position.lineNumber,
				startColumn: 1,
				endLineNumber: position.lineNumber,
				endColumn: position.column,
			});

			if (/class="[^"]*$/.test(lineUpToCursor)) {
				return {
					suggestions: extractCssClasses(_liveCssContent).map((cls) => ({
						label: cls,
						kind: monaco.languages.CompletionItemKind.Value,
						insertText: cls,
						detail: 'CSS class',
						range,
					})),
				};
			}

			if (/id="[^"]*$/.test(lineUpToCursor)) {
				const ids = new Set<string>();
				for (const m of _liveCssContent.matchAll(/#([a-zA-Z][\w-]*)/g)) ids.add(m[1]);
				return {
					suggestions: Array.from(ids).map((id) => ({
						label: id,
						kind: monaco.languages.CompletionItemKind.Value,
						insertText: id,
						detail: 'CSS id',
						range,
					})),
				};
			}

			return { suggestions: [] };
		},
	});
}

const HTML_TAGS = [
	'div',
	'span',
	'p',
	'h1',
	'h2',
	'h3',
	'h4',
	'button',
	'select',
	'option',
	'textarea',
	'body',
	'head',
	'title',
	'style',
	'rml',
	'handle',
	'tabset',
	'tab',
	'panel',
];
const VOID_HTML_TAGS = new Set(['input', 'img', 'link']);

export function registerHtmlEmmetCompletions(monaco: typeof Monaco) {
	if (_htmlEmmetRegistered) return;
	_htmlEmmetRegistered = true;

	monaco.languages.registerCompletionItemProvider('html', {
		provideCompletionItems: (model, position) => {
			const word = model.getWordUntilPosition(position);
			const range: Monaco.IRange = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			};

			const charBefore = model.getValueInRange({
				startLineNumber: position.lineNumber,
				startColumn: word.startColumn - 1,
				endLineNumber: position.lineNumber,
				endColumn: word.startColumn,
			});
			if (charBefore === '<') return { suggestions: [] };

			const suggestions: Monaco.languages.CompletionItem[] = HTML_TAGS.map((tag) =>
				VOID_HTML_TAGS.has(tag)
					? {
							label: tag,
							kind: monaco.languages.CompletionItemKind.Snippet,
							insertText: `<${tag} $1/>`,
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							detail: `<${tag}/>`,
							sortText: `0_${tag}`,
							range,
						}
					: {
							label: tag,
							kind: monaco.languages.CompletionItemKind.Snippet,
							insertText: `<${tag}>$1</${tag}>`,
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							detail: `<${tag}></emmet>`,
							sortText: `0_${tag}`,
							range,
						}
			);

			return { suggestions };
		},
	});
}

function kw(
	monaco: typeof Monaco,
	label: string,
	range: Monaco.IRange
): Monaco.languages.CompletionItem {
	return { label, kind: monaco.languages.CompletionItemKind.Keyword, insertText: label, range };
}
function fn(
	monaco: typeof Monaco,
	label: string,
	insertText: string,
	detail: string,
	range: Monaco.IRange
): Monaco.languages.CompletionItem {
	return {
		label,
		kind: monaco.languages.CompletionItemKind.Function,
		insertText,
		insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
		detail,
		range,
	};
}
function constant(
	monaco: typeof Monaco,
	label: string,
	detail: string,
	range: Monaco.IRange
): Monaco.languages.CompletionItem {
	return {
		label,
		kind: monaco.languages.CompletionItemKind.Constant,
		insertText: label,
		detail,
		range,
	};
}

export function registerLuaCompletions(monaco: typeof Monaco) {
	if (_luaRegistered) return;
	_luaRegistered = true;
	monaco.languages.registerCompletionItemProvider('lua', {
		provideCompletionItems: (model, position) => {
			const word = model.getWordUntilPosition(position);
			const range: Monaco.IRange = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			};

			const suggestions: Monaco.languages.CompletionItem[] = [
				...(
					[
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
					] as const
				).map((k) => kw(monaco, k, range)),

				snippet(
					monaco,
					'function',
					'function ${1:name}(${2:args})\n\t${3}\nend',
					'function block',
					range
				),
				snippet(monaco, 'if', 'if ${1:condition} then\n\t${2}\nend', 'if block', range),
				snippet(
					monaco,
					'if-else',
					'if ${1:condition} then\n\t${2}\nelse\n\t${3}\nend',
					'if/else block',
					range
				),
				snippet(
					monaco,
					'for',
					'for ${1:i} = ${2:1}, ${3:10} do\n\t${4}\nend',
					'numeric for',
					range
				),
				snippet(
					monaco,
					'for-in',
					'for ${1:k}, ${2:v} in pairs(${3:table}) do\n\t${4}\nend',
					'generic for',
					range
				),
				snippet(monaco, 'while', 'while ${1:condition} do\n\t${2}\nend', 'while loop', range),
				snippet(monaco, 'repeat', 'repeat\n\t${1}\nuntil ${2:condition}', 'repeat/until', range),
				snippet(monaco, 'local', 'local ${1:name} = ${2:value}', 'local variable', range),
				snippet(
					monaco,
					'onStart',
					'function onStart(entity)\n\t${1}\nend',
					'Called once when the entity starts',
					range
				),
				snippet(
					monaco,
					'onUpdate',
					'function onUpdate(entity, deltaTime)\n\t${1}\nend',
					'Called every frame',
					range
				),
				snippet(
					monaco,
					'onDestroy',
					'function onDestroy(entity)\n\t${1}\nend',
					'Called when the entity is destroyed',
					range
				),
				snippet(
					monaco,
					'onCollision',
					'function onCollision(entity, other)\n\t${1}\nend',
					'Called on physics collision',
					range
				),
				snippet(
					monaco,
					'onTriggerEnter',
					'function onTriggerEnter(entity, other)\n\t${1}\nend',
					'Called when entering a trigger',
					range
				),
				snippet(
					monaco,
					'onInteract',
					'function onInteract(entity, other)\n\t${1}\nend',
					'Called when the entity is interacted with',
					range
				),

				fn(
					monaco,
					'GetEntity',
					'GetEntity(EntityTag.${1:PLAYER})',
					'GetEntity(tag) → Entity',
					range
				),
				fn(monaco, 'loadMap', 'loadMap(${1:tags.mapName})', 'loadMap(path)', range),
				fn(
					monaco,
					'Input.isKeyDown',
					'Input:isKeyDown(Keys.${1:W})',
					'Input:isKeyDown(key) → bool',
					range
				),
				fn(
					monaco,
					'Input.isKeyPressed',
					'Input:isKeyPressed(Keys.${1:W})',
					'Input:isKeyPressed(key) → bool',
					range
				),

				...(
					[
						'A',
						'B',
						'C',
						'D',
						'E',
						'F',
						'G',
						'H',
						'I',
						'J',
						'K',
						'L',
						'M',
						'N',
						'O',
						'P',
						'Q',
						'R',
						'S',
						'T',
						'U',
						'V',
						'W',
						'X',
						'Y',
						'Z',
						'UP',
						'DOWN',
						'LEFT',
						'RIGHT',
					] as const
				).map((k) => constant(monaco, `Keys.${k}`, `GLFW_KEY_${k}`, range)),

				fn(
					monaco,
					'MainCamera.setPosition',
					'MainCamera:setPosition(${1:x}, ${2:y})',
					'setPosition(x, y)',
					range
				),
				fn(
					monaco,
					'MainCamera.lerpTo',
					'MainCamera:lerpTo(${1:x}, ${2:y}, ${3:alpha})',
					'lerpTo(x, y, alpha)',
					range
				),
				fn(monaco, 'MainCamera.setZoom', 'MainCamera:setZoom(${1:zoom})', 'setZoom(zoom)', range),
				fn(
					monaco,
					'MainCamera.getPosition',
					'MainCamera:getPosition()',
					'getPosition() → vec2',
					range
				),
				fn(monaco, 'MainCamera.getWidth', 'MainCamera:getWidth()', 'getWidth() → number', range),
				fn(monaco, 'MainCamera.getHeight', 'MainCamera:getHeight()', 'getHeight() → number', range),
				fn(
					monaco,
					'World.getEntitiesByTag',
					'World:getEntitiesByTag(EntityTag.${1:PLAYER})',
					'getEntitiesByTag(tag) → Entity[]',
					range
				),
				fn(
					monaco,
					'World.getEntitiesByLayer',
					'World:getEntitiesByLayer(Layer.${1:ENTITIES})',
					'getEntitiesByLayer(layer) → Entity[]',
					range
				),
				fn(
					monaco,
					'Borders.isOutOfBounds',
					'Borders:isOutOfBounds(${1:pos}, ${2:offsetX}, ${3:offsetY})',
					'isOutOfBounds(pos, ox, oy) → bool',
					range
				),
				fn(
					monaco,
					'Borders.clampCamera',
					'Borders:clampCamera(${1:pos})',
					'clampCamera(pos)',
					range
				),
				fn(
					monaco,
					'UI.open',
					'UI:open("${1:id}", tags.${2:uiFile})',
					'open(id, uiFilePath) → UiDocument',
					range
				),
				fn(monaco, 'UI.close', 'UI:close("${1:id}")', 'close(id)', range),
				fn(monaco, 'UI.isOpen', 'UI:isOpen("${1:id}")', 'isOpen(id) → bool', range),
				fn(monaco, 'UI.get', 'UI:get("${1:id}")', 'get(id) → UiDocument', range),
				fn(
					monaco,
					'Audio.playMusic',
					'Audio:playMusic(tags.${1:musicName}, ${2:true})',
					'playMusic(path, loop?)',
					range
				),
				fn(monaco, 'Audio.playSound', 'Audio:playSound("${1:path}")', 'playSound(path)', range),
				fn(monaco, 'Audio.stopMusic', 'Audio:stopMusic()', 'stopMusic()', range),
				fn(monaco, 'Audio.pauseMusic', 'Audio:pauseMusic()', 'pauseMusic()', range),
				fn(
					monaco,
					'Audio.setMasterVolume',
					'Audio:setMasterVolume(${1:1.0})',
					'setMasterVolume(v)',
					range
				),
				fn(
					monaco,
					'Audio.setMusicVolume',
					'Audio:setMusicVolume(${1:1.0})',
					'setMusicVolume(v)',
					range
				),
				fn(monaco, 'Audio.setSfxVolume', 'Audio:setSfxVolume(${1:1.0})', 'setSfxVolume(v)', range),

				fn(
					monaco,
					'Config.setLetterboxing',
					'Config:setLetterboxing(${1:true})',
					'setLetterboxing(bool)',
					range
				),
				fn(
					monaco,
					'Config.getLetterboxing',
					'Config:getLetterboxing()',
					'getLetterboxing() → bool',
					range
				),
				fn(monaco, 'Config.getGameName', 'Config:getGameName()', 'getGameName() → string', range),
				fn(
					monaco,
					'Config.getGameVersion',
					'Config:getGameVersion()',
					'getGameVersion() → string',
					range
				),

				fn(monaco, 'Session.set', 'Session:set("${1:key}", ${2:value})', 'set(key, value)', range),
				fn(monaco, 'Session.get', 'Session:get("${1:key}")', 'get(key) → value', range),
				fn(monaco, 'Session.has', 'Session:has("${1:key}")', 'has(key) → bool', range),
				fn(monaco, 'Session.remove', 'Session:remove("${1:key}")', 'remove(key)', range),
				fn(monaco, 'Session.clear', 'Session:clear()', 'clear()', range),

				...(
					[
						'PLAYER',
						'ENEMY',
						'NPC',
						'ITEM',
						'TILEMAP',
						'TILEMAP_COLLIDER',
						'TRIGGER',
						'DOOR',
						'SIGN',
						'PARTICLE',
						'PROJECTILE',
						'SPAWN_POINT',
						'PLAYER_SPAWN_POINT',
						'UNKNOWN',
					] as const
				).map((t) => constant(monaco, `EntityTag.${t}`, 'EntityTag enum', range)),
				...(
					[
						'GROUND',
						'DECORATION',
						'ENTITIES',
						'SHADOWS',
						'FOREGROUND',
						'EFFECTS_HIGH',
						'UI_MENU',
						'UNKNOWN',
					] as const
				).map((l) => constant(monaco, `Layer.${l}`, 'Layer enum', range)),
				...(['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'UNKNOWN'] as const).map((d) =>
					constant(monaco, `Direction.${d}`, 'Direction enum', range)
				),

				fn(monaco, 'entity.getPos', '${1:entity}:getPos()', 'getPos() → PositionComponent', range),
				fn(
					monaco,
					'entity.getMove',
					'${1:entity}:getMove()',
					'getMove() → MovementComponent',
					range
				),
				fn(monaco, 'entity.interact', '${1:entity}:interact()', 'interact()', range),
				fn(monaco, 'entity.disable', '${1:entity}:disable()', 'disable()', range),
				fn(
					monaco,
					'entity.hasComponent',
					'${1:entity}:hasComponent()',
					'hasComponent() → bool',
					range
				),
				fn(monaco, 'pos.get', '${1:pos}:get()', 'get() → Position', range),
				fn(monaco, 'pos.direction', '${1:pos}.direction', 'direction: Direction', range),
				fn(monaco, 'move.move', '${1:move}:move(Direction.${2:RIGHT})', 'move(direction)', range),
				fn(
					monaco,
					'render.setIsActive',
					'${1:render}:setIsActive(${2:true})',
					'setIsActive(bool)',
					range
				),
				fn(
					monaco,
					'render.getIsActive',
					'${1:render}:getIsActive()',
					'getIsActive() → bool',
					range
				),

				...Object.entries(_luaTags).map(([name, path]) =>
					constant(monaco, `tags.${name}`, path, range)
				),
			];

			const text = model.getValue();
			const matches = text.match(/\b[a-zA-Z_]\w*\b/g) || [];
			const uniqueWords = new Set(matches);
			uniqueWords.delete(word.word);

			const luaKeywords = [
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
			luaKeywords.forEach((k) => uniqueWords.delete(k));

			const dynamicSuggestions: Monaco.languages.CompletionItem[] = Array.from(uniqueWords).map(
				(w) => ({
					label: w,
					kind: monaco.languages.CompletionItemKind.Variable,
					insertText: w,
					detail: 'Variable',
					range,
				})
			);

			return { suggestions: [...suggestions, ...dynamicSuggestions] };
		},
	});
}
