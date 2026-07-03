// mobile menu toggle
  const toggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  toggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

  // footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // build pizza wheel slices dynamically (8 slices, alternating pepperoni pattern)
  const slicesGroup = document.getElementById('slices');
  const cx = 200, cy = 200, rOuter = 168, rInner = 40;
  const sliceCount = 8;
  const colors = ['#F6B221', '#FBCB58'];

  function polar(cx, cy, r, angleDeg){
    const a = (angleDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  for(let i=0;i<sliceCount;i++){
    const startAngle = (360/sliceCount) * i;
    const endAngle = (360/sliceCount) * (i+1);
    const [x1,y1] = polar(cx,cy,rOuter,startAngle);
    const [x2,y2] = polar(cx,cy,rOuter,endAngle);
    const [xi1,yi1] = polar(cx,cy,rInner,startAngle);
    const [xi2,yi2] = polar(cx,cy,rInner,endAngle);

    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    const d = `M ${xi1} ${yi1} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${rInner} ${rInner} 0 0 0 ${xi1} ${yi1} Z`;
    path.setAttribute('d', d);
    path.setAttribute('fill', colors[i % 2]);
    path.setAttribute('class','pizza-slice');
    path.setAttribute('stroke', '#E29A06');
    path.setAttribute('stroke-width', '1');
    slicesGroup.appendChild(path);

    const midAngle = startAngle + (360/sliceCount)/2;
    const dotPositions = [0.62, 0.8];
    dotPositions.forEach((frac, idx) => {
      const angleOffset = (idx === 0) ? -6 : 6;
      const [dx, dy] = polar(cx, cy, rOuter*frac, midAngle + angleOffset);
      const dot = document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('cx', dx);
      dot.setAttribute('cy', dy);
      dot.setAttribute('r', 9);
      dot.setAttribute('fill', '#C11F32');
      slicesGroup.appendChild(dot);
      const dot2 = document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot2.setAttribute('cx', dx);
      dot2.setAttribute('cy', dy);
      dot2.setAttribute('r', 3);
      dot2.setAttribute('fill', '#87101F');
      slicesGroup.appendChild(dot2);
    });
  }

  /* ================= CART ================= */
  const WHATS_NUMBER = '5519986018068';
  const cart = []; // {id, name, price, qty}

  function formatBRL(v){
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }
  function findItem(id){ return cart.find(i => i.id === id); }

  function addToCart(id, name, price, btn){
    const existing = findItem(id);
    if(existing){ existing.qty += 1; }
    else{ cart.push({id, name, price, qty:1}); }
    renderCart();
    showToast(name + ' adicionado ao carrinho');
    pulseFab();
    if(btn){
      btn.classList.add('added');
      setTimeout(()=> btn.classList.remove('added'), 500);
    }
  }

  function changeQty(id, delta){
    const item = findItem(id);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0){ removeItem(id); return; }
    renderCart();
  }

  function removeItem(id){
    const idx = cart.findIndex(i => i.id === id);
    if(idx > -1) cart.splice(idx,1);
    renderCart();
  }

  function clearCart(){
    cart.length = 0;
    renderCart();
  }

  function cartTotal(){ return cart.reduce((sum,i)=> sum + i.price*i.qty, 0); }
  function cartCount(){ return cart.reduce((sum,i)=> sum + i.qty, 0); }

  function renderCart(){
    const body = document.getElementById('cartBody');
    const badge = document.getElementById('cartBadge');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotalValue');
    const sendBtn = document.getElementById('cartSendBtn');

    const count = cartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    subtotalEl.textContent = count > 0 ? formatBRL(cartTotal()) : '';

    if(cart.length === 0){
      body.innerHTML = '<div class="cart-empty">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
        + '<p>Seu carrinho está vazio.<br>Adicione umas pizzas gostosas!</p>'
        + '</div>';
    } else {
      body.innerHTML = cart.map(item => (
        '<div class="cart-item">'
        + '<div class="cart-item-info">'
        + '<h4>' + item.name + '</h4>'
        + '<span class="unit">' + formatBRL(item.price) + ' / un.</span>'
        + '</div>'
        + '<div class="cart-item-right">'
        + '<span class="cart-item-price">' + formatBRL(item.price*item.qty) + '</span>'
        + '<div class="qty-stepper">'
        + '<button type="button" data-qty-minus="' + item.id + '" aria-label="Diminuir">&minus;</button>'
        + '<span>' + item.qty + '</span>'
        + '<button type="button" data-qty-plus="' + item.id + '" aria-label="Aumentar">+</button>'
        + '</div>'
        + '<button type="button" class="remove-btn" data-remove="' + item.id + '">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>'
        + 'remover'
        + '</button>'
        + '</div>'
        + '</div>'
      )).join('');

      body.querySelectorAll('[data-qty-minus]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.qtyMinus, -1)));
      body.querySelectorAll('[data-qty-plus]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.qtyPlus, 1)));
      body.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeItem(b.dataset.remove)));
    }

    totalEl.textContent = formatBRL(cartTotal());
    sendBtn.disabled = cart.length === 0;
  }

  function pulseFab(){
    const fab = document.getElementById('cartFab');
    fab.classList.remove('pulse');
    void fab.offsetWidth;
    fab.classList.add('pulse');
  }

  let toastTimer;
  function showToast(msg){
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), 2200);
  }

  function openCart(){
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart(){
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function sendToWhatsapp(){
    if(cart.length === 0) return;
    let msg = 'Olá! Gostaria de fazer o seguinte pedido:\n\n';
    cart.forEach(item => {
      msg += item.qty + 'x ' + item.name + ' — ' + formatBRL(item.price*item.qty) + '\n';
    });
    msg += '\nTotal: ' + formatBRL(cartTotal()) + '\n\nNome:\nEndereço:\nForma de pagamento:';
    const url = 'https://wa.me/' + WHATS_NUMBER + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }

  document.getElementById('cartFab').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('cartSendBtn').addEventListener('click', sendToWhatsapp);
  document.getElementById('clearCartLink').addEventListener('click', clearCart);

  // wire pizza cards
  document.querySelectorAll('.pizza-card').forEach(card => {
    const name = card.dataset.name;
    const priceBroto = parseFloat(card.dataset.broto);
    const priceGrande = parseFloat(card.dataset.grande);
    let selectedSize = 'grande';
    const sizeBtns = card.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.size;
      });
    });
    const addBtn = card.querySelector('[data-add-pizza]');
    addBtn.addEventListener('click', () => {
      const price = selectedSize === 'broto' ? priceBroto : priceGrande;
      const sizeLabel = selectedSize === 'broto' ? 'Broto' : 'Grande';
      const id = name + '-' + selectedSize;
      addToCart(id, name + ' (' + sizeLabel + ')', price, addBtn);
      openCart();
    });
  });

  // wire drink cards
  document.querySelectorAll('.drink-card').forEach(card => {
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const addBtn = card.querySelector('[data-add-drink]');
    addBtn.addEventListener('click', () => {
      addToCart('drink-' + name, name, price, addBtn);
      openCart();
    });
  });

  renderCart();
