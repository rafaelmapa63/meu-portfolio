const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');

const events = {};
let frame;
let position = 1000;
let focused = false;
let reduced = false;
const context = {
  scrollY: 1000,
  performance: { now: () => 0 },
  matchMedia: () => ({ matches: reduced }),
  requestAnimationFrame: callback => { frame = callback; return 1; },
  cancelAnimationFrame: () => { frame = null; },
  scrollTo: ({ top }) => { position = top; },
  document: {
    querySelectorAll: () => [{ addEventListener: (type, callback) => { events.click = callback; } }],
    querySelector: () => ({ focus: () => { focused = true; } }),
    getElementById: () => null,
    addEventListener: (type, callback) => { events[type] = callback; }
  }
};

runInNewContext(readFileSync(__dirname + '/site.js', 'utf8'), context);
const click = () => events.click({ preventDefault() {} });

click();
frame(250);
assert.ok(position > 750 && position < 1000, 'o começo da rolagem deve ser lento');
frame(1000);
assert.equal(position, 0);
assert.equal(focused, true);

click();
events.wheel();
assert.equal(frame, null, 'rolagem manual cancela');

reduced = true;
focused = false;
click();
assert.equal(position, 0);
assert.equal(frame, null);
assert.equal(focused, true);

for (const page of ['index.html', 'sobre.html', 'projetos.html']) {
  const html = readFileSync(__dirname + '/' + page, 'utf8');
  assert.match(html, /src="site.js"/);
  assert.match(html, /href="#top" class="back-to-top/);
  assert.match(html, /id="top"/);
}

const projects = readFileSync(__dirname + '/projetos.html', 'utf8');
for (const asset of ['porsche', 'volvo', 'lopez', 'mercedes']) {
  assert.match(projects, new RegExp('assets/home/' + asset + '\\.png'));
}
for (const asset of ['catalogo-volvo', 'captacao', 'fidcomex']) {
  assert.match(projects, new RegExp('assets/projetos/' + asset + '\\.png'));
}

console.log('OK: rolagem, menu, tres paginas e sete imagens de projetos');
