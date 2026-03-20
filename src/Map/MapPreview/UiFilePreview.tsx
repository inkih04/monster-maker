
import { useMemo} from 'react';
import './UiFilePreview.css';
import { useCodeEditorStore } from '../../CodeEditor/CodeEditorGState';

function extractRmlParts(rml: string): { bodyHtml: string; headStyle: string } {
	const styleMatch = rml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	const headStyle = styleMatch?.[1] ?? '';
	const bodyMatch = rml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	const bodyHtml = bodyMatch?.[1] ?? rml;
	return { bodyHtml, headStyle };
}

function buildSrcDoc(htmlContent: string, cssContent: string): string {
	const { bodyHtml, headStyle } = extractRmlParts(htmlContent);
	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: transparent;
}
${headStyle}
${cssContent}
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

function UiFilePreview() {
	const htmlContent = useCodeEditorStore((s) => s.openUiFile?.htmlContent ?? '');
	const cssContent = useCodeEditorStore((s) => s.openUiFile?.cssContent ?? '');
	const htmlPath = useCodeEditorStore((s) => s.openUiFile?.htmlPath ?? '');


	const srcDoc = useMemo(() => buildSrcDoc(htmlContent, cssContent), [htmlContent, cssContent]);

	return (
		<div className="uiFilePreview--overlay">
			<iframe
				key={htmlPath}
				srcDoc={srcDoc}
				className="uiFilePreview--frame"
				sandbox="allow-same-origin"
				title={`Live preview `}
			/>
		</div>
	);
}

export default UiFilePreview;
