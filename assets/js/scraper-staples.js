// ============================================
// Web Scraper - Staples Advantage Demo Output
// Loads data from locally scraped product.json
// ============================================
(function () {

  var STAPLES_DATA = {
    sku: '135848',
    supplier: 'staples',
    url: 'https://www.staplesadvantage.com/tru-red-8482-8-5-x-11-copy-paper-20-lbs-92-brightness-500-sheets-ream-10-reams-carton-tr56958/product_135848',
    name: 'TRU RED\u2122 8.5" x 11" Copy Paper, 20 lbs., 92 Brightness, 500 Sheets/Ream, 10 Reams/Carton (TR56958)',
    brand: 'TRU RED',
    manufacturer: 'DOMTAR',
    price: '$61.59',
    unit_of_measure: '5000/Carton',
    manufacturer_part_number: '135848/TR56958',
    upc: '00718103351829',
    categories: ['Paper', 'Copy Paper', 'Copy & Printer Paper'],
    description: 'Expect high-quality results for home and office documents with this printer paper. This 20 lb. weight paper is engineered to prevent jamming, making it ideal for use in all machines. With a 92 brightness rating, this paper delivers crisp text and images in black and white. Featuring 5000 sheets, this Tru Red 8.5" x 11" white printer paper provides the right amount to keep up with your daily demand.',
    features: [
      'Copy printer paper that is best for high volume, black & white printing',
      'Paper weight: 20 lbs.',
      'Sheet Dimension: 8.5W" x 11"L (US Letter)',
      'Brightness rating of 92 for sharp, clear print results',
      'White paper with a Matte finish',
      '500 sheets per ream, 10 reams per carton, 5000 sheets total',
      'Paper is acid-free to prevent crumbling or yellowing',
      'Engineered to prevent jamming',
      'Designed for high-speed printers',
      'Packaging may vary'
    ],
    specifications: {
      'Acid Free': 'Acid Free',
      'Bond Paper Weight (lbs.)': '20',
      'Brand Name': 'TRU RED',
      'Brightness': '92',
      'Color Family': 'White',
      'Copy & Printer Paper Finish': 'Matte',
      'Hole Punched': 'No',
      'Length in Inches': '11',
      'Number of Reams': '10-Ream',
      'Paper GSM': '75',
      'Paper Type': 'Copy',
      'Sheet Dimension': '8.5" x 11" (US letter)',
      'Total Number of Sheets': '5000',
      'UPC': '00718103351829'
    },
    reviews: {
      rating: 4.56,
      count: 37529,
      summary: 'The copy paper is generally praised for its good quality and reasonable price, making it suitable for everyday office use.'
    },
    made_in_america: true,
    images: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
    image_count: 6,
    scraped_at: '2026-02-13T20:12:28.417134'
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  var basePath = 'assets/images/scraped/135848';
  var localImages = STAPLES_DATA.images.map(function (f) { return basePath + '/images/' + f; });

  var mainImg = document.getElementById('result-main-img');
  if (!mainImg) return;

  document.getElementById('result-name').textContent = STAPLES_DATA.name;
  document.getElementById('result-price').textContent = STAPLES_DATA.price + ' / ' + STAPLES_DATA.unit_of_measure;
  document.getElementById('result-sku').textContent = STAPLES_DATA.sku;
  document.getElementById('result-description').textContent = STAPLES_DATA.description;

  mainImg.src = localImages[0];
  mainImg.alt = STAPLES_DATA.name;

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
      STAPLES_DATA.features.map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('') +
      '</ul>';
  }

  var specsEl = document.getElementById('result-specs');
  if (specsEl) {
    var specs = STAPLES_DATA.specifications;
    specsEl.innerHTML = '<h4>Specifications</h4><table>' +
      Object.keys(specs).map(function (k) {
        return '<tr><td>' + escapeHtml(k) + '</td><td>' + escapeHtml(specs[k]) + '</td></tr>';
      }).join('') +
      '</table>';
  }

  var jsonOutput = document.getElementById('json-output');
  if (jsonOutput) {
    jsonOutput.textContent = JSON.stringify(STAPLES_DATA, null, 2);
  }

})();
