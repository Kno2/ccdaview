import { describe, expect, it } from 'vitest';
import { bootstrapize } from '../src/utilities/htmlhelpers';

describe('bootstrapize', () => {
    it.each([
        ['img onerror', '<img src="x" onerror="alert(1)">', ''],
        ['script', '<script>alert(1)</script>', ''],
        ['svg onload', '<svg onload="alert(1)"></svg>', ''],
        ['iframe', '<iframe src="https://a.example"></iframe>', ''],
        ['inline handler on allowed tag', '<content onclick="alert(1)">t</content>', '<content>t</content>'],
        ['javascript: href', '<a href="javascript:alert(1)">x</a>', '<a>x</a>'],
        ['CDATA-wrapped payload', '<![CDATA[ > <img src=x onerror=alert(1)> ]]>', ' ]]&gt;'],
        ['processing-instruction payload', '<?x > <img src=x onerror=alert(1)> ?>', ' ?&gt;']
    ])('strips executable content: %s', (_, input, expected) => {
        expect(bootstrapize(input)).toBe(expected);
    });

    it.each([
        ['style background-image', '<div style="background-image:url(https://a.example/open)">s</div>', '<div>s</div>'],
        [
            'td background',
            '<table><tbody><tr><td background="https://a.example/b">t</td></tr></tbody></table>',
            '<table class="table table-bordered table-striped"><tbody><tr><td>t</td></tr></tbody></table>'
        ],
        ['style element', '<style>body{background:url(https://a.example/s)}</style>', ''],
        ['link stylesheet', '<link rel="stylesheet" href="https://a.example/c">', ''],
        ['video poster and source', '<video poster="https://a.example/p"><source src="https://a.example/v"></video>', ''],
        ['input type=image', '<input type="image" src="https://a.example/i">', '']
    ])('strips remote resource loads: %s', (_, input, expected) => {
        expect(bootstrapize(input)).toBe(expected);
    });

    it.each([
        [
            'CDA list',
            '<list listType="ordered"><item><content ID="problem1">P</content></item></list>',
            '<list listtype="ordered"><item><content id="problem1">P</content></item></list>'
        ],
        ['CDA paragraph', '<paragraph styleCode="Bold">B</paragraph>', '<paragraph stylecode="Bold">B</paragraph>'],
        [
            'table with colspan',
            '<table border="1"><tbody><tr><td colspan="2">v</td></tr></tbody></table>',
            '<table class="table table-bordered table-striped"><tbody><tr><td colspan="2">v</td></tr></tbody></table>'
        ],
        ['external link', '<a href="https://example.com">link</a>', '<a href="https://example.com">link</a>']
    ])('keeps narrative markup: %s', (_, input, expected) => {
        expect(bootstrapize(input)).toBe(expected);
    });
});
