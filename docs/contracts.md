# contracts.md — Contrato Técnico do Projeto Estufa Inteligente

> **Versão:** v1.0 — S1 (23-24/mai/2026)
> **Status:** rascunho inicial — deve ser revisado e aprovado pelos três membros ao final da S1.
> **Regra de ouro:** ninguém muda este arquivo sozinho. Qualquer alteração vira PR no GitHub, os outros dois aprovam, e só aí entra em `main`.

---

## 1. Identificadores fixos

| Campo | Valor |
|-------|-------|
| `device_id` do protótipo | `estufa01` |
| Prefixo de tópicos MQTT | `estufa/{device_id}/...` |
| Prefixo de endpoints REST | `/api/v1/...` |
| Porta do broker (TLS) | `8883` |
| Broker | HiveMQ Cloud Free Tier |
| Usuários MQTT | `esp32` (firmware) · `backend` (back-end Python) |

---

## 2. Tópicos MQTT

Todos os tópicos seguem o padrão `estufa/{device_id}/<frente>/<subtópico>`.
O back-end assina com wildcard: `estufa/+/telemetria/#` e `estufa/+/config/#`.

### 2.1 Telemetria (ESP32 → Broker → Back-end)

#### `estufa/{id}/telemetria/sensores`
- **Direção:** ESP32 publica
- **QoS:** 0
- **Frequência:** a cada 60 s (média móvel de 6 amostras de leituras a cada 10 s)
- **Payload:**
```json
{
  "ts": 1748123456,
  "device_id": "estufa01",
  "temp_c":   { "val": 24.5,  "ma": 24.3  },
  "umid_ar":  { "val": 58.2,  "ma": 57.9  },
  "umid_solo":{ "val": 67.0,  "ma": 66.5  },
  "luz_lux":  { "val": 3200,  "ma": 3180  },
  "nivel_cm": { "val": 18.4,  "ma": 18.4  },
  "qualidade": 1
}
```
- **Campos:**
  - `ts` — Unix timestamp (segundos, via NTP)
  - `val` — leitura instantânea (usada pela malha de controle)
  - `ma` — média móvel de janela deslizante de 6 amostras (persistida no banco)
  - `qualidade` — `1` = leitura válida; `0` = sensor com falha (último valor válido mantido por até 3 ciclos)

#### `estufa/{id}/telemetria/status`
- **Direção:** ESP32 publica
- **QoS:** 0
- **Frequência:** a cada 60 s
- **Payload:**
```json
{
  "ts": 1748123456,
  "device_id": "estufa01",
  "modo": "auto",
  "atuadores": {
    "bomba":     { "estado": "off", "pwm_pct": 0   },
    "ventoinha": { "estado": "on",  "pwm_pct": 75  },
    "led_r":     { "estado": "on",  "pwm_pct": 100 },
    "led_g":     { "estado": "on",  "pwm_pct": 40  },
    "led_b":     { "estado": "off", "pwm_pct": 0   }
  },
  "wifi_rssi_dbm": -62,
  "uptime_s": 3600
}
```

#### `estufa/{id}/telemetria/alertas`
- **Direção:** ESP32 publica
- **QoS:** 1
- **Trigger:** condição anômala detectada
- **Payload:**
```json
{
  "ts": 1748123456,
  "device_id": "estufa01",
  "codigo": "RESERVATORIO_BAIXO",
  "mensagem": "Nível abaixo de 5 cm. Bomba bloqueada.",
  "valor_atual": 4.1,
  "unidade": "cm"
}
```
- **Códigos possíveis:** `RESERVATORIO_BAIXO` · `SENSOR_FALHA` · `PARAMETRO_FORA_FAIXA` · `ATUADOR_TIMEOUT` · `BUFFER_OVERFLOW`

#### `estufa/{id}/sistema/lwt`
- **Direção:** Broker publica automaticamente em desconexão abrupta
- **QoS:** 1 · **Retain:** sim
- **Payload:**
```json
{
  "device_id": "estufa01",
  "status": "offline",
  "ts_ultimo_contato": 1748123456
}
```

