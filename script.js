import * as THREE from './vendor/three.module.min.js';

const root = document.documentElement;
const hero = document.querySelector('.hero');
const canvas = document.querySelector('#carousel-canvas');
const loading = document.querySelector('.canvas-loading');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

hero.addEventListener('pointermove', (event) => {
  const rect = hero.getBoundingClientRect();
  root.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
  root.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
});

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf1efe8, 10, 24);
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
camera.position.set(0, 5.15, 11.6);
camera.lookAt(0, 2.85, 0);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

scene.add(new THREE.HemisphereLight(0xfffff4, 0x647358, 2.5));
const keyLight = new THREE.SpotLight(0xfff9dd, 24, 25, Math.PI / 5, .65, 1.4);
keyLight.position.set(-5, 9, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight, keyLight.target);
const rim = new THREE.DirectionalLight(0xb8d990, 3.2);
rim.position.set(5, 5, -4);
scene.add(rim);

const carousel = new THREE.Group();
carousel.rotation.x = -.035;
scene.add(carousel);
const mat = (color, roughness = .55, metalness = .05) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const cream = mat(0xf2e7cf, .65);
const pink = mat(0xd9908d, .68);
const dark = mat(0x25382e, .42, .25);
const brass = mat(0x9b7455, .34, .6);
const sage = mat(0xa8b885, .7);

function mesh(geometry, material, parent = carousel) {
  const item = new THREE.Mesh(geometry, material);
  item.castShadow = true;
  item.receiveShadow = true;
  parent.add(item);
  return item;
}

const base1 = mesh(new THREE.CylinderGeometry(2.45, 2.7, .38, 64), brass); base1.position.y = .18;
const base2 = mesh(new THREE.CylinderGeometry(2.18, 2.42, .25, 64), dark); base2.position.y = .5;
const base3 = mesh(new THREE.CylinderGeometry(1.9, 2.15, .2, 64), cream); base3.position.y = .72;
const centerPole = mesh(new THREE.CylinderGeometry(.09, .12, 5.4, 20), brass); centerPole.position.y = 3.05;
const canopy = mesh(new THREE.ConeGeometry(2.75, 2.15, 64, 1, true), pink); canopy.position.y = 5.35;
const canopyInner = mesh(new THREE.ConeGeometry(2.68, 2.05, 64, 1, true), cream); canopyInner.position.y = 5.32; canopyInner.scale.set(.985,.985,.985);
canopyInner.material = new THREE.MeshStandardMaterial({color:0xf5ead5,side:THREE.BackSide,roughness:.8});
const canopyRing = mesh(new THREE.TorusGeometry(2.7,.12,14,64), brass); canopyRing.rotation.x = Math.PI/2; canopyRing.position.y = 4.28;
const topBall = mesh(new THREE.SphereGeometry(.18,24,16), brass); topBall.position.y = 6.48;
const topCurl = mesh(new THREE.TorusGeometry(.28,.035,8,30,Math.PI*1.45),dark); topCurl.position.set(.02,6.78,0); topCurl.rotation.z=.5;

for(let i=0;i<16;i++){
  const stripe=mesh(new THREE.ConeGeometry(2.765,2.17,64,1,true,Math.PI*2/16-.075,Math.PI*2/16*.58), i%2?cream:pink);
  stripe.position.y=5.36; stripe.rotation.y=i*Math.PI*2/16;
}

