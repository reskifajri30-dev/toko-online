// GANTI nomor ini dengan nomor WhatsApp swalayan (format: kode negara tanpa "+" atau "0" di depan)
const NOMOR_WA_TOKO = "62xxxxxxxxxx";

const produk = {
  "cat-sembako": [
    {n:"Beras 5kg", p:65000},
    {n:"Minyak goreng 1L", p:18000},
    {n:"Gula pasir 1kg", p:15000},
    {n:"Telur ayam 1kg", p:28000},
  ],
  "cat-minuman": [
    {n:"Air mineral 600ml", p:4000},
    {n:"Teh botol", p:5000},
    {n:"Kopi sachet (renceng)", p:12000},
  ],
  "cat-snack": [
    {n:"Keripik kentang", p:9000},
    {n:"Biskuit kaleng", p:22000},
  ],
  "cat-rumah": [
    {n:"Sabun cuci piring", p:9500},
    {n:"Deterjen 800g", p:16000},
    {n:"Tisu gulung isi 4", p:14000},
  ],
};

const qty = {};

function fmt(n){return "Rp " + n.toLocaleString("id-ID");}

function render(){
  for(const cat in produk){
    const el = document.getElementById(cat);
    el.innerHTML = "";
    produk[cat].forEach((item, i)=>{
      const key = cat+"-"+i;
      if(!(key in qty)) qty[key]=0;
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
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

function getSelected(){
  const items = [];
  for(const cat in produk){
    produk[cat].forEach((item, i)=>{
      const key = cat+"-"+i;
      if(qty[key] > 0) items.push({...item, qty: qty[key]});
    });
  }
  return items;
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

render();
updateTotal();