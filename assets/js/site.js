/* Clinical Rhythm resource site
   Search, type filters, live counts, collapsible topics, and the active beat on the
   rhythm strip. Everything is already rendered; this only shows, hides, opens and closes. */
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
  var expandAll = document.querySelector('[data-expand-all]');
  var totalFiles = rows.length;
  var activeType = 'all';
  var filtering = false;
  var STORE = 'clinical-rhythm-open';

  if (!topics.length) { return; }

  function has(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }

  /* ---------- remembered open state ---------- */

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveState() {
    try { window.localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  var state = loadState();   /* what the person chose, per topic id, kept on this device */
  var override = {};         /* choices made while a search is active; forgotten when it clears */

  function remember(topic, open) {
    if (filtering) { override[topic.id] = open; } else { state[topic.id] = open; saveState(); }
  }

  /* Open or close without treating it as the person's choice. */
  function setSilently(topic, open) {
    if (topic.open === open) { return; }
    topic.dataset.auto = '1';
    topic.open = open;
  }

  function setOpen(topic, open) {
    remember(topic, open);
    setSilently(topic, open);
  }

  function openFromHash() {
    var id = window.location.hash.replace(/^#/, '');
    if (!id) { return; }
    var target;
    try { target = document.getElementById(decodeURIComponent(id)); } catch (e) { target = null; }
    if (!target) { return; }
    var topic = target.closest ? target.closest('.topic') : null;
    if (topic) { setOpen(topic, true); }
  }

  function refreshExpandAll() {
    if (!expandAll) { return; }
    var visible = topics.filter(function (t) { return !t.hidden; });
    var allOpen = visible.length > 0 && visible.every(function (t) { return t.open; });
    expandAll.textContent = allOpen ? 'Collapse all' : 'Expand all';
    expandAll.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
  }

  /* Topics that start open because of the "open" flag in topics.yml. */
  topics.forEach(function (t) { if (t.open) { t.setAttribute('data-default-open', ''); } });

  /* Restore what the person left open last time, then honour a #topic link. */
  topics.forEach(function (t) { if (has(state, t.id)) { setSilently(t, !!state[t.id]); } });
  openFromHash();

  topics.forEach(function (topic) {
    topic.addEventListener('toggle', function () {
      if (topic.dataset.auto === '1') { delete topic.dataset.auto; refreshExpandAll(); return; }
      remember(topic, topic.open);
      refreshExpandAll();
    });
  });

  /* A tap on a beat, or any link to a topic, opens it before the page scrolls so the jump lands right. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) { return; }
    var topic = document.getElementById(a.getAttribute('href').slice(1));
    if (topic && topic.classList.contains('topic')) { setOpen(topic, true); }
  });
  window.addEventListener('hashchange', openFromHash);

  if (expandAll) {
    expandAll.addEventListener('click', function () {
      var visible = topics.filter(function (t) { return !t.hidden; });
      var allOpen = visible.every(function (t) { return t.open; });
      visible.forEach(function (t) { setOpen(t, !allOpen); });
      refreshExpandAll();
    });
  }

  /* ---------- search and type filter ---------- */

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
    var wasFiltering = filtering;
    filtering = words.length > 0 || activeType !== 'all';
    if (wasFiltering && !filtering) { override = {}; }
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
      topic.hidden = filtering && visibleHere === 0;

      /* A topic with matches opens so the results are visible. When the search clears,
         every topic goes back to how the person left it. */
      var wantOpen;
      if (filtering) {
        wantOpen = has(override, id) ? override[id] : visibleHere > 0;
      } else {
        wantOpen = has(state, id) ? !!state[id] : topic.hasAttribute('data-default-open');
      }
      setSilently(topic, wantOpen);

      var beat = document.querySelector('.beat[data-beat="' + id + '"]');
      if (beat) { beat.classList.toggle('is-dim', filtering && visibleHere === 0); }
    });

    if (totalEl) { totalEl.textContent = filtering ? shown : totalFiles; }
    if (results) {
      results.textContent = filtering ? 'Showing ' + shown + ' of ' + totalFiles + ' files' : '';
    }
    if (none) { none.hidden = !(filtering && shown === 0); }
    refreshExpandAll();
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
    if (input.value) { apply(); }
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

  /* Printing shows every topic; afterwards the page goes back to how it was. */
  window.addEventListener('beforeprint', function () {
    topics.forEach(function (t) { setSilently(t, true); });
  });
  window.addEventListener('afterprint', apply);

  refreshExpandAll();

  /* ---------- active beat on the strip ---------- */

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
