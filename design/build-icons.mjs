import * as si from 'simple-icons';
import fs from 'fs';

const byTitle = new Map();
for (const k of Object.keys(si)) { const i = si[k]; if (i && i.title) byTitle.set(i.title.toLowerCase(), i); }

// extra availability probe
const probe = ['PythonAnywhere','Google','Kubernetes','Dialogflow','Amazon','Assembly','GNU Bash','Markdown','Pytest','Sentence Transformers'];
console.log('--- PROBE ---');
for (const p of probe) console.log(' ', p.padEnd(24), byTitle.has(p.toLowerCase()) ? 'YES ' + byTitle.get(p.toLowerCase()).hex : 'no');

// relative luminance -> lift dark brand colors so they read on #0A0A0B
function lum(hex){
  const v = [0,2,4].map(i => { const c = parseInt(hex.slice(i,i+2),16)/255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); });
  return 0.2126*v[0] + 0.7152*v[1] + 0.0722*v[2];
}
function lift(hex){
  // blend toward white, preserving hue, until it reads on #0A0A0B
  let [r,g,b] = [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
  const hx = (a) => a.map(c=>Math.round(c).toString(16).padStart(2,'0')).join('');
  if (lum(hex) >= 0.22) return '#'+hex;
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const m = [r,g,b].map(c => c + (255 - c) * t);
    if (lum(hx(m)) >= 0.22) return '#' + hx(m);
  }
  return '#E4E5EA';
}

const S = (title, label) => {
  const i = byTitle.get(title.toLowerCase());
  if (!i) { console.error('MISSING simple-icon:', title); return null; }
  return { label: label || i.title, src:'si', path: i.path, color: lift(i.hex), raw:'#'+i.hex };
};
const D = (dir, file, label) => {
  const p = `node_modules/devicon/icons/${dir}/${file}`;
  if (!fs.existsSync(p)) { console.error('MISSING devicon:', p); return null; }
  let svg = fs.readFileSync(p,'utf8').replace(/<\?xml[^>]*\?>/,'').replace(/<!--[\s\S]*?-->/g,'').trim();
  return { label, src:'dv', svg, color:null };
};
const T = (label, note) => ({ label, src:'txt', note: note||'' });

const groups = [
  { name:'Languages', items:[
    S('Python'), D('java','java-original.svg','Java'), S('C'), S('TypeScript'), S('JavaScript'),
    D('matlab','matlab-original.svg','MATLAB'), S('TradingView','Pine Script'),
    S('HTML5','HTML'), S('CSS'), S('LaTeX'), T('Assembly','x86 · LC-3'), T('SQL')
  ]},
  { name:'ML & Data', items:[
    S('PyTorch'), S('NumPy'), S('SciPy'), D('matplotlib','matplotlib-original.svg','Matplotlib'),
    S('pandas'), S('Meta','FAISS'), S('Hugging Face','sentence-transformers'),
    S('Google Gemini','Gemini API'), S('Google Colab'), S('Jupyter')
  ]},
  { name:'Web', items:[
    S('React'), S('Astro'), S('Django'), S('Flask'), S('Tailwind CSS'),
    S('Chart.js'), S('Streamlit'), S('Node.js')
  ]},
  { name:'Cloud & Infrastructure', items:[
    D('amazonwebservices','amazonwebservices-original-wordmark.svg','AWS'),
    T('ECS Fargate','AWS'), T('EKS','AWS'),
    S('Terraform'), S('Docker'), S('Vercel'), S('Supabase'), S('PostgreSQL'), S('SQLite'), S('PythonAnywhere')
  ]},
  { name:'Tools & Observability', items:[
    S('Git'), S('GitHub'), S('Datadog'), T('Observe'), S('JUnit5','JUnit'),
    S('Google','Google OR-Tools'), S('Dialogflow','Dialogflow CX'), T('Finnhub API'), T('YFinance')
  ]}
].map(g => ({ ...g, items: g.items.filter(Boolean) }));

fs.writeFileSync('icons.json', JSON.stringify(groups, null, 1));
const n = groups.reduce((a,g)=>a+g.items.length,0);
console.log(`\nwrote icons.json — ${groups.length} groups, ${n} entries`);
console.log('lifted colors:');
groups.forEach(g=>g.items.forEach(i=>{ if(i.src==='si' && i.color.toLowerCase()!==i.raw.toLowerCase()) console.log(`  ${i.label.padEnd(24)} ${i.raw} -> ${i.color}`); }));
