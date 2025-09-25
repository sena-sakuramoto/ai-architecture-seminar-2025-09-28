const CODE = 'AP-2025-SEMINAR';
const KEY = 'ap_invite_ok';
const SLUG = 'aixarch-20250928-8dC2p';

const wantsSlug = () =>
  SLUG.length > 0 &&
  (location.pathname.endsWith(`/${SLUG}`) || location.pathname.endsWith(`/${SLUG}/`));

const ensureSlugPath = () => {
  if (!wantsSlug()) {
    location.pathname = `/${SLUG}/`;
    return false;
  }
  return true;
};

const renderGate = () => {
  const wrap = document.getElementById('app-gate');
  if (!wrap) {
    console.error('Gate container not found');
    return;
  }

  wrap.classList.remove('hidden');
  wrap.innerHTML = `
    <div class="w-full h-full bg-white flex items-center justify-center p-8">
      <div class="max-w-md w-full border border-slate-200 rounded-2xl p-6 shadow-xl">
        <div class="text-sm text-slate-500 mb-2">Invite Code</div>
        <input id="code" class="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="コードを入力">
        <button id="ok" class="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded px-3 py-2 transition">開く</button>
        <div class="mt-2 text-xs text-slate-500">受講者限定。第三者共有は不可。</div>
      </div>
    </div>`;

  const okButton = document.getElementById('ok');
  okButton?.addEventListener('click', () => {
    const input = document.getElementById('code');
    const value = input instanceof HTMLInputElement ? input.value.trim() : '';
    if (value === CODE) {
      localStorage.setItem(KEY, '1');
      wrap.remove();
    } else {
      alert('コードが違います');
    }
  });
};

const setupGate = () => {
  const ok = localStorage.getItem(KEY) === '1';
  const slugOk = wantsSlug();

  if (!ok || !slugOk) {
    if (!ensureSlugPath()) {
      return;
    }
    renderGate();
  }
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', setupGate);
  } else {
    setupGate();
  }
}
