/* Clinical Rhythm resource site
   Search, type filters, live counts, and the active beat on the rhythm strip.
   Everything on the page is already rendered; this only shows and hides rows. */
(function () {
  'use strict';

  var input = document.getElementById('search');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-type]'));
  var rows = Array.prototype.slice.call(document.querySelectorAll('.resource[data-search]'));
  var topics = Array.prototype.slice.call(document.querySelectorAll('.topic[data-topic]'));
  var beats = Array.prototype.slice.call(document.querySelectorAll('.beat[data-beat]'));
  var results = document.querySelector('[data-results]');
  var none = document.querySelector('[data-none]');
  var totalEl = document.querySelector('[data-total]');
  var totalFiles = rows.length;
  var activeType = 'all';

  if (!rows.length) { return; }

  function terms() {
    if (!input) { return []; }
    return input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }

  function matches(row, words) {
    if (activeType !== 'all' && row.getAttribute('data-type') !== activeType) { return false; }
    var text = row.getAttribute('data-search') || '';
    for (var i = 0; i < words.length; i++) {
      if (text.indexOf(words[i]) === -1) { return false; }
    }
    return true;
  }

  function setCount(id, n) {
    var els = document.querySelectorAll('[data-count="' + id + '"]');
    for (var i = 0; i < els.length; i++) { els[i].textContent = n; }
  }

  function apply() {
    var words = terms();
    var filtering = words.length > 0 || activeType !== 'all';
    var shown = 0;

    topics.forEach(function (topic) {
      var id = topic.getAttribute('data-topic');
      var visibleHere = 0;

      Array.prototype.forEach.call(topic.querySelectorAll('.group'), function (group) {
        var visibleInGroup = 0;
        Array.prototype.forEach.call(group.querySelectorAll('.resource'), function (row) {
          var ok = matches(row, words);
          row.hidden = !ok;
          if (ok) { visibleInGroup++; }
        });
        group.hidden = visibleInGroup === 0;
        visibleHere += visibleInGroup;
      });

      shown += visibleHere;
      setCount(id, visibleHere);

      var hasFiles = topic.querySelector('.resource') !== null;
      topic.hidden = filtering && hasFiles && visibleHere === 0;

      var beat = document.querySelector('.beat[data-beat="' + id + '"]');
      if (beat) { beat.classList.toggle('is-dim', filtering && visibleHere === 0); }
    });

    if (totalEl) { totalEl.textContent = filtering ? shown : totalFiles; }
    if (results) {
      results.textContent = filtering ? 'Showing ' + shown + ' of ' + totalFiles + ' files' : '';
    }
    if (none) { none.hidden = !(filtering && shown === 0); }
  }

  if (input) {
    input.addEventListener('input', apply);
    input.addEventListener('search', apply);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; apply(); input.blur(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) { return; }
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return; }
      e.preventDefault();
      input.focus();
      input.select();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeType = chip.getAttribute('data-type');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
  });

  /* Highlight the beat for the topic currently on screen. */
  var barHeight = (document.querySelector('.bar') || { offsetHeight: 60 }).offsetHeight;
  var ticking = false;

  function markActive() {
    ticking = false;
    var current = null;
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].hidden) { continue; }
      var top = topics[i].getBoundingClientRect().top;
      if (top - barHeight <= 80) { current = topics[i]; } else { break; }
    }
    var id = current ? current.getAttribute('data-topic') : null;
    beats.forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-beat') === id);
    });
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(markActive); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  markActive();
})();
