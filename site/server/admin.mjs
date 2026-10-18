const ownerEmail='eleela@egembassydc.com';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function handleAdmin(request,env,pages){
 const url=new URL(request.url),p=url.pathname;
 const admin=request.headers.get('oai-authenticated-user-id') && request.headers.get('oai-authenticated-user-email')?.toLowerCase()===ownerEmail;
 if(p==='/admin'||p==='/admin.html'){
  if(!request.headers.get('oai-authenticated-user-id'))return Response.redirect(url.origin+'/signin-with-chatgpt?return_to=%2Fadmin',302);
  if(!admin)return new Response('Acceso reservado al administrador',{status:403});
  return new Response(pages['/admin.html'],{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}});
 }
 if(!p.startsWith('/api/'))return null;
 try {
 if(p==='/api/settings'&&request.method==='GET'){
  const doc=await env.MEDIA.get('settings.json');return json(doc?await doc.json():{riddles:[],music:{}});
 }
 if(p.startsWith('/api/music/')&&request.method==='GET'){
  const id=p.slice(11);if(!/^[a-f0-9-]+$/.test(id))return new Response('No encontrado',{status:404});
  const f=await env.MEDIA.get('music/'+id);if(!f)return new Response('No encontrado',{status:404});
  return new Response(f.body,{headers:{'Content-Type':f.httpMetadata?.contentType||'audio/mpeg','Cache-Control':'public,max-age=86400'}});
 }
 if(!admin)return json({error:'Acceso reservado al administrador'},403);
 if(request.method!=='POST')return json({error:'Método no permitido'},405);
 if(request.headers.get('Origin')!==url.origin)return json({error:'Origen no permitido'},403);
 if(p==='/api/upload'){
  const type=request.headers.get('Content-Type');if(!['audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/webm'].includes(type))return json({error:'Formato de audio no admitido'},400);
  const data=await request.arrayBuffer();if(data.byteLength>20*1024*1024)return json({error:'Máximo 20 MB'},413);
  const id=crypto.randomUUID();await env.MEDIA.put('music/'+id,data,{httpMetadata:{contentType:type}});return json({url:'/api/music/'+id});
 }
 if(p==='/api/settings'){
  const raw=await request.text();if(raw.length>500000)return json({error:'Configuración demasiado grande'},413);
  const d=JSON.parse(raw);
  if(!Array.isArray(d.riddles)||d.riddles.length>500||!d.music||typeof d.music!=='object')return json({error:'Configuración inválida'},400);
  for(const r of d.riddles)if(typeof r.id!=='string'||!r.id.startsWith('custom-')||typeof r.question!=='string'||r.question.length>2000||!Array.isArray(r.options)||r.options.length!==3||r.options.some(o=>typeof o!=='string'||o.length>500)||![0,1,2].includes(r.answer)||typeof r.hint!=='string')return json({error:'Acertijo inválido'},400);
  if(new Set(d.riddles.map(r=>r.id)).size!==d.riddles.length)return json({error:'Identificadores repetidos'},400);
  for(const [chapter,track] of Object.entries(d.music))if(!/^(10|[1-9])$/.test(chapter)||typeof track.url!=='string'||!/^\/api\/music\/[a-f0-9-]+$/.test(track.url)||typeof track.name!=='string')return json({error:'Pista inválida'},400);
  await env.MEDIA.put('settings.json',JSON.stringify(d),{httpMetadata:{contentType:'application/json'}});return json({ok:true});
 }
 return json({error:'No encontrado'},404);
 }catch(e){console.error('Configuration unavailable',e.message);return json({error:'No se pudo acceder a la configuración. Inténtalo de nuevo.'},503);}
}
