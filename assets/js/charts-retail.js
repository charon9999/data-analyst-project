// ============================================
// Retail Sales EDA Charts - Chart.js Visualizations
// All outputs from eda-retail-sales-dataset.ipynb
// Dataset: 62,884 transactions, 31 columns, 2016-2021
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = '#a0a0b0';
  Chart.defaults.borderColor = 'rgba(42, 42, 62, 0.5)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  const palette = ['#6c63ff','#00c897','#ff9f43','#54a0ff','#ff6b6b','#00d2d3','#8b83ff','#ffc048','#a29bfe','#fd79a8'];

  // -------------------------------------------------------
  // Section 6: Missing Values Analysis
  // -------------------------------------------------------
  const missingCtx = document.getElementById('chart-retail-missing-values');
  if (missingCtx) {
    new Chart(missingCtx, {
      type: 'bar',
      data: {
        labels: ['DeliveryDate', 'DeliveryDays', 'CustomerStateCode'],
        datasets: [{
          label: 'Missing %',
          data: [79.06, 79.06, 0.05],
          backgroundColor: 'rgba(255, 127, 80, 0.75)',
          borderColor: '#ff7f50',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => v + '%' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.1: Revenue Distribution (Order-level)
  // -------------------------------------------------------
  const revDistCtx = document.getElementById('chart-retail-revenue-distribution');
  if (revDistCtx) {
    new Chart(revDistCtx, {
      type: 'bar',
      data: {
        labels: ['$0-200','$200-500','$500-1K','$1K-2K','$2K-5K','$5K-10K','$10K-20K','$20K-50K'],
        datasets: [{
          label: 'Order Count',
          data: [3915, 3711, 4527, 5347, 6019, 2189, 530, 88],
          backgroundColor: 'rgba(0, 200, 151, 0.7)',
          borderColor: '#00c897',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               title: { display: true, text: 'Number of Orders', color: '#a0a0b0' } },
          x: { grid: { display: false },
               title: { display: true, text: 'Order Value ($)', color: '#a0a0b0' } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.2: Revenue Trend by Year
  // -------------------------------------------------------
  const yearRevCtx = document.getElementById('chart-retail-yearly-revenue');
  if (yearRevCtx) {
    new Chart(yearRevCtx, {
      type: 'line',
      data: {
        labels: ['2016','2017','2018','2019','2020','2021'],
        datasets: [{
          label: 'Revenue ($)',
          data: [6946794, 7421422, 12788961, 18264382, 9294632, 1039288],
          borderColor: '#6c63ff',
          backgroundColor: 'rgba(108, 99, 255, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(1) + 'M' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Year order count
  const yearOrdCtx = document.getElementById('chart-retail-yearly-orders');
  if (yearOrdCtx) {
    new Chart(yearOrdCtx, {
      type: 'bar',
      data: {
        labels: ['2016','2017','2018','2019','2020','2021'],
        datasets: [{
          label: 'Orders',
          data: [2865, 3280, 5965, 9083, 4635, 498],
          backgroundColor: '#ff7f50cc',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Monthly revenue pattern
  const monthRevCtx = document.getElementById('chart-retail-monthly-revenue');
  if (monthRevCtx) {
    new Chart(monthRevCtx, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Revenue ($)',
          data: [6759981, 7842476, 2625523, 607334, 4757984, 4293037, 3852416, 4085169, 4363864, 4315027, 4756060, 7496609],
          backgroundColor: palette.concat(palette).slice(0,12).map(c => c + 'BB'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(1) + 'M' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.3: Category Analysis - 3 panels
  // -------------------------------------------------------

  // Panel 1: Revenue by Category
  const catRevCtx = document.getElementById('chart-retail-category-revenue');
  if (catRevCtx) {
    new Chart(catRevCtx, {
      type: 'bar',
      data: {
        labels: ['Computers','Home Appliances','Cameras','Cell phones','TV & Video','Audio','Music/Movies','Games & Toys'],
        datasets: [{
          label: 'Revenue ($)',
          data: [19301595, 10795479, 6520168, 6183791, 5928983, 3169628, 3131006, 724829],
          backgroundColor: '#4682b4cc',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // Panel 2: Profit by Category
  const catProfCtx = document.getElementById('chart-retail-category-profit');
  if (catProfCtx) {
    new Chart(catProfCtx, {
      type: 'bar',
      data: {
        labels: ['Computers','Home Appliances','Cameras','Cell phones','TV & Video','Audio','Music/Movies','Games & Toys'],
        datasets: [{
          label: 'Profit ($)',
          data: [11277448, 6296339, 3919801, 3498627, 3536694, 1827852, 1909259, 396669],
          backgroundColor: '#00c897cc',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // Panel 3: Qty Sold by Category
  const catQtyCtx = document.getElementById('chart-retail-category-qty');
  if (catQtyCtx) {
    new Chart(catQtyCtx, {
      type: 'bar',
      data: {
        labels: ['Computers','Cell phones','Music/Movies','Audio','Games & Toys','Home Appliances','Cameras','TV & Video'],
        datasets: [{
          label: 'Quantity Sold',
          data: [44151, 31477, 28802, 23490, 22591, 18401, 17609, 11236],
          backgroundColor: '#ff7f50cc',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.4: Brand Analysis
  // -------------------------------------------------------
  const brandRevCtx = document.getElementById('chart-retail-brand-revenue');
  if (brandRevCtx) {
    new Chart(brandRevCtx, {
      type: 'bar',
      data: {
        labels: ['Adventure Works','Contoso','Wide World Importers','Fabrikam','The Phone Company','Proseware','Litware','Southridge Video','A. Datum','Northwind Traders'],
        datasets: [{
          label: 'Revenue ($)',
          data: [11849909, 10792325, 9172800, 6807894, 5386820, 3212628, 2659499, 2578596, 1486208, 1126070],
          backgroundColor: '#00008bcc',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  const brandOrdCtx = document.getElementById('chart-retail-brand-orders');
  if (brandOrdCtx) {
    new Chart(brandOrdCtx, {
      type: 'bar',
      data: {
        labels: ['Contoso','Southridge Video','Wide World Importers','Adventure Works','The Phone Company','Fabrikam','Proseware','Northwind Traders','A. Datum','Litware'],
        datasets: [{
          label: 'Order Count',
          data: [12155, 6869, 7538, 5681, 5424, 3330, 2840, 2299, 1782, 1616],
          backgroundColor: '#006400cc',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.5: Geographic Analysis
  // -------------------------------------------------------
  const countryRevCtx = document.getElementById('chart-retail-country-revenue');
  if (countryRevCtx) {
    new Chart(countryRevCtx, {
      type: 'bar',
      data: {
        labels: ['United States','United Kingdom','Germany','Canada','Australia','Italy','Netherlands','France'],
        datasets: [{
          label: 'Revenue ($)',
          data: [29871631, 7084088, 5414150, 4724335, 2708138, 2475646, 1962154, 1515338],
          backgroundColor: '#00008bcc',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  const countryCustomersCtx = document.getElementById('chart-retail-country-customers');
  if (countryCustomersCtx) {
    new Chart(countryCustomersCtx, {
      type: 'bar',
      data: {
        labels: ['United States','United Kingdom','Canada','Germany','Australia','Italy','Netherlands','France'],
        datasets: [{
          label: 'Customers',
          data: [5706, 1570, 1179, 1150, 780, 530, 534, 438],
          backgroundColor: '#008080cc',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // Online vs Physical
  const channelRevCtx = document.getElementById('chart-retail-channel-revenue');
  if (channelRevCtx) {
    new Chart(channelRevCtx, {
      type: 'doughnut',
      data: {
        labels: ['Physical Store ($44.4M)','Online ($11.4M)'],
        datasets: [{
          data: [44351155, 11404325],
          backgroundColor: ['#54a0ff','#ff9f43'],
          borderColor: '#1a1a2e',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } }
        }
      }
    });
  }

  const channelOrdersCtx = document.getElementById('chart-retail-channel-orders');
  if (channelOrdersCtx) {
    new Chart(channelOrdersCtx, {
      type: 'doughnut',
      data: {
        labels: ['Physical Store (20,746)','Online (5,580)'],
        datasets: [{
          data: [20746, 5580],
          backgroundColor: ['#54a0ff','#ff9f43'],
          borderColor: '#1a1a2e',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.6: Gender Analysis
  // -------------------------------------------------------
  const genderRevCtx = document.getElementById('chart-retail-gender-revenue');
  if (genderRevCtx) {
    new Chart(genderRevCtx, {
      type: 'doughnut',
      data: {
        labels: ['Male ($28.3M)','Female ($27.4M)'],
        datasets: [{
          data: [28334855, 27420625],
          backgroundColor: ['#54a0ff','#ff6b6b'],
          borderColor: '#1a1a2e',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } }
        }
      }
    });
  }

  const genderCustCtx = document.getElementById('chart-retail-gender-customers');
  if (genderCustCtx) {
    new Chart(genderCustCtx, {
      type: 'bar',
      data: {
        labels: ['Male','Female'],
        datasets: [{
          label: 'Customers',
          data: [6029, 5858],
          backgroundColor: ['#54a0ffcc','#ff6b6bcc'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.7: Product Color Analysis
  // -------------------------------------------------------
  const colorCtx = document.getElementById('chart-retail-product-colors');
  if (colorCtx) {
    new Chart(colorCtx, {
      type: 'bar',
      data: {
        labels: ['Black','White','Silver','Grey','Brown','Blue','Red','Green','Gold','Pink'],
        datasets: [{
          label: 'Revenue ($)',
          data: [13862232, 11929074, 10411966, 4301441, 3714149, 3132525, 1908461, 1879166, 1593501, 1106840],
          backgroundColor: ['#333333','#e0e0e0','#c0c0c0','#808080','#8B4513','#4169E1','#DC143C','#228B22','#FFD700','#FF69B4'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } },
          x: { grid: { display: false }, ticks: { maxRotation: 45 } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 10.9: Top Subcategories
  // -------------------------------------------------------
  const subcatCtx = document.getElementById('chart-retail-subcategories');
  if (subcatCtx) {
    new Chart(subcatCtx, {
      type: 'bar',
      data: {
        labels: ['Desktops','Televisions','Projectors & Screens','Water Heaters','Camcorders','Laptops','Movie DVD','Touch Screen Phones','Smart phones','Refrigerators'],
        datasets: [{
          label: 'Revenue ($)',
          data: [9906357, 4308719, 3767522, 3547823, 3357990, 3164777, 3131006, 3083462, 2805657, 2152664],
          backgroundColor: palette.map(c => c + 'BB'),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Store Country Revenue
  // -------------------------------------------------------
  const storeCountryCtx = document.getElementById('chart-retail-store-country');
  if (storeCountryCtx) {
    new Chart(storeCountryCtx, {
      type: 'bar',
      data: {
        labels: ['United States','Online','United Kingdom','Germany','Canada','Australia','Italy','Netherlands','France'],
        datasets: [{
          label: 'Revenue ($)',
          data: [23764426, 11404325, 5749770, 4246279, 3611562, 2099141, 2059087, 1591344, 1229546],
          backgroundColor: palette.map(c => c + 'BB'),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

});
