/* =========================================================
   Maua & More — storefront logic
   Edit SETTINGS and PRODUCTS below to customise your shop.
   ========================================================= */
const SETTINGS = {
  whatsapp: "254798653306",   // <-- your WhatsApp number, country code first, no + or spaces
  currency: "KSh",
  shopName: "Maua & More"
};

// Put photos in /images named <id>.jpg (e.g. images/classic-red.jpg). If missing, a drawn illustration shows.
const PRODUCTS = [
  { id:"classic-red",  name:"Classic Red Roses Bouquet", price:2500, cat:"Roses",     occ:["Valentine's","Anniversary","Just Because"], style:"bouquet", color:"#c4122f", wrap:"#2b2b2b", img:"images/classic-red.jpg",tag:"Best Seller" },
  { id:"pink-roses",   name:"Pink Roses Bouquet",        price:2300, cat:"Roses",     occ:["Birthday","Just Because"],                  style:"bouquet", color:"#f06292", wrap:"#f8bbd0" },
  { id:"white-roses",  name:"White Roses Bouquet",       price:2400, cat:"Roses",     occ:["Wedding","Anniversary"],                    style:"bouquet", color:"#fff8ef", wrap:"#f1e4da" },
  { id:"mixed-roses",  name:"Mixed Roses Bouquet",       price:2700, cat:"Roses",     occ:["Birthday","Anniversary"],                   style:"bouquet", color:"#e8476b", wrap:"#f7a8c0", mix:true },
  { id:"rose-box",     name:"Rose Box (Premium)",        price:3500, cat:"Gift Boxes",occ:["Valentine's","Anniversary"],                style:"box",     color:"#c4122f", wrap:"#1f1f1f", tag:"Premium" },
  { id:"lavender",     name:"Lavender Roses Bouquet",    price:2800, cat:"Roses",     occ:["Birthday","Just Because"],                  style:"bouquet", color:"#b58ad6", wrap:"#d9c2ee" },
  { id:"heart-box",    name:"Heart Shape Rose Box",      price:4200, cat:"Gift Boxes",occ:["Valentine's","Anniversary","Wedding"],      style:"heart",   color:"#c4122f", wrap:"#1f1f1f", tag:"Love" },
  { id:"yellow-roses", name:"Yellow Roses Bouquet",      price:2200, cat:"Roses",     occ:["Birthday","Just Because"],                  style:"bouquet", color:"#f6c026", wrap:"#d9b68b" },
  { id:"lily-mix",     name:"Pink Lily & Rose Bouquet",  price:3200, cat:"Bouquets",  occ:["Birthday","Wedding"],                       style:"bouquet", color:"#e91e8c", wrap:"#fbc4dc", lily:true, tag:"New" },
  { id:"gift-set",     name:"Flowers + Chocolate Gift Set", price:4500, cat:"Gift Sets", occ:["Birthday","Anniversary","Valentine's"],  style:"box",     color:"#d6336c", wrap:"#7a1f45" },
  { id:"teddy-combo",  name:"Teddy & Roses Combo",       price:3900, cat:"Gift Sets", occ:["Valentine's","Birthday"],                   style:"bouquet", color:"#ff5c8a", wrap:"#ffd0df", teddy:true },
  { id:"wedding-arch", name:"Bridal Bouquet",            price:6500, cat:"Bouquets",  occ:["Wedding"],                                  style:"bouquet", color:"#ffffff", wrap:"#f4e6d6", pearl:true, tag:"Bridal" }
];

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const money = n => `${SETTINGS.currency} ${n.toLocaleString("en-KE")}`;
const store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch{} }
};
let cart = store.get("mm_cart", {});       // {id: qty}
let wish = store.get("mm_wish", []);
let activeCat = "All", activeOcc = null, query = "";

/* ---------- illustration generator (fallback when no photo) ---------- */
function shade(hex, amt){
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, v + amt));
  return "#" + [(n>>16)&255,(n>>8)&255,n&255].map(c).map(v=>v.toString(16).padStart(2,"0")).join("");
}
function rng(seed){ let s = [...seed].reduce((a,c)=>a+c.charCodeAt(0),7); return () => (s = (s*9301+49297)%233280)/233280; }

