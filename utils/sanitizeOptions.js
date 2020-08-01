module.exports = {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'sup', 'sub',
        'ins', 'del'
    ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
        a: [ 'href', 'name', 'target' ],
        img: [ 'src' ],
        span: [ 'style' ],
        p: [ 'style' ]
    },
    allowedStyles: {
        '*': {
            'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
            'text-align': [/^left$/, /^right$/, /^center$/]
        },
    },
    selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
    allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
    allowProtocolRelative: true,
    enforceHtmlBoundary: false
}