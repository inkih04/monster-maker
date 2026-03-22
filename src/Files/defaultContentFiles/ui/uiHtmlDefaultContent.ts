export const uiHtmlDefaultContent = (fileName: string, cssName: string): string => `<rml>
<head>
    <title>${fileName}</title>
    <link type="text/rcss" href="${cssName}"/>
</head>
<body>
</body>
</rml>
`;