function rose(cx, cy, r, col){
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${shade(col,-25)}"/>
    <circle cx="${cx}" cy="${cy}" r="${r*.86}" fill="${col}"/>
    <path d="M${cx-r*.6} ${cy} a${r*.6} ${r*.6} 0 1 1 ${r*1.2} 0 a${r*.38} ${r*.38} 0 1 1 ${-r*.76} 0 a${r*.2} ${r*.2} 0 1 1 ${r*.4} 0" fill="none" stroke="${shade(col,-45)}" stroke-width="${r*.09}" stroke-linecap="round"/>
    <path d="M${cx-r*.7} ${cy-r*.25} q${r*.7} ${-r*.75} ${r*1.4} 0" fill="none" stroke="${shade(col,40)}" stroke-width="${r*.07}" opacity=".6" stroke-linecap="round"/>
  </g>`;
}
function leaf(x, y, rot){ return `<ellipse cx="${x}" cy="${y}" rx="9" ry="22" fill="#2f7d4f" transform="rotate(${rot} ${x} ${y})"/>`; }

function art(p){
  const r = rng(p.id), uid = "g"+p.id;
  let body = "";
  const bg = `<defs>
    <linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde7ee"/><stop offset="1" stop-color="#f7bfd0"/></linearGradient>
    <linearGradient id="${uid}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(p.wrap,25)}"/><stop offset="1" stop-color="${shade(p.wrap,-25)}"/></linearGradient>
  </defs>${p.nobg ? "" : `<rect width="300" height="300" fill="url(#${uid})"/>`}
  <ellipse cx="150" cy="278" rx="95" ry="10" fill="#000" opacity=".12"/>`;

  if (p.style === "bouquet"){
    for(let i=0;i<14;i++) body += leaf(70+r()*160, 95+r()*40, -70+r()*140);
    // wrap behind + front
    body += `<polygon points="150,285 55,120 245,120" fill="url(#${uid}w)"/>
             <polygon points="150,285 90,125 150,150" fill="${shade(p.wrap,18)}" opacity=".7"/>
             <polygon points="150,285 210,125 150,150" fill="${shade(p.wrap,-18)}" opacity=".55"/>`;
    const pos = [[150,70,30],[108,88,27],[192,88,27],[75,118,24],[225,118,24],[130,110,28],[172,110,28],[150,138,26],[100,138,22],[200,138,22],[150,100,24]];
    pos.forEach(([x,y,s],i)=>{ 
      let c = p.color;
      if (p.mix) c = ["#e8476b","#c4122f","#f48fb1","#ff7a9a"][i%4];
      body += rose(x,y,s,c);
    });
    if (p.lily){
      body += `<g transform="translate(150 95)">${[0,60,120,180,240,300].map(a=>`<ellipse cx="0" cy="-30" rx="11" ry="30" fill="#ffd1e6" stroke="#ec79b4" stroke-width="1.5" transform="rotate(${a})"/>`).join("")}<circle r="7" fill="#f3a712"/></g>`;
    }
    if (p.teddy){
      body += `<g transform="translate(232 232)"><circle r="26" fill="#c68b59"/><circle cx="-20" cy="-20" r="10" fill="#c68b59"/><circle cx="20" cy="-20" r="10" fill="#c68b59"/><ellipse cy="8" rx="11" ry="8" fill="#f1d3b3"/><circle cx="-9" cy="-6" r="3" fill="#333"/><circle cx="9" cy="-6" r="3" fill="#333"/><circle cy="3" r="3.5" fill="#333"/></g>`;
    }
    // gypsophila
    for(let i=0;i<60;i++){ const x=60+r()*180, y=70+r()*80; body += `<circle cx="${x}" cy="${y}" r="${1.8+r()*2}" fill="${p.pearl?'#fff':'#fff'}" opacity=".92"/>`; }
    // ribbon
    body += `<path d="M150 190 l-34 -18 v36z M150 190 l34 -18 v36z" fill="#d6336c"/><circle cx="150" cy="190" r="8" fill="#b01650"/>
             <path d="M146 196 l-18 55 l16 -8 l6 12z M154 196 l18 55 l-16 -8 l-6 12z" fill="#d6336c"/>`;
  }
  else if (p.style === "box"){
    body += `<rect x="45" y="150" width="210" height="110" rx="10" fill="${p.wrap}"/>
             <rect x="45" y="150" width="210" height="28" rx="8" fill="${shade(p.wrap,22)}"/>`;
    for(let row=0;row<2;row++) for(let i=0;i<6;i++){
      body += rose(70+i*32, 130+row*22, 17, p.color);
    }
    for(let i=0;i<10;i++) body += leaf(60+i*20, 118, -30+r()*60);
    body += `<rect x="140" y="150" width="20" height="110" fill="#d6336c"/><path d="M150 150 l-30 -22 v40z M150 150 l30 -22 v40z" fill="#d6336c"/><circle cx="150" cy="150" r="8" fill="#b01650"/>
             <text x="150" y="228" text-anchor="middle" font-family="Great Vibes, cursive" font-size="26" fill="#e7c36c">Just for You</text>`;
  }
  else { // heart
    body += `<path d="M150 265 C40 190 25 115 80 90 C115 75 140 95 150 118 C160 95 185 75 220 90 C275 115 260 190 150 265Z" fill="${p.wrap}"/>
             <path d="M150 248 C58 182 46 122 90 102 C118 90 140 106 150 126 C160 106 182 90 210 102 C254 122 242 182 150 248Z" fill="${shade(p.color,-40)}"/>`;
    for(let i=0;i<34;i++){ const t=r()*Math.PI*2, d=Math.sqrt(r()); const x=150+Math.cos(t)*d*78, y=140+Math.sin(t)*d*58+(Math.abs(Math.cos(t))*0); body += rose(x,y,13,p.color); }
    body += `<path d="M85 195 q65 55 130 0" fill="none" stroke="#d6336c" stroke-width="10"/>`;
  }
  return `<img src="images/hero f3.jpg" alt="${p.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
  /*return `<img src="images/${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
/* return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">${bg}${body}</svg>`; */ 
}

