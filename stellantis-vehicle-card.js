/*! Stellantis Vehicle Card - bundled (full + compact) - https://github.com/ac-uy/ha-stellantis-vehicle-card */
(function(){
const CARD_NAME = 'stellantis-custom-vehicle-card';

const DEFAULT_ENTITIES = {
  battery: 'sensor.garage_c5_aircross_battery',
  electricRange: 'sensor.garage_c5_aircross_range',
  fuel: 'sensor.garage_c5_aircross_fuel',
  fuelRange: 'sensor.garage_c5_aircross_fuel_range',
  mileage: 'sensor.garage_c5_aircross_mileage',
  cabin: 'sensor.garage_c5_aircross_temperature',
  coolant: 'sensor.garage_c5_aircross_coolant_temperature',
  serviceBattery: 'sensor.garage_c5_aircross_service_battery',
  lastTrip: 'sensor.garage_c5_aircross_last_trip',
  lastCharge: 'sensor.garage_c5_aircross_last_charge',
  batteryHealth: 'sensor.garage_c5_aircross_battery_soh_capacity',
  chargingRate: 'sensor.garage_c5_aircross_battery_charging_rate',
  chargingEnd: 'sensor.garage_c5_aircross_battery_charging_end',
  chargeLimit: 'number.garage_c5_aircross_battery_charging_limit',
  costPer100km: 'sensor.c5_aircross_cost_per_100km',
  charging: 'binary_sensor.garage_c5_aircross_battery_charging',
  plugged: 'binary_sensor.garage_c5_aircross_battery_plugged',
  climate: 'binary_sensor.garage_c5_aircross_preconditioning',
  engine: 'binary_sensor.garage_c5_aircross_engine',
  alarm: 'binary_sensor.garage_c5_aircross_alarm',
  connected: 'binary_sensor.garage_c5_aircross_remote_commands',
  climateStart: 'button.garage_c5_aircross_preconditioning_start',
  climateStop: 'button.garage_c5_aircross_preconditioning_stop',
  wake: 'button.garage_c5_aircross_wakeup',
  image: '/local/stellantis_vehicles/AC-ACNT200005973156/VR7A4DGZSPL028911.png',
};

const DIESEL_BASE = 6.4 * 1.90; // C5 diesel Aircross baseline €/100km

const CSS = `
  :host { display:block; }
  ha-card { position:relative; overflow:hidden; color:#f8fafc; background:linear-gradient(160deg,#0a1120 0%,#152136 52%,#080e1a 100%); border:1px solid rgba(148,163,184,.2); border-radius:28px; box-shadow:0 22px 55px rgba(0,0,0,.34); transition:border-color .4s ease, box-shadow .4s ease; }
  ha-card.accent-charging { border-color:rgba(34,197,94,.5); box-shadow:0 22px 55px rgba(0,0,0,.34), 0 0 42px rgba(34,197,94,.2); }
  ha-card.accent-low { border-color:rgba(245,158,11,.5); box-shadow:0 22px 55px rgba(0,0,0,.34), 0 0 38px rgba(245,158,11,.18); }
  ha-card.accent-alarm { border-color:rgba(239,68,68,.55); box-shadow:0 22px 55px rgba(0,0,0,.34), 0 0 38px rgba(239,68,68,.22); }
  ha-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:transparent; transition:background .4s ease; z-index:5; }
  ha-card.accent-charging::before { background:linear-gradient(90deg,transparent,#22c55e,transparent); }
  ha-card.accent-low::before { background:linear-gradient(90deg,transparent,#f59e0b,transparent); }
  ha-card.accent-alarm::before { background:linear-gradient(90deg,transparent,#ef4444,transparent); }
  .shell { padding:22px 24px 24px; }

  /* header */
  .topline { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
  .eyebrow { color:#8ea2bd; font-size:10px; font-weight:800; letter-spacing:.2em; text-transform:uppercase; }
  h1 { margin:5px 0 0; font-size:clamp(25px,4vw,36px); line-height:1; letter-spacing:-.04em; }
  .subtitle { margin-top:7px; color:#93a4bb; font-size:12px; }
  .connection { display:flex; align-items:center; gap:8px; padding:8px 13px; border-radius:999px; background:rgba(15,23,42,.7); color:#cbd5e1; font-size:10px; font-weight:800; letter-spacing:.09em; white-space:nowrap; }
  .dot { width:8px; height:8px; border-radius:50%; background:#64748b; box-shadow:0 0 0 4px rgba(100,116,139,.14); }
  .dot.on { background:#22c55e; box-shadow:0 0 0 4px rgba(34,197,94,.16); }

  /* hero with flanking gauges */
  .hero { position:relative; display:grid; grid-template-columns:minmax(120px,1fr) minmax(0,1.5fr) minmax(120px,1fr); align-items:center; gap:6px; min-height:250px; margin:14px 0 6px; }
  /* EV-only hero: battery on the left, car fills the rest (no fuel gauge) */
  .hero.hero-ev { grid-template-columns:minmax(130px,1fr) minmax(0,2fr); }
  .hero-car { position:relative; display:flex; align-items:center; justify-content:center; min-height:220px; }
  .hero-car::before { content:''; position:absolute; inset:6% 4%; background:radial-gradient(ellipse at center,rgba(71,95,126,.4) 0%,rgba(15,23,42,.08) 55%,transparent 78%); z-index:0; }
  .hero-car::after { content:''; position:absolute; left:12%; right:12%; bottom:20px; height:18px; border-radius:50%; background:rgba(0,0,0,.42); filter:blur(15px); }
  .hero-car img { position:relative; z-index:1; width:100%; max-width:340px; max-height:250px; object-fit:contain; filter:drop-shadow(0 24px 18px rgba(0,0,0,.5)); }
  .gauge { display:flex; flex-direction:column; gap:9px; }
  .gauge.right { align-items:flex-end; text-align:right; }
  .g-head { display:flex; align-items:center; gap:6px; color:#9fb0c6; font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
  .gauge.right .g-head { flex-direction:row-reverse; }
  .g-head ha-icon { --mdc-icon-size:17px; }
  .g-pct { font-size:34px; font-weight:800; letter-spacing:-.04em; line-height:1; }
  .g-range { color:#93a4bb; font-size:12px; font-weight:600; margin-top:-2px; }
  .g-bar { width:100%; height:9px; border-radius:99px; overflow:hidden; background:#22304a; box-shadow:inset 0 1px 2px rgba(0,0,0,.4); }
  .g-fill { height:100%; border-radius:inherit; transition:width .5s ease; }
  .g-fill.battery { background:linear-gradient(90deg,#ef4444,#f59e0b 35%,#22c55e); }
  .g-fill.fuel { background:linear-gradient(90deg,#ef4444,#f59e0b 30%,#eab308 55%,#22c55e); }
  .g-fill.charging { background:linear-gradient(90deg,#16a34a,#4ade80 50%,#16a34a); background-size:200% 100%; animation:flow 1.8s linear infinite; }
  .g-icon-batt { color:#4ade80; }
  .g-icon-fuel { color:#fbbf24; }
  @keyframes flow { 0% { background-position:0 0; } 100% { background-position:200% 0; } }

  /* charging strip */
  .charge-strip { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:18px; margin:6px 0 16px; padding:12px 18px; border-radius:16px; background:rgba(22,101,52,.24); border:1px solid rgba(34,197,94,.3); }
  .charge-strip .cs-item { display:flex; align-items:center; gap:7px; font-size:14px; font-weight:700; color:#dcfce7; }
  .charge-strip ha-icon { --mdc-icon-size:19px; color:#4ade80; }
  .charge-strip .cs-bolt { animation:blink 1.4s ease infinite; }
  @keyframes blink { 50% { opacity:.35; } }
  .charge-strip .cs-sub { color:#86efac; opacity:.85; font-weight:600; }

  /* cost highlight band */
  .cost-band { display:flex; align-items:center; gap:16px; margin:0 0 18px; padding:16px 18px; border-radius:18px; background:linear-gradient(135deg,rgba(21,94,58,.5),rgba(15,23,42,.5)); border:1px solid rgba(34,197,94,.28); }
  .cost-band .cb-icon { flex:0 0 auto; display:flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:14px; background:rgba(34,197,94,.16); }
  .cost-band .cb-icon ha-icon { --mdc-icon-size:26px; color:#4ade80; }
  .cost-band .cb-main { display:flex; flex-direction:column; gap:2px; }
  .cost-band .cb-cost { font-size:24px; font-weight:800; letter-spacing:-.03em; }
  .cost-band .cb-cost small { font-size:13px; font-weight:600; color:#93a4bb; }
  .cost-band .cb-label { font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#9fb0c6; }
  .cost-band .cb-save { margin-left:auto; text-align:right; }
  .cost-band .cb-save-val { font-size:20px; font-weight:800; color:#4ade80; letter-spacing:-.02em; }
  .cost-band .cb-save-label { font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#86efac; opacity:.8; }
  .cost-band.empty { background:rgba(15,23,42,.5); border-color:rgba(148,163,184,.18); }
  .cost-band.empty .cb-icon { background:rgba(148,163,184,.12); }
  .cost-band.empty .cb-icon ha-icon { color:#94a3b8; }

  /* status chips (colored fills) */
  .chips { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:18px; }
  .chip { display:flex; flex-direction:column; align-items:center; gap:5px; min-width:0; padding:11px 7px; border:1px solid rgba(148,163,184,.14); border-radius:15px; background:rgba(15,23,42,.5); text-align:center; transition:background .3s ease, border-color .3s ease; }
  .chip ha-icon { --mdc-icon-size:21px; color:#94a3b8; }
  .chip-label { overflow:hidden; color:#cbd5e1; font-size:10px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }
  .chip-state { color:#94a3b8; font-size:10px; font-weight:600; }
  .chip.on { background:rgba(22,101,52,.32); border-color:rgba(34,197,94,.4); }
  .chip.on ha-icon { color:#4ade80; }
  .chip.on .chip-state { color:#86efac; }
  .chip.warn { background:rgba(127,29,29,.34); border-color:rgba(239,68,68,.42); }
  .chip.warn ha-icon { color:#f87171; }
  .chip.warn .chip-state { color:#fca5a5; }

  /* secondary details */
  .section-title { display:flex; align-items:center; gap:8px; margin:0 0 10px; color:#9fb0c6; font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
  .section-title ha-icon { --mdc-icon-size:16px; color:#e11d48; }
  .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
  .stat { padding:11px 13px; border-left:2px solid #2f3e56; border-radius:0 10px 10px 0; background:rgba(15,23,42,.36); }
  .stat-label { color:#647388; font-size:10px; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
  .stat-value { margin-top:4px; color:#e8eef7; font-size:17px; font-weight:700; letter-spacing:-.02em; }
  .stat-unit { color:#8ea2bd; font-size:11px; font-weight:500; }

  /* actions */
  .actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .action { display:flex; align-items:center; gap:12px; min-height:60px; padding:12px 16px; border:1px solid rgba(148,163,184,.2); border-radius:16px; color:#e2e8f0; background:rgba(30,41,59,.78); cursor:pointer; font:inherit; text-align:left; transition:transform .15s ease, background .15s ease, border-color .15s ease; }
  .action:hover { transform:translateY(-2px); border-color:rgba(225,29,72,.75); background:rgba(51,65,85,.92); }
  .action:active { transform:translateY(0); }
  .action:disabled { cursor:not-allowed; opacity:.35; }
  .action.busy { animation:pulse 1s ease infinite; }
  .action.active { border-color:rgba(34,197,94,.6); background:rgba(22,101,52,.35); }
  .action ha-icon { --mdc-icon-size:26px; flex:0 0 auto; color:#fb7185; }
  .action.active ha-icon { color:#22c55e; }
  .action-text { display:flex; flex-direction:column; min-width:0; }
  .action-label { font-size:13px; font-weight:800; }
  .action-sub { margin-top:2px; color:#93a4bb; font-size:10px; font-weight:600; }
  .footer { display:flex; justify-content:space-between; gap:12px; margin-top:16px; color:#5b697d; font-size:10px; }
  @keyframes pulse { 50% { opacity:.52; } }

  @media (max-width:640px) {
    .shell { padding:18px; }
    .hero { grid-template-columns:1fr; gap:14px; }
    .hero-car { order:-1; min-height:180px; }
    .gauge, .gauge.right { align-items:stretch; text-align:left; }
    .gauge.right .g-head { flex-direction:row; }
    .stats { grid-template-columns:repeat(2,1fr); }
    .chips { grid-template-columns:repeat(2,1fr); }
    .cost-band { flex-wrap:wrap; }
    .cost-band .cb-save { margin-left:0; text-align:left; width:100%; }
    .footer { flex-direction:column; }
  }
  @media (max-width:420px) { .stats, .actions { grid-template-columns:1fr; } }
`;

class C5AircrossCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._clickHandler = (event) => this._handleAction(event);
  }

  setConfig(config) {
    this._config = config || {};
    this._entities = { ...DEFAULT_ENTITIES, ...(config?.entities || {}) };
    this._render();
  }

  set hass(value) { this._hass = value; this._render(); }
  get hass() { return this._hass; }
  connectedCallback() { this.shadowRoot.addEventListener('click', this._clickHandler); }
  disconnectedCallback() { this.shadowRoot.removeEventListener('click', this._clickHandler); }
  getCardSize() { return 9; }

  _state(entity) { return entity ? this._hass?.states?.[entity] : undefined; }
  _raw(entity) { const value = this._state(entity)?.state; return value === undefined || value === 'unknown' || value === 'unavailable' ? null : value; }
  _number(entity) { const value = Number(this._raw(entity)); return Number.isFinite(value) ? value : null; }
  _format(entity, digits = 1) { const value = this._number(entity); if (value === null) return '—'; return value.toLocaleString('en-US', { maximumFractionDigits: digits }); }
  _binary(entity, onText, offText) { const value = this._raw(entity); if (value === null) return 'Unknown'; return value === 'on' ? onText : offText; }
  _escape(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  _icon(name, cls = '') { return `<ha-icon class="${cls}" icon="${this._escape(name)}"></ha-icon>`; }

  _relativeTime(entity) {
    const raw = this._raw(entity);
    if (!raw) return '—';
    const then = new Date(raw);
    if (Number.isNaN(then.getTime())) return '—';
    const diff = Date.now() - then.getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    return `${days} d ago`;
  }

  // Flanking gauge for the hero (battery or fuel)
  _gauge(side, label, entity, rangeEntity, kind, icon, iconCls) {
    const percent = Math.max(0, Math.min(100, this._number(entity) ?? 0));
    return `<div class="gauge ${side}">
      <div class="g-head">${this._icon(icon, iconCls)}<span>${this._escape(label)}</span></div>
      <div class="g-pct">${this._format(entity, 0)}%</div>
      <div class="g-range">${this._format(rangeEntity, 0)} km range</div>
      <div class="g-bar"><div class="g-fill ${kind}" style="width:${percent}%"></div></div>
    </div>`;
  }

  _chip(label, entity, icon, onText, offText, warning = false) {
    const raw = this._raw(entity);
    const isOn = raw === 'on';
    const state = raw === null ? 'Unknown' : (isOn ? onText : offText);
    const className = raw === null ? '' : (isOn && warning ? 'warn' : (isOn ? 'on' : ''));
    return `<div class="chip ${className}">${this._icon(icon)}<div class="chip-label">${this._escape(label)}</div><div class="chip-state">${this._escape(state)}</div></div>`;
  }

  _stat(label, value, unit = '') {
    return `<div class="stat"><div class="stat-label">${this._escape(label)}</div><div class="stat-value">${this._escape(value)} <span class="stat-unit">${this._escape(unit)}</span></div></div>`;
  }

  // Cost + savings highlight band
  _costBand() {
    const n = this._number(this._entities.costPer100km);
    if (n === null) {
      return `<div class="cost-band empty">
        <div class="cb-icon">${this._icon('mdi:cash')}</div>
        <div class="cb-main"><div class="cb-cost">—</div><div class="cb-label">Charging cost · gathering data</div></div>
      </div>`;
    }
    const baseline = Number(this._config.fuel_baseline) || DIESEL_BASE;
    const saveLabel = this._config.save_label || 'saved vs diesel';
    const save = Math.max(0, baseline - n);
    return `<div class="cost-band">
      <div class="cb-icon">${this._icon('mdi:cash')}</div>
      <div class="cb-main">
        <div class="cb-cost">€${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}<small> /100km</small></div>
        <div class="cb-label">Cost to charge &amp; drive</div>
      </div>
      <div class="cb-save">
        <div class="cb-save-val">€${save.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
        <div class="cb-save-label">${this._escape(saveLabel)}</div>
      </div>
    </div>`;
  }

  _chargeStrip() {
    const e = this._entities;
    const rate = this._number(e.chargingRate);
    const rateTxt = rate === null ? '—' : `${rate.toLocaleString('en-US', { maximumFractionDigits: 0 })} km/h`;
    const limit = this._number(e.chargeLimit);
    const items = [];
    items.push(`<span class="cs-item"><ha-icon class="cs-bolt" icon="mdi:lightning-bolt"></ha-icon>${this._escape(rateTxt)}</span>`);
    const endRaw = this._raw(e.chargingEnd);
    if (endRaw) {
      const end = new Date(endRaw);
      if (!Number.isNaN(end.getTime())) {
        const now = new Date();
        const timeStr = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const diffMin = Math.round((end.getTime() - now.getTime()) / 60000);
        let etaTxt = `Ready ${timeStr}`;
        if (diffMin > 0) {
          const h = Math.floor(diffMin / 60);
          const m = diffMin % 60;
          const inTxt = h > 0 ? `${h}h ${m}m` : `${m}m`;
          etaTxt = `Ready ${timeStr} <span class="cs-sub">· in ${inTxt}</span>`;
        }
        items.push(`<span class="cs-item"><ha-icon icon="mdi:clock-outline"></ha-icon>${etaTxt}</span>`);
      }
    }
    const limitPct = (limit !== null && limit > 0) ? limit : 100;
    items.push(`<span class="cs-item"><ha-icon icon="mdi:battery-charging-90"></ha-icon>to ${this._escape(limitPct.toLocaleString('en-US', { maximumFractionDigits: 0 }))}%</span>`);
    return `<div class="charge-strip">${items.join('')}</div>`;
  }

  _render() {
    if (!this._hass || !this._entities) return;
    const e = this._entities;
    const connected = this._raw(e.connected) === 'on';
    const image = this._config.image || e.image;
    const title = this._config.title || 'C5 Aircross';
    const climateOn = this._raw(e.climate) === 'on';
    const charging = this._raw(e.charging) === 'on';
    const alarmOn = this._raw(e.alarm) === 'on';
    const battNum = this._number(e.battery);
    const lowBattery = battNum !== null && battNum <= 20;
    const accent = charging ? 'accent-charging' : (alarmOn ? 'accent-alarm' : (lowBattery ? 'accent-low' : ''));
    const wakeAvailable = this._state(e.wake) && this._state(e.wake).state !== 'unavailable';
    const climateAvailable = this._state(climateOn ? e.climateStop : e.climateStart)
      && this._state(climateOn ? e.climateStop : e.climateStart).state !== 'unavailable';

    const eyebrow = this._config.eyebrow || 'MY CITROËN';
    const subtitle = this._config.subtitle || 'Hybrid · Garage · Connected vehicle';
    const hideFuel = this._config.hide_fuel === true;

    this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card class="${accent}"><div class="shell">
      <div class="topline"><div><div class="eyebrow">${this._escape(eyebrow)}</div><h1>${this._escape(title)}</h1><div class="subtitle">${this._escape(subtitle)}</div></div><div class="connection"><span class="dot ${connected ? 'on' : ''}"></span>${connected ? 'CONNECTED' : 'OFFLINE'}</div></div>

      <div class="hero${hideFuel ? ' hero-ev' : ''}">
        ${this._gauge('left', 'Battery', e.battery, e.electricRange, charging ? 'battery charging' : 'battery', charging ? 'mdi:battery-charging' : 'mdi:battery-high', 'g-icon-batt')}
        <div class="hero-car"><img src="${this._escape(image)}" alt="${this._escape(title)}"></div>
        ${hideFuel ? '' : this._gauge('right', 'Fuel', e.fuel, e.fuelRange, 'fuel', 'mdi:gas-station', 'g-icon-fuel')}
      </div>

      ${charging ? this._chargeStrip() : ''}

      ${this._costBand()}

      <div class="chips">${this._chip('Charging', e.charging, 'mdi:battery-charging', 'Charging', 'Ready')}${this._chip('Plugged', e.plugged, 'mdi:power-plug', 'Connected', 'Unplugged')}${this._chip('Climate', e.climate, 'mdi:air-conditioner', 'Active', 'Off')}${this._chip('Alarm', e.alarm, 'mdi:alarm-light', 'Active', 'Clear', true)}</div>

      <div class="section-title">${this._icon('mdi:information-outline')}Vehicle details</div>
      <div class="stats">
        ${this._stat('Mileage', this._format(e.mileage, 0), 'km')}
        ${this._stat('Last trip', this._format(e.lastTrip, 1), 'km')}
        ${this._stat('Last charge', this._relativeTime(e.lastCharge))}
        ${this._stat('Battery health', this._format(e.batteryHealth, 0), '%')}
        ${this._stat('Cabin', this._format(e.cabin, 1), '°C')}
        ${this._stat('Coolant', this._format(e.coolant, 1), '°C')}
        ${this._stat('12V battery', this._format(e.serviceBattery, 0), '%')}
        ${this._stat('Engine', this._binary(e.engine, 'Running', 'Off'))}
      </div>

      <div class="section-title">${this._icon('mdi:gesture-tap-button')}Remote controls</div>
      <div class="actions">
        <button class="action ${climateOn ? 'active' : ''}" data-action="climate" ${climateAvailable ? '' : 'disabled'} aria-label="Toggle climate">
          ${this._icon(climateOn ? 'mdi:air-conditioner' : 'mdi:air-conditioner-off')}
          <span class="action-text"><span class="action-label">Climate ${climateOn ? 'on' : 'off'}</span><span class="action-sub">${climateOn ? 'Tap to stop' : 'Tap to start'}</span></span>
        </button>
        <button class="action" data-action="wake" ${wakeAvailable ? '' : 'disabled'} aria-label="Wake vehicle">
          ${this._icon('mdi:power-sleep')}
          <span class="action-text"><span class="action-label">Wake</span><span class="action-sub">Refresh vehicle data</span></span>
        </button>
      </div>
      <div class="footer"><span>Commands require remote-service access and may take a moment.</span><span>${connected ? 'API online' : 'Check connection'}</span></div>
    </div></ha-card>`;
  }

  async _handleAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled || !this._hass) return;
    const e = this._entities;
    const kind = button.dataset.action;
    let entity;
    if (kind === 'climate') {
      const climateOn = this._raw(e.climate) === 'on';
      entity = climateOn ? e.climateStop : e.climateStart;
      const confirmMsg = climateOn ? 'Stop preconditioning?' : 'Start preconditioning?';
      if (!window.confirm(confirmMsg)) return;
    } else if (kind === 'wake') {
      entity = e.wake;
    }
    if (!entity) return;
    button.classList.add('busy');
    try {
      await this._hass.callService('button', 'press', { entity_id: entity });
    } finally {
      setTimeout(() => button.classList.remove('busy'), 1400);
    }
  }
}

if (!customElements.get(CARD_NAME)) customElements.define(CARD_NAME, C5AircrossCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_NAME)) {
  window.customCards.push({ type: CARD_NAME, name: 'Stellantis Vehicle Card', description: 'Vehicle dashboard card for Stellantis cars (Citroën / Peugeot / etc.)' });
}

})();

(function(){
const CARD_NAME = 'stellantis-custom-vehicle-compact-card';

const DEFAULT_ENTITIES = {
  battery: 'sensor.garage_c5_aircross_battery',
  electricRange: 'sensor.garage_c5_aircross_range',
  fuel: 'sensor.garage_c5_aircross_fuel',
  fuelRange: 'sensor.garage_c5_aircross_fuel_range',
  mileage: 'sensor.garage_c5_aircross_mileage',
  charging: 'binary_sensor.garage_c5_aircross_battery_charging',
  chargingRate: 'sensor.garage_c5_aircross_battery_charging_rate',
  chargingEnd: 'sensor.garage_c5_aircross_battery_charging_end',
  chargeLimit: 'number.garage_c5_aircross_battery_charging_limit',
  plugged: 'binary_sensor.garage_c5_aircross_battery_plugged',
  climate: 'binary_sensor.garage_c5_aircross_preconditioning',
  alarm: 'binary_sensor.garage_c5_aircross_alarm',
  engine: 'binary_sensor.garage_c5_aircross_engine',
  connected: 'binary_sensor.garage_c5_aircross_remote_commands',
  climateStart: 'button.garage_c5_aircross_preconditioning_start',
  climateStop: 'button.garage_c5_aircross_preconditioning_stop',
  wake: 'button.garage_c5_aircross_wakeup',
  costPer100km: 'sensor.c5_aircross_cost_per_100km',
  image: '/local/stellantis_vehicles/AC-ACNT200005973156/VR7A4DGZSPL028911.png',
};

const CSS = `
  :host { display: block; }
  ha-card { position:relative; overflow:hidden; color:#f8fafc; background:linear-gradient(150deg,#0b1422 0%,#16243a 55%,#080f1c 100%); border:1px solid rgba(148,163,184,.22); border-radius:26px; box-shadow:0 18px 45px rgba(0,0,0,.32); transition:border-color .4s ease, box-shadow .4s ease; }
  ha-card.accent-charging { border-color:rgba(34,197,94,.5); box-shadow:0 18px 45px rgba(0,0,0,.32), 0 0 34px rgba(34,197,94,.22); }
  ha-card.accent-low { border-color:rgba(245,158,11,.5); box-shadow:0 18px 45px rgba(0,0,0,.32), 0 0 30px rgba(245,158,11,.2); }
  ha-card.accent-alarm { border-color:rgba(239,68,68,.55); box-shadow:0 18px 45px rgba(0,0,0,.32), 0 0 30px rgba(239,68,68,.24); }
  /* top accent line */
  ha-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:transparent; transition:background .4s ease; z-index:2; }
  ha-card.accent-charging::before { background:linear-gradient(90deg,transparent,#22c55e,transparent); }
  ha-card.accent-low::before { background:linear-gradient(90deg,transparent,#f59e0b,transparent); }
  ha-card.accent-alarm::before { background:linear-gradient(90deg,transparent,#ef4444,transparent); }
  .wrap { position:relative; padding:18px; }
  .head { display:grid; grid-template-columns:1fr auto; align-items:center; gap:12px; }
  .head-l { justify-self:start; display:flex; flex-direction:column; gap:2px; min-width:0; }
  .title { font-size:18px; font-weight:800; letter-spacing:-.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cost { display:flex; flex-direction:column; align-items:flex-end; gap:2px; justify-self:end; padding:6px 14px; border-radius:16px; background:rgba(15,23,42,.6); border:1px solid rgba(148,163,184,.16); white-space:nowrap; }
  .cost .cost-line { display:flex; align-items:center; gap:6px; }
  .cost ha-icon { --mdc-icon-size:16px; color:#4ade80; }
  .cost .cost-val { font-size:14px; font-weight:800; letter-spacing:-.02em; color:#f8fafc; }
  .cost .cost-unit { font-size:10px; font-weight:600; color:#94a3b8; }
  .cost .cost-save { font-size:9px; font-weight:700; color:#4ade80; letter-spacing:.02em; }
  .cost.cost-empty { flex-direction:row; align-items:center; gap:6px; opacity:.6; }
  .cost.cost-empty ha-icon { color:#94a3b8; }
  .conn { display:flex; align-items:center; gap:7px; padding:6px 10px; border-radius:999px; background:rgba(15,23,42,.7); font-size:10px; font-weight:800; letter-spacing:.08em; color:#cbd5e1; }
  .dot { width:8px; height:8px; border-radius:50%; background:#64748b; }
  .dot.on { background:#22c55e; box-shadow:0 0 0 4px rgba(34,197,94,.16); }
  .stage { position:relative; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:10px; margin-top:6px; }
  .stage.stage-ev { grid-template-columns:1fr auto; }
  .metric { display:flex; flex-direction:column; gap:7px; }
  .metric.right { align-items:flex-end; }
  .m { min-width:0; width:100%; max-width:150px; padding:9px 11px; border:1px solid rgba(148,163,184,.16); border-radius:14px; background:rgba(15,23,42,.55); }
  .metric.right .m { text-align:right; }
  .m-top { display:flex; align-items:center; gap:6px; color:#cbd5e1; font-size:10px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
  .metric.right .m-top { flex-direction:row-reverse; }
  .m-top ha-icon { --mdc-icon-size:15px; color:#94a3b8; }
  .m-val { margin-top:3px; font-size:17px; font-weight:800; letter-spacing:-.02em; }
  .m-sub { margin-top:1px; color:#94a3b8; font-size:10px; font-weight:600; }
  .bar { margin-top:6px; height:7px; border-radius:99px; overflow:hidden; background:#243044; }
  .fill { height:100%; border-radius:inherit; transition:width .4s ease; }
  .fill.battery { background:linear-gradient(90deg,#ef4444,#f59e0b 35%,#22c55e); }
  .fill.fuel { background:linear-gradient(90deg,#ef4444,#f59e0b 30%,#eab308 55%,#22c55e); }
  .fill.charging { background:linear-gradient(90deg,#16a34a,#4ade80 50%,#16a34a); background-size:200% 100%; animation:flow 1.8s linear infinite; }
  @keyframes flow { 0% { background-position:0% 0; } 100% { background-position:200% 0; } }
  .charge-strip { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:12px; padding:9px 14px; border-radius:14px; background:rgba(22,101,52,.28); border:1px solid rgba(34,197,94,.32); }
  .charge-strip .cs-item { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#dcfce7; }
  .charge-strip ha-icon { --mdc-icon-size:16px; color:#4ade80; }
  .charge-strip .cs-bolt { animation:blink 1.4s ease infinite; }
  @keyframes blink { 50% { opacity:.35; } }
  .charge-strip .cs-sub { color:#86efac; opacity:.8; font-weight:600; }
  .car { position:relative; display:flex; align-items:center; justify-content:center; padding:0 4px; height:130px; }
  .car::after { content:''; position:absolute; left:8%; right:8%; bottom:12px; height:14px; border-radius:50%; background:rgba(0,0,0,.42); filter:blur(12px); }
  .car img { position:relative; z-index:1; width:100%; max-width:230px; height:100%; max-height:130px; object-fit:contain; filter:drop-shadow(0 16px 14px rgba(0,0,0,.5)); }
  .status { display:flex; justify-content:center; flex-wrap:wrap; gap:6px; margin-top:14px; }
  .pill { display:flex; align-items:center; gap:5px; padding:7px 9px; border:1px solid rgba(148,163,184,.16); border-radius:999px; background:rgba(15,23,42,.55); font-size:11px; font-weight:700; color:#cbd5e1; font-family:inherit; white-space:nowrap; }
  .pill ha-icon { --mdc-icon-size:15px; color:#94a3b8; flex:0 0 auto; }
  .pill span { overflow:hidden; text-overflow:ellipsis; }
  .pill.icon-only { padding:8px; border-radius:50%; }
  .pill.icon-only ha-icon { --mdc-icon-size:18px; }
  .pill.on ha-icon { color:#22c55e; }
  .pill.warn ha-icon { color:#ef4444; }
  button.pill { cursor:pointer; transition:transform .15s ease, background .15s ease, border-color .15s ease; }
  button.pill:hover { transform:translateY(-2px); border-color:rgba(225,29,72,.7); background:rgba(51,65,85,.9); }
  button.pill:active { transform:translateY(0); }
  button.pill:disabled { cursor:not-allowed; opacity:.4; }
  button.pill.on:hover { border-color:rgba(34,197,94,.7); }
  button.pill.act { border-color:rgba(148,163,184,.35); }
  button.pill.busy { animation:pulse 1s ease infinite; }
  @keyframes pulse { 50% { opacity:.5; } }
  .odo { display:flex; align-items:center; gap:4px; color:#94a3b8; font-size:11px; font-weight:600; }
  .odo ha-icon { --mdc-icon-size:13px; color:#94a3b8; }
  @media (max-width:520px) {
    .stage, .stage.stage-ev { grid-template-columns:1fr; }
    .metric, .metric.right { align-items:stretch; }
    .metric.right .m { text-align:left; }
    .metric.right .m-top { flex-direction:row; }
    .m { max-width:none; }
    .car { order:-1; }
  }
`;

class C5AircrossCompactCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._clickHandler = (event) => this._handleAction(event);
  }
  setConfig(config) { this._config = config || {}; this._entities = { ...DEFAULT_ENTITIES, ...(config?.entities || {}) }; this._render(); }
  set hass(value) { this._hass = value; this._render(); }
  get hass() { return this._hass; }
  connectedCallback() { this.shadowRoot.addEventListener('click', this._clickHandler); }
  disconnectedCallback() { this.shadowRoot.removeEventListener('click', this._clickHandler); }
  getCardSize() { return 4; }

  _state(e) { return e ? this._hass?.states?.[e] : undefined; }
  _raw(e) { const v = this._state(e)?.state; return v === undefined || v === 'unknown' || v === 'unavailable' ? null : v; }
  _num(e) { const n = Number(this._raw(e)); return Number.isFinite(n) ? n : null; }
  _fmt(e, d = 0) { const n = this._num(e); return n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: d }); }
  _esc(v) { return String(v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  _icon(n) { return `<ha-icon icon="${this._esc(n)}"></ha-icon>`; }

  // Read-only status pill (plain <span>)
  _pill(label, entity, icon, onText, offText, warn = false) {
    const raw = this._raw(entity);
    const isOn = raw === 'on';
    const txt = raw === null ? label : (isOn ? onText : offText);
    const cls = raw === null ? '' : (isOn ? (warn ? 'warn' : 'on') : '');
    const iconsOnly = this._config.pills_icons_only === true;
    const inner = iconsOnly ? this._icon(icon) : `${this._icon(icon)}<span>${this._esc(txt)}</span>`;
    return `<span class="pill ${cls}${iconsOnly ? ' icon-only' : ''}" title="${this._esc(txt)}">${inner}</span>`;
  }

  // Live charging strip (rate + ready-by time + target)
  _chargeStrip() {
    const e = this._entities;
    const rate = this._num(e.chargingRate);
    const rateTxt = rate === null ? '—' : `${rate.toLocaleString('en-US', { maximumFractionDigits: 0 })} km/h`;
    const limit = this._num(e.chargeLimit);
    const items = [];
    items.push(`<span class="cs-item"><ha-icon class="cs-bolt" icon="mdi:lightning-bolt"></ha-icon>${this._esc(rateTxt)}</span>`);
    const endRaw = this._raw(e.chargingEnd);
    if (endRaw) {
      const end = new Date(endRaw);
      if (!Number.isNaN(end.getTime())) {
        const now = new Date();
        const timeStr = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const diffMin = Math.round((end.getTime() - now.getTime()) / 60000);
        let etaTxt = `Ready ${timeStr}`;
        if (diffMin > 0) {
          const h = Math.floor(diffMin / 60);
          const m = diffMin % 60;
          const inTxt = h > 0 ? `${h}h ${m}m` : `${m}m`;
          etaTxt = `Ready ${timeStr} <span class="cs-sub">· in ${inTxt}</span>`;
        }
        items.push(`<span class="cs-item"><ha-icon icon="mdi:clock-outline"></ha-icon>${etaTxt}</span>`);
      }
    }
    const limitPct = (limit !== null && limit > 0) ? limit : 100;
    items.push(`<span class="cs-item"><ha-icon icon="mdi:battery-charging-90"></ha-icon>to ${this._esc(limitPct.toLocaleString('en-US', { maximumFractionDigits: 0 }))}%</span>`);
    return `<div class="charge-strip">${items.join('')}</div>`;
  }

  // Centered charging-cost badge for the header
  _costBadge(entity) {
    const n = this._num(entity);
    if (n === null || n <= 0) {
      return `<span class="cost cost-empty">${this._icon('mdi:cash')}<span class="cost-unit">€/100km · no data yet</span></span>`;
    }
    const val = `€${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    const baseline = Number(this._config.fuel_baseline) || (6.4 * 1.90);
    const saveLabel = this._config.save_label || 'vs diesel';
    const save = Math.max(0, baseline - n);
    const saveTxt = `saves €${save.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${saveLabel}`;
    return `<span class="cost"><span class="cost-line">${this._icon('mdi:cash')}<span class="cost-val">${this._esc(val)}</span><span class="cost-unit">/100km</span></span><span class="cost-save">${this._esc(saveTxt)}</span></span>`;
  }

  // Clickable action pill (<button>)
  _actionPill(action, icon, label, { on = false, disabled = false, warn = false } = {}) {
    const iconsOnly = this._config.pills_icons_only === true;
    const cls = ['pill', 'act', on ? (warn ? 'warn' : 'on') : '', iconsOnly ? 'icon-only' : ''].filter(Boolean).join(' ');
    const inner = iconsOnly ? this._icon(icon) : `${this._icon(icon)}<span>${this._esc(label)}</span>`;
    return `<button class="${cls}" data-action="${this._esc(action)}" ${disabled ? 'disabled' : ''} title="${this._esc(label)}">${inner}</button>`;
  }

  _render() {
    if (!this._hass || !this._entities) return;
    const e = this._entities;
    const connected = this._raw(e.connected) === 'on';
    const image = this._config.image || e.image;
    const title = this._config.title || 'C5 Aircross';
    const hideFuel = this._config.hide_fuel === true;
    const batt = Math.max(0, Math.min(100, this._num(e.battery) ?? 0));
    const fuel = Math.max(0, Math.min(100, this._num(e.fuel) ?? 0));
    const climateOn = this._raw(e.climate) === 'on';
    const climateTarget = climateOn ? e.climateStop : e.climateStart;
    const climateDisabled = !(this._state(climateTarget) && this._state(climateTarget).state !== 'unavailable');
    const charging = this._raw(e.charging) === 'on';
    const alarmOn = this._raw(e.alarm) === 'on';
    const battNum = this._num(e.battery);
    const lowBattery = battNum !== null && battNum <= 20;
    const accent = charging ? 'accent-charging' : (alarmOn ? 'accent-alarm' : (lowBattery ? 'accent-low' : ''));

    this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card class="${accent}"><div class="wrap">
      <div class="head"><div class="head-l"><span class="title">${this._esc(title)}</span>${this._num(e.mileage) !== null ? `<span class="odo">${this._icon('mdi:counter')}${this._fmt(e.mileage)} km</span>` : ''}</div>${this._costBadge(e.costPer100km)}</div>
      <div class="stage${hideFuel ? ' stage-ev' : ''}">
        <div class="metric">
          <div class="m"><div class="m-top">${this._icon(charging ? 'mdi:battery-charging' : 'mdi:battery-high')}Battery</div><div class="m-val">${this._fmt(e.battery)}%</div><div class="m-sub">${this._fmt(e.electricRange)} km range</div><div class="bar"><div class="fill battery ${charging ? 'charging' : ''}" style="width:${batt}%"></div></div></div>
        </div>
        <div class="car"><img src="${this._esc(image)}" alt="${this._esc(title)}"></div>
        ${hideFuel ? '' : `<div class="metric right">
          <div class="m"><div class="m-top">${this._icon('mdi:gas-station')}Fuel</div><div class="m-val">${this._fmt(e.fuel)}%</div><div class="m-sub">${this._fmt(e.fuelRange)} km range</div><div class="bar"><div class="fill fuel" style="width:${fuel}%"></div></div></div>
        </div>`}
      </div>
      ${charging ? this._chargeStrip() : ''}
      <div class="status">
        ${this._actionPill('climate', climateOn ? 'mdi:air-conditioner' : 'mdi:snowflake', climateOn ? 'Climate' : 'Climate', { on: climateOn, disabled: climateDisabled })}
        ${this._pill('Charging', e.charging, 'mdi:battery-charging', 'Charging', 'Idle')}
        ${this._pill('Plugged', e.plugged, 'mdi:power-plug', 'Plugged', 'Unplugged')}
        ${this._pill('Engine', e.engine, 'mdi:engine', 'On', 'Off')}
        ${this._pill('Alarm', e.alarm, 'mdi:alarm-light', 'Alarm', 'Secure', true)}
      </div>
    </div></ha-card>`;
  }

  async _handleAction(event) {
    const button = event.target.closest('button[data-action]');
    if (!button || button.disabled || !this._hass) return;
    const e = this._entities;
    const kind = button.dataset.action;
    let entity;
    if (kind === 'climate') {
      const climateOn = this._raw(e.climate) === 'on';
      entity = climateOn ? e.climateStop : e.climateStart;
      if (!window.confirm(climateOn ? 'Stop preconditioning?' : 'Start preconditioning?')) return;
    }
    if (!entity) return;
    button.classList.add('busy');
    try {
      await this._hass.callService('button', 'press', { entity_id: entity });
    } finally {
      setTimeout(() => button.classList.remove('busy'), 1400);
    }
  }
}

if (!customElements.get(CARD_NAME)) customElements.define(CARD_NAME, C5AircrossCompactCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_NAME)) {
  window.customCards.push({ type: CARD_NAME, name: 'Stellantis Vehicle Compact Card', description: 'Compact Stellantis vehicle status card centered on the vehicle image' });
}

})();
