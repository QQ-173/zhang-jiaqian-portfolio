'use strict';
const pages=[...document.querySelectorAll('.folio-page')];
const pageNumber=document.querySelector('#reader-page');
const navNumber=document.querySelector('.nav-page');
const previous=document.querySelector('#previous-page');
const next=document.querySelector('#next-page');
let currentPage=0;
function setCurrent(index){currentPage=index;const label=`${String(index+1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}`;pageNumber.textContent=navNumber.textContent=label;previous.disabled=index===0;next.disabled=index===pages.length-1;}
function detectPage(){let nearest=0,distance=Infinity;pages.forEach((page,i)=>{const r=page.getBoundingClientRect();const d=Math.abs(r.top-70);if(r.top<=innerHeight*.5&&d<distance){nearest=i;distance=d;}});setCurrent(nearest);}
let scheduled=false;addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(()=>{detectPage();scheduled=false;});scheduled=true;}},{passive:true});addEventListener('resize',detectPage);setCurrent(0);detectPage();
previous.addEventListener('click',()=>pages[Math.max(0,currentPage-1)].scrollIntoView());next.addEventListener('click',()=>pages[Math.min(pages.length-1,currentPage+1)].scrollIntoView());
// Load video bytes only after an explicit play action; all films retain their full duration.
const videos=[...document.querySelectorAll('video')];
videos.forEach(video=>{const shell=video.closest('.video-shell');const cover=shell.querySelector('.play-cover');const fallback=shell.querySelector('.media-fallback');
 cover.addEventListener('click',async()=>{if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}cover.hidden=true;try{await video.play();}catch{fallback.hidden=false;cover.hidden=false;cover.querySelector('span:last-child').textContent='点击重试播放';}});
 video.addEventListener('play',()=>{cover.hidden=true;fallback.hidden=true;videos.forEach(other=>{if(other!==video)other.pause();});});
 video.addEventListener('error',()=>{fallback.hidden=false;cover.hidden=false;cover.querySelector('span:last-child').textContent='播放遇到问题 · 可打开原片';});
});
// Full-size image viewing, keyboard navigation, and native dialog focus containment.
const dialog=document.querySelector('#gallery-dialog');const image=document.querySelector('#gallery-image');const caption=document.querySelector('#gallery-caption');const original=document.querySelector('#gallery-original');const galleryPrevious=document.querySelector('#gallery-previous');const galleryNext=document.querySelector('#gallery-next');let galleryItems=[],galleryIndex=0,opener;
function showImage(index){galleryIndex=index;const item=galleryItems[index];image.src=item.dataset.src;image.alt=item.dataset.caption;caption.textContent=item.dataset.caption;original.href=item.dataset.src;galleryPrevious.disabled=index===0;galleryNext.disabled=index===galleryItems.length-1;}
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{opener=button;galleryItems=[...document.querySelectorAll(`[data-gallery="${button.dataset.gallery}"]`)];showImage(galleryItems.indexOf(button));dialog.showModal();document.body.style.overflow='hidden';}));
document.querySelector('#gallery-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true});});dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
galleryPrevious.addEventListener('click',()=>showImage(Math.max(0,galleryIndex-1)));galleryNext.addEventListener('click',()=>showImage(Math.min(galleryItems.length-1,galleryIndex+1)));dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'&&galleryIndex>0){event.preventDefault();showImage(galleryIndex-1);}if(event.key==='ArrowRight'&&galleryIndex<galleryItems.length-1){event.preventDefault();showImage(galleryIndex+1);}});
