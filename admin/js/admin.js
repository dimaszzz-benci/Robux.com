const SUPABASE_URL = 'https://lstfzphfkdpzqqhbbuwi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdGZ6cGhma2RwenFxaGJidXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDk0MTYsImV4cCI6MjA5MzYyNTQxNn0.DqZ9AGsRrMHHYIPCtGQZAAhGM1TKYVsAugecvNyepQM';

let currentAdmin = null;

function headers() {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
}

function formatRp(n) {
  return 'Rp ' + parseInt(n).toLocaleString('id-ID');
}

function formatTanggal(str) {
  const d = new Date(str);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// =====================
// AUTH
// =====================

async function login() {
  const username = document.getElementById('inp-login-user').value.trim();
  const password = document.getElementById('inp-login-pass').value.trim();
  const errEl = document.getElementById('login-error');

  if (!username || !password) {
    errEl.classList.add('show');
    return;
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/admins?username=eq.${username}&password=eq.${password}&select=*`,
    { headers: headers() }
  );

  const data = await res.json();

  if (data.length === 0) {
    errEl.classList.add('show');
    return;
  }

  currentAdmin = data[0];
  errEl.classList.remove('show');
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('dashboard-page').style.display = 'block';
  loadDashboard();
}

function logout() {
  currentAdmin = null;
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('dashboard-page').style.display = 'none';
}

// =====================
// TABS
// =====================

function bukaTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

// =====================
// DASHBOARD
// =====================

async function loadDashboard() {
  await loadPesanan();
  await loadProduk();
  await loadPengaturan();
}

// =====================
// PESANAN
// =====================

async function loadPesanan() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?order=created_at.desc&select=*`,
    { headers: headers() }
  );
  const data = await res.json();

  const total = data.length;
  const pending = data.filter(o => o.status === 'pending').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;

  const list = document.getElementById('orders-list');

  if (data.length === 0) {
    list.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">Belum ada pesanan.</p>';
    return;
  }

  list.innerHTML = data.map(order => `
    <div class="order-card ${order.status}" id="order-${order.id}">
      <div class="order-top">
        <div>
          <div class="order-id">#${order.id} &mdash; ${formatTanggal(order.created_at)}</div>
          <div class="order-paket">${order.nama_paket} &mdash; ${formatRp(order.harga)}</div>
        </div>
        <div class="status-badge ${order.status}">${order.status}</div>
      </div>
      <div class="order-detail">
        <strong>Username:</strong> ${order.username_roblox}<br/>
        <strong>Password:</strong> ${order.password_roblox}<br/>
        <strong>Backup Code 1:</strong> ${order.backup_code_1}<br/>
        <strong>Backup Code 2:</strong> ${order.backup_code_2}<br/>
        <strong>Backup Code 3:</strong> ${order.backup_code_3}<br/>
        <strong>No. WA:</strong> ${order.nomor_wa}
      </div>
      <div class="order-actions">
        <button class="btn-sm btn-wa-admin" onclick="hubungiWA('${order.nomor_wa}', '${order.username_roblox}', '${order.nama_paket}')">Hubungi WA</button>
        <button class="btn-sm btn-selesai" onclick="updateStatus(${order.id}, 'selesai')">Selesai</button>
        <button class="btn-sm btn-batal" onclick="updateStatus(${order.id}, 'dibatalkan')">Batal</button>
      </div>
    </div>
  `).join('');
}

async function updateStatus(id, status) {
  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status })
  });
  await loadPesanan();
}

function hubungiWA(nomor, username, paket) {
  const pesan = encodeURIComponent(
`Halo ${username}, pesanan kamu untuk paket ${paket} sedang kami proses. Mohon ditunggu ya.`
  );
  window.open(`https://wa.me/62${nomor.replace(/^0/, '')}?text=${pesan}`, '_blank');
}

// =====================
// PRODUK
// =====================

async function loadProduk() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?order=robux.asc&select=*`,
    { headers: headers() }
  );
  const data = await res.json();

  const list = document.getElementById('produk-list');
  list.innerHTML = data.map(pkg => `
    <div class="product-admin-card">
      <div class="product-admin-top">
        ${pkg.gambar_url
          ? `<img src="${pkg.gambar_url}" class="product-admin-img" id="img-preview-${pkg.id}"/>`
          : `<div class="product-admin-img-placeholder" id="img-preview-${pkg.id}">No Image</div>`
        }
        <div>
          <div class="product-admin-name">${pkg.nama}</div>
          <div class="product-admin-robux">${pkg.robux} Robux</div>
        </div>
      </div>

      <div class="product-fields">
        <div class="form-group">
          <label>Harga (Rp)</label>
          <input type="number" id="harga-${pkg.id}" value="${pkg.harga}"/>
        </div>
        <div class="form-group">
          <label>Harga Asli (Rp)</label>
          <input type="number" id="harga-asli-${pkg.id}" value="${pkg.harga_asli}"/>
        </div>
        <div class="form-group">
          <label>Stok</label>
          <input type="number" id="stok-${pkg.id}" value="${pkg.stok}"/>
        </div>
      </div>

      <div class="form-group">
        <label>URL Gambar</label>
        <input type="text" id="gambar-${pkg.id}" value="${pkg.gambar_url || ''}" placeholder="https://..." oninput="previewGambar(${pkg.id})"/>
      </div>

      <div class="product-toggle">
        <span>Tampilkan Produk</span>
        <label class="switch">
          <input type="checkbox" id="aktif-${pkg.id}" ${pkg.aktif ? 'checked' : ''}/>
          <span class="slider"></span>
        </label>
      </div>

      <button class="btn btn-primary" onclick="simpanProduk(${pkg.id})">Simpan</button>
    </div>
  `).join('');
}

function previewGambar(id) {
  const url = document.getElementById(`gambar-${id}`).value.trim();
  const el = document.getElementById(`img-preview-${id}`);
  if (url) {
    el.outerHTML = `<img src="${url}" class="product-admin-img" id="img-preview-${id}"/>`;
  }
}

async function simpanProduk(id) {
  const harga = parseInt(document.getElementById(`harga-${id}`).value);
  const harga_asli = parseInt(document.getElementById(`harga-asli-${id}`).value);
  const stok = parseInt(document.getElementById(`stok-${id}`).value);
  const gambar_url = document.getElementById(`gambar-${id}`).value.trim();
  const aktif = document.getElementById(`aktif-${id}`).checked;

  await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ harga, harga_asli, stok, gambar_url, aktif })
  });

  alert('Produk berhasil disimpan.');
}

// =====================
// PENGATURAN
// =====================

async function loadPengaturan() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/settings?select=*`,
    { headers: headers() }
  );
  const data = await res.json();
  if (data.length > 0) {
    document.getElementById('toggle-toko').checked = data[0].toko_aktif;
  }
}

async function simpanStatusToko() {
  const aktif = document.getElementById('toggle-toko').checked;
  await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ toko_aktif: aktif })
  });
}

async function gantiPassword() {
  const newPass = document.getElementById('inp-new-pass').value.trim();
  const successEl = document.getElementById('setting-success');
  const errorEl = document.getElementById('setting-error');

  if (!newPass) {
    errorEl.classList.add('show');
    return;
  }

  await fetch(`${SUPABASE_URL}/rest/v1/admins?id=eq.${currentAdmin.id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ password: newPass })
  });

  successEl.classList.add('show');
  errorEl.classList.remove('show');
  document.getElementById('inp-new-pass').value = '';

  setTimeout(() => successEl.classList.remove('show'), 3000);
    }
