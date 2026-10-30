#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .build
npx --yes esbuild src/main.js \
  --bundle --format=iife --minify \
  --alias:three=./vendor/three/build/three.module.js \
  --alias:three/addons=./vendor/three/addons \
  --outfile=.build/scene.js
python3 - <<'PY'
from pathlib import Path
html = Path('index.html').read_text()
bundle = Path('.build/scene.js').read_text()
# strip importmap (not needed for the bundled IIFE)
start = html.index('<script type="importmap">')
end = html.index('</script>', start) + len('</script>')
html = html[:start] + html[end:]
html = html.replace('<script type="module" src="./src/main.js"></script>',
                    '<script>\n' + bundle + '\n</script>')
Path('hoshimart-rainy-corner.html').write_text(html)
print('wrote hoshimart-rainy-corner.html', len(html), 'bytes')
PY
