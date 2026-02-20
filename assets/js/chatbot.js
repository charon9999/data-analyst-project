// ============================================
// Product Substitution Chatbot
// ============================================
(function () {

  // ---- CONFIGURATION ----
  // API URL is read from config.js (loaded before this script)
  var API_BASE = (typeof ENV !== 'undefined' && ENV.API_BASE) ? ENV.API_BASE : 'http://localhost:8000';

  var STORAGE_KEY = 'chatbot_history';
  var categoriesData = [];

  // ---- DOM REFS ----
  var historyEl = document.getElementById('chat-history');
  var formEl = document.getElementById('chat-form');
  var submitBtn = document.getElementById('chat-submit');
  var clearBtn = document.getElementById('chat-clear');
  var supercatSel = document.getElementById('cb-supercategory');
  var catSel = document.getElementById('cb-category');

  if (!historyEl || !formEl) return;

  // ---- CATEGORIES ----
  function loadCategories() {
    fetch(API_BASE + '/categories')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        categoriesData = data;
        var supercats = [];
        var seen = {};
        data.forEach(function (c) {
          if (!seen[c.supercategory]) { supercats.push(c.supercategory); seen[c.supercategory] = true; }
        });
        supercats.sort();
        supercatSel.innerHTML = '<option value="">-- Select --</option>' +
          supercats.map(function (s) { return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>'; }).join('');
        updateStatus('Ready');
      })
      .catch(function () {
        supercatSel.innerHTML = '<option value="">Failed to load</option>';
        updateStatus('Offline');
      });
  }

  supercatSel.addEventListener('change', function () {
    var val = this.value;
    var cats = categoriesData.filter(function (c) { return c.supercategory === val; })
      .map(function (c) { return c.category; }).sort();
    catSel.innerHTML = cats.length
      ? '<option value="">-- Select --</option>' + cats.map(function (c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>'; }).join('')
      : '<option value="">Select supercategory first</option>';
  });

  function updateStatus(text) {
    document.querySelectorAll('.chatbot-status').forEach(function (el) { el.textContent = text; });
  }

  // ---- HISTORY PERSISTENCE ----
  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveHistory(messages) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch (e) { /* full */ }
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    renderAllMessages([]);
  }

  // ---- RENDERING ----
  function renderAllMessages(messages) {
    historyEl.innerHTML = '';
    if (messages.length === 0) {
      historyEl.innerHTML =
        '<div class="chat-empty">' +
          '<div class="chat-empty-icon">&#128269;</div>' +
          '<p>No searches yet. Fill out the form below to find product substitutes.</p>' +
        '</div>';
      return;
    }
    messages.forEach(function (msg) {
      if (msg.role === 'user') appendUserBubble(msg, false);
      else appendBotBubble(msg, false);
    });
    scrollToBottom();
  }

  function appendUserBubble(msg, animate) {
    var div = document.createElement('div');
    div.className = 'chat-bubble chat-bubble--user';
    if (!animate) div.style.animation = 'none';
    var c = msg.content;
    var tags = '<div class="chat-user-details">';
    tags += '<span class="chat-user-tag">' + escapeHtml(c.name) + '</span>';
    tags += '<span class="chat-user-tag">' + escapeHtml(c.supercategory) + ' &gt; ' + escapeHtml(c.category) + '</span>';
    tags += '<span class="chat-user-tag">Qty: ' + escapeHtml(String(c.quantity)) + (c.quantity_unit ? ' ' + escapeHtml(c.quantity_unit) : '') + '</span>';
    if (c.unit_price) tags += '<span class="chat-user-tag">$' + Number(c.unit_price).toFixed(2) + '/unit</span>';
    if (c.total_price) tags += '<span class="chat-user-tag">$' + Number(c.total_price).toFixed(2) + ' total</span>';
    tags += '</div>';
    div.innerHTML =
      '<div class="chat-bubble-label">You searched</div>' +
      tags +
      (c.description ? '<div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.35rem;">' + escapeHtml(c.description) + '</div>' : '') +
      '<div class="chat-bubble-time">' + formatTime(msg.timestamp) + '</div>';
    removeEmpty();
    historyEl.appendChild(div);
  }

  function appendBotBubble(msg, animate) {
    var div = document.createElement('div');
    div.className = 'chat-bubble chat-bubble--bot';
    if (!animate) div.style.animation = 'none';
    var c = msg.content;
    var html = '<div class="chat-bubble-label">Substitution Results</div>';

    if (c.error) {
      html += '<div class="chat-bot-error">' + escapeHtml(c.error) + '</div>';
    } else if (!c.substitutes || c.substitutes.length === 0) {
      html += '<div class="chat-bot-summary">No substitutes found for this product. Try a different category or description.</div>';
    } else {
      html += '<div class="chat-bot-summary">' + c.substitutes.length + ' substitute' + (c.substitutes.length > 1 ? 's' : '') + ' found (' + (c.candidates_evaluated || '?') + ' candidates evaluated)</div>';
      c.substitutes.forEach(function (sub) {
        html += renderSubCard(sub);
      });
    }

    html += '<div class="chat-bubble-time">' + formatTime(msg.timestamp) + '</div>';
    div.innerHTML = html;
    historyEl.appendChild(div);
  }

  function renderSubCard(sub) {
    var hasSavings = sub.savings !== null && sub.savings !== undefined;
    var h = '<div class="chat-sub-card">';
    h += '<div class="chat-sub-card-header">';
    h += '<span class="chat-sub-rank">' + sub.rank + '</span>';
    h += '<span class="chat-sub-name">' + escapeHtml(sub.product_name) + '</span>';
    h += '</div>';
    h += '<div class="chat-sub-meta">';
    h += '<span class="tag">SKU: ' + escapeHtml(sub.sku) + '</span>';
    if (sub.candidate_uom) h += '<span class="tag">' + escapeHtml(sub.candidate_uom) + '</span>';
    if (sub.unit_type) h += '<span class="tag">' + escapeHtml(sub.unit_type) + '</span>';
    h += '<span class="tag">Qty: ' + sub.qty_needed + '</span>';
    h += '</div>';
    h += '<div class="chat-sub-reason">' + escapeHtml(sub.reason) + '</div>';
    if (sub.comparison_notes) {
      h += '<div class="chat-sub-notes">' + escapeHtml(sub.comparison_notes) + '</div>';
    }
    h += '<div class="chat-sub-pricing">';
    h += '<span class="chat-sub-price-item">Our price: <span class="value">$' + sub.our_unit_price.toFixed(2) + '</span></span>';
    if (hasSavings) {
      h += '<span class="chat-sub-price-item">Your price: <span class="value">$' + sub.their_unit_price.toFixed(2) + '</span></span>';
    }
    h += '<span class="chat-sub-price-item">Our total: <span class="value">$' + sub.our_total_spend.toFixed(2) + '</span></span>';
    if (hasSavings) {
      var positive = sub.savings >= 0;
      h += '<span class="chat-sub-savings chat-sub-savings--' + (positive ? 'positive' : 'negative') + '">';
      h += (positive ? 'Save' : 'Costs more') + ': $' + Math.abs(sub.savings).toFixed(2) + ' (' + Math.abs(sub.savings_percentage).toFixed(1) + '%)';
      h += '</span>';
    }
    h += '</div></div>';
    return h;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'chat-typing';
    div.id = 'chat-typing-indicator';
    div.innerHTML =
      '<div class="chat-typing-dots"><span></span><span></span><span></span></div>' +
      '<span id="chat-typing-status" style="font-size:0.82rem;color:var(--text-muted);">Searching for substitutes...</span>';
    historyEl.appendChild(div);
    scrollToBottom();
  }

  function updateTypingStatus(msg) {
    var el = document.getElementById('chat-typing-status');
    if (el) el.textContent = msg;
  }

  function hideTyping() {
    var el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function removeEmpty() {
    var empty = historyEl.querySelector('.chat-empty');
    if (empty) empty.remove();
  }

  function scrollToBottom() {
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  // ---- SUBMIT ----
  function handleSubmit(e) {
    e.preventDefault();
    var name = document.getElementById('cb-name').value.trim();
    var supercategory = supercatSel.value;
    var category = catSel.value;
    var quantity = parseFloat(document.getElementById('cb-quantity').value);
    var unit_price = parseFloat(document.getElementById('cb-unit-price').value) || 0;
    var total_price = parseFloat(document.getElementById('cb-total-price').value) || 0;
    var quantity_unit = document.getElementById('cb-quantity-unit').value.trim();
    var description = document.getElementById('cb-description').value.trim();

    if (!name || !supercategory || !category || !quantity) {
      alert('Please fill in all required fields (name, supercategory, category, quantity).');
      return;
    }

    var payload = {
      name: name,
      description: description,
      supercategory: supercategory,
      category: category,
      quantity: quantity,
      quantity_unit: quantity_unit,
      unit_price: unit_price,
      total_price: total_price
    };

    var messages = loadHistory();
    var now = Date.now();

    // Add user message
    var userMsg = { role: 'user', timestamp: now, content: payload };
    messages.push(userMsg);
    saveHistory(messages);
    appendUserBubble(userMsg, true);
    scrollToBottom();

    // Show typing
    submitBtn.disabled = true;
    showTyping();

    var limitReached = false;

    fetch(API_BASE + '/substitute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      if (!res.ok) {
        return res.json().then(function (err) {
          if (res.status === 429) { limitReached = true; }
          throw new Error(err.detail || 'Request failed (HTTP ' + res.status + ')');
        });
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) return;

          buffer += decoder.decode(chunk.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop();

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (!line.startsWith('data: ')) continue;
            var event;
            try { event = JSON.parse(line.slice(6)); } catch (e) { continue; }

            if (event.type === 'status') {
              updateTypingStatus(event.message);
            } else if (event.type === 'result') {
              var data = event.data;
              var botMsg = {
                role: 'bot',
                timestamp: Date.now(),
                content: {
                  substitutes: data.substitutes || [],
                  candidates_evaluated: data.candidates_evaluated,
                  source_item: data.source_item
                }
              };
              messages.push(botMsg);
              saveHistory(messages);
              appendBotBubble(botMsg, true);
              scrollToBottom();

              if (data.requests_remaining !== undefined) {
                submitBtn.textContent = '\uD83D\uDD0D Find Substitutes (' + data.requests_remaining + ' left)';
              }
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          }

          return pump();
        });
      }

      return pump();
    })
    .catch(function (err) {
      var botMsg = {
        role: 'bot',
        timestamp: Date.now(),
        content: { error: err.message || 'Could not connect to API.' }
      };
      messages.push(botMsg);
      saveHistory(messages);
      appendBotBubble(botMsg, true);
      scrollToBottom();
      if (limitReached) { submitBtn.textContent = '\uD83D\uDD0D Limit Reached'; }
    })
    .finally(function () {
      hideTyping();
      if (!limitReached) submitBtn.disabled = false;
    });
  }

  // ---- HELPERS ----
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatTime(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ---- EXAMPLE ----
  function fillExample() {
    document.getElementById('cb-name').value = 'Sharpie S-Gel, Gel Pens, Medium Point (0.7mm), Black Ink Gel Pen, With Canister, 36 Count';
    document.getElementById('cb-quantity').value = '200';
    document.getElementById('cb-quantity-unit').value = '36 / Pack';
    document.getElementById('cb-unit-price').value = '52.29';
    document.getElementById('cb-total-price').value = '';
    document.getElementById('cb-description').value = 'Sharpie S-Gel gel pens, medium point 0.7mm, black ink, with canister, 36 count per pack';

    // Set supercategory and trigger category load
    var superVal = 'Office Supplies';
    var catVal = 'Writing Supplies & Instruments';
    supercatSel.value = superVal;
    var cats = categoriesData.filter(function (c) { return c.supercategory === superVal; })
      .map(function (c) { return c.category; }).sort();
    catSel.innerHTML = '<option value="">-- Select --</option>' +
      cats.map(function (c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>'; }).join('');
    catSel.value = catVal;
  }

  // ---- INIT ----
  formEl.addEventListener('submit', handleSubmit);
  clearBtn.addEventListener('click', function () {
    if (loadHistory().length === 0) return;
    clearHistory();
  });
  var exampleBtn = document.getElementById('chat-example');
  if (exampleBtn) exampleBtn.addEventListener('click', fillExample);

  loadCategories();
  renderAllMessages(loadHistory());

})();
