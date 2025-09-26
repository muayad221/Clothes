const sheetId = "1-Gd3iRu0OHnv2m5XPARtX-V7j73-K0IpdVLCXcKDlHo";
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

function fixImageLink(link) {
  if (!link) return "";
  if (link.includes("drive.google.com")) {
    if (link.includes("uc?export=view")) return link;
    const match = link.match(/[-\w]{25,}/);
    if (match) return `https://drive.google.com/uc?export=view&id=${match[0]}`;
  }
  if (link.includes("imgur.com")) {
    if (!link.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return link.replace("imgur.com", "i.imgur.com") + ".jpg";
    }
  }
  return link;
}

let currentImages = [];
let currentIndex = 0;

fetch(url)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    let html = "";
    rows.forEach((r, idx) => {
      const name = r.c[0]?.v || "";
      const price = r.c[1]?.v || "";
      const stock = r.c[2]?.v || "";
      let images = r.c[3]?.v || "";

      // multiple images (comma separated in sheet)
      let imageList = images.split(",").map(link => fixImageLink(link.trim()));

      // product card
      html += `
        <div class="product">
          <img id="product-img-${idx}" src="${imageList[0]}" 
               alt="${name}" onclick='openLightbox(${JSON.stringify(imageList)})'>
          <h3>${name}</h3>
          <p>Price: ${price} IQD</p>
          <p class="${stock.toLowerCase() === 'namaya' ? 'namaya' : ''}">${stock}</p>
          <a href="https://wa.me/9647511369395?text=slav, mn dvet ${name} j range ">
            Order via WhatsApp
          </a>
        </div>
      `;

      // start slideshow for this product
      let imgIndex = 0;
      setInterval(() => {
        imgIndex = (imgIndex + 1) % imageList.length;
        const imgEl = document.getElementById(`product-img-${idx}`);
        if (imgEl) imgEl.src = imageList[imgIndex];
      }, 2000); // change every 2 sec
    });

    document.getElementById("products").innerHTML = html;
  });

// ============ Lightbox ============
function openLightbox(images) {
  currentImages = images;
  currentIndex = 0;
  document.getElementById("lightbox-img").src = currentImages[currentIndex];
  document.getElementById("lightbox").style.display = "flex";
}

function nextImage() {
  currentIndex = (currentIndex + 1) % currentImages.length;
  document.getElementById("lightbox-img").src = currentImages[currentIndex];
}

function prevImage() {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  document.getElementById("lightbox-img").src = currentImages[currentIndex];
}

// Close lightbox when clicking outside image
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox" || e.target.id === "lightbox-img") {
    document.getElementById("lightbox").style.display = "none";
  }
});