/* ---------- render ---------- */
function buildFilters(){
  const cats = ["All", ...new Set(PRODUCTS.map(p=>p.cat))];
  $("#filters").innerHTML = cats.map(c=>`<button class="chip ${c===activeCat&&!activeOcc?'on':''}" data-cat="${c}">${c}</button>`).join("");
}
function visible(){
  return PRODUCTS.filter(p =>
    (activeCat==="All" || p.cat===activeCat) &&
    (!activeOcc || p.occ.includes(activeOcc)) &&
    (!query || (p.name+" "+p.cat+" "+p.occ.join(" ")).toLowerCase().includes(query))
  );
}
function renderProducts(){
  const list = visible();
  $("#emptyMsg").hidden = list.length > 0;
  $("#productGrid").innerHTML = list.map(p => `
    <article class="card">
      ${p.tag?`<span class="tag">${p.tag}</span>`:""}
      <button class="heart ${wish.includes(p.id)?'on':''}" data-wish="${p.id}" aria-label="Add to wishlist">♥</button>
      <div class="img" data-img="${p.id}">${art(p)}</div>
      <div class="info">
        <h3>${p.name}</h3>
        <div class="price">${money(p.price)}</div>
        <button class="btn" data-add="${p.id}">🛒 Add to Cart</button>
      </div>
    </article>`).join("");
  // swap in real photos if they exist
  list.forEach(p=>{
    const im = new Image(); im.alt = p.name; im.loading = "lazy";
    im.onload = () => { const box = document.querySelector(`[data-img="${p.id}"]`); if(box) box.replaceChildren(im); };
    im.src = p.img || `images/${p.id}.jpg`;   // optional: img:"images/my-photo.png" in the product
  });
}

/* ---------- cart ---------- */
const count = () => Object.values(cart).reduce((a,b)=>a+b,0);
const total = () => Object.entries(cart).reduce((s,[id,q]) => s + (PRODUCTS.find(p=>p.id===id)?.price||0)*q, 0);
function saveCart(){ store.set("mm_cart", cart); renderCart(); }

function renderCart(){
  $("#cartCount").textContent = count();
  const ids = Object.keys(cart);
  $("#cartFoot").style.display = ids.length ? "grid" : "none";
  $("#subtotal").textContent = money(total());
  $("#cartItems").innerHTML = ids.length ? ids.map(id=>{
    const p = PRODUCTS.find(x=>x.id===id); if(!p) return "";
    return `<div class="line">
      <div class="thumb"><img src="${p.img || `images/${p.id}.jpg`}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML=decodeURIComponent('${encodeURIComponent(art(p))}')"></div>
      <div><h4>${p.name}</h4><div class="price">${money(p.price)}</div>
        <div class="qty"><button data-dec="${id}">−</button><span>${cart[id]}</span><button data-inc="${id}">+</button></div></div>
      <button class="rm" data-rm="${id}" aria-label="Remove">✕</button></div>`;
  }).join("") : `<div class="cart-empty"><div style="font-size:3rem">🌷</div><p>Your cart is empty.<br>Add some beautiful blooms!</p></div>`;
}
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove("show"),1800); }
function openCart(o){ $("#drawer").classList.toggle("open",o); $("#overlay").classList.toggle("open",o); }

