#!/usr/bin/env python3
"""Bundles design/ into one shareable ../relay-all.html (run from anywhere)."""
import base64, json, re, pathlib
d = pathlib.Path(__file__).parent
rd = lambda p: (d / p).read_text()
css, js = rd('shared/components.css'), rd('shared/mock.js')
safe = lambda s: s.replace('</script', '<\\/script').replace('</style', '<\\/style')

def inline(name):
    h = rd(name + '.html')
    h = h.replace('<link rel="stylesheet" href="shared/components.css">', lambda_ := '<style>' + safe(css) + '</style>')
    h = h.replace('<script src="shared/mock.js"></script>', '<script>' + safe(js) + '</script>')
    return h

designs = {n: inline(n) for n in ('ledger', 'dispatch', 'observatory')}
idx = rd('index.html')
idx = re.sub(r'src="(previews/[^"]+\.png)"', lambda m: 'src="data:image/png;base64,' + base64.b64encode((d / m.group(1)).read_bytes()).decode() + '"', idx)
shell = '''
<script>
const DESIGNS = ''' + safe(json.dumps(designs)) + ''';
const BACK = '<a href="" onclick="history.replaceState(null,\\'\\',location.pathname);location.reload();return false" style="position:fixed;z-index:99;left:50%;transform:translateX(-50%);bottom:0;padding:4px 12px;background:#1b1d22;color:#fff;font:600 12px system-ui,sans-serif;border-radius:6px 6px 0 0;text-decoration:none;opacity:.85">&larr; Design options</a>';
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]'); const m = a && a.getAttribute('href').match(/^(ledger|dispatch|observatory)\\.html(#.*)?$/);
  if (!m) return;
  e.preventDefault();
  history.replaceState(null, '', location.pathname + (m[2] || '#/dashboard'));
  document.open(); document.write(DESIGNS[m[1]].replace('</body>', BACK + '</body>')); document.close();
});
</script>
'''
out = d.parent / 'relay-all.html'
out.write_text(idx.replace('</body>', shell + '</body>'))
print(out, out.stat().st_size // 1024, 'KB')
