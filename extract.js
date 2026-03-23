import fs from 'fs';

const html = fs.readFileSync('target_page.html', 'utf8');

const headerMatch = html.match(/<header id="masthead"[\s\S]*?<\/header>/);
let headerHtml = headerMatch ? headerMatch[0] : '';
fs.writeFileSync('extracted_header.html', headerHtml);

const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i) || html.match(/<div data-elementor-type="wp-post" data-elementor-id="1937"[\s\S]*?<\/footer>/i) || html.match(/<div class="site-footer[\s\S]*?<\/footer>/i) || html.match(/<div data-elementor-type="wp-post" data-elementor-id="1937"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/i);
let footerHtml = footerMatch ? footerMatch[0] : '';
fs.writeFileSync('extracted_footer.html', footerHtml);

const linkMatches = html.match(/<link rel=["']stylesheet["'][\s\S]*?>/gi);
fs.writeFileSync('extracted_links.html', linkMatches ? linkMatches.join('\n') : '');

console.log('Extraction complete');
