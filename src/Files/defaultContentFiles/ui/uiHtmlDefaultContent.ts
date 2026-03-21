export const uiHtmlDefaultContent = (fileName: string, cssPath: string): string => `<rml>
<head>
    <title>${fileName}</title>
    <link type="text/rcss" href="${cssPath}"/>
</head>
<body>
</body>
</rml>
`;
