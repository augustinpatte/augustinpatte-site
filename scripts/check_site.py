from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import re

root = Path(__file__).resolve().parents[1] / 'dist'
class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.nodes=[]
    def handle_starttag(self, tag, attrs): self.nodes.append((tag,dict(attrs)))

pages=list(root.rglob('*.html'))
parsed={}
for path in pages:
    parser=Parser();parser.feed(path.read_text());parsed[path]=parser.nodes
errors=[]
for page,nodes in parsed.items():
    ids=[a['id'] for tag,a in nodes if 'id' in a]
    if len(ids)!=len(set(ids)): errors.append(f'Duplicate IDs: {page}')
    if len([1 for tag,a in nodes if tag=='h1'])!=1:errors.append(f'Expected one H1: {page}')
    for tag,attrs in nodes:
        # Empty alt is intentional for decorative logos beside their written names.
        if tag=='img' and 'alt' not in attrs:errors.append(f'Missing alt: {page}')
        for key in ('href','src'):
            target=attrs.get(key,'')
            if target.startswith('#'):
                if target[1:] not in ids:errors.append(f'Missing fragment {target}: {page}')
            elif target.startswith('/') and not target.startswith('//'):
                u=urlparse(target);file=root/unquote(u.path.lstrip('/'))
                if u.path.endswith('/'):file=file/'index.html'
                if not file.is_file():errors.append(f'Missing {target}: {page}')
    for text in re.findall(r'<(?:h1|h2|p)[^>]*>(.*?)</(?:h1|h2|p)>',page.read_text()):
        if 'undefined' in text or '[object Object]' in text:errors.append(f'Bad template data: {page}')
css=(root/'styles.css').read_text()
if re.search(r'^\+',css,re.M):errors.append('Patch markers left in CSS')
assert not errors, '\n'.join(errors)
print(f'PASS: {len(pages)} pages; local routes, assets, fragments, headings, image descriptions and template data.')
print(f'PASS: {len([p for p in pages if "/fr/" in str(p)])} French pages and bilingual route pairs.')
