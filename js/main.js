const SUPABASE_URL = 'https://lstfzphfkdpzqqhbbuwi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdGZ6cGhma2RwenFxaGJidXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDk0MTYsImV4cCI6MjA5MzYyNTQxNn0.DqZ9AGsRrMHHYIPCtGQZAAhGM1TKYVsAugecvNyepQM';

let selectedPkg = null;
let tokoAktif = true;

async function fetchProducts() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=robux.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  return data;
}

async function fetchSettings() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  return data;
}

function formatRp(n) {
  return 'Rp ' + parseInt(n).toLocaleString('id-ID');
}

function renderProducts(products) {
  const grid = document.getElementById('packages-grid');
  grid.innerHTML = '';

  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">Tidak ada paket tersedia.</p>';
    return;
  }

  products.forEach(pkg => {
    const diskon = Math.round((1 - pkg.harga / pkg.harga_asli) * 100);
    const habis = pkg.stok <= 0;
    const nonaktif = !pkg.aktif;

    if (nonaktif) return;

    const imgEl = pkg.gambar_url
      ? `<img src="${pkg.gambar_url}" class="pkg-img" alt="${pkg.nama}"/>`
      : `<div class="pkg-img-placeholder">No Image</div>`;

    const habisEl = habis ? `<div class="pkg-habis">Stok Habis</div>` : '';

    const card = document.createElement('div');
    card.className = 'pkg-card';
    card.id = `pkg-${pkg.id}`;
    card.innerHTML = `
      ${diskon > 0 ? `<div class="pkg-discount">${diskon}%</div>` : ''}
      <div class="pkg-robux">${pkg.robux} ROBUX</div>
      ${imgEl}
      <div class="pkg-price">${formatRp(pkg.harga)}</div>
      <div class="pkg-price-old">${formatRp(pkg.harga_asli)}</div>
      <div class="pkg-stok">Stok: ${pkg.stok}</div>
      ${habisEl}
    `;

    if (!habis) {
      card.onclick = () => pilihPaket(card, pkg);
    }

    grid.appendChild(card);
  });
}

function pilihPaket(el, pkg) {
  document.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedPkg = pkg;
}

function prosesOrder() {
  const username = document.getElementById('inp-username').value.trim();
  const password = document.getElementById('inp-password').value.trim();
  const bc1 = document.getElementById('inp-bc1').value.trim();
  const bc2 = document.getElementById('inp-bc2').value.trim();
  const bc3 = document.getElementById('inp-bc3').value.trim();
  const wa = document.getElementById('inp-wa').value.trim();
  const errEl = document.getElementById('error-msg');

  if (!username || !password || !bc1 || !bc2 || !bc3 || !wa || !selectedPkg) {
    errEl.classList.add('show');
    errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (!tokoAktif) {
    errEl.textContent = 'Toko sedang tutup.';
    errEl.classList.add('show');
    return;
  }

  errEl.classList.remove('show');

  const params = new URLSearchParams({
    username, password, bc1, bc2, bc3, wa,
    pkg_id: selectedPkg.id,
    pkg_nama: selectedPkg.nama,
    pkg_robux: selectedPkg.robux,
    pkg_harga: selectedPkg.harga
  });

  window.location.href = `konfirmasi.html?${params.toString()}`;
}

async function init() {
  try {
    const products = await fetchProducts();
    renderProducts(products);
  } catch (e) {
    document.getElementById('packages-grid').innerHTML =
      '<p style="color: red; font-size: 0.85rem;">Gagal memuat paket. Coba refresh.</p>';
  }
}

init();