---

### 2.2 Configuração (Back-end → Broker → ESP32)

#### `estufa/{id}/config/parametros`
- **Direção:** Back-end publica; ESP32 subscreve
- **QoS:** 2 (exactly-once — evita dupla aplicação de limites)
- **Payload:**
```json
{
  "ts": 1748123456,
  "temp_c_min":    18.0,
  "temp_c_max":    30.0,
  "umid_ar_min":   50.0,
  "umid_ar_max":   80.0,
  "umid_solo_min": 40.0,
  "umid_solo_max": 90.0,
  "nivel_cm_min":  5.0,
  "luz_lux_min":   1000
}
```

#### `estufa/{id}/config/modo`
- **Direção:** Back-end publica; ESP32 subscreve
- **QoS:** 2
- **Payload:**
```json
{
  "ts": 1748123456,
  "modo": "manual"
}
```
- **Valores válidos de `modo`:** `"auto"` · `"manual"`
- **Comportamento no ESP32:** em `"manual"`, `task_control_logic` suspende acionamento automático. Timeout de inatividade: 10 min.

#### `estufa/{id}/config/atuadores`
- **Direção:** Back-end publica; ESP32 subscreve (somente em modo manual)
- **QoS:** 1
- **Payload:**
```json
{
  "ts": 1748123456,
  "atuador": "bomba",
  "estado": "on",
  "duracao_s": 30
}
```
- **Valores válidos de `atuador`:** `"bomba"` · `"ventoinha"` · `"led"`
- **Valores válidos de `estado`:** `"on"` · `"off"`
- **`duracao_s`:** obrigatório quando `estado = "on"`. Máximo: 60 s para bomba, 300 s para ventoinha/led. O ESP32 desliga automaticamente ao expirar.

#### `estufa/{id}/config/fotoperíodo`
- **Direção:** Back-end publica; ESP32 subscreve
- **QoS:** 2
- **Payload:**
```json
{
  "ts": 1748123456,
  "hora_inicio": "06:00",
  "hora_fim":    "20:00",
  "espectro": {
    "r_pct": 100,
    "g_pct": 40,
    "b_pct": 20
  }
}
```

---

## 3. Endpoints REST do Back-end

Base URL (produção): `https://estufa-tcc.onrender.com`
Base URL (local dev): `http://localhost:8000`

Todos os endpoints retornam `Content-Type: application/json`. Erros seguem o padrão `{"detail": "mensagem de erro"}`.

| Método + Endpoint | Quem usa | Descrição |
|---|---|---|
| `GET /api/v1/telemetria/atual` | Dashboard | Leituras mais recentes de todos os sensores (último registro por `device_id`). |
| `GET /api/v1/telemetria/historico?sensor=X&inicio=T1&fim=T2` | Dashboard | Série histórica. `sensor`: nome do campo (ex: `temp_c`). `T1`/`T2`: Unix timestamps. |
| `PUT /api/v1/parametros/{variavel}` | Dashboard | Atualiza um limite. Persiste no banco e publica via MQTT QoS 2 automaticamente. |
| `PUT /api/v1/modo` | Dashboard | Alterna entre `auto` e `manual`. Publica via MQTT QoS 2. |
| `POST /api/v1/atuadores/{id}/comando` | Dashboard | Comando manual. Só aceito se modo = `manual`. Publica via MQTT QoS 1. |
| `GET /api/v1/alertas?resolvido=false` | Dashboard | Lista alertas ativos. |
| `PATCH /api/v1/alertas/{id}/resolver` | Dashboard | Marca alerta como resolvido. |
| `GET /api/v1/status` | Dashboard / monitoramento | Status do back-end: broker conectado, última telemetria recebida, uptime. |

### Exemplos de request/response

**GET /api/v1/telemetria/atual**
```json
{
  "device_id": "estufa01",
  "ts": 1748123456,
  "temp_c": 24.3,
  "umid_ar": 57.9,
  "umid_solo": 66.5,
  "luz_lux": 3180,
  "nivel_cm": 18.4
}
```

