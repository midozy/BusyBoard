(function () {
  'use strict';

  const STORAGE_KEYS = {
    status: 'busyboard.status',
    customMessage: 'busyboard.customMessage',
    theme: 'busyboard.theme',
    panelHidden: 'busyboard.panelHidden',
    autoResetMinutes: 'busyboard.autoResetMinutes',
    autoResetTarget: 'busyboard.autoResetTarget',
    autoResetAt: 'busyboard.autoResetAt'
  };

  const STATUSES = [
    { key: 'available',     label: 'Available',            icon: '✓', color: '--c-available',     note: 'Come on in',                          key_num: '1' },
    { key: 'busy',          label: 'Busy',                  icon: '●', color: '--c-busy',          note: 'Please knock first',                  key_num: '2' },
    { key: 'meeting',       label: 'In Meeting',            icon: '◆', color: '--c-meeting',       note: 'In a meeting',                        key_num: '3' },
    { key: 'physical',      label: 'In Physical Meeting',   icon: '🚶', color: '--c-physical',      note: 'In a physical meeting',          key_num: '4' },
    { key: 'exec',          label: 'Executive Meeting',     icon: '★', color: '--c-exec',          note: 'Executive meeting in progress',       key_num: '5' },
    { key: 'teams',         label: 'Teams Call',            icon: '☎', color: '--c-teams',         note: 'On a Teams call',                     key_num: '6' },
    { key: 'focus',         label: 'Focus Work',            icon: '◐', color: '--c-focus',         note: 'Deep focus — minimal interruptions',  key_num: '7' },
    { key: 'dnd',           label: 'Do Not Disturb',        icon: '⛔', color: '--c-dnd',           note: 'Do not disturb',                     key_num: '8' },
    { key: 'away',          label: 'Away',                  icon: '○', color: '--c-away',          note: 'Away from desk',                     key_num: '9' }
  ];

  const els = {
    statusText:          document.getElementById('statusText'),
    statusIcon:          document.getElementById('statusIcon'),
    statusNote:          document.getElementById('statusNote'),
    display:             document.getElementById('display'),
    clock:               document.getElementById('clock'),
    dateLine:            document.getElementById('dateLine'),
    statusGrid:          document.getElementById('statusGrid'),
    darkToggle:          document.getElementById('darkToggle'),
    fullscreenToggle:    document.getElementById('fullscreenToggle'),
    panel:               document.getElementById('panel'),
    panelToggle:         document.getElementById('panelToggle'),
    panelShowBtn:        document.getElementById('panelShowBtn'),
    customMessageInput:  document.getElementById('customMessageInput'),
    clearMessageBtn:     document.getElementById('clearMessageBtn'),
    charCount:           document.getElementById('charCount'),
    autoResetSelect:     document.getElementById('autoResetSelect'),
    autoResetTarget:     document.getElementById('autoResetTarget'),
    autoResetHint:       document.getElementById('autoResetHint'),
    timerBanner:         document.getElementById('timerBanner'),
    remoteUrl:           document.getElementById('remoteUrl'),
    remoteBar:           document.getElementById('remoteBar')
  };

  let autoResetTimer = null;

  // ── Server mode detection ─────────────────────────────────────────────────
  // When opened via http:// (node server.js), status is shared via /api/status.
  // When opened via file:// it falls back to localStorage — works standalone.
  const SERVER_MODE = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const API = SERVER_MODE ? `${window.location.origin}/api/status` : null;

  // Tracks the last status we received from the server so we don't re-render
  // unnecessarily on every poll.
  let lastServerStatus = null;
  let lastServerMessage = null;

  function statusByKey(key) {
    return STATUSES.find((s) => s.key === key) || STATUSES[0];
  }

  // ── Status rendering ──────────────────────────────────────────────────────
  function applyStatus(key, opts = {}) {
    const status = statusByKey(key);
    document.documentElement.style.setProperty('--status-color', `var(${status.color})`);
    els.statusText.textContent = status.label;
    els.statusIcon.textContent = status.icon;
    
    // Show custom message if available, otherwise show default note
    const customMsg = opts.customMessage !== undefined ? opts.customMessage : getCurrentCustomMessage();
    els.statusNote.textContent = customMsg || status.note;
    
    document.title = `${status.label} — BusyBoard`;

    document.querySelectorAll('.status-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.key === key);
    });

    if (SERVER_MODE) {
      if (!opts.skipPost) postStatus(key, customMsg);
    } else {
      localStorage.setItem(STORAGE_KEYS.status, key);
    }

    if (!opts.skipAutoReset) scheduleAutoResetIfDifferent(key);
  }

  function getCurrentCustomMessage() {
    if (SERVER_MODE) {
      return lastServerMessage || '';
    }
    return localStorage.getItem(STORAGE_KEYS.customMessage) || '';
  }

  // ── API calls ─────────────────────────────────────────────────────────────
  function postStatus(key, customMessage = '') {
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: key, customMessage })
    }).catch(() => { /* network hiccup — ignore */ });
  }

  function pollStatus() {
    fetch(API)
      .then((r) => r.json())
      .then(({ status, customMessage }) => {
        const msgChanged = customMessage !== lastServerMessage;
        if (status && (status !== lastServerStatus || msgChanged)) {
          lastServerStatus = status;
          lastServerMessage = customMessage || '';
          applyStatus(status, { skipPost: true, skipAutoReset: true, customMessage: lastServerMessage });
        }
      })
      .catch(() => { /* offline — keep showing last known status */ });
  }

  // ── Status grid ───────────────────────────────────────────────────────────
  function buildStatusGrid() {
    els.statusGrid.innerHTML = '';
    STATUSES.forEach((status) => {
      const btn = document.createElement('button');
      btn.className = 'status-btn';
      btn.dataset.key = status.key;
      btn.style.setProperty('--dot-color', `var(${status.color})`);
      btn.innerHTML = `
        <span class="dot" style="background:var(${status.color})"></span>
        <span>${status.label}</span>
        <kbd>${status.key_num}</kbd>
      `;
      btn.addEventListener('click', () => applyStatus(status.key));
      els.statusGrid.appendChild(btn);
    });

    els.autoResetTarget.innerHTML = STATUSES.map(
      (s) => `<option value="${s.key}">${s.label}</option>`
    ).join('');
  }

  // ── Clock ─────────────────────────────────────────────────────────────────
  function tickClock() {
    const now = new Date();
    els.clock.textContent    = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    els.dateLine.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    updateTimerBanner();
  }

  // ── Auto reset ────────────────────────────────────────────────────────────
  function scheduleAutoResetIfDifferent(currentKey) {
    const minutes = parseInt(localStorage.getItem(STORAGE_KEYS.autoResetMinutes) || '0', 10);
    const target  = localStorage.getItem(STORAGE_KEYS.autoResetTarget) || 'available';

    clearTimeout(autoResetTimer);

    if (minutes > 0 && currentKey !== target) {
      const resetAt = Date.now() + minutes * 60 * 1000;
      localStorage.setItem(STORAGE_KEYS.autoResetAt, String(resetAt));
      autoResetTimer = setTimeout(() => {
        applyStatus(target);
        localStorage.removeItem(STORAGE_KEYS.autoResetAt);
      }, minutes * 60 * 1000);
    } else {
      localStorage.removeItem(STORAGE_KEYS.autoResetAt);
    }
  }

  function resumeAutoResetFromStorage() {
    const resetAt = parseInt(localStorage.getItem(STORAGE_KEYS.autoResetAt) || '0', 10);
    const minutes = parseInt(localStorage.getItem(STORAGE_KEYS.autoResetMinutes) || '0', 10);
    const target  = localStorage.getItem(STORAGE_KEYS.autoResetTarget) || 'available';

    if (resetAt && minutes > 0) {
      const remaining = resetAt - Date.now();
      if (remaining > 0) {
        clearTimeout(autoResetTimer);
        autoResetTimer = setTimeout(() => {
          applyStatus(target);
          localStorage.removeItem(STORAGE_KEYS.autoResetAt);
        }, remaining);
      } else {
        applyStatus(target);
        localStorage.removeItem(STORAGE_KEYS.autoResetAt);
      }
    }
  }

  function updateTimerBanner() {
    const resetAt = parseInt(localStorage.getItem(STORAGE_KEYS.autoResetAt) || '0', 10);
    if (!resetAt) { els.timerBanner.hidden = true; return; }
    const remainingMs = resetAt - Date.now();
    if (remainingMs <= 0) { els.timerBanner.hidden = true; return; }
    const mins = Math.floor(remainingMs / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    const target = statusByKey(localStorage.getItem(STORAGE_KEYS.autoResetTarget) || 'available');
    els.timerBanner.hidden = false;
    els.timerBanner.textContent = `Auto reset to "${target.label}" in ${mins}m ${secs.toString().padStart(2, '0')}s`;
  }

  function initAutoResetControls() {
    const savedMinutes = localStorage.getItem(STORAGE_KEYS.autoResetMinutes) || '0';
    const savedTarget  = localStorage.getItem(STORAGE_KEYS.autoResetTarget)  || 'available';
    els.autoResetSelect.value  = savedMinutes;
    els.autoResetTarget.value  = savedTarget;
    updateAutoResetHint();

    els.autoResetSelect.addEventListener('change', () => {
      localStorage.setItem(STORAGE_KEYS.autoResetMinutes, els.autoResetSelect.value);
      updateAutoResetHint();
      const currentStatus = SERVER_MODE ? lastServerStatus : (localStorage.getItem(STORAGE_KEYS.status) || 'available');
      scheduleAutoResetIfDifferent(currentStatus);
    });

    els.autoResetTarget.addEventListener('change', () => {
      localStorage.setItem(STORAGE_KEYS.autoResetTarget, els.autoResetTarget.value);
      updateAutoResetHint();
      const currentStatus = SERVER_MODE ? lastServerStatus : (localStorage.getItem(STORAGE_KEYS.status) || 'available');
      scheduleAutoResetIfDifferent(currentStatus);
    });
  }

  function updateAutoResetHint() {
    const minutes = parseInt(els.autoResetSelect.value, 10);
    if (minutes === 0) {
      els.autoResetHint.textContent = 'No auto reset scheduled.';
    } else {
      const targetLabel = statusByKey(els.autoResetTarget.value).label;
      els.autoResetHint.textContent = `Resets to "${targetLabel}" after ${minutes} min.`;
    }
  }

  // ── Remote URL bar ────────────────────────────────────────────────────────
  function initRemoteBar() {
    if (!els.remoteBar || !els.remoteUrl) return;
    if (SERVER_MODE) {
      const url = window.location.href.replace('localhost', window.location.hostname);
      els.remoteUrl.textContent = window.location.href;
      els.remoteBar.hidden = false;
    } else {
      els.remoteBar.hidden = true;
    }
  }

  // ── Dark mode ─────────────────────────────────────────────────────────────
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      els.darkToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      els.darkToggle.textContent = '🌙';
    }
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // ── Fullscreen ────────────────────────────────────────────────────────────
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ── Panel ─────────────────────────────────────────────────────────────────
  function setPanelHidden(hidden) {
    els.panel.classList.toggle('hidden', hidden);
    els.panelShowBtn.hidden = !hidden;
    localStorage.setItem(STORAGE_KEYS.panelHidden, hidden ? '1' : '0');
  }

  // ── Custom Message ────────────────────────────────────────────────────────
  function initCustomMessage() {
    const savedMessage = localStorage.getItem(STORAGE_KEYS.customMessage) || '';
    els.customMessageInput.value = savedMessage;
    updateCharCount();

    els.customMessageInput.addEventListener('input', () => {
      const message = els.customMessageInput.value;
      updateCharCount();
      
      if (SERVER_MODE) {
        const currentStatus = lastServerStatus || 'available';
        lastServerMessage = message;
        postStatus(currentStatus, message);
      } else {
        localStorage.setItem(STORAGE_KEYS.customMessage, message);
      }
      
      // Update display immediately
      const currentStatus = SERVER_MODE ? lastServerStatus : (localStorage.getItem(STORAGE_KEYS.status) || 'available');
      applyStatus(currentStatus, { skipPost: true, customMessage: message });
    });

    els.clearMessageBtn.addEventListener('click', () => {
      els.customMessageInput.value = '';
      els.customMessageInput.dispatchEvent(new Event('input'));
      els.customMessageInput.focus();
    });
  }

  function updateCharCount() {
    const count = els.customMessageInput.value.length;
    els.charCount.textContent = count;
    els.charCount.style.color = count > 50 ? 'var(--c-busy)' : 'var(--text-muted)';
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  function handleKeydown(e) {
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

    const numStatus = STATUSES.find((s) => s.key_num === e.key);
    if (numStatus) { applyStatus(numStatus.key); return; }

    switch (e.key.toLowerCase()) {
      case 'f': toggleFullscreen(); break;
      case 'd': toggleTheme();      break;
      case 'p': setPanelHidden(!els.panel.classList.contains('hidden')); break;
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    buildStatusGrid();

    // Apply saved theme
    applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || 'light');

    // Restore panel visibility state EARLY (before other UI updates)
    const panelHidden = localStorage.getItem(STORAGE_KEYS.panelHidden) === '1';
    setPanelHidden(panelHidden);

    if (SERVER_MODE) {
      // Fetch current status from server immediately, then poll every 1.5 s
      pollStatus();
      setInterval(pollStatus, 1500);
    } else {
      const saved = localStorage.getItem(STORAGE_KEYS.status) || 'available';
      applyStatus(saved, { skipAutoReset: true });
    }

    initCustomMessage();
    initAutoResetControls();
    resumeAutoResetFromStorage();
    initRemoteBar();

    tickClock();
    setInterval(tickClock, 1000);

    els.darkToggle.addEventListener('click', toggleTheme);
    els.fullscreenToggle.addEventListener('click', toggleFullscreen);
    els.panelToggle.addEventListener('click', () => setPanelHidden(true));
    els.panelShowBtn.addEventListener('click', () => setPanelHidden(false));
    document.addEventListener('keydown', handleKeydown);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
