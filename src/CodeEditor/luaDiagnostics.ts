import type * as Monaco from 'monaco-editor';


interface Marker {
	line: number;
	col: number;
	endCol: number;
	message: string;
	severity: 'error' | 'warning';
}

interface BlockInfo {
	type: string;
	line: number;
}

function stripStringsAndComments(source: string): string {
	let result = '';
	let i = 0;
	while (i < source.length) {
		if (source[i] === '-' && source[i + 1] === '-') {
			if (source[i + 2] === '[' && source[i + 3] === '[') {
				i += 4;
				while (i < source.length && !(source[i] === ']' && source[i + 1] === ']')) i++;
				i += 2;
			} else {
				while (i < source.length && source[i] !== '\n') {
					result += ' ';
					i++;
				}
			}
		} else if (source[i] === '"' || source[i] === "'") {
			const quote = source[i];
			result += ' ';
			i++;
			while (i < source.length && source[i] !== quote && source[i] !== '\n') {
				result += ' ';
				i++;
			}
			result += ' ';
			i++;
		} else if (source[i] === '[' && source[i + 1] === '[') {
			result += '  ';
			i += 2;
			while (i < source.length && !(source[i] === ']' && source[i + 1] === ']')) {
				result += source[i] === '\n' ? '\n' : ' ';
				i++;
			}
			result += '  ';
			i += 2;
		} else {
			result += source[i];
			i++;
		}
	}
	return result;
}

function checkBlockBalance(lines: string[]): Marker[] {
	const markers: Marker[] = [];
	const stack: BlockInfo[] = [];

	for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
		const line = lines[lineIdx];
		const lineNum = lineIdx + 1;

		const tokens = line.match(/\b\w+\b/g) ?? [];

		for (const token of tokens) {
			const col = line.indexOf(token) + 1;

			if (
				token === 'function' ||
				token === 'if' ||
				token === 'for' ||
				token === 'while' ||
				token === 'repeat'
			) {
				stack.push({ type: token, line: lineNum });
			} else if (token === 'do') {
				const top = stack[stack.length - 1];
				if (top?.type === 'for' || top?.type === 'while') {
					// 'do' is part of for/while, not a new block
				} else {
					stack.push({ type: 'do', line: lineNum });
				}
			} else if (token === 'then' || token === 'elseif' || token === 'else') {
				// part of if syntax, not new blocks
			} else if (token === 'until') {
				const top = stack[stack.length - 1];
				if (top?.type === 'repeat') {
					stack.pop();
				} else {
					markers.push({
						line: lineNum,
						col,
						endCol: col + token.length,
						message: "'until' without matching 'repeat'",
						severity: 'error',
					});
				}
			} else if (token === 'end') {
				if (stack.length === 0) {
					markers.push({
						line: lineNum,
						col,
						endCol: col + 3,
						message: "'end' without matching block opener (function/if/for/while/do)",
						severity: 'error',
					});
				} else {
					stack.pop();
				}
			}
		}
	}

	for (const unclosed of stack) {
		markers.push({
			line: unclosed.line,
			col: 1,
			endCol: 999,
			message: `Unclosed '${unclosed.type}' block — missing 'end'`,
			severity: 'error',
		});
	}

	return markers;
}


function checkElseIfTypo(lines: string[]): Marker[] {
	const markers: Marker[] = [];
	for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
		const line = lines[lineIdx];
		if (/\belse\s+if\b/.test(line)) {
			const col = line.search(/\belse\s+if\b/) + 1;
			markers.push({
				line: lineIdx + 1,
				col,
				endCol: col + 10,
				message: "Use 'elseif' instead of 'else if' in Lua",
				severity: 'error',
			});
		}
	}
	return markers;
}

function checkReturnNotLast(lines: string[]): Marker[] {
	const markers: Marker[] = [];
	for (let lineIdx = 0; lineIdx < lines.length - 1; lineIdx++) {
		const line = lines[lineIdx].trim();
		if (/^\breturn\b/.test(line)) {
			const next = lines[lineIdx + 1].trim();
			if (
				next &&
				!/^\bend\b/.test(next) &&
				!/^\belse\b/.test(next) &&
				!/^\belseif\b/.test(next) &&
				next !== ''
			) {
				markers.push({
					line: lineIdx + 2,
					col: 1,
					endCol: lines[lineIdx + 1].length + 1,
					message: 'Unreachable code after return',
					severity: 'warning',
				});
			}
		}
	}
	return markers;
}

function checkSemicolons(lines: string[]): Marker[] {
	const markers: Marker[] = [];
	for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
		const line = lines[lineIdx];
		if (/;$/.test(line.trim())) {
			markers.push({
				line: lineIdx + 1,
				col: line.lastIndexOf(';') + 1,
				endCol: line.lastIndexOf(';') + 2,
				message: 'Semicolons are not needed in Lua',
				severity: 'warning',
			});
		}
	}
	return markers;
}

function toMonacoMarkers(markers: Marker[], monaco: typeof Monaco): Monaco.editor.IMarkerData[] {
	return markers.map((m) => ({
		startLineNumber: m.line,
		endLineNumber: m.line,
		startColumn: m.col,
		endColumn: m.endCol,
		message: m.message,
		severity: m.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
		source: 'Lua',
	}));
}

export function validateLua(monaco: typeof Monaco, model: Monaco.editor.ITextModel): void {
	const source = model.getValue();
	const stripped = stripStringsAndComments(source);
	const lines = stripped.split('\n');

	const allMarkers: Marker[] = [
		...checkElseIfTypo(lines),
		...checkBlockBalance(lines),
		...checkReturnNotLast(lines),
		...checkSemicolons(lines),
	];

	monaco.editor.setModelMarkers(model, 'lua-validator', toMonacoMarkers(allMarkers, monaco));
}
