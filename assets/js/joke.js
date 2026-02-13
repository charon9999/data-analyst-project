// Fetch a random joke from JokeAPI on page load
(function () {
  var container = document.getElementById('joke-content');
  if (!container) return;

  fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.error) {
        container.innerHTML = '<span class="joke-loading">Could not load joke.</span>';
        return;
      }
      if (data.type === 'twopart') {
        container.innerHTML =
          '<p class="joke-setup">' + escapeHtml(data.setup) + '</p>' +
          '<p class="joke-delivery">' + escapeHtml(data.delivery) + '</p>';
      } else {
        container.innerHTML = '<p class="joke-setup">' + escapeHtml(data.joke) + '</p>';
      }
    })
    .catch(function () {
      container.innerHTML = '<span class="joke-loading">Could not load joke.</span>';
    });

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
