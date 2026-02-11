// ============================================
// EDA Charts - Chart.js Visualizations
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  // Common chart defaults
  if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#a0a0b0';
    Chart.defaults.borderColor = 'rgba(42, 42, 62, 0.5)';
    Chart.defaults.font.family = "'Inter', sans-serif";
  }

  const palette = ['#6c63ff','#00c897','#ff9f43','#54a0ff','#ff6b6b','#00d2d3','#8b83ff','#ffc048'];

  // --- Revenue by Category ---
  const catCtx = document.getElementById('chart-category-revenue');
  if (catCtx) {
    new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: ['Electronics','Footwear','Accessories','Clothing','Beauty','Fitness','Stationery'],
        datasets: [{
          label: 'Total Revenue (INR)',
          data: [18465, 13646, 5507, 4741, 2007, 2096, 499],
          backgroundColor: palette.map(c => c + 'CC'),
          borderColor: palette,
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '₹' + v.toLocaleString() } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // --- Order Status Distribution ---
  const statusCtx = document.getElementById('chart-order-status');
  if (statusCtx) {
    new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Delivered','RTO','Cancelled'],
        datasets: [{
          data: [24, 3, 3],
          backgroundColor: ['#00c897','#ff9f43','#ff6b6b'],
          borderColor: '#1a1a2e',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
        }
      }
    });
  }

  // --- Payment Method Distribution ---
  const payCtx = document.getElementById('chart-payment');
  if (payCtx) {
    new Chart(payCtx, {
      type: 'bar',
      data: {
        labels: ['UPI','Credit Card','Debit Card','COD'],
        datasets: [{
          label: 'Orders',
          data: [11, 7, 6, 6],
          backgroundColor: ['#6c63ff','#54a0ff','#00d2d3','#ff9f43'],
          borderRadius: 6
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

  // --- Monthly Revenue Trend ---
  const trendCtx = document.getElementById('chart-monthly-trend');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
        datasets: [{
          label: 'Revenue (INR)',
          data: [6761, 6615, 5116, 5237, 5271, 4607, 2887, 4023, 2878],
          borderColor: '#6c63ff',
          backgroundColor: 'rgba(108,99,255,0.1)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6c63ff',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '₹' + v.toLocaleString() } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // --- Customer Type Split ---
  const custCtx = document.getElementById('chart-customer-type');
  if (custCtx) {
    new Chart(custCtx, {
      type: 'doughnut',
      data: {
        labels: ['Returning','New'],
        datasets: [{
          data: [9, 6],
          backgroundColor: ['#6c63ff','#00d2d3'],
          borderColor: '#1a1a2e',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
        }
      }
    });
  }

  // --- Return Reasons ---
  const retCtx = document.getElementById('chart-return-reasons');
  if (retCtx) {
    new Chart(retCtx, {
      type: 'bar',
      data: {
        labels: ['Size Issue','Product Damaged','Changed Mind','Wrong Product'],
        datasets: [{
          label: 'Return Count',
          data: [3, 2, 2, 1],
          backgroundColor: ['#ff6b6b','#ff9f43','#6c63ff','#00d2d3'],
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { stepSize: 1 } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // --- Revenue by State ---
  const stateCtx = document.getElementById('chart-state-revenue');
  if (stateCtx) {
    new Chart(stateCtx, {
      type: 'bar',
      data: {
        labels: ['Maharashtra','Karnataka','Delhi','Tamil Nadu','Telangana','Gujarat','West Bengal','Rajasthan'],
        datasets: [{
          label: 'Revenue (INR)',
          data: [12742, 8902, 6332, 5337, 4117, 3424, 848, 1098],
          backgroundColor: palette.map(c => c + 'CC'),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(42,42,62,0.3)' },
               ticks: { callback: v => '₹' + v.toLocaleString() } },
          x: { grid: { display: false }, ticks: { maxRotation: 45 } }
        }
      }
    });
  }

});
