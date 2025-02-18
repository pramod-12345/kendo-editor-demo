import { commonAttributes, getAttrs, getAttributes } from './node-utils';

const iframe = {
    attrs: {
        src: {
            default: null,
        },
        style: {
            default: null,
        },
        title: 'iframe',
        class: 'iframe',
        alt: 'iframe',
        scrolling: 'iframe',
        height: 'iframe',
        width: 'iframe',
    },
    group: 'inline',
    inline: true,
    draggable: true,
    selectable: true,
    parseDOM: [
        {
            tag: 'iframe',
            getAttrs: (dom) => ({
                src: dom.getAttribute('src'),
                class: dom.getAttribute('class'),
                title: dom.getAttribute('title'),
                style: dom.getAttribute('style'),
                width: dom.getAttribute('width'),
                height: dom.getAttribute('height'),
                alt: dom.getAttribute('alt'),
                scrolling: dom.getAttribute('scrolling'),
            }),
        },
    ],
    toDOM: (node) => {
        const attrs = {
            src: node.attrs.src,
            class: node.attrs.class,
            style: node.attrs.style,
            title: node.attrs.title,
            alt: node.attrs.alt || 'iframe',
            width: node.attrs.width || '650px',
            height: node.attrs.height || '350px',
            frameBorder: '0',
            allowfullscreen: 'true',
            scrolling: node.attrs.scrolling || 'no',
            loading : 'lazy'
        };
        return [ 'iframe', attrs ];
    },
};

const shortCode = {
    name: 'shortCode',
    inline: true,
    group: 'inline',
    content: 'inline+',
    marks: '',
    attrs: {
        contenteditable: { default: null },
    },
    atom: true,
    parseDOM: [
        {
            tag: 'shortCode',
            priority: 51,
            getAttrs: (dom) => ({
                class: dom.getAttribute('class'),
                style: dom.getAttribute('style'),
            }),
        },
    ],
    toDOM: (node) => [
        'shortCode',
        {
            class: node.attrs.class || '',
            style: node.attrs.style || '',
        },
        0,
    ],
};

// const a = {
//     name: 'a',
//     inline: true,
//     group: 'inline',
//     content: 'inline+',
//     attrs: {
//         contenteditable: { default: null },
//         rel: '',
//         href: '',
//         target: '',
//         title: ''
//     },
//     atom: true,
//     parseDOM: [ {
//         tag: 'a',
//         priority: 51,
//         getAttrs: (dom) => ({
//             rel: dom.getAttribute('rel'),
//             href: dom.getAttribute('href'),
//             target: dom.getAttribute('target'),
//             title: dom.getAttribute('title')
//         }),
//     } ],
//     toDOM: (node) =>  [
//         'a',
//         {
//             rel: node.attrs.rel || null,
//             href: node.attrs.href || null,
//             target: node.attrs.target || null,
//             title: node.attrs.title || null
//         },
//         0 ,
//     ],
// };

const button = {
    name: 'button',
    inline: true,
    group: 'inline',
    content: 'block+',
    marks: '',
    selectable: true,
    defining: true,
    draggable: true,
    attrs: {
        contenteditable: { default: null },
        style: {
            default: null,
        },
        class: 'btn',
        onclick: {},
        rel: '',
        // disabled: false,
        label: { default: 'Click Me' },
        id:  { default: new Date().getTime() },
    },
    atom: true,
    parseDOM: [
        {
            tag: 'button',
            priority: 51,
            getAttrs: (dom) => ({
                class: dom.getAttribute('class'),
                style: dom.getAttribute('style'),
                onclick: dom.getAttribute('onclick'),
                rel: dom.getAttribute('rel'),
                selectable: { default: null },
                // disabled: dom.getAttribute('disabled'),
                label: dom.innerText,
                id : dom.id
            }),
        },
    ],
    toDOM: (node) => [
        'button',
        {
            class: node.attrs.class || '',
            style: node.attrs.style || '',
            onclick: node.attrs.onclick || {},
            rel: node.attrs.rel || '',
            // disabled: node.attrs.disabled || true,
            selectable:  node.attrs.selectable || true,
            id:  node.attrs.id || new Date().getTime()
        },
        node.attrs.label,
    ],
};

const script = {
    content: 'text*',
    group: 'block',
    attrs: {
        ...commonAttributes(),
        src: '',
        async: '',
    },
    parseDOM: [
        {
            tag: 'script',
            getAttrs: getAttributes,
        },
    ],
    toDOM: (node) => [ 'script', getAttrs(node.attrs, false), 0 ],
};

const blockquote = {
    content: 'block+',
    group: 'block',
    defining: true,
    attrs: {
        ...commonAttributes(),
    },
    parseDOM: [ { tag: 'blockquote', getAttrs: getAttributes } ],
    toDOM: (node) => [ 'blockquote', getAttrs(node.attrs, false), 0 ],
};

export { iframe, shortCode, button, script, blockquote };
