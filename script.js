/* script.js — shared across pages
   - simple localStorage persistence
   - products array
   - page-specific renderers based on body data-page
*/

// --------------------- PRODUCTS ---------------------
const PRODUCTS = [
    { id: "p1", sku: "SS-001", name: "Wireless Earbuds", price: 29.99, desc: "Compact true-wireless earbuds, 24h with case.", img: "https://cdn.thewirecutter.com/wp-content/media/2025/01/BEST-WIRELESS-BLUETOOTH-EARBUDS-2048px-5969-2x1-1.jpg?width=2048&quality=75&crop=2:1&auto=webp" },
    { id: "p2", sku: "SS-002", name: "Smart Watch", price: 59.99, desc: "Fitness tracking and notifications.", img: "https://gourban.in/cdn/shop/files/Pulse.jpg?v=1749553994&width=2048" },
    { id: "p3", sku: "SS-003", name: "Gaming Mouse", price: 19.99, desc: "Ergonomic mouse with RGB lighting.", img: "https://arcticfox.com/cdn/shop/files/1_f87f08be-bf1b-4065-ae81-21d7c1ad0f69.jpg?v=1699270558" },
    { id: "p4", sku: "SS-004", name: "Bluetooth Speaker", price: 39.99, desc: "Portable speaker, water resistant.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmtG64CrgLgMALj1LNuCJDo0ZZ0fGIUTHBEA&s" },
    { id: "p5", sku: "SS-005", name: "Laptop Stand", price: 24.99, desc: "Foldable aluminum laptop stand.", img: "https://symplify.in/cdn/shop/products/Wooden-Laptop-Stand-Opt3-3.jpg?v=1658253933" },
    { id: "p6", sku: "SS-006", name: "Mechanical Keyboard", price: 49.99, desc: "Tactile switches, compact layout.", img: "https://hips.hearstapps.com/hmg-prod/images/pop-mechanical-keyboards-64e4ce5645fe9.jpg" },
    { id: "p7", sku: "SS-007", name: "Phone Tripod", price: 14.99, desc: "Lightweight tripod for vlogging.", img: "https://m.media-amazon.com/images/I/619wqJs2bCL.jpg" },
    { id: "p8", sku: "SS-008", name: "USB-C Hub", price: 34.99, desc: "Multiport hub with HDMI & 3xUSB-A.", img: "https://images-eu.ssl-images-amazon.com/images/I/61r1wRm4mUL._AC_UL210_SR210,210_.jpg" },
    { id: "p9", sku: "SS-009", name: "Portable Charger", price: 22.99, desc: "10,000mAh fast-charge powerbank.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTka65QfI0CmIvk_ZwRKwQPc45jWrmBSiGaNQ&s" },
    { id: "p10", sku: "SS-010", name: "Noise Cancelling Headphones", price: 89.99, desc: "Over-ear ANC headphones.", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=6d3b4b1d1a2f5a5d6c1b2a3f6d9e7c4b" }
  ];
  
  // --------------------- STORAGE HELPERS ---------------------
  const DB = {
    getCart(){ return JSON.parse(localStorage.getItem('ss_cart')||'[]') },
    setCart(c){ localStorage.setItem('ss_cart', JSON.stringify(c)) },
    addToCart(id, qty=1){
      const cart = DB.getCart();
      const found = cart.find(i=>i.id===id);
      if(found) found.qty = Math.min(99, found.qty + qty);
      else cart.push({ id, qty });
      DB.setCart(cart);
    },
    removeFromCart(id){
      let cart = DB.getCart().filter(i=>i.id!==id);
      DB.setCart(cart);
    },
    updateQty(id, qty){
      const cart = DB.getCart();
      const it = cart.find(i=>i.id===id);
      if(it){ it.qty = Math.max(1, qty); DB.setCart(cart); }
    },
    clearCart(){ localStorage.removeItem('ss_cart') },
  
    getUser(){ return JSON.parse(localStorage.getItem('ss_user')||'null') },
    setUser(u){ localStorage.setItem('ss_user', JSON.stringify(u)) },
    logout(){ localStorage.removeItem('ss_user') },
  
    getUsers(){ return JSON.parse(localStorage.getItem('ss_users')||'[]') },
    saveUser(u){ const users = DB.getUsers(); users.push(u); localStorage.setItem('ss_users', JSON.stringify(users)) },
  
    getShipping(){ return JSON.parse(localStorage.getItem('ss_shipping')||'null') },
    setShipping(s){ localStorage.setItem('ss_shipping', JSON.stringify(s)) },
  
    saveOrder(order){
      const orders = JSON.parse(localStorage.getItem('ss_orders')||'[]');
      orders.push(order);
      localStorage.setItem('ss_orders', JSON.stringify(orders));
    }
  };
  
  // --------------------- UTIL ---------------------
  function $id(id){ return document.getElementById(id) }
  function q(sel){ return document.querySelector(sel) }
  function qs(sel){ return Array.from(document.querySelectorAll(sel)) }
  function currency(n){ return Number(n).toFixed(2) }
  
  function updateCartCountUI(){
    const cartLink = q('#cart-link');
    if(!cartLink) return;
    const count = DB.getCart().reduce((s,i)=>s+i.qty,0);
    cartLink.textContent = `Cart (${count})`;
  }
  function updateAuthUI(){
    const a = q('#auth-link');
    const user = DB.getUser();
    if(!a) return;
    if(user){ a.textContent = `Hi, ${user.name}`; a.href = '#'; a.addEventListener('click', (e)=>{ e.preventDefault(); if(confirm('Logout?')){ DB.logout(); location.href='index.html' }}) }
    else { a.textContent = 'Login'; a.href = 'login.html' }
  }
  
  // --------------------- RENDERERS ---------------------
  document.addEventListener('DOMContentLoaded', ()=>{
    updateCartCountUI();
    updateAuthUI();
    // header search binds on all pages
    const searchInput = q('#search-input');
    if(searchInput){
      searchInput.addEventListener('input', (e)=>{
        const page = document.body.dataset.page;
        const qv = e.target.value.trim().toLowerCase();
        if(page === 'home') renderProductGrid(filterProducts(qv));
        else { /* on other pages, just keep search value and redirect */ }
      });
    }
  
    const page = document.body.dataset.page;
    if(page === 'home') initHome();
    if(page === 'product') initProductPage();
    if(page === 'cart') initCart();
    if(page === 'shipping') initShipping();
    if(page === 'payment') initPayment();
    if(page === 'contact') initContact();
    if(page === 'login') initLogin();
    if(page === 'signup') initSignup();
  });
  
  // ---- FILTER HELP ----
  function filterProducts(qv){
    if(!qv) return PRODUCTS;
    return PRODUCTS.filter(p => (p.name + ' ' + p.desc + ' ' + p.sku).toLowerCase().includes(qv));
  }
  
  // ---- HOME ----
  function initHome(){
    renderProductGrid(PRODUCTS);
  }
  function renderProductGrid(list){
    const grid = $id('product-grid');
    if(!grid) return;
    grid.innerHTML = '';
    list.forEach(p=>{
      const el = document.createElement('article');
      el.className = 'product card';
      el.innerHTML = `
        <div class="product-media">
          <img src="${p.img}" alt="${escapeHtml(p.name)}"/>
        </div>
        <div class="product-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div class="product-title">${escapeHtml(p.name)}</div>
              <div class="small muted">${escapeHtml(p.sku)}</div>
            </div>
            <div class="price">$${currency(p.price)}</div>
          </div>
          <p class="product-desc">${escapeHtml(p.desc)}</p>
          <div class="product-actions">
            <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
            <button class="btn ghost" data-add="${p.id}">Add</button>
            <button class="btn secondary" data-buy="${p.id}">Buy</button>
          </div>
        </div>
      `;
      grid.appendChild(el);
    });
  
    // attach buttons
    qs('[data-add]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-add'); DB.addToCart(id,1); updateCartCountUI(); b.textContent = 'Added ✓'; setTimeout(()=> b.textContent = 'Add', 700);
    }));
    qs('[data-buy]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-buy'); DB.addToCart(id,1); updateCartCountUI();
      // go to shipping if logged in else to login
      if(DB.getCart().length === 0) { alert('Cart empty') }
      else {
        // if user not logged in prompt login, otherwise go to shipping
        if(!DB.getUser()){ if(confirm('You need to login to checkout. Go to Login?')) location.href='login.html' }
        else location.href = 'shipping.html';
      }
    }));
  }
  
  // ---- PRODUCT PAGE ----
  function initProductPage(){
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const p = PRODUCTS.find(x=>x.id===id);
    const container = $id('product-detail');
    if(!container) return;
    if(!p){ container.innerHTML = '<div class="card">Product not found. <a href="index.html">Back</a></div>'; return; }
  
    container.innerHTML = `
      <div class="card">
        <div class="product-media" style="height:360px"><img src="${p.img}" alt="${escapeHtml(p.name)}"/></div>
      </div>
      <div class="card">
        <div class="small muted">${escapeHtml(p.sku)}</div>
        <h2 style="margin:6px 0">${escapeHtml(p.name)}</h2>
        <div class="price">$${currency(p.price)}</div>
        <p class="muted small">${escapeHtml(p.desc)}</p>
  
        <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
          <input id="qty" type="number" value="1" min="1" style="width:88px;padding:8px;border-radius:8px;border:1px solid #e6eef9" />
          <button class="btn" id="add-to-cart">Add to cart</button>
          <button class="btn secondary" id="buy-now">Buy now</button>
        </div>
  
        <div style="margin-top:12px" class="small muted">Free returns • 30 days</div>
      </div>
    `;
  
    $id('add-to-cart').addEventListener('click', ()=>{
      const qty = Math.max(1, parseInt($id('qty').value) || 1);
      DB.addToCart(p.id, qty);
      updateCartCountUI();
      $id('add-to-cart').textContent = 'Added ✓';
      setTimeout(()=> $id('add-to-cart').textContent = 'Add to cart', 700);
    });
  
    $id('buy-now').addEventListener('click', ()=>{
      const qty = Math.max(1, parseInt($id('qty').value) || 1);
      DB.addToCart(p.id, qty);
      updateCartCountUI();
      // require login
      if(!DB.getUser()){ if(confirm('You need to login to checkout. Go to Login?')) location.href='login.html' }
      else location.href = 'shipping.html';
    });
  }
  
  // ---- CART PAGE ----
  function initCart(){
    renderCartArea();
  }
  function renderCartArea(){
    const area = $id('cart-area');
    if(!area) return;
    const cart = DB.getCart();
    if(cart.length === 0){
      area.innerHTML = `<div class="card"><p>Your cart is empty. <a href="index.html">Continue shopping</a></p></div>`; return;
    }
    // Build cart UI
    let total = 0;
    area.innerHTML = '';
    cart.forEach(item=>{
      const p = PRODUCTS.find(x=>x.id===item.id);
      if(!p) return;
      const subtotal = p.price * item.qty; total += subtotal;
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <img src="${p.img}" alt="${escapeHtml(p.name)}"/>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong>${escapeHtml(p.name)}</strong>
              <div class="small muted">${escapeHtml(p.sku)}</div>
            </div>
            <div class="small">$${currency(subtotal)}</div>
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
            <div class="qty">
              <button data-dec="${p.id}">−</button>
              <span class="small">Qty <strong id="q-${p.id}">${item.qty}</strong></span>
              <button data-inc="${p.id}">+</button>
            </div>
            <button class="btn secondary" data-remove="${p.id}" style="margin-left:12px">Remove</button>
          </div>
        </div>
      `;
      area.appendChild(row);
    });
  
    const summary = document.createElement('div');
    summary.className = 'card';
    summary.innerHTML = `
      <div class="small muted">Items: ${cart.length}</div>
      <h3>Total: $${currency(total)}</h3>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn secondary" id="clear-cart">Clear cart</button>
        <button class="btn" id="checkout">Checkout</button>
      </div>
    `;
    area.appendChild(summary);
  
    // handlers
    qs('[data-inc]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-inc'); const cart = DB.getCart(); const it = cart.find(x=>x.id===id);
      if(it){ it.qty += 1; DB.setCart(cart); renderCartArea(); updateCartCountUI(); }
    }));
    qs('[data-dec]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-dec'); const cart = DB.getCart(); const it = cart.find(x=>x.id===id);
      if(it && it.qty>1){ it.qty -= 1; DB.setCart(cart); renderCartArea(); updateCartCountUI(); }
    }));
    qs('[data-remove]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-remove'); if(confirm('Remove item?')){ DB.removeFromCart(id); renderCartArea(); updateCartCountUI(); }
    }));
  
    $id('clear-cart').addEventListener('click', ()=>{ if(confirm('Clear cart?')){ DB.clearCart(); renderCartArea(); updateCartCountUI(); }});
    $id('checkout').addEventListener('click', ()=>{
      if(!DB.getUser()){ if(confirm('Login required to checkout. Go to Login?')) location.href='login.html'; return; }
      location.href = 'shipping.html';
    });
  }
  
  // ---- SHIPPING ----
  function initShipping(){
    const form = $id('shipping-form'); if(!form) return;
    const s = DB.getShipping();
    if(s){
      $id('ship-name').value = s.name || '';
      $id('ship-phone').value = s.phone || '';
      $id('ship-line1').value = s.line1 || '';
      $id('ship-line2').value = s.line2 || '';
      $id('ship-city').value = s.city || '';
      $id('ship-region').value = s.region || '';
      $id('ship-postal').value = s.postal || '';
      $id('ship-country').value = s.country || '';
    }
  
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const shipping = {
        name: $id('ship-name').value.trim(),
        phone: $id('ship-phone').value.trim(),
        line1: $id('ship-line1').value.trim(),
        line2: $id('ship-line2').value.trim(),
        city: $id('ship-city').value.trim(),
        region: $id('ship-region').value.trim(),
        postal: $id('ship-postal').value.trim(),
        country: $id('ship-country').value.trim()
      };
      DB.setShipping(shipping);
      location.href = 'payment.html';
    });
  }
  
  // ---- PAYMENT ----
  function initPayment(){
    // show order summary
    const sumEl = $id('order-summary'); if(!sumEl) return;
    const cart = DB.getCart();
    if(cart.length===0){ sumEl.innerHTML = `<div class="card small muted">Cart empty. <a href="index.html">Shop</a></div>`; return; }
    let total = 0;
    const itemsHtml = cart.map(it=>{
      const p = PRODUCTS.find(x=>x.id===it.id); const sub = p.price * it.qty; total += sub;
      return `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="small">${escapeHtml(p.name)} x${it.qty}</div><div class="small">$${currency(sub)}</div></div>`;
    }).join('');
    const shipping = DB.getShipping();
    const shippingHtml = shipping ? `<div class="small muted">Ship to: ${escapeHtml(shipping.name)}, ${escapeHtml(shipping.city)}</div>` : '';
    sumEl.innerHTML = `<div class="card"><h4 class="small">Order summary</h4>${itemsHtml}<hr style="margin:8px 0"/><div style="display:flex;justify-content:space-between"><strong>Total</strong><strong>$${currency(total)}</strong></div>${shippingHtml}</div>`;
  
    // payment form
    $id('payment-form').addEventListener('submit', (e)=>{
      e.preventDefault();
      // Mock payment validation
      // In production use PCI-compliant payment gateway
      const payment = {
        name: $id('card-name').value.trim(),
        number: $id('card-number').value.replace(/\s+/g,'').trim(),
        exp: $id('card-exp').value.trim(),
        cvc: $id('card-cvc').value.trim()
      };
      if(payment.number.length < 12){ alert('Invalid card number (demo)'); return; }
  
      // create order
      const order = {
        id: 'ORD' + Date.now(),
        created: new Date().toISOString(),
        items: DB.getCart(),
        shipping: DB.getShipping(),
        payment: { cardholder: payment.name, method: 'card (demo)' },
        total: total
      };
      DB.saveOrder(order);
      DB.clearCart();
      updateCartCountUI();
      alert('Payment successful — order placed! Order id: ' + order.id);
      location.href = 'index.html';
    });
  }
  
  // ---- CONTACT ----
  function initContact(){
    const form = $id('contact-form'); if(!form) return;
    const feedback = $id('contact-feedback');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = {
        name: $id('contact-name').value.trim(),
        email: $id('contact-email').value.trim(),
        message: $id('contact-message').value.trim(),
        at: new Date().toISOString()
      };
      console.log('Contact submitted (demo):', data);
      feedback.textContent = 'Thanks! We received your message (demo).';
      form.reset();
      setTimeout(()=> feedback.textContent = '', 3000);
    });
  }
  
  // ---- AUTH (LOCAL DEMO) ----
  function initLogin(){
    const form = $id('login-form'); if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = $id('login-email').value.trim();
      const pass = $id('login-password').value;
      const users = DB.getUsers();
      const u = users.find(x=>x.email===email && x.pass===pass);
      const msg = $id('login-msg');
      if(!u){ if(msg) msg.textContent = 'Invalid credentials (demo)'; return; }
      DB.setUser({ name: u.name, email: u.email });
      updateAuthUI();
      location.href = 'index.html';
    });
  }
  
  function initSignup(){
    const form = $id('signup-form'); if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = $id('signup-name').value.trim();
      const email = $id('signup-email').value.trim();
      const pass = $id('signup-password').value;
      const users = DB.getUsers();
      if(users.find(u=>u.email===email)){ $id('signup-msg').textContent = 'Email already registered'; return; }
      DB.saveUser({ name, email, pass });
      $id('signup-msg').textContent = 'Account created — redirecting to login...';
      setTimeout(()=> location.href = 'login.html', 900);
    });
  }
  
  // ---- UTIL FUNCTIONS ----
  function escapeHtml(str){ if(!str) return ''; return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])) }
  