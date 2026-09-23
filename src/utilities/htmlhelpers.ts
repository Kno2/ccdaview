import DOMPurify from 'dompurify';
import $ from 'jquery';
import lodash from 'lodash';

const NARRATIVE_SANITIZE_CONFIG = {
    ADD_TAGS: ['content', 'paragraph', 'list', 'item', 'linkhtml', 'footnote', 'footnoteref', 'rendermultimedia'],
    ADD_ATTR: ['stylecode', 'listtype'],
    FORBID_TAGS: ['img', 'style']
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