const clickable = [];
const horseGroups = {};
function cylinderBetween(parent, radius, length, material, x, y, z, rz=0){
  const part=mesh(new THREE.CylinderGeometry(radius,radius,length,12),material,parent); part.position.set(x,y,z); part.rotation.z=rz; return part;
}
function createHorse(category, angle, horseMat){
  const anchor=new THREE.Group(); anchor.rotation.y=angle; carousel.add(anchor);
  const group=new THREE.Group(); group.position.set(1.72,2.05,0); group.rotation.z=-.08; anchor.add(group);
  group.userData.category=category; clickable.push(group);
  const body=mesh(new THREE.SphereGeometry(.58,28,18),horseMat,group); body.scale.set(1.45,.72,.58); body.userData.category=category;
  const neck=cylinderBetween(group,.22,.72,horseMat,.62,.35,0,-.5); neck.userData.category=category;
  const head=mesh(new THREE.SphereGeometry(.32,24,16),horseMat,group); head.position.set(.88,.7,0); head.scale.set(1.15,.75,.75); head.userData.category=category;
  const muzzle=mesh(new THREE.SphereGeometry(.18,18,12),cream,group); muzzle.position.set(1.18,.62,0); muzzle.scale.set(1.3,.7,.72); muzzle.userData.category=category;
  [-.26,.26].forEach((z)=>{const ear=mesh(new THREE.ConeGeometry(.09,.28,10),horseMat,group);ear.position.set(.74,1.02,z*.45);ear.rotation.z=-.2;ear.userData.category=category});
  [[-.56,-.52,.22,-.18],[-.18,-.54,-.22,.16],[.45,-.5,.22,-.2],[.7,-.46,-.2,.23]].forEach(([x,y,z,r])=>{const leg=cylinderBetween(group,.065,.88,horseMat,x,y,z,r);leg.userData.category=category});
  const tail=mesh(new THREE.TorusGeometry(.32,.055,8,20,Math.PI*1.2),horseMat,group);tail.position.set(-.92,.13,0);tail.rotation.set(Math.PI/2,0,.4);tail.userData.category=category;
  const saddle=mesh(new THREE.BoxGeometry(.55,.13,.58), category==='motion'?pink:category==='product'?sage:dark,group);saddle.position.set(-.05,.38,0);saddle.rotation.z=.03;saddle.userData.category=category;
  const pole=cylinderBetween(anchor,.035,3.65,brass,1.72,2.7,0,0); pole.userData.category=category;
  horseGroups[category] = group;
  return group;
}
createHorse('motion',0,cream); createHorse('product',Math.PI*2/3,pink); createHorse('worlds',Math.PI*4/3,sage);

for(let i=0;i<12;i++){
  const bulb=mesh(new THREE.SphereGeometry(.055,10,8),mat(i%2?0xffe6a4:0xe99b92,.3));
  const a=i*Math.PI*2/12; bulb.position.set(Math.cos(a)*2.67,4.28,Math.sin(a)*2.67);
}

function resize(){
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  renderer.setSize(rect.width,rect.height,false); camera.aspect=rect.width/rect.height; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas); resize();

let targetRotation=.35, velocity=0, dragging=false, downX=0, lastX=0, moved=0, activeCategory='';
canvas.addEventListener('pointerdown',e=>{dragging=true;downX=lastX=e.clientX;moved=0;velocity=0;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;moved+=Math.abs(dx);targetRotation+=dx*.009;velocity=dx*.0018});
canvas.addEventListener('pointerup',e=>{dragging=false;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(moved<7)pickHorse(e)});
canvas.addEventListener('pointercancel',()=>dragging=false);
const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
function pickHorse(event){
  const rect=canvas.getBoundingClientRect(); pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(clickable,true)[0]; if(hit){const category=hit.object.userData.category||hit.object.parent?.userData.category;if(category)focusCategory(category)}
}
const categoryAngles={motion:0,product:-Math.PI*2/3,worlds:-Math.PI*4/3};
const portal = document.querySelector('.carousel-reveal');
const portalData = {
  motion:{index:'HORSE 01 / MOTION',title:'THE MOTION<br>ARCHIVE',copy:'4条点点互动投放视频与1组动态视觉作品',images:['assets/game-murder.jpg','assets/white-snake.jpg']},
  product:{index:'HORSE 02 / PRODUCT',title:'THE PRODUCT<br>ARCHIVE',copy:'App、官网与品牌内容的完整视觉系统',images:['assets/emox-ui.jpg','assets/emox.jpg']},
  worlds:{index:'HORSE 03 / WORLDS',title:'THE WORLDS<br>ARCHIVE',copy:'动态环境、空间气氛与纪录影像',images:['assets/world-garden.jpg','assets/stage.jpg']}
};
function openPortal(category){
  const data=portalData[category];
  portal.querySelector('.reveal-index').textContent=data.index;
  portal.querySelector('h2').innerHTML=data.title;
  portal.querySelector('.reveal-copy').textContent=data.copy;
  portal.querySelectorAll('.reveal-thumbs img').forEach((img,i)=>img.src=data.images[i]);
  portal.dataset.category=category;portal.setAttribute('aria-hidden','false');hero.classList.add('portal-open');
}
function closePortal(){
  activeCategory='';portal.setAttribute('aria-hidden','true');hero.classList.remove('portal-open');
  document.querySelectorAll('[data-focus]').forEach(b=>b.classList.remove('active'));
}
function focusCategory(category){
  activeCategory=category;targetRotation=categoryAngles[category]+.18;
  document.querySelectorAll('[data-focus]').forEach(b=>b.classList.toggle('active',b.dataset.focus===category));
  openPortal(category);
}
document.querySelectorAll('[data-focus]').forEach(button=>button.addEventListener('click',()=>focusCategory(button.dataset.focus)));
portal.querySelector('.reveal-close').addEventListener('click',closePortal);
portal.querySelector('.reveal-enter').addEventListener('click',()=>{const category=portal.dataset.category;setFilter(category);document.querySelector('#work').scrollIntoView({behavior:'smooth'})});
document.querySelector('.archive-plaque').addEventListener('click',()=>document.querySelector('#archive').scrollIntoView({behavior:'smooth'}));

