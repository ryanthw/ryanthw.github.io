import fs from 'fs';
const groups = JSON.parse(fs.readFileSync('icons.json','utf8'));

const MONO = "'IBM Plex Mono',monospace";
const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function mark(it){
  if (it.src === 'si')
    return `<svg viewBox="0 0 24 24" width="25" height="25" fill="${it.color}" aria-hidden="true"><path d="${it.path}"></path></svg>`;
  if (it.src === 'dv'){
    const wide = /wordmark/.test(it.label) || it.label === 'AWS';
    let svg = it.svg
      .replace(/\swidth="[^"]*"/,'').replace(/\sheight="[^"]*"/,'')
      .replace(/<svg/, `<svg width="${wide?44:25}" height="25" aria-hidden="true"`);
    return svg;
  }
  const initials = it.label.replace(/[^A-Za-z0-9 ]/g,'').split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase();
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;border:1px solid #2E2E33;border-radius:3px;font-family:${MONO};font-size:9px;letter-spacing:.04em;color:#8A8A93">${initials}</span>`;
}

function tile(it){
  const sub = it.note ? `<span style="font-family:${MONO};font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:#5C5C64">${esc(it.note)}</span>` : '';
  return `        <div style="background:#141416;border:1px solid #232326;border-radius:3px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;gap:9px;text-align:center;min-height:92px;justify-content:center">
          <div style="height:26px;display:flex;align-items:center;justify-content:center">${mark(it)}</div>
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-size:12.5px;color:#EDEDEF;line-height:1.25">${esc(it.label)}</span>
            ${sub}
          </div>
        </div>`;
}

const sections = groups.map((g,gi) => `
    <div style="display:grid;grid-template-columns:180px minmax(0,1fr);gap:32px;padding:30px 0;${gi ? 'border-top:1px solid #232326;' : ''}align-items:start">
      <div style="display:flex;flex-direction:column;gap:6px;position:sticky;top:0">
        <span style="font-family:Archivo,sans-serif;font-weight:700;font-size:19px;letter-spacing:-.014em;line-height:1.15">${esc(g.name)}</span>
        <span style="font-family:${MONO};font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:#5C5C64">${String(g.items.length).padStart(2,'0')} technologies</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px">
${g.items.map(tile).join('\n')}
      </div>
    </div>`).join('\n');

const total = groups.reduce((a,g)=>a+g.items.length,0);

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
    *{box-sizing:border-box}
    body{margin:0;background:#0A0A0B;color:#EDEDEF;font-family:'IBM Plex Sans',-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
    a{color:#EDEDEF;text-decoration:none}
    a:hover{color:#B3A369}
  </style>
</helmet>

<div style="min-height:1720px;background:#0A0A0B;padding-bottom:70px">

  <div style="border-bottom:1px solid #232326">
    <div style="max-width:1120px;margin:0 auto;padding:0 40px;height:68px;display:flex;align-items:center;justify-content:space-between">
      <div style="font-family:Archivo,sans-serif;font-weight:800;font-size:15px;letter-spacing:-.01em">RW<span style="color:#B3A369">.</span></div>
      <div style="display:flex;gap:30px;font-family:${MONO};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8A8A93">
        <a href="#">Home</a><a href="#" style="color:#EDEDEF">Stack</a><a href="#">Experience</a><a href="#">Education</a><a href="#">Projects</a><a href="#">Connect</a>
      </div>
    </div>
  </div>

  <div style="max-width:1120px;margin:0 auto;padding:0 40px">

    <div style="padding-top:60px;padding-bottom:22px;display:flex;flex-direction:column;gap:14px">
      <div style="font-family:${MONO};font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#8A8A93">Stack</div>
      <h1 style="font-family:Archivo,sans-serif;font-weight:800;font-size:54px;line-height:1;letter-spacing:-.03em;margin:0;text-transform:uppercase">Technologies</h1>
      <p style="margin:0;max-width:58ch;color:#8A8A93;font-size:16px">${total} technologies I have shipped something with — grouped by what they are for, not by how well I claim to know them.</p>
    </div>
${sections}
  </div>
</div>
</x-dc>
</body>
</html>
`;
fs.writeFileSync('Stack.dc.html', html);
console.log(`Stack.dc.html written — ${total} technologies, ${groups.length} groups, ${(html.length/1024).toFixed(1)} KB`);
