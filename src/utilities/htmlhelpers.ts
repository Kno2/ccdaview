import DOMPurify from 'dompurify';
import $ from 'jquery';
import lodash from 'lodash';

const NARRATIVE_SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
        'content',
        'paragraph',
        'list',
        'item',
        'linkhtml',
        'footnote',
        'footnoteref',
        'rendermultimedia',
        'caption',
        'table',
        'thead',
        'tbody',
        'tfoot',
        'tr',
        'th',
        'td',
        'col',
        'colgroup',
        'sub',
        'sup',
        'br',
        'hr',
        'a',
        'b',
        'i',
        'u',
        'em',
        'strong',
        'span',
        'div',
        'p',
        'pre',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6'
    ],
    ALLOWED_ATTR: ['id', 'stylecode', 'listtype', 'colspan', 'rowspan', 'align', 'valign', 'scope', 'headers', 'abbr', 'span', 'href']
};

export function getElementIndex(node: HTMLElement): number {
    const children = lodash.filter([].slice.call(node.parentNode.childNodes), { nodeType: 1 });
    return Array.prototype.indexOf.call(children, node);
}

export function bootstrapize(html: string): string {
    const $html = $('<div />');

    $html.html(DOMPurify.sanitize(html, NARRATIVE_SANITIZE_CONFIG));

    const $all = $html.find('*').removeAttr('width border xmlns');

    $all.filter('table').addClass('table table-bordered table-striped');

    return $html.html();
}
