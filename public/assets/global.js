
(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var eur=function(n,d){return n.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})+' €'};

  /* fond nuit par défaut, fond clair au choix */
  var thm=document.createElement('button');
  function setTheme(light){
    if(light){root.setAttribute('data-egi','light')}else{root.removeAttribute('data-egi')}
    thm.setAttribute('aria-label',light?'Passer en fond nuit':'Passer en fond clair');
  }
  
  thm.addEventListener('click',function(){
    var light=root.getAttribute('data-egi')!=='light';
    setTheme(light);
    try{localStorage.setItem('egi-theme',light?'light':'dark')}catch(e){}
  });

  /* bandeau du menu : noir sur les sections nuit, blanc sur les sections claires */
  var navEl=$('.nav'), bands=$$('.hero,.phead,.rhero,.proof,main > .sec,footer'), navTick=false;
  function majNav(){
    navTick=false;
    var y=navEl.getBoundingClientRect().bottom, cur=bands[0];
    for(var i=0;i<bands.length;i++){var r=bands[i].getBoundingClientRect();if(r.top<=y){cur=bands[i]}else{break}}
    var lite=cur.classList.contains('lite')||(root.getAttribute('data-egi')==='light'&&!cur.classList.contains('hero'));
    navEl.classList.toggle('onlite',lite);
  }
  function demNav(){majNav()}
  window.addEventListener('scroll',demNav,{passive:true});window.addEventListener('resize',demNav);
  thm.addEventListener('click',demNav);majNav();

  /* menu mobile */
  var burger=$('#burger'), mnav=$('#mnav');
  if(burger&&mnav){burger.addEventListener('click',function(){var o=mnav.hidden;mnav.hidden=!o;burger.setAttribute('aria-expanded',o?'true':'false')})}

  try{
  /* héros : les objets suivent le pointeur, chacun à sa profondeur */
  var scene=$('#scene');
  if(scene&&!reduce){
    var pars=$$('.par',scene);
    scene.parentElement.addEventListener('pointermove',function(e){
      var r=scene.getBoundingClientRect();
      var x=(e.clientX-(r.left+r.width/2))/r.width, y=(e.clientY-(r.top+r.height/2))/r.height;
      pars.forEach(function(p){var d=+p.getAttribute('data-d');p.style.transform='translate3d('+(x*d).toFixed(1)+'px,'+(y*d).toFixed(1)+'px,0)'});
    });
    scene.parentElement.addEventListener('pointerleave',function(){pars.forEach(function(p){p.style.transform=''})});
  }

  }catch(e){}
  try{
  /* trois moments : le point lumineux passe d'une carte à l'autre */
  var cards=$$('#flow .mcard'), track=$('#track'), cur=1, timer=null;
  var pts=$$('#track li');
  function setMoment(s){cur=s;track.style.setProperty('--s',s);pts.forEach(function(li,i){li.classList.toggle('on',i<=s)});cards.forEach(function(c,i){c.setAttribute('aria-pressed',i===s?'true':'false')})}
  function play(){stop();if(reduce)return;timer=setInterval(function(){setMoment((cur+1)%3)},3200)}
  function stop(){if(timer){clearInterval(timer);timer=null}}
  cards.forEach(function(c,i){c.addEventListener('click',function(){stop();setMoment(i)})});
  var flow=$('#flow');
  flow.addEventListener('pointerenter',stop);flow.addEventListener('pointerleave',play);
  flow.addEventListener('focusin',stop);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){es[0].isIntersecting?play():stop()},{threshold:.3}).observe(flow);
  }
  }catch(e){}
  try{
  /* mur de ventes : trois colonnes, la liste doublée pour boucler sans saut */
  var TX=[
    ['Utilitaire Renault Master','24 500,00 €','Garage, Lyon','gn','En sécurité'],
    ['Extension de maison','42 000,00 €','Maçonnerie, Tours','gn','En sécurité'],
    ['Huile sur toile signée','18 000,00 €','Galerie, Bordeaux','warn','En attente'],
    ['Tracteur John Deere','68 000,00 €','Concession, Auch','gn','En sécurité'],
    ['Cuisine sur mesure','18 400,00 €','Menuiserie, Nantes','ok','Payée'],
    ['Montre de collection','15 000,00 €','Horloger, Paris','gn','En sécurité'],
    ['Lot de 40 palettes','9 800,00 €','Négoce, Lille','ok','Payée'],
    ['Mini-pelle 2,5 t','31 200,00 €','Matériel TP, Rouen','gn','En sécurité'],
    ['Camping-car profilé','62 000,00 €','Concession, Annecy','warn','En attente'],
    ['Serveurs reconditionnés','12 600,00 €','Informatique, Rennes','gn','En sécurité'],
    ['Piscine coque 8 m','29 900,00 €','Pisciniste, Aix','gn','En sécurité'],
    ['Séminaire 120 couverts','12 000,00 €','Traiteur, Dijon','ok','Payée'],
    ['Commode Louis XV','7 400,00 €','Antiquaire, Lyon','gn','En sécurité'],
    ['Fonds de commerce','180 000,00 €','Cession, Bourges','warn','En attente'],
    ['Remorque porte-engins','14 300,00 €','Négoce, Metz','gn','En sécurité'],
    ['Bague diamant 1,2 ct','11 200,00 €','Joaillier, Cannes','gn','En sécurité'],
    ['Semi-remorque frigo','38 500,00 €','Transport, Le Havre','ok','Payée'],
    ['Verrière d\'atelier','8 900,00 €','Métallier, Angers','gn','En sécurité']
  ];
  var wall=$('#wall');
  function txCard(t){
    var c=document.createElement('div');c.className='txc';
    var a=document.createElement('div'),b=document.createElement('div');
    [['o',t[0]],['m mono tab',t[1]]].forEach(function(x){var s=document.createElement('span');s.className=x[0];s.textContent=x[1];a.appendChild(s)});
    var w=document.createElement('span');w.className='w';w.textContent=t[2];
    var g=document.createElement('span');g.className='bdg '+t[3];g.textContent=t[4];
    b.appendChild(w);b.appendChild(g);c.appendChild(a);c.appendChild(b);return c;
  }
  if(wall){['','b','c'].forEach(function(k,ci){
    var col=document.createElement('div');col.className='wcol '+k;
    var list=TX.slice(ci*6).concat(TX.slice(0,ci*6));
    list.concat(list).forEach(function(t){col.appendChild(txCard(t))});
    wall.appendChild(col);
  })}

  }catch(e){}
  try{
  /* cas d'usage : cartes photo, défilement continu, suspendu seulement pendant un glisser au doigt ou une navigation clavier */
  var METIERS=[
    ['btp','BTP et artisans','Chantiers, rénovation, gros œuvre','Réception des travaux','Deux artisans casqués sur un chantier'],
    ['veh','Véhicules d\'occasion','Garages, marchands, concessions','Remise des clés et de la carte grise','Une clé de voiture passe d\'une main à l\'autre'],
    ['art','Art et antiquités','Galeries, antiquaires, marchands','Livraison et contrôle d\'état','Salle de galerie aux murs couverts de tableaux'],
    ['agri','Engins et agricole','Tracteurs, TP, matériel d\'occasion','Livraison et mise en route','Tracteur au travail dans un champ'],
    ['ind','Industrie et équipement','Équipementiers, négoce, grossistes','Réception de la commande','Ligne de machines dans une usine'],
    ['cuis','Cuisines et sur-mesure','Menuiserie, agencement, piscines','Pose et réception','Menuisier traçant une pièce de bois'],
    ['montre','Montres et bijoux','Horlogers, joailliers, revente','Réception et vérification','Montre mécanique posée sur une table'],
    ['bat','Bateaux et camping-cars','Concessions, courtiers','Remise du bien et des papiers','Voiliers amarrés dans un port'],
    ['even','Événementiel','Salles, traiteurs, organisateurs','Tenue de l\'événement','Salle de réception dressée pour un dîner'],
    ['comm','Cession de fonds','Commerces, PME, parts sociales','Signature et transfert effectif','Intérieur d\'une boutique'],
    ['ecom','E-commerce','Boutiques en ligne, toutes commandes','Réception du colis','Deux personnes dans un entrepôt de préparation'],
    ['dev','Marketplaces et API','Plateformes qui intègrent Egicore','Selon vos propres règles','Écran affichant du code']
  ];
  var MET={"btp": "metier-btp.html", "veh": "metier-vehicules.html", "ind": "metier-industrie.html", "ecom": "metier-e-commerce.html", "art": "metier-art.html", "agri": "metier-agricole.html", "cuis": "metier-sur-mesure.html", "montre": "metier-montres.html", "bat": "metier-bateaux.html", "even": "metier-evenementiel.html", "comm": "metier-commerce.html", "dev": "metier-numerique.html"};
  var tick=$('#tick'), tickList=$('#tickList');
  function phCard(m,dup){
    var li=document.createElement('li');if(dup){li.setAttribute('aria-hidden','true')}
    var a=document.createElement('a');a.className='ph';a.href=MET[m[0]]||'cas-usage.html';if(dup){a.tabIndex=-1}
    var img=document.createElement('img');img.src='obj/ph-'+m[0]+'.webp';img.width=760;img.height=475;img.loading='lazy';img.alt=dup?'':m[4];
    var tx=document.createElement('div');tx.className='tx';
    var h=document.createElement('h3');h.textContent=m[1];
    tx.appendChild(h);a.appendChild(img);a.appendChild(tx);li.appendChild(a);return li;
  }
  if(tick&&tickList){
    METIERS.forEach(function(m){tickList.appendChild(phCard(m,false))});
    if(!reduce){
      METIERS.forEach(function(m){tickList.appendChild(phCard(m,true))});
      var tItems=tickList.children, tHold=false, tView=false, tLast=0, tAcc=0, tRun=false, tTimer=null;
      var tStep=function(now){
        if(!tRun)return;
        var dt=Math.min(.1,(now-tLast)/1000);tLast=now;
        if(!tHold){
          tAcc+=dt*38;var px=Math.floor(tAcc);
          if(px>0){tAcc-=px;var half=tItems[METIERS.length].offsetLeft-tItems[0].offsetLeft;
            var x=tick.scrollLeft+px;if(x>=half){x-=half}tick.scrollLeft=x}
        }
        requestAnimationFrame(tStep);
      };
      var tSync=function(){var want=tView&&!document.hidden;if(want&&!tRun){tRun=true;tLast=performance.now();requestAnimationFrame(tStep)}else if(!want){tRun=false}};
      var hold=function(){tHold=true;if(tTimer){clearTimeout(tTimer);tTimer=null}};
      var release=function(d){if(tTimer){clearTimeout(tTimer)}tTimer=setTimeout(function(){tHold=false},d)};
      tick.addEventListener('touchstart',hold,{passive:true});tick.addEventListener('touchend',function(){release(2500)});
      tick.addEventListener('focusin',hold);tick.addEventListener('focusout',function(){release(200)});
      if('IntersectionObserver' in window){new IntersectionObserver(function(es){tView=es[0].isIntersecting;tSync()}).observe(tick)}else{tView=true}
      document.addEventListener('visibilitychange',tSync);tSync();
    }
  }

  }catch(e){}
  try{
  /* créer une vente : six écrans */
  var ecrans=[
    {t:'Client',h:'Vous choisissez un client existant ou vous en créez un.',r:[['Raison sociale','SCI Loiret'],['SIRET','882 310 456 00017',1],['Contact','Achats, e-mail vérifié']]},
    {t:'Solvabilité',h:'Le score se lit en un coup d\'œil.',r:[['Score','79 / 100',1],['Risque','Faible risque']]},
    {t:'Détails',h:'Ce que vous vendez, et quand vous livrez.',r:[['Intitulé','Cuisine sur mesure'],['Devis','DEV-2026-09-162.pdf',1],['Livraison prévue','19 septembre 2026']]},
    {t:'Paiement',h:'La répartition entre ce que vous touchez tout de suite et ce qui attend.',r:[['Total TTC','14 000,00 €',1],['Acompte, 40 %','5 600,00 €',1],['Gardé en sécurité jusqu\'à la livraison','8 400,00 €',1],['Mode','Pay by Bank']]},
    {t:'Votre prix',h:'Les frais appliqués à cette vente, selon votre abonnement.',r:[['Votre abonnement','Egiplus, 49 € par mois, 0,9 % par vente'],['Frais Egicore','126,00 €',1],['Payée par','Le vendeur']]},
    {t:'Récapitulatif',h:'Vous relisez, puis vous envoyez le lien de paiement à votre client.',r:[['Client','SCI Loiret'],['Total TTC','14 000,00 €',1],['Net versé','13 874,00 €',1],['Libération','À la livraison']]}
  ];
  var wsteps=$('#wsteps'), wiz=$('#wiz'), wi=0;
  ecrans.forEach(function(e,i){
    var b=document.createElement('button');b.type='button';b.className='wst';b.setAttribute('role','tab');b.id='wst'+i;
    var em=document.createElement('em');em.textContent=i+1;b.appendChild(em);var lb=document.createElement('span');lb.className='lb';lb.textContent=e.t;b.appendChild(lb);b.setAttribute('aria-label','Écran '+(i+1)+', '+e.t);
    b.addEventListener('click',function(){setEcran(i)});wsteps.appendChild(b);
  });
  function setEcran(i){
    wi=i;var e=ecrans[i];
    $$('.wst',wsteps).forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false');b.classList.toggle('done',j<i)});
    $('#wtitle').textContent=e.t;$('#whint').textContent=e.h;
    var rows=$('#wrows');rows.textContent='';
    e.r.slice(0,2).forEach(function(r,j){
      var d=document.createElement('div');d.className='row';
      var k=document.createElement('span');k.className='k';k.textContent=r[0];
      var v=document.createElement('span');v.className='v'+(r[2]?' mono tab':'');v.textContent=r[1];
      d.appendChild(k);d.appendChild(v);rows.appendChild(d);
    });
    $('#wcnt').textContent='Écran '+(i+1)+' sur 6';
    $('#wnext').textContent=i===5?'Revenir au premier écran':'Écran suivant';
    wiz.style.setProperty('--w',i+1);$('#gears').style.setProperty('--w',i+1);
  }
  $('#wnext').addEventListener('click',function(){setEcran((wi+1)%6)});
  setEcran(0);

  }catch(e){}
  try{
  /* téléphone : l'écran suit le pointeur */
  var phone=$('#phone');
  if(phone&&!reduce){
    phone.addEventListener('pointermove',function(e){
      var r=phone.getBoundingClientRect();
      phone.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*34).toFixed(1)+'deg');
      phone.style.setProperty('--rx',((.5-(e.clientY-r.top)/r.height)*22).toFixed(1)+'deg');
    });
    phone.addEventListener('pointerleave',function(){phone.style.removeProperty('--ry');phone.style.removeProperty('--rx')});
  }

  }catch(e){}
  try{
  /* sept jours : le sablier se retourne à mesure que la section défile */
  var sj=$('#sept-jours'), days=$$('#days li');
  if(!sj){throw 0}
  function majJours(){
    var r=sj.getBoundingClientRect(), vh=window.innerHeight;
    var p=Math.max(0,Math.min(1,(vh*.85-r.top)/(r.height*.75)));
    sj.style.setProperty('--p',p.toFixed(3));
    days.forEach(function(li,i){li.classList.toggle('on',p>=i/(days.length-1)-.01)});
  }
  if(!reduce){window.addEventListener('scroll',majJours,{passive:true});window.addEventListener('resize',majJours);majJours()}
  else{days.forEach(function(li){li.classList.add('on')})}

  }catch(e){}
  try{
  /* tarifs : la pièce tourne à chaque changement */
  var plans=$$('#plans .plan'), rate=1.5, pname='Pro', qui='v', flip=0, sim=$('#sim'), montant=$('#montant');
  function calc(){
    var m=+montant.value, f=m*rate/100, a=m, v=m-f;
    if(qui==='a'){a=m+f;v=m}else if(qui==='p'){a=m+f/2;v=m-f/2}
    $('#montantOut').textContent=eur(m,0);
    $('#rA').textContent=eur(a,2);$('#rF').textContent=eur(f,2);$('#rV').textContent=eur(v,2);
    $('#rFk').textContent='Frais Egicore, formule '+pname;
  }
  function spin(){flip++;sim.style.setProperty('--flip',flip)}
  plans.forEach(function(p){p.addEventListener('click',function(){
    plans.forEach(function(o){o.setAttribute('aria-checked',o===p?'true':'false')});
    rate=+p.getAttribute('data-rate');pname=p.getAttribute('data-name');calc();spin();
  })});
  $$('#qui button').forEach(function(b){b.addEventListener('click',function(){
    $$('#qui button').forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
    qui=b.getAttribute('data-q');calc();spin();
  })});
  montant.addEventListener('input',calc);montant.addEventListener('change',spin);
  calc();

  }catch(e){}
  try{
  /* menus déroulants */
  $$('.dd').forEach(function(dd){
    var btn=$('.ddbtn',dd), menu=$('.ddmenu',dd), items=$$('li',menu);
    function open(){menu.hidden=false;btn.setAttribute('aria-expanded','true');(($('li[aria-selected="true"]',menu))||items[0]).focus()}
    function close(f){menu.hidden=true;btn.setAttribute('aria-expanded','false');if(f){btn.focus()}}
    function pick(li){items.forEach(function(o){o.setAttribute('aria-selected',o===li?'true':'false')});$('span',btn).textContent=li.textContent;close(true)}
    btn.addEventListener('click',function(){menu.hidden?open():close(false)});
    btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open()}});
    items.forEach(function(li,i){
      li.addEventListener('click',function(){pick(li)});
      li.addEventListener('keydown',function(e){
        if(e.key==='ArrowDown'){e.preventDefault();items[Math.min(items.length-1,i+1)].focus()}
        else if(e.key==='ArrowUp'){e.preventDefault();items[Math.max(0,i-1)].focus()}
        else if(e.key==='Home'){e.preventDefault();items[0].focus()}
        else if(e.key==='End'){e.preventDefault();items[items.length-1].focus()}
        else if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(li)}
        else if(e.key==='Escape'){e.preventDefault();close(true)}
        else if(e.key==='Tab'){close(false)}
      });
    });
    document.addEventListener('pointerdown',function(e){if(!menu.hidden&&!dd.contains(e.target)){close(false)}});
  });

  }catch(e){}
  try{
  /* inscription : la maquette n'envoie rien */
  $('#form').addEventListener('submit',function(e){
    e.preventDefault();
    var em=$('#email'), msg=$('#fmsg');
    if(!em.value||!em.checkValidity()){msg.textContent='Indiquez une adresse e-mail valide, par exemple vous@entreprise.fr.';em.focus();return}
    window.egicoreEnvoyer(this, msg);
  });

  }catch(e){}
  try{
  /* apparitions et tampon */
  if('IntersectionObserver' in window&&!reduce){
    root.classList.add('js');
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px 25% 0px'});
    $$('.rv').forEach(function(el){io.observe(el)});
    io.observe($('#stamp'));
  }

  }catch(e){}
})();
