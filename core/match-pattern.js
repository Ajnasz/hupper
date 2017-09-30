/**
 * Transforms a valid match pattern into a regular expression
 * which matches all URLs included by that pattern.
 *
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns
 *
 * @param  {string}  pattern  The pattern to transform.
 * @return {RegExp}           The pattern's equivalent as a RegExp.
 * @throws {TypeError}        If the pattern is not a valid MatchPattern
 */

// matches all valid match patterns (except '<all_urls>')
// and extracts [ , scheme, host, path, ]
const matchPattern = (/^(?:(\*|http|https|file|ftp|app):\/\/([^/]+|)\/?(.*))$/i);


export default function (pattern) {
	if (pattern === '<all_urls>') {
		return (/^(?:https?|file|ftp|app):\/\//);
	}
	const match = matchPattern.exec(pattern);
	if (!match) {
		throw new TypeError(`"${ pattern }" is not a valid MatchPattern`);
	}
	const [, scheme, host, path,] = match;
	return new RegExp('^(?:'
		+ (scheme === '*' ? 'https?' : escape(scheme)) + ':\\/\\/'
		+ (host === '*' ? '[^\\/]*' : escape(host).replace(/^\*\./g, '(?:[^\\/]+)?'))
		+ (path ? (path === '*' ? '(?:\\/.*)?' : ('\\/' + escape(path).replace(/\*/g, '.*'))) : '\\/?')
		+ ')$');
}
