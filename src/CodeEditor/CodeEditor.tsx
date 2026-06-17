import * as monaco from 'monaco-editor';
import { useRef, useCallback, useEffect } from 'react';
import MonacoEditor, { OnMount, BeforeMount, loader } from '@monaco-editor/react';
import {
	buildTheme,
	EDITOR_OPTIONS,
	registerLuaCompletions,
	registerHtmlCssClassCompletions,
	registerHtmlEmmetCompletions,
	updateLuaTags,
} from './monacoConfig';
import { validateLua } from './luaDiagnostics';
import './CodeEditor.css';

loader.config({ monaco });

export type CodeEditorLanguage = 'lua' | 'html' | 'css' | 'json';

interface CodeEditorProps {
	language: CodeEditorLanguage;
	value?: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
	className?: string;
	tags?: Record<string, string>;
}

function CodeEditor({
	language,
	value = '',
	onChange,
	readOnly = false,
	className = '',
	tags = {},
}: Readonly<CodeEditorProps>) {
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<typeof monaco | null>(null);
	const pendingValueRef = useRef<string | null>(null);
	const validateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const editor = editorRef.current;
		if (!editor) {
			pendingValueRef.current = value;
			return;
		}
		if (editor.getValue() === value) return;
		editor.setValue(value);
		editor.revealLine(1);
	}, [value]);

	useEffect(() => {
		if (language === 'lua') updateLuaTags(tags);
	}, [tags, language]);

	const applyTheme = useCallback(() => {
		monacoRef.current?.editor.defineTheme('monster-maker', buildTheme());
		monacoRef.current?.editor.setTheme('monster-maker');
	}, []);

	useEffect(() => {
		const observer = new MutationObserver(applyTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'data-theme'],
		});
		return () => observer.disconnect();
	}, [applyTheme]);

	const handleBeforeMount: BeforeMount = useCallback(
		(m) => {
			monacoRef.current = m;
			m.editor.defineTheme('monster-maker', buildTheme());
			if (language === 'lua') registerLuaCompletions(m);
			if (language === 'html') {
				registerHtmlCssClassCompletions(m);
				registerHtmlEmmetCompletions(m);
			}
		},
		[language]
	);

	const handleMount: OnMount = useCallback(
		(editor) => {
			editorRef.current = editor;
			if (pendingValueRef.current !== null) {
				editor.setValue(pendingValueRef.current);
				pendingValueRef.current = null;
			}
			editor.focus();

			if (language === 'lua' && monacoRef.current) {
				const m = monacoRef.current;
				const model = editor.getModel();
				if (model) validateLua(m, model);

				editor.onDidChangeModelContent(() => {
					if (validateTimerRef.current) clearTimeout(validateTimerRef.current);
					validateTimerRef.current = setTimeout(() => {
						const currentModel = editor.getModel();
						if (currentModel) validateLua(m, currentModel);
					}, 600);
				});
			}
		},
		[language]
	);

	const handleChange = useCallback(
		(val: string | undefined) => {
			onChange?.(val ?? '');
		},
		[onChange]
	);

	return (
		<div className={`codeEditor--root ${className}`}>
			<MonacoEditor
				language={language}
				theme="monster-maker"
				options={{ ...EDITOR_OPTIONS, readOnly }}
				beforeMount={handleBeforeMount}
				onMount={handleMount}
				onChange={handleChange}
				loading={<CodeEditorSkeleton />}
			/>
		</div>
	);
}

function CodeEditorSkeleton() {
	return (
		<div className="codeEditor--skeleton">
			<div className="codeEditor--skeleton-gutter" />
			<div className="codeEditor--skeleton-lines">
				{Array.from({ length: 12 }, (_, i) => (
					<div
						key={i}
						className="codeEditor--skeleton-line"
						style={{ width: `${30 + Math.random() * 55}%`, opacity: 1 - i * 0.07 }}
					/>
				))}
			</div>
		</div>
	);
}

export default CodeEditor;
