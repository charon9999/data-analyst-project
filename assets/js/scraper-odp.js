// ============================================
// Web Scraper - ODP (Office Depot) Demo Output
// Loads data from locally scraped product.json
// ============================================
(function () {

  var ODP_DATA = {
    sku: '4852038',
    supplier: 'odp',
    url: 'https://www.odpbusiness.com/a/products/4852038/',
    name: 'Smead\u00AE 1/3-Tab 12-Pocket Organizer Folder, Letter Size, Gray',
    price: '$13.59',
    unit_of_measure: 'each',
    manufacturer_number: 'Manufacturer #89207',
    categories: ['Office Supplies', 'Filing & Folders', 'Expanding File Folders'],
    description: 'Reach for the Smead 1/3-Tab 12-Pocket Organizer Folder to stay on track at the office or in the classroom. The folder offers assorted tab positions to help you see different sections at a glance.',
    features: [
      '12 pockets to help separate items.',
      'Assorted tab positions allow easy reference to labels.',
      'Poly construction can handle bumps and drops.',
      'Clear, zippered pouch on the inner back cover helps store business cards, paper clips and more.',
      'Compact size to fit in your bag or backpack.'
    ],
    specifications: {
      'Item #': '4852038',
      'Manufacturer #': '89207',
      'Brand Name_Discontinued': 'Smead',
      'color': 'Gray',
      'tab cut': '1/3',
      'sheet size': 'Letter (8-1/2" x 11")',
      'expansion': '1-1/2 in.',
      'Tab Style': 'End',
      'primary material': 'Plastic',
      'quantity': '1',
      'manufacturer': 'SMEAD MFG CO',
      'Total Quantity': '1 File Wallets',
      'UPC': '086486892070'
    },
    images: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp', '07.webp', '08.webp', '09.webp'],
    image_count: 9,
    scraped_at: '2026-02-13T19:46:15.843850'
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  var basePath = 'assets/images/scraped/4852038';
  var localImages = ODP_DATA.images.map(function (f) { return basePath + '/images/' + f; });

  var mainImg = document.getElementById('result-main-img');
  if (!mainImg) return;

  document.getElementById('result-name').textContent = ODP_DATA.name;
  document.getElementById('result-price').textContent = ODP_DATA.price + ' / ' + ODP_DATA.unit_of_measure;
  document.getElementById('result-sku').textContent = ODP_DATA.sku;
  document.getElementById('result-description').textContent = ODP_DATA.description;

  mainImg.src = localImages[0];
  mainImg.alt = ODP_DATA.name;

  var thumbContainer = document.getElementById('result-thumbnails');
  localImages.forEach(function (imgPath, idx) {
    var thumb = document.createElement('img');
    thumb.src = imgPath;
    thumb.alt = 'Image ' + (idx + 1);
    if (idx === 0) thumb.classList.add('active');
    thumb.addEventListener('click', function () {
      mainImg.src = imgPath;
      thumbContainer.querySelectorAll('img').forEach(function (t) { t.classList.remove('active'); });
      thumb.classList.add('active');
    });
    thumbContainer.appendChild(thumb);
  });

  var featuresEl = document.getElementById('result-features');
  if (featuresEl) {
    featuresEl.innerHTML = '<h4>Features</h4><ul class="highlight-box">' +
      ODP_DATA.features.map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('') +
      '</ul>';
  }

  var specsEl = document.getElementById('result-specs');
  if (specsEl) {
    var specs = ODP_DATA.specifications;
    specsEl.innerHTML = '<h4>Specifications</h4><table>' +
      Object.keys(specs).map(function (k) {
        return '<tr><td>' + escapeHtml(k) + '</td><td>' + escapeHtml(specs[k]) + '</td></tr>';
      }).join('') +
      '</table>';
  }

  var jsonOutput = document.getElementById('json-output');
  if (jsonOutput) {
    jsonOutput.textContent = JSON.stringify(ODP_DATA, null, 2);
  }

})();