function checkout(){
  if(!count()) return toast("Your cart is empty");
  const name=$("#custName").value.trim(), phone=$("#custPhone").value.trim(), addr=$("#custAddr").value.trim(), note=$("#custNote").value.trim();
  if(!name||!phone||!addr) return toast("Please fill in name, phone and address");
  const lines = Object.entries(cart).map(([id,q])=>{ const p=PRODUCTS.find(x=>x.id===id); return `• ${p.name} x${q} — ${money(p.price*q)}`; });
  const msg = `🌸 *New Order — ${SETTINGS.shopName}*\n\n${lines.join("\n")}\n\n*Total:* ${money(total())}\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Delivery:* ${addr}${note?`\n*Gift message:* ${note}`:""}`;
  window.open(`https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* ---------- events ---------- */
document.addEventListener("click", e=>{
  const t = e.target.closest("button, li, a"); if(!t) return;
  const d = t.dataset;
  if(d.service){ e.preventDefault(); window.open(`https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(`Hello ${SETTINGS.shopName}! I'd like to enquire about your ${d.service} service.`)}`,"_blank"); return; }
  if(d.add){ cart[d.add]=(cart[d.add]||0)+1; saveCart(); toast("Added to cart 🌸"); }
  else if(d.inc){ cart[d.inc]++; saveCart(); }
  else if(d.dec){ cart[d.dec]--; if(cart[d.dec]<=0) delete cart[d.dec]; saveCart(); }
  else if(d.rm){ delete cart[d.rm]; saveCart(); }
  else if(d.wish){ wish = wish.includes(d.wish)? wish.filter(x=>x!==d.wish) : [...wish,d.wish]; store.set("mm_wish",wish); t.classList.toggle("on"); }
  else if(d.cat){ activeCat=d.cat; activeOcc=null; buildFilters(); renderProducts(); }
  else if(d.filter){ activeOcc=d.filter; activeCat="All"; buildFilters(); renderProducts(); toast(`Showing ${d.filter} gifts`); $("#shop").scrollIntoView({behavior:"smooth"}); }
});
$("#cartBtn").onclick = () => openCart(true);
$("#closeCart").onclick = $("#overlay").onclick = () => openCart(false);
$("#checkoutBtn").onclick = checkout;
$("#menuToggle").onclick = () => $("#nav").classList.toggle("open");
$("#nav").addEventListener("click", e=>{ if(e.target.tagName==="A") $("#nav").classList.remove("open"); });
$("#searchForm").addEventListener("submit", e=>{ e.preventDefault(); query=$("#searchInput").value.trim().toLowerCase(); activeCat="All"; activeOcc=null; buildFilters(); renderProducts(); $("#shop").scrollIntoView({behavior:"smooth"}); });
$("#searchInput").addEventListener("input", e=>{ if(!e.target.value){ query=""; renderProducts(); } });
$("#contactForm").addEventListener("submit", e=>{
  e.preventDefault(); const f=new FormData(e.target);
  const msg=`Hello ${SETTINGS.shopName}! I'm ${f.get("name")} (${f.get("phone")}).\n${f.get("message")}`;
  window.open(`https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape") openCart(false); });

/* highlight nav on scroll */
const secs = ["home","shop","services","occasions","about","contact"];
addEventListener("scroll", ()=>{
  let cur="home"; secs.forEach(id=>{ const el=document.getElementById(id); if(el && el.getBoundingClientRect().top<140) cur=id; });
  document.querySelectorAll(".nav a").forEach(a=>a.classList.toggle("active", a.getAttribute("href")==="#"+cur));
},{passive:true});

/* ---------- init ---------- */
function init(){
  $("#heroArt").innerHTML = art({...PRODUCTS[0], id:"hero", wrap:"#f08aa8", nobg:true});
  $("#occArt").innerHTML  = art({...PRODUCTS[3], id:"occ"});
  const hero = $(".hero .petals");
  hero.innerHTML = Array.from({length:12},(_,i)=>`<span style="left:${Math.random()*100}%;animation-duration:${8+Math.random()*8}s;animation-delay:${-Math.random()*10}s">${["🌸","🌹","✿"][i%3]}</span>`).join("");
  const wa = `https://wa.me/${SETTINGS.whatsapp}`;
  $("#waLink").href = wa; $("#waFoot").href = wa;
  $("#yr").textContent = new Date().getFullYear();
  buildFilters(); renderProducts(); renderCart();
}
init();