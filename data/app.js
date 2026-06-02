const ROUTES = [
  { hash: "#/", label: "Home", render: renderHome },
  { hash: "#/configuracao", label: "Configuração", render: renderConfig },
  { hash: "#/manual", label: "Modo Manual", render: renderManual },
  { hash: "#/historico", label: "Histórico", render: renderHistory },
  { hash: "#/status", label: "Status", render: renderStatus },
];

const app = document.getElementById("app");
const navLinks = document.getElementById("nav-links");

function fmtNum(n, dec = 1) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("pt-BR", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

async function api(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function pageHeader(title, subtitle) {
  return `<header class="page-header">
    <h1>${title}</h1>
    <p>${subtitle}</p>
  </header>`;
}

function renderChart(title, samples, heightClass) {
  const values = samples.length ? samples.map((s) => s.v) : [];
  const max = values.length ? Math.max(...values) : 1;
  const min = values.length ? Math.min(...values) : 0;
  const bars = values.length || 12;
  const barHtml = (values.length ? values : Array(12).fill(0))
    .map((v) => {
      const pct = max > min ? ((v - min) / (max - min)) * 85 + 15 : 40;
      return `<div class="bar" style="height:${pct}%"></div>`;
    })
    .join("");
  return `<section class="chart-box">
    <h2>${title}</h2>
    <div class="chart-bars">${barHtml}</div>
    <div class="chart-axis"><span>início</span><span>meio</span><span>agora</span></div>
  </section>`;
}

function buildNav() {
  const hash = location.hash || "#/";
  navLinks.innerHTML = ROUTES.map(
    (r) =>
      `<a href="${r.hash}" class="${hash === r.hash ? "active" : ""}">${r.label}</a>`
  ).join("");
}

function router() {
  buildNav();
  const hash = location.hash || "#/";
  const route = ROUTES.find((r) => r.hash === hash) || ROUTES[0];
  route.render().catch((err) => {
    app.innerHTML =
      pageHeader("Erro", "Não foi possível carregar os dados") +
      `<p class="message error">${err.message}. Verifique se está conectado ao Wi-Fi da ESP32.</p>`;
  });
}

async function renderHome() {
  const data = await api("/api/sensors");
  const hist = await api("/api/history?sensor=temperature");
  const ago =
    data.updatedSecAgo < 60
      ? `há ${data.updatedSecAgo} s`
      : `há ${Math.floor(data.updatedSecAgo / 60)} min`;

  app.innerHTML =
    pageHeader("Home — Dashboard", "Visão geral dos sensores e tendência") +
    `<section aria-label="Cards de sensores">
      <p class="section-label">Sensores (4 cards)</p>
      <div class="sensor-grid">
        <article class="sensor-card"><span class="name">Temperatura</span><p class="value">${fmtNum(data.temperature)} °C</p></article>
        <article class="sensor-card"><span class="name">Umidade</span><p class="value">${fmtNum(data.humidity, 0)} %</p></article>
        <article class="sensor-card"><span class="name">Luminosidade</span><p class="value">${fmtNum(data.light, 0)} lux</p></article>
        <article class="sensor-card"><span class="name">CO₂</span><p class="value">${fmtNum(data.co2, 0)} ppm</p></article>
      </div>
    </section>
    ${renderChart("Gráfico — leituras recentes (Temperatura)", hist.samples || [])}
    <footer class="page-footer">
      <span>Atualizado: ${ago}</span>
      <button type="button" class="btn" id="btn-refresh">Atualizar</button>
    </footer>`;

  document.getElementById("btn-refresh").onclick = () => router();
}

async function renderConfig() {
  const cfg = await api("/api/config");
  app.innerHTML =
    pageHeader("Configuração", "Parâmetros do sistema e limites dos sensores") +
    `<form id="cfg-form" class="cfg-form">
      <fieldset>
        <legend>Limites de alerta</legend>
        <div class="field"><label>Temp. mínima (°C)</label><input name="tempMin" type="number" step="0.1" value="${cfg.tempMin}" /></div>
        <div class="field"><label>Temp. máxima (°C)</label><input name="tempMax" type="number" step="0.1" value="${cfg.tempMax}" /></div>
        <div class="field"><label>Umidade máxima (%)</label><input name="humidityMax" type="number" step="1" value="${cfg.humidityMax}" /></div>
      </fieldset>
      <fieldset>
        <legend>Comunicação</legend>
        <div class="field"><label>Broker MQTT</label><input name="mqttBroker" value="${cfg.mqttBroker}" /></div>
        <div class="field"><label>Tópico base</label><input name="mqttTopic" value="${cfg.mqttTopic}" /></div>
        <div class="field"><label>Intervalo de leitura (s)</label><input name="readIntervalSec" type="number" min="5" value="${cfg.readIntervalSec}" /></div>
      </fieldset>
      <fieldset>
        <legend>Wi-Fi (rede do roteador)</legend>
        <div class="field"><label>Nome da rede (SSID)</label><input name="wifiSsid" value="${cfg.wifiSsid || ""}" placeholder="Deixe vazio para usar modo AP" /></div>
        <div class="field"><label>Senha Wi-Fi</label><input name="wifiPassword" type="password" placeholder="••••••••" /></div>
      </fieldset>
      <fieldset>
        <legend>Geral</legend>
        <div class="field"><label>Nome do dispositivo</label><input name="deviceName" value="${cfg.deviceName}" /></div>
      </fieldset>
      <div style="display:flex;gap:0.75rem">
        <button type="submit" class="btn btn-primary">Salvar</button>
        <button type="button" class="btn" id="cfg-cancel">Cancelar</button>
      </div>
      <p id="cfg-msg" class="message hidden"></p>
    </form>`;

  document.getElementById("cfg-cancel").onclick = () => router();
  document.getElementById("cfg-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    body.tempMin = parseFloat(body.tempMin);
    body.tempMax = parseFloat(body.tempMax);
    body.humidityMax = parseFloat(body.humidityMax);
    body.readIntervalSec = parseInt(body.readIntervalSec, 10);
    try {
      await api("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const msg = document.getElementById("cfg-msg");
      msg.className = "message ok";
      msg.textContent =
        "Salvo. Se alterou o Wi-Fi, reinicie o dispositivo na página Status.";
    } catch {
      const msg = document.getElementById("cfg-msg");
      msg.className = "message error";
      msg.textContent = "Falha ao salvar.";
    }
  };
}

async function renderManual() {
  const state = await api("/api/actuators");

  app.innerHTML =
    pageHeader("Modo Manual", "Controle direto dos atuadores (sobrescreve automação)") +
    `<div class="alert-box ${state.manualMode ? "" : "hidden"}" id="manual-alert">
      ⚠ Modo manual ativo — automação pausada
    </div>
    <section>
      <p class="section-label">Atuadores (3 toggles)</p>
      <div class="toggle-row">
        <span>Ventilador</span>
        <button type="button" class="toggle ${state.fan ? "on" : ""}" data-key="fan" aria-pressed="${state.fan}"></button>
      </div>
      <div class="toggle-row">
        <span>Bomba de irrigação</span>
        <button type="button" class="toggle ${state.pump ? "on" : ""}" data-key="pump"></button>
      </div>
      <div class="toggle-row">
        <span>Iluminação LED</span>
        <button type="button" class="toggle ${state.led ? "on" : ""}" data-key="led"></button>
      </div>
      <div class="field" style="margin-top:1rem">
        <label><input type="checkbox" id="manual-mode" ${state.manualMode ? "checked" : ""} /> Ativar modo manual</label>
      </div>
    </section>
    <div class="chart-box" style="margin-top:2rem">
      <p style="margin:0;font-weight:700">Estado consolidado</p>
      <ul id="actuator-summary" style="margin:0.5rem 0 0;padding-left:1.25rem;color:#525252;font-size:0.875rem"></ul>
    </div>`;

  let local = { ...state };

  function summary() {
    const on = (v) => (v ? "LIGADO" : "DESLIGADO");
    document.getElementById("actuator-summary").innerHTML = `
      <li>Ventilador: ${on(local.fan)}</li>
      <li>Bomba: ${on(local.pump)}</li>
      <li>LED: ${on(local.led)}</li>`;
    document.getElementById("manual-alert").classList.toggle("hidden", !local.manualMode);
  }

  async function persist() {
    await api("/api/actuators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(local),
    });
    summary();
  }

  document.querySelectorAll(".toggle").forEach((btn) => {
    btn.onclick = async () => {
      if (!local.manualMode) return;
      const key = btn.dataset.key;
      local[key] = !local[key];
      btn.classList.toggle("on", local[key]);
      await persist();
    };
  });

  document.getElementById("manual-mode").onchange = async (e) => {
    local.manualMode = e.target.checked;
    if (!local.manualMode) {
      local.fan = local.pump = local.led = false;
      document.querySelectorAll(".toggle").forEach((b) => b.classList.remove("on"));
    }
    await persist();
  };

  summary();
}

async function renderHistory() {
  let sensor = "temperature";
  app.innerHTML =
    pageHeader("Histórico", "Dados armazenados na memória da ESP32") +
    `<section class="filters">
      <p class="section-label" style="width:100%">Filtros</p>
      <div class="field">
        <label>Sensor</label>
        <select id="hist-sensor">
          <option value="temperature">Temperatura</option>
          <option value="humidity">Umidade</option>
          <option value="light">Luminosidade</option>
          <option value="co2">CO₂</option>
        </select>
      </div>
      <div class="field">
        <label>&nbsp;</label>
        <button type="button" class="btn" id="hist-apply">Aplicar</button>
      </div>
    </section>
    <div id="hist-content"></div>`;

  async function load() {
    sensor = document.getElementById("hist-sensor").value;
    const hist = await api(`/api/history?sensor=${sensor}`);
    const samples = hist.samples || [];
    const values = samples.map((s) => s.v);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const avg = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
    const unit =
      sensor === "temperature"
        ? "°C"
        : sensor === "humidity"
          ? "%"
          : sensor === "light"
            ? " lux"
            : " ppm";
    const names = {
      temperature: "Temperatura",
      humidity: "Umidade",
      light: "Luminosidade",
      co2: "CO₂",
    };
    document.getElementById("hist-content").innerHTML =
      renderChart(`Gráfico — histórico (${names[sensor]})`, samples) +
      `<div class="stats-row">
        <span>Min: ${fmtNum(min)}${unit}</span>
        <span>Média: ${fmtNum(avg)}${unit}</span>
        <span>Max: ${fmtNum(max)}${unit}</span>
      </div>
      <p class="message" style="margin-top:1rem">${samples.length} amostras em RAM (máx. ${hist.count || 0})</p>`;
  }

  document.getElementById("hist-apply").onclick = load;
  await load();
}

async function renderStatus() {
  const st = await api("/api/status");
  const wifiLabel = st.wifiMode === "ap" ? "AP — " + st.wifiSsid : "STA — " + st.wifiSsid;

  app.innerHTML =
    pageHeader("Status do Sistema", "Conectividade e saúde do dispositivo") +
    `<section>
      <div class="status-row">
        <span>Wi-Fi</span>
        <span><span class="status-dot ${st.wifiConnected ? "ok" : "err"}"></span>${wifiLabel}</span>
      </div>
      <div class="status-row">
        <span>MQTT</span>
        <span><span class="status-dot ${st.mqttConfigured ? "ok" : "warn"}"></span>${st.mqttConfigured ? "Configurado — " + st.mqttBroker : "Não conectado (apenas configurado)"}</span>
      </div>
      <div class="status-row">
        <span>Uptime</span>
        <span><span class="status-dot ok"></span>${st.uptime}</span>
      </div>
    </section>
    <section>
      <p class="section-label" style="margin-top:2rem">Informações adicionais</p>
      <div class="info-grid">
        <div class="info-cell"><span>IP local</span><strong>${st.ip}</strong></div>
        <div class="info-cell"><span>Firmware</span><strong>${st.firmware}</strong></div>
        <div class="info-cell"><span>Memória livre</span><strong>${st.freeHeapKb} KB</strong></div>
        <div class="info-cell"><span>Dispositivo</span><strong>${st.deviceName}</strong></div>
      </div>
    </section>
    <div class="center-actions">
      <button type="button" class="btn" id="btn-reboot">Reiniciar dispositivo</button>
    </div>`;

  document.getElementById("btn-reboot").onclick = async () => {
    if (!confirm("Reiniciar a ESP32?")) return;
    await api("/api/reboot", { method: "POST" });
    app.innerHTML = pageHeader("Reiniciando…", "Aguarde e recarregue a página em alguns segundos.");
  };
}

window.addEventListener("hashchange", router);
router();
setInterval(() => {
  const hash = location.hash || "#/";
  if (hash === "#/" || hash === "#/status") router();
}, 10000);