const clock=new THREE.Clock();
function render(){
  const dt=Math.min(clock.getDelta(),.04);
  if(!dragging&&!activeCategory&&!prefersReducedMotion)targetRotation+=dt*.13;
  if(!dragging){targetRotation+=velocity;velocity*=.93}
  carousel.rotation.y+=(targetRotation-carousel.rotation.y)*.075;
  const compact=innerWidth<700;
  const targetX=activeCategory&&!compact?-.72:0;
  carousel.position.x+=(targetX-carousel.position.x)*.07;
  carousel.position.y=Math.sin(clock.elapsedTime*1.2)*.025;
  camera.position.z+=((activeCategory?10.45:11.6)-camera.position.z)*.06;
  Object.entries(horseGroups).forEach(([key,horse])=>{
    const lift=activeCategory===key ? .34 : 0;
    horse.position.y+=(2.05+lift-horse.position.y)*.09;
    horse.rotation.z+=((activeCategory===key?-.015:-.08)-horse.rotation.z)*.08;
  });
  renderer.render(scene,camera);requestAnimationFrame(render);
}
loading.style.opacity='0';setTimeout(()=>loading.remove(),550);render();

document.querySelectorAll('.floating-tag').forEach(tag=>{
  let drag=false,sx=0,sy=0,ox=0,oy=0;
  tag.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX;sy=e.clientY;ox=parseFloat(tag.dataset.x||0);oy=parseFloat(tag.dataset.y||0);tag.setPointerCapture(e.pointerId)});
  tag.addEventListener('pointermove',e=>{if(!drag)return;const x=Math.max(-90,Math.min(90,ox+e.clientX-sx));const y=Math.max(-70,Math.min(70,oy+e.clientY-sy));tag.dataset.x=x;tag.dataset.y=y;tag.style.translate=`${x}px ${y}px`});
  tag.addEventListener('pointerup',()=>drag=false);tag.addEventListener('pointercancel',()=>drag=false);
});

const filterButtons=[...document.querySelectorAll('[data-filter]')];
function setFilter(filter){
  filterButtons.forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));
  document.querySelectorAll('.project').forEach(card=>card.classList.toggle('hidden',filter!=='all'&&card.dataset.category!==filter));
}
filterButtons.forEach(button=>button.addEventListener('click',()=>setFilter(button.dataset.filter)));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const dialog=document.querySelector('.lightbox'), dialogImage=dialog.querySelector('img'), dialogVideo=dialog.querySelector('video'), dialogCaption=dialog.querySelector(':scope > p');
document.querySelectorAll('[data-image],[data-video]').forEach(trigger=>trigger.addEventListener('click',()=>{
  const isVideo=Boolean(trigger.dataset.video);dialogCaption.textContent=trigger.dataset.caption||'';dialogImage.hidden=isVideo;dialogVideo.hidden=!isVideo;
  if(isVideo){dialogVideo.poster=trigger.dataset.poster||'';dialogVideo.src=trigger.dataset.video;dialogVideo.play().catch(()=>{})}else{dialogImage.src=trigger.dataset.image;dialogImage.alt=trigger.dataset.caption||'作品图片预览'}
  dialog.showModal();
}));
function closeDialog(){dialogVideo.pause();dialogVideo.removeAttribute('src');dialogVideo.load();dialog.close()}
dialog.querySelector('.lightbox-close').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()});
