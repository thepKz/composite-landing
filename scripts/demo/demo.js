(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('.public-header');
  const menu = $('.main-nav');
  const toggle = $('.menu-toggle');
  const trigger = $('.product-navigation-trigger');
  const dropdown = $('#product-navigation-list');
  function closeMenu() { menu.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Mở menu'); dropdown.hidden=true; trigger.setAttribute('aria-expanded','false'); }
  toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Đóng menu':'Mở menu');});
  trigger.addEventListener('click',()=>{dropdown.hidden=!dropdown.hidden;trigger.setAttribute('aria-expanded',String(!dropdown.hidden));});
  trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();dropdown.hidden=false;trigger.setAttribute('aria-expanded','true');$('a',dropdown)?.focus();}});
  header.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!dropdown.hidden){dropdown.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus();}else{closeMenu();toggle.focus();}}});
  $('.product-navigation').addEventListener('focusout',event=>{if(!event.currentTarget.contains(event.relatedTarget)){dropdown.hidden=true;trigger.setAttribute('aria-expanded','false');}});
  document.addEventListener('pointerdown',event=>{if(!header.contains(event.target))closeMenu();});
  $$('a',header).forEach(link=>link.addEventListener('click',closeMenu));

  if ($('.hero-studio')) {
  const studio=$('.hero-studio'), slides=$$('.studio-slide'), thumbs=$$('.studio-controls button');
  const captions=['Bể composite dạng hộp','Nhiều kiểu dáng bồn bể','Sản phẩm tại xưởng'];
  let slide=0, paused=false, inView=true;
  const play=document.createElement('button');play.className='studio-play';play.type='button';$('.studio-controls').append(play);
  function syncPlay(){play.textContent=paused?'▶':'Ⅱ';play.setAttribute('aria-label',paused?'Bật tự chuyển ảnh':'Dừng tự chuyển ảnh');play.hidden=reduced.matches;studio.dataset.running=String(!paused&&!reduced.matches&&inView&&!document.hidden);}
  function showSlide(index){slide=index;slides.forEach((el,i)=>{el.classList.toggle('is-current',i===index);el.setAttribute('aria-hidden',String(i!==index));thumbs[i].setAttribute('aria-pressed',String(i===index));});$('.studio-caption strong').textContent=captions[index];}
  thumbs.forEach((button,index)=>button.addEventListener('click',()=>{paused=true;showSlide(index);syncPlay();}));
  play.addEventListener('click',()=>{paused=!paused;syncPlay();});
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncPlay();},{threshold:.2}).observe(studio);
  setInterval(()=>{if(!paused&&!reduced.matches&&inView&&!document.hidden&&!studio.matches(':hover')&&!studio.contains(document.activeElement))showSlide((slide+1)%slides.length);},5500);
  reduced.addEventListener('change',syncPlay);document.addEventListener('visibilitychange',syncPlay);syncPlay();

  }

  if ($('.photo-lightbox')) {
  const photos=[['02','Bồn bể tại xưởng'],['06','Kiểu dáng & quy cách'],['05','Chi tiết sản phẩm'],['01','Bề mặt composite'],['08','Các mẫu bồn bể'],['03','Góc nhìn tại xưởng'],['04','Các cấu kiện bồn bể'],['07','Bể composite dạng hộp']];
  const gallery=$('.photo-lightbox');let selected=0,opener=null;
  function showPhoto(index){selected=(index+photos.length)%photos.length;const [file,label]=photos[selected];$('figure img',gallery).src=`/images/customer/customer-${file}.webp`;$('figure img',gallery).alt=label;const labels=$$('figcaption span',gallery);labels[0].textContent=label;labels[1].textContent=`${selected+1} / ${photos.length}`;}
  function openGallery(index,button){opener=button;showPhoto(index);gallery.showModal();}
  $$('.workshop-gallery button').forEach((button,index)=>button.addEventListener('click',()=>openGallery(index,button)));
  $('.gallery-more').addEventListener('click',event=>openGallery(0,event.currentTarget));
  $('.lightbox-close',gallery).addEventListener('click',()=>gallery.close());
  const controls=$$('.lightbox-controls button',gallery);controls[0].addEventListener('click',()=>showPhoto(selected-1));controls[1].addEventListener('click',()=>showPhoto(selected+1));
  gallery.addEventListener('click',event=>{if(event.target===gallery)gallery.close();});gallery.addEventListener('close',()=>opener?.focus());

  }

  $$('.inquiry-form').forEach(form => { $('button',form).disabled=false;
  form.addEventListener('submit',event=>{event.preventDefault();let result=$('.demo-form-result',form);if(!result){result=document.createElement('p');result.className='demo-form-result';result.setAttribute('role','status');form.append(result);}result.textContent='Đã hoàn tất thao tác thử. Không có thông tin nào được gửi hoặc lưu.';});

  });

  const searchForm=$('.news-filters');
  if(searchForm) searchForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const submit=$('button',searchForm);submit.disabled=true;
    const status=$('.news-result-count');status.setAttribute('role','status');
    try {
      const response=await fetch('/assets/news-search.json');
      if(!response.ok)throw new Error('search');
      const index=await response.json(), data=new FormData(searchForm);
      const term=String(data.get('q')||'').trim().toLocaleLowerCase('vi'), kind=String(data.get('kind')||'');
      const matches=index.filter(post=>(!kind||post.kind===kind)&&`${post.title} ${post.excerpt}`.toLocaleLowerCase('vi').includes(term));
      let list=$('.news-list');if(!list){list=document.createElement('div');list.className='news-list';status.after(list);}list.replaceChildren();
      matches.forEach(post=>{const article=document.createElement('article');article.className='news-card';const heading=document.createElement('h2'),link=document.createElement('a'),excerpt=document.createElement('p');link.href=post.href;link.textContent=post.title;heading.append(link);excerpt.textContent=post.excerpt;article.append(heading,excerpt);list.append(article);});
      $$('.news-layout .empty-state, .pagination').forEach(element=>element.hidden=true);
      status.textContent=matches.length?`${matches.length} bài viết phù hợp trong bản demo.`:'Không có bài viết phù hợp trong bản demo.';
      window.ScrollTrigger?.refresh();
    }catch{status.textContent='Chưa tải được danh sách. Vui lòng thử lại.';}finally{submit.disabled=false;}
  });
  if(window.gsap&&window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);publicChoreography(gsap,ScrollTrigger);window.addEventListener('load',()=>ScrollTrigger.refresh());}
})();

