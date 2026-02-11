// ============================================
// EDA Charts - Chart.js Visualizations
// All outputs from eda-e-commerce-dataset.ipynb
// Dataset: 345 orders, 37 columns, Oct-Dec 2024
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = '#a0a0b0';
  Chart.defaults.borderColor = 'rgba(42, 42, 62, 0.5)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  const palette = ['#6c63ff','#00c897','#ff9f43','#54a0ff','#ff6b6b','#00d2d3','#8b83ff','#ffc048','#a29bfe','#fd79a8'];

  // -------------------------------------------------------
  // Section 5: Missing Values Analysis (Cell 16)
  // -------------------------------------------------------
  const missingCtx = document.getElementById('chart-missing-values');
  if (missingCtx) {
    new Chart(missingCtx, {
      type: 'bar',
      data: {
        labels: ['Comments','Discount Code','Discount Code %','Discount Integer','Discount Check','Reason','Ret Rec','Del vs Ret Check','Ret Window','Order Vs Return Date Check','Del Date','Delivery Days'],
        datasets: [{
          label: 'Missing %',
          data: [98.26, 59.42, 59.42, 59.42, 59.42, 47.83, 47.83, 47.83, 47.83, 47.83, 5.22, 5.22],
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
  // Section 9.1: Revenue Distribution (Cell 33)
  // Order value histogram approximation
  // -------------------------------------------------------
  const revDistCtx = document.getElementById('chart-revenue-distribution');
  if (revDistCtx) {
    new Chart(revDistCtx, {
      type: 'bar',
      data: {
        labels: ['0-1K','1K-2K','2K-3K','3K-4K','4K-5K','5K-6K','6K-7K','7K-8K'],
        datasets: [{
          label: 'Order Count',
          data: [12, 98, 85, 72, 38, 18, 12, 10],
          backgroundColor: 'rgba(0, 200, 151, 0.7)',
          borderColor: '#00c897',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          annotation: false
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               title: { display: true, text: 'Frequency', color: '#a0a0b0' } },
          x: { grid: { display: false },
               title: { display: true, text: 'Order Value (₹)', color: '#a0a0b0' } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 9.2: Category Analysis (Cell 36) - 3 panels
  // -------------------------------------------------------

  // Panel 1: Total Revenue by Category
  const catRevCtx = document.getElementById('chart-category-revenue');
  if (catRevCtx) {
    new Chart(catRevCtx, {
      type: 'bar',
      data: {
        labels: ['Outerwear','Dresses','Tops','Bottoms','Accessories'],
        datasets: [{
          label: 'Total Revenue (₹)',
          data: [318739, 219718, 144548, 136825, 87878],
          backgroundColor: ['#4682b4cc','#4682b4cc','#4682b4cc','#4682b4cc','#4682b4cc'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'K' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Panel 2: Order Count by Category
  const catCountCtx = document.getElementById('chart-category-count');
  if (catCountCtx) {
    new Chart(catCountCtx, {
      type: 'bar',
      data: {
        labels: ['Outerwear','Dresses','Tops','Bottoms','Accessories'],
        datasets: [{
          label: 'Number of Orders',
          data: [68, 70, 73, 66, 68],
          backgroundColor: ['#ff7f50cc','#ff7f50cc','#ff7f50cc','#ff7f50cc','#ff7f50cc'],
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

  // Panel 3: AOV by Category
  const catAovCtx = document.getElementById('chart-category-aov');
  if (catAovCtx) {
    new Chart(catAovCtx, {
      type: 'bar',
      data: {
        labels: ['Outerwear','Dresses','Tops','Bottoms','Accessories'],
        datasets: [{
          label: 'Avg Order Value (₹)',
          data: [4687, 3139, 1980, 2073, 1292],
          backgroundColor: ['#90ee90cc','#90ee90cc','#90ee90cc','#90ee90cc','#90ee90cc'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '₹' + v.toLocaleString() } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 9.3: Order Status (Cell 38) - bar + pie
  // -------------------------------------------------------
  const statusBarCtx = document.getElementById('chart-order-status-bar');
  if (statusBarCtx) {
    new Chart(statusBarCtx, {
      type: 'bar',
      data: {
        labels: ['Delivered','RTO','Cancelled'],
        datasets: [{
          label: 'Count',
          data: [327, 17, 1],
          backgroundColor: ['#008080','#008080','#008080'],
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

  const statusPieCtx = document.getElementById('chart-order-status-pie');
  if (statusPieCtx) {
    new Chart(statusPieCtx, {
      type: 'pie',
      data: {
        labels: ['Delivered 94.8%','RTO 4.9%','Cancelled 0.3%'],
        datasets: [{
          data: [327, 17, 1],
          backgroundColor: ['#00c897','#ff9f43','#ff6b6b'],
          borderColor: '#1a1a2e',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 9.4: Return Analysis (Cells 40, 42)
  // -------------------------------------------------------

  // Return Rate split
  const retSplitCtx = document.getElementById('chart-return-split');
  if (retSplitCtx) {
    new Chart(retSplitCtx, {
      type: 'doughnut',
      data: {
        labels: ['Returned (180)','Not Returned (165)'],
        datasets: [{
          data: [180, 165],
          backgroundColor: ['#ff6b6b','#00c897'],
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

  // Return Reasons - bar
  const retBarCtx = document.getElementById('chart-return-reasons-bar');
  if (retBarCtx) {
    new Chart(retBarCtx, {
      type: 'bar',
      data: {
        labels: ['Size Issue','Quality Defect','Changed Mind','Wrong Item','Damaged in Transit'],
        datasets: [{
          label: 'Count',
          data: [67, 32, 29, 28, 24],
          backgroundColor: '#e8837899',
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

  // Return Reasons - pie
  const retPieCtx = document.getElementById('chart-return-reasons-pie');
  if (retPieCtx) {
    new Chart(retPieCtx, {
      type: 'pie',
      data: {
        labels: ['Size Issue 37.2%','Quality Defect 17.8%','Changed Mind 16.1%','Wrong Item 15.6%','Damaged 13.3%'],
        datasets: [{
          data: [67, 32, 29, 28, 24],
          backgroundColor: ['#ff6b6b','#ff9f43','#6c63ff','#00d2d3','#54a0ff'],
          borderColor: '#1a1a2e',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 9.5: Geographic Analysis (Cell 45) - 2 panels
  // -------------------------------------------------------

  // Top 10 States by Revenue
  const stateRevCtx = document.getElementById('chart-state-revenue');
  if (stateRevCtx) {
    new Chart(stateRevCtx, {
      type: 'bar',
      data: {
        labels: ['Maharashtra','Gujarat','Uttar Pradesh','Delhi','Karnataka','Kerala','Tamil Nadu','Madhya Pradesh','Rajasthan','Punjab'],
        datasets: [{
          label: 'Revenue (₹)',
          data: [128424, 123919, 94468, 68668, 63144, 57814, 55260, 52197, 45605, 39536],
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
               ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'K' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // Top 10 States by Order Count
  const stateCountCtx = document.getElementById('chart-state-orders');
  if (stateCountCtx) {
    new Chart(stateCountCtx, {
      type: 'bar',
      data: {
        labels: ['Maharashtra','Gujarat','Uttar Pradesh','Delhi','Tamil Nadu','Karnataka','Kerala','Madhya Pradesh','Punjab','West Bengal'],
        datasets: [{
          label: 'Order Count',
          data: [50, 46, 36, 26, 24, 23, 23, 22, 15, 13],
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

  // Top Cities by Order Count
  const cityCtx = document.getElementById('chart-top-cities');
  if (cityCtx) {
    new Chart(cityCtx, {
      type: 'bar',
      data: {
        labels: ['Mumbai','Delhi','Surat','Bangalore','Chandigarh','Lucknow','Jaipur','Ahmedabad','Kolkata','Pune'],
        datasets: [{
          label: 'Orders',
          data: [27, 26, 13, 13, 13, 13, 13, 12, 12, 12],
          backgroundColor: palette.map(c => c + 'BB'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' } },
          x: { grid: { display: false }, ticks: { maxRotation: 45 } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 9.6: Payment Methods (Cell 48) - bar + pie
  // -------------------------------------------------------
  const payBarCtx = document.getElementById('chart-payment-bar');
  if (payBarCtx) {
    new Chart(payBarCtx, {
      type: 'bar',
      data: {
        labels: ['Credit Card','UPI','COD','Debit Card','Wallet'],
        datasets: [{
          label: 'Count',
          data: [88, 82, 62, 61, 52],
          backgroundColor: '#800080cc',
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

  const payPieCtx = document.getElementById('chart-payment-pie');
  if (payPieCtx) {
    new Chart(payPieCtx, {
      type: 'pie',
      data: {
        labels: ['Credit Card 25.5%','UPI 23.8%','COD 18.0%','Debit Card 17.7%','Wallet 15.1%'],
        datasets: [{
          data: [88, 82, 62, 61, 52],
          backgroundColor: ['#6c63ff','#54a0ff','#ff9f43','#00d2d3','#00c897'],
          borderColor: '#1a1a2e',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 9.7: Source/Channel Analysis (Cells 50, 52)
  // -------------------------------------------------------

  // Source Revenue
  const srcRevCtx = document.getElementById('chart-source-revenue');
  if (srcRevCtx) {
    new Chart(srcRevCtx, {
      type: 'bar',
      data: {
        labels: ['Website','Instagram Shop','Mobile App'],
        datasets: [{
          label: 'Revenue (₹)',
          data: [308071, 302773, 296865],
          backgroundColor: ['#ff9f43cc','#ff9f43cc','#ff9f43cc'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'K' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Source AOV
  const srcAovCtx = document.getElementById('chart-source-aov');
  if (srcAovCtx) {
    new Chart(srcAovCtx, {
      type: 'bar',
      data: {
        labels: ['Instagram Shop','Website','Mobile App'],
        datasets: [{
          label: 'Avg Order Value (₹)',
          data: [2778, 2567, 2559],
          backgroundColor: ['#ff7f50cc','#ff7f50cc','#ff7f50cc'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '₹' + v.toLocaleString() } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // -------------------------------------------------------
  // Section 8: Categorical Analysis (Cell 29)
  // Customer Type, Warehouse, Refund Status
  // -------------------------------------------------------

  // Customer Type
  const custCtx = document.getElementById('chart-customer-type');
  if (custCtx) {
    new Chart(custCtx, {
      type: 'doughnut',
      data: {
        labels: ['New (269)','Returning (76)'],
        datasets: [{
          data: [269, 76],
          backgroundColor: ['#4682b4','#ff7f50'],
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

  // Warehouse Distribution
  const whCtx = document.getElementById('chart-warehouse');
  if (whCtx) {
    new Chart(whCtx, {
      type: 'bar',
      data: {
        labels: ['Delhi','Mumbai','Bangalore'],
        datasets: [{
          label: 'Orders Fulfilled',
          data: [132, 121, 92],
          backgroundColor: ['#4682b4cc','#4682b4cc','#4682b4cc'],
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

  // Refund Status
  const refundCtx = document.getElementById('chart-refund-status');
  if (refundCtx) {
    new Chart(refundCtx, {
      type: 'doughnut',
      data: {
        labels: ['Processed (173)','Not Applicable (165)','Pending (7)'],
        datasets: [{
          data: [173, 165, 7],
          backgroundColor: ['#00c897','#54a0ff','#ff9f43'],
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

});
