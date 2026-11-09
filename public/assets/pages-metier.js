(function(){
  var x=document.getElementById('pgx');if(!x)return;
  var tabs=[].slice.call(x.querySelectorAll('.pgtab')),pans=[].slice.call(x.querySelectorAll('.pgpan'));
  var red=matchMedia('(prefers-reduced-motion: reduce)').matches,D=7000,cur=0,t0=0,run=false,auto=!red,seen=false,hover=false;
  function show(i,fromUser){
    tabs.forEach(function(t,j){t.setAttribute('aria-selected',j===i?'true':'false');t.tabIndex=j===i?0:-1;t.style.removeProperty('--p')});
    pans.forEach(function(p,j){p.hidden=j!==i;p.classList.remove('go')});
    void pans[i].offsetWidth;pans[i].classList.add('go');
    cur=i;t0=performance.now();
    if(fromUser){auto=false;tabs[i].style.setProperty('--p',1)}
  }
  function tick(now){
    if(!run)return;
    if(auto&&!hover){var k=Math.min(1,(now-t0)/D);tabs[cur].style.setProperty('--p',k.toFixed(3));if(k>=1)show((cur+1)%tabs.length)}else{t0=now-(parseFloat(tabs[cur].style.getPropertyValue('--p'))||0)*D}
    requestAnimationFrame(tick)
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(i,true);if(innerWidth<=900){t.scrollIntoView({block:'nearest',behavior:'smooth'})}});
    t.addEventListener('keydown',function(e){var k=e.key==='ArrowDown'||e.key==='ArrowRight'?1:e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:0;if(k){e.preventDefault();var n=(i+k+tabs.length)%tabs.length;show(n,true);tabs[n].focus()}});
  });
  x.addEventListener('mouseenter',function(){hover=true});x.addEventListener('mouseleave',function(){hover=false});
  show(0);if(!auto){tabs[0].style.setProperty('--p',1)}
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!run){run=true;if(!seen){seen=true;show(cur)}t0=performance.now()-(parseFloat(tabs[cur].style.getPropertyValue('--p'))||0)*D;requestAnimationFrame(tick)}else if(!v){run=false}},{threshold:.35}).observe(x)}else{tabs[0].style.setProperty('--p',1)}
})()