import { useMemo } from 'react';
import './UiFilePreview.css';
import { useCodeEditorStore } from '../../CodeEditor/CodeEditorGState';
import { useTranslation } from 'react-i18next';

interface RmluiWarning {
	id: string;
	pattern: RegExp;
	message: string;
	fix: string;
}

function getRmluiWarnings(t: (key: string) => string): RmluiWarning[] {
	return [
		{
			id: 'border-solid-shorthand',
			pattern: /border(-\w+)?\s*:\s*[\d.]+\w*\s+solid/gi,
			message: t('rcssWarnings.borderSolidShorthand.message'),
			fix: t('rcssWarnings.borderSolidShorthand.fix'),
		},
		{
			id: 'border-style',
			pattern: /border(-\w+)?-style\s*:/gi,
			message: t('rcssWarnings.borderStyle.message'),
			fix: t('rcssWarnings.borderStyle.fix'),
		},
		{
			id: 'transition',
			pattern: /(?<!\w)transition\s*:/gi,
			message: t('rcssWarnings.transition.message'),
			fix: t('rcssWarnings.transition.fix'),
		},
		{
			id: 'animation',
			pattern: /(?<!\w)animation\s*:/gi,
			message: t('rcssWarnings.animation.message'),
			fix: t('rcssWarnings.animation.fix'),
		},
		{
			id: 'box-shadow',
			pattern: /box-shadow\s*:/gi,
			message: t('rcssWarnings.boxShadow.message'),
			fix: t('rcssWarnings.boxShadow.fix'),
		},
		{
			id: 'vw-vh-units',
			pattern: /:\s*[\d.]+v[wh]/gi,
			message: t('rcssWarnings.vwVhUnits.message'),
			fix: t('rcssWarnings.vwVhUnits.fix'),
		},
	];
}

function injectBorderStyleWhereNeeded(css: string): string {
	return css.replace(/\{([^}]*)\}/g, (block, inner: string) => {
		const hasBorderWidth = /border-width\s*:/i.test(inner);
		const hasBorderColor = /border-color\s*:/i.test(inner);

		if (hasBorderWidth && hasBorderColor) {
			return `{${inner}  border-style: solid;\n}`;
		}
		return block;
	});
}

function detectWarnings(css: string, warnings: RmluiWarning[]): RmluiWarning[] {
	const found: RmluiWarning[] = [];
	for (const rule of warnings) {
		rule.pattern.lastIndex = 0;
		if (rule.pattern.test(css)) {
			found.push(rule);
		}
	}
	return found;
}

interface RmlParts {
	bodyHtml: string;
	bodyAttrs: string;
	headStyle: string;
}

function extractRmlParts(rml: string): RmlParts {
	const styleMatch = rml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	const headStyle = styleMatch?.[1] ?? '';

	const bodyTagMatch = rml.match(/<body([^>]*)>/i);
	const bodyAttrs = bodyTagMatch?.[1]?.trim() ?? '';

	const bodyMatch = rml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	const bodyHtml = bodyMatch?.[1] ?? rml;

	return { bodyHtml, bodyAttrs, headStyle };
}

function buildSrcDoc(htmlContent: string, cssContent: string): string {
	const { bodyHtml, bodyAttrs, headStyle } = extractRmlParts(htmlContent);
	const normalizedCss = injectBorderStyleWhereNeeded(cssContent);

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
${normalizedCss}
</style>
</head>
<body ${bodyAttrs}>${bodyHtml}</body>
</html>`;
}

interface WarningBannerProps {
	warnings: RmluiWarning[];
}

function WarningBanner({ warnings }: WarningBannerProps) {
	const { t } = useTranslation();
	if (warnings.length === 0) return null;

	return (
		<div className="uiFilePreview--warnings">
			<div className="uiFilePreview--warnings-header">
				<span className="uiFilePreview--warnings-icon">⚠</span>
				<span>
					RCSS — {warnings.length}{' '}
					{warnings.length > 1
						? t('rcssWarnings.incompatibilities')
						: t('rcssWarnings.incompatibility')}
				</span>
			</div>
			<ul className="uiFilePreview--warnings-list">
				{warnings.map((w) => (
					<li key={w.id} className="uiFilePreview--warning-item">
						<span className="uiFilePreview--warning-msg">{w.message}</span>
						<span className="uiFilePreview--warning-fix">→ {w.fix}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function UiFilePreview() {
	const { t } = useTranslation();
	const htmlContent = useCodeEditorStore((s) => s.openUiFile?.htmlContent ?? '');
	const cssContent = useCodeEditorStore((s) => s.openUiFile?.cssContent ?? '');
	const htmlPath = useCodeEditorStore((s) => s.openUiFile?.htmlPath ?? '');

	const warnings = useMemo(() => getRmluiWarnings(t), [t]);
	const srcDoc = useMemo(() => buildSrcDoc(htmlContent, cssContent), [htmlContent, cssContent]);
	const detectedWarnings = useMemo(
		() => detectWarnings(cssContent, warnings),
		[cssContent, warnings]
	);

	return (
		<div className="uiFilePreview--overlay">
			<iframe
				key={htmlPath}
				srcDoc={srcDoc}
				className="uiFilePreview--frame"
				sandbox="allow-same-origin"
				title="Live preview"
			/>
			<WarningBanner warnings={detectedWarnings} />
		</div>
	);
}

export default UiFilePreview;
