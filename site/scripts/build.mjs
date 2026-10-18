import fs from 'node:fs';
const files = fs.readdirSync('.').filter(f => /\.(html|css|js)$/.test(f));
const pages = Object.fromEntries(files.map(f => ['/' + f, fs.readFileSync(f, 'utf8')]));
fs.mkdirSync('dist/server', {recursive:true});
fs.mkdirSync('dist/client', {recursive:true});
fs.cpSync('assets', 'dist/client/assets', {recursive:true});
fs.writeFileSync('dist/server/index.js', `const pages = ${JSON.stringify(pages)};
${fs.readFileSync("server/admin.mjs","utf8").replace("export async function", "async function")}
export default {
 async fetch(request, env) {
  const managed = await handleAdmin(request,env,pages);
  if(managed) return managed;
  const path = new URL(request.url).pathname;
  const key = path === '/' ? '/index.html' : path;
  const body = pages[key] ?? pages[key + '.html'];
  if (body !== undefined) {
   const type = key.endsWith('.css') ? 'text/css' : key.endsWith('.js') ? 'text/javascript' : 'text/html';
   return new Response(request.method === 'HEAD' ? null : body, {headers:{'Content-Type': type + '; charset=utf-8'}});
  }
  return env.ASSETS.fetch(request);
 }
};\n`);
const config = {project_id:'appgprj_6aa32ef0fbfc819198285a0acf1d26ef',r2:'MEDIA'};
fs.mkdirSync('dist/.openai', {recursive:true});
for (const path of ['.openai/hosting.json','dist/.openai/hosting.json']) fs.writeFileSync(path, JSON.stringify(config,null,2)+'\n');
