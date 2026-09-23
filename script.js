// --- Konfigurasi Firebase (GANTI dengan config kamu sendiri) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDaYRZsO7N6pQxudTHxpyBN_n_Sh4eXXV8",
  authDomain: "toko-online-312bb.firebaseapp.com",
  projectId: "toko-online-312bb",
  storageBucket: "toko-online-312bb.firebasestorage.app",
  messagingSenderId: "7924620978",
  appId: "1:7924620978:web:dd0e3a1a94102aa7ecb3ab"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NOMOR_WA_TOKO = "62xxxxxxxxxx";

let produk = {};
const qty = {};

function fmt(n){ return "Rp " + n.toLocaleString("id-ID"); }

async function loadProduk(){
  produk = { "cat-sembako":[], "cat-minuman":[], "cat-snack":[], "cat-rumah":[] };
  const snapshot = await getDocs(collection(db, "produk"));
  snapshot.forEach(docSnap=>{
    const data = docSnap.data();
    const catKey = "cat-" + data.kategori;
    if(!produk[catKey]) produk[catKey] = [];
    produk[catKey].push({ id: docSnap.id, n: data.nama, p: Number(data.harga), img: data.gambar });
  });
  render();
  updateTotal();
}

function render(){
  for(const cat in produk){
    const el = document.getElementById(cat);
    if(!el) continue;
    el.innerHTML = "";
    if(produk[cat].length === 0){
      el.innerHTML = `<p style="color:#8a8a8a;font-size:.85rem;padding:8px 4px;">Belum ada produk di kategori ini.</p>`;
      continue;
    }
    produk[cat].forEach((item)=>{
      const key = item.id;
      if(!(key in qty)) qty[key] = 0;
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <img class="thumb" src="${item.img || 'images/placeholder.jpg'}" alt="${item.n}" onerror="this.src='images/placeholder.jpg'">
        <div class="info">
          <div class="name">${item.n}</div>
          <div class="price">${fmt(item.p)}</div>
        </div>
        <div class="stepper">
          <button data-key="${key}" data-d="-1" aria-label="Kurangi">−</button>
          <span class="qty" id="q-${key}">${qty[key]}</span>
          <button data-key="${key}" data-d="1" aria-label="Tambah">+</button>
        </div>`;
      el.appendChild(row);
    });
  }
  document.querySelectorAll(".stepper button").forEach(b=>{
    b.addEventListener("click", ()=>{
      const key = b.dataset.key;
      const d = parseInt(b.dataset.d);
      qty[key] = Math.max(0, qty[key] + d);
      document.getElementById("q-"+key).textContent = qty[key];
      updateTotal();
    });
  });
}

function getAllItems(){
  const all = [];
  for(const cat in produk) all.push(...produk[cat]);
  return all;
}

function getSelected(){
  return getAllItems().filter(it => qty[it.id] > 0).map(it => ({...it, qty: qty[it.id]}));
}

function updateTotal(){
  const items = getSelected();
  const total = items.reduce((s,it)=>s+it.p*it.qty,0);
  const count = items.reduce((s,it)=>s+it.qty,0);
  document.getElementById("totalHarga").textContent = fmt(total);
  document.getElementById("totalItem").textContent = count + " barang dipilih";
  document.getElementById("btnPesan").disabled = count === 0;
}

document.getElementById("btnPesan").addEventListener("click", ()=>{
  const items = getSelected();
  const nama = document.getElementById("nama").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const telp = document.getElementById("telp").value.trim();

  if(!nama || !alamat){
    alert("Mohon isi nama dan alamat lengkap sebelum memesan.");
    return;
  }

  let pesan = "Halo, saya ingin pesan:\n\n";
  let total = 0;
  items.forEach(it=>{
    const sub = it.p*it.qty;
    total += sub;
    pesan += `- ${it.n} x${it.qty} = ${fmt(sub)}\n`;
  });
  pesan += `\nTotal: ${fmt(total)}\n\n`;
  pesan += `Nama: ${nama}\nAlamat: ${alamat}\n`;
  if(telp) pesan += `Telepon: ${telp}\n`;

  const url = `https://wa.me/${NOMOR_WA_TOKO}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank");
});

loadProduk();