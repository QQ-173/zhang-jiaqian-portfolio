const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion && matchMedia('(pointer:fine)').matches) {
  addEventListener('pointermove', (event) => {
    root.style.setProperty('--mx', `${event.clientX}px`);
    root.style.setProperty('--my', `${event.clientY}px`);
  }, { passive: true });
}

const progress = document.querySelector('.page-progress i');
function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.setProperty('--progress', `${distance > 0 ? (scrollY / distance) * 100 : 0}%`);
}
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const filterButtons = [...document.querySelectorAll('[data-filter]')];
filterButtons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle('active', item === button));
  document.querySelectorAll('.project').forEach((project) => {
    const hidden = filter !== 'all' && project.dataset.category !== filter;
    project.classList.toggle('hidden', hidden);
    if (!hidden) requestAnimationFrame(() => project.classList.add('visible'));
  });
}));

document.querySelectorAll('[data-gallery-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    const track = button.closest('.horizontal-gallery').querySelector('.gallery-track');
    track.scrollBy({ left: Number(button.dataset.galleryScroll) * track.clientWidth * .82, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
});

const gallerySets = {
  emoxInternship: [
    { src: 'assets/emox-internship-output-01.jpg', caption: 'EMOX 实习产出 · 公众号图文 / H5详情页 / B端展会内容 · 01 / 02' },
    { src: 'assets/emox-internship-output-02.jpg', caption: 'EMOX 实习产出 · AI口播视频 / 抖音心理学短视频 · 02 / 02' }
  ],
  juanjuan: [
    { src: 'assets/juanjuan-ip-01.jpg', caption: 'PawTribe · 卷卷IP设计 · 角色设定 / 三视图 / 表情与周边 · 01 / 02' },
    { src: 'assets/juanjuan-ip-02.jpg', caption: 'PawTribe · 卷卷IP设计 · 动作 / 节日装扮 / 品牌空间 · 02 / 02' }
  ],
  mood: [
    { src: 'assets/mood-01.jpg', caption: '古建空间气氛设定 · 室内生活空间 · 01 / 04' },
    { src: 'assets/mood-02.jpg', caption: '古建空间气氛设定 · 室内戏台 · 02 / 04' },
    { src: 'assets/mood-03.jpg', caption: '古建空间气氛设定 · 室外日景 · 03 / 04' },
    { src: 'assets/mood-04.jpg', caption: '古建空间气氛设定 · 室外夜景 · 04 / 04' }
  ],
  storyboard: [
    { src: 'assets/storyboard-01.png', caption: '幻想短片 · 手绘动态分镜 · 第1页 / 镜头01—05' },
    { src: 'assets/storyboard-02.png', caption: '幻想短片 · 手绘动态分镜 · 第2页 / 镜头06—09' },
    { src: 'assets/storyboard-03.png', caption: '幻想短片 · 手绘动态分镜 · 第3页 / 镜头10—14' },
    { src: 'assets/storyboard-04.png', caption: '幻想短片 · 手绘动态分镜 · 第4页 / 镜头15—19' },
    { src: 'assets/storyboard-05.png', caption: '幻想短片 · 手绘动态分镜 · 第5页 / 镜头20' }
  ]
};

const dialog = document.querySelector('.lightbox');
const dialogImage = dialog.querySelector('img');
const dialogVideo = dialog.querySelector('video');
const dialogCaption = dialog.querySelector('.lightbox-caption');
const dialogType = dialog.querySelector('.lightbox-type');
const dialogStatus = dialog.querySelector('.lightbox-status');
const dialogOpen = dialog.querySelector('.lightbox-open');
const dialogPrev = dialog.querySelector('.lightbox-prev');
const dialogNext = dialog.querySelector('.lightbox-next');
let activeGallery = null;
let activeIndex = 0;

function showDialog() {
  if (!dialog.open) dialog.showModal();
}

function resetMedia() {
  dialogVideo.pause();
  dialogVideo.removeAttribute('src');
  dialogVideo.removeAttribute('poster');
  dialogVideo.load();
  dialogImage.removeAttribute('src');
  dialogImage.hidden = true;
  dialogVideo.hidden = true;
  dialogPrev.hidden = true;
  dialogNext.hidden = true;
  dialogOpen.hidden = true;
  activeGallery = null;
}

function showGalleryImage(index) {
  const items = gallerySets[activeGallery];
  activeIndex = (index + items.length) % items.length;
  const item = items[activeIndex];
  dialogImage.src = item.src;
  dialogImage.alt = item.caption;
  dialogCaption.textContent = item.caption;
  dialogStatus.textContent = `IMAGE ${String(activeIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  dialogOpen.href = new URL(item.src, document.baseURI).href;
  dialogOpen.hidden = false;
  dialogPrev.hidden = false;
  dialogNext.hidden = false;
}

document.querySelectorAll('[data-image], [data-video], [data-gallery]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    resetMedia();
    const caption = trigger.dataset.caption || '';
    if (trigger.dataset.video) {
      dialogType.textContent = 'FULL FILM PLAYER';
      dialogStatus.textContent = `LOADING · ${trigger.dataset.duration || '--:--'}`;
      dialogCaption.textContent = caption;
      dialogVideo.hidden = false;
      dialogVideo.poster = trigger.dataset.poster || '';
      dialogVideo.src = trigger.dataset.video;
      dialogOpen.href = new URL(trigger.dataset.video, document.baseURI).href;
      dialogOpen.hidden = false;
      showDialog();
      dialogVideo.load();
      dialogVideo.play().catch(() => {});
      return;
    }
    dialogImage.hidden = false;
    if (trigger.dataset.gallery) {
      dialogType.textContent = 'IMAGE GALLERY';
      activeGallery = trigger.dataset.gallery;
      showGalleryImage(Number(trigger.dataset.galleryIndex) || 0);
    } else {
      dialogType.textContent = 'IMAGE VIEWER';
      dialogStatus.textContent = 'IMAGE PREVIEW';
      dialogCaption.textContent = caption;
      dialogImage.src = trigger.dataset.image;
      dialogImage.alt = caption || '作品图片预览';
      dialogOpen.href = new URL(trigger.dataset.image, document.baseURI).href;
      dialogOpen.hidden = false;
    }
    showDialog();
  });
});

dialogPrev.addEventListener('click', () => activeGallery && showGalleryImage(activeIndex - 1));
dialogNext.addEventListener('click', () => activeGallery && showGalleryImage(activeIndex + 1));

dialogVideo.addEventListener('loadedmetadata', () => {
  const duration = Math.round(dialogVideo.duration || 0);
  dialogStatus.textContent = `READY · ${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`;
});
dialogVideo.addEventListener('error', () => { dialogStatus.textContent = 'PLAYER ERROR · OPEN ORIGINAL'; });

function closeDialog() {
  resetMedia();
  if (dialog.open) dialog.close();
}
dialog.querySelector('.lightbox-close').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog();
});
document.addEventListener('keydown', (event) => {
  if (!dialog.open) return;
  if (event.key === 'Escape') closeDialog();
  if (activeGallery && event.key === 'ArrowLeft') showGalleryImage(activeIndex - 1);
  if (activeGallery && event.key === 'ArrowRight') showGalleryImage(activeIndex + 1);
});