**PUT /api/v1/parametros/temp_c_max**
```json
// request body
{ "valor": 28.0 }

// response 200
{ "variavel": "temp_c_max", "valor": 28.0, "publicado_mqtt": true }
```

**POST /api/v1/atuadores/bomba/comando**
```json
// request body
{ "estado": "on", "duracao_s": 20 }

// response 200
{ "atuador": "bomba", "estado": "on", "duracao_s": 20, "publicado_mqtt": true }
```

---

## 4. Modelo de dados (SQLite)

Tabelas mínimas que o back-end deve manter:

```sql
-- Telemetria histórica (uma linha por mensagem MQTT recebida)
CREATE TABLE telemetria (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   TEXT    NOT NULL,
  ts          INTEGER NOT NULL,  -- Unix timestamp
  temp_c      REAL,
  umid_ar     REAL,
  umid_solo   REAL,
  luz_lux     REAL,
  nivel_cm    REAL,
  qualidade   INTEGER DEFAULT 1
);

-- Parâmetros de controle (última configuração vigente por device)
CREATE TABLE parametros (
  device_id     TEXT PRIMARY KEY,
  temp_c_min    REAL DEFAULT 18.0,
  temp_c_max    REAL DEFAULT 30.0,
  umid_ar_min   REAL DEFAULT 50.0,
  umid_ar_max   REAL DEFAULT 80.0,
  umid_solo_min REAL DEFAULT 40.0,
  umid_solo_max REAL DEFAULT 90.0,
  nivel_cm_min  REAL DEFAULT 5.0,
  luz_lux_min   REAL DEFAULT 1000.0,
  updated_at    INTEGER
);

-- Alertas
CREATE TABLE alertas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   TEXT    NOT NULL,
  ts          INTEGER NOT NULL,
  codigo      TEXT    NOT NULL,
  mensagem    TEXT,
  valor_atual REAL,
  resolvido   INTEGER DEFAULT 0
);
```

---

## 5. Pinagem do ESP32 (referência para firmware)

| GPIO | Função | Sensor/Atuador | Tipo de sinal |
|------|--------|----------------|---------------|
| 4    | DHT22 DATA | Temp. + umidade do ar | Digital (1-wire) |
| 34   | HL-69 AO | Umidade do solo | ADC analógico |
| 5    | HC-SR04 TRIG | Nível do reservatório | Digital saída |
| 18   | HC-SR04 ECHO | Nível do reservatório | Digital entrada |
| 35   | LDR | Luminosidade | ADC analógico |
| 25   | MOSFET bomba | JT100 mini bomba | PWM saída |
| 26   | MOSFET ventoinha | Ventoinha 5V | PWM saída |
| 27   | MOSFET LED R | Fita LED RGB — canal R | PWM saída |
| 14   | MOSFET LED G | Fita LED RGB — canal G | PWM saída |
| 12   | MOSFET LED B | Fita LED RGB — canal B | PWM saída |

> ⚠️ GPIOs 34 e 35 são input-only no ESP32 DevKit V1 — não conectar nada como saída nesses pinos.

---

## 6. Regras de evolução deste documento

1. Qualquer campo adicionado, removido ou renomeado neste arquivo **deve** ser tratado como breaking change.
2. O membro que identificar a necessidade de mudança abre uma issue no GitHub com o label `contract-change` e descreve o impacto nos três lados (firmware / back-end / dashboard).
3. Os três discutem na issue antes do PR. Sem aprovação dos três, sem merge.
4. Ao alterar, incrementar a versão no cabeçalho deste arquivo (v1.0 → v1.1 → ...) e anotar o changelog abaixo.

### Changelog

| Versão | Data | Autor | O que mudou |
|--------|------|-------|-------------|
| v1.0 | 24/mai/2026 | Pedro (com Claude) | Criação inicial baseada na Monografia V4 |
