import * as tpl from '../../core/tpl';

let test = require('tape');

test('core/tpl.htmlEscape', (t) => {
	t.plan(11);

	t.equal(tpl.htmlEscape('&'), '&amp;', '& replaced to &amp;');
	t.equal(tpl.htmlEscape('&&&&&'), '&amp;&amp;&amp;&amp;&amp;', 'all & replaced to &amp;');

	t.equal(tpl.htmlEscape('<'), '&lt;', '< replaced to &lt;');
	t.equal(tpl.htmlEscape('<<<<<'), '&lt;&lt;&lt;&lt;&lt;', 'all < replaced to &lt;');

	t.equal(tpl.htmlEscape('>'), '&gt;', '> replaced to &gt;');
	t.equal(tpl.htmlEscape('>>>>>'), '&gt;&gt;&gt;&gt;&gt;', 'all > replaced to &gt;');

	t.equal(tpl.htmlEscape("'"), '&apos;', "' replaced to &apos;");
	t.equal(tpl.htmlEscape("'''''"), '&apos;&apos;&apos;&apos;&apos;', "all ' replaced to &apos;");

	t.equal(tpl.htmlEscape('"'), '&quot;', '" replaced to &quot;');
	t.equal(tpl.htmlEscape('"""""'), '&quot;&quot;&quot;&quot;&quot;', 'all " replaced to &quot;');

	t.equal(tpl.htmlEscape('Lorem\'s ipsum & dolor <script> "amet"'),
		'Lorem&apos;s ipsum &amp; dolor &lt;script&gt; &quot;amet&quot;', 'replaces all &<>\'" charts char to html entity');

	t.end();
});

test('core/tpl.template', (t) => {
	t.plan(13);

	t.equal(tpl.template('{foo}', {foo: 'bar'}), 'bar', 'replaced {foo} to the text given in object');
	t.equal(tpl.template('{foo} bar', {foo: 'bar'}), 'bar bar', 'replaced {foo} to the text given in object, and left the other part as it was');

	t.equal(tpl.template('{foo} {bar}', {foo: 'bar', bar: 'baz'}), 'bar baz',
		'replaced multiple template variables to the text given in object, and left the other part as it was');

	t.equal(tpl.template('{qux}', {foo: 'bar', bar: 'baz'}), '{qux}', 'kept the value es it was if no entry in replacement');

	t.equal(tpl.template('{foo} {bar} {qux}', {foo: 'bar', bar: 'baz'}), 'bar baz {qux}',
		'replaced multiple template variables to the text given in object, and left the other part as it was,');

	t.equal(tpl.template('{foo}', {foo: 'Lorem\'s ipsum & dolor <script> "amet"'}), 'Lorem&apos;s ipsum &amp; dolor &lt;script&gt; &quot;amet&quot;',
		'escape text');

	t.equal(tpl.template('{=foo}', {foo: 'Lorem\'s ipsum & dolor <script> "amet"'}), 'Lorem\'s ipsum & dolor <script> "amet"',
		'no escape if value prefixed with =');

	t.equal(tpl.template('{foo}', {foo: 1}), '1', 'Call toString on value');
	t.equal(tpl.template('{foo}', {foo: null}), '{foo}', 'No replace if value is null');
	t.equal(tpl.template('{foo}', {foo: void(0)}), '{foo}', 'No replace if value is undefined');
	t.equal(tpl.template('{foo}', {foo: ''}), '', 'Allow empty string as value');
	t.equal(tpl.template('{foo}', {foo: 0}), '0', 'Allow 0 as value');

	t.equal(tpl.template('{foo bar baz}', {'foo bar baz': 'LOREM IPSUM'}), 'LOREM IPSUM', 'replaced key with spaces to the text given in object');

	t.end();
});
