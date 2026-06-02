#!/usr/bin/env python3
"""
Servidor local que imita a ESP32 — use para testar a interface sem hardware.

  python scripts/dev_server.py

Abra http://127.0.0.1:8765 no navegador (porta padrao; use --port se precisar).
"""

from __future__ import annotations

import argparse
import json
import random
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
STATE_FILE = ROOT / ".dev-server-state.json"
HISTORY_SIZE = 48
BOOT_TIME = time.time()
LAST_SENSOR = time.time()

DEFAULT_CONFIG = {
    "deviceName": "Estufa-01 (simulador)",
    "tempMin": 18.0,
    "tempMax": 30.0,
    "humidityMax": 80.0,
    "mqttBroker": "mqtt://192.168.1.10:1883",
    "mqttTopic": "estufa/sensor/",
    "readIntervalSec": 60,
    "wifiSsid": "",
    "wifiPassword": "",
}

state = {
    "config": dict(DEFAULT_CONFIG),
    "readings": {"temperature": 24.5, "humidity": 62.0, "light": 450.0, "co2": 420.0},
    "history": [],
    "actuators": {"fan": False, "pump": False, "led": False},
    "manualMode": False,
}


def load_state() -> None:
    if not STATE_FILE.exists():
        return
    try:
        saved = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        state["config"].update(saved.get("config", {}))
        state["actuators"].update(saved.get("actuators", {}))
        state["manualMode"] = saved.get("manualMode", False)
        state["history"] = saved.get("history", [])[-HISTORY_SIZE:]
    except (json.JSONDecodeError, OSError):
        pass


def save_state() -> None:
    payload = {
        "config": state["config"],
        "actuators": state["actuators"],
        "manualMode": state["manualMode"],
        "history": state["history"][-HISTORY_SIZE:],
    }
    STATE_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def push_history() -> None:
    r = state["readings"]
    sample = {
        "timestamp": int(time.time()),
        "temperature": r["temperature"],
        "humidity": r["humidity"],
        "light": r["light"],
        "co2": r["co2"],
    }
    state["history"].append(sample)
    if len(state["history"]) > HISTORY_SIZE:
        state["history"] = state["history"][-HISTORY_SIZE:]


def tick_sensors() -> None:
    global LAST_SENSOR
    interval = max(5, int(state["config"].get("readIntervalSec", 60)))
    now = time.time()
    if now - LAST_SENSOR < interval:
        return
    LAST_SENSOR = now
    r = state["readings"]
    r["temperature"] = round(
        max(15.0, min(35.0, r["temperature"] + random.uniform(-0.1, 0.1))), 2
    )
    r["humidity"] = round(
        max(30.0, min(95.0, r["humidity"] + random.uniform(-2.0, 2.0))), 1
    )
    r["light"] = round(max(0.0, min(1200.0, r["light"] + random.uniform(-30, 30))), 0)
    r["co2"] = round(max(350.0, min(1200.0, r["co2"] + random.uniform(-5, 5))), 0)
    push_history()


def format_uptime() -> str:
    sec = int(time.time() - BOOT_TIME)
    days, sec = divmod(sec, 86400)
    hours, sec = divmod(sec, 3600)
    minutes, _ = divmod(sec, 60)
    return f"{days}d {hours}h {minutes}m"


def json_response(handler: BaseHTTPRequestHandler, code: int, data: object) -> None:
    body = json.dumps(data).encode("utf-8")
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_body(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length", 0))
    if length == 0:
        return {}
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


class DevHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        print(f"[dev] {self.address_string()} - {fmt % args}")

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:
        tick_sensors()
        path = urlparse(self.path).path

        if path in ("", "/"):
            return self._serve_file("index.html", "text/html; charset=utf-8")
        if path == "/style.css":
            return self._serve_file("style.css", "text/css; charset=utf-8")
        if path == "/app.js":
            return self._serve_file("app.js", "application/javascript; charset=utf-8")

        if path == "/api/sensors":
            ago = int(time.time() - LAST_SENSOR)
            return json_response(
                self,
                200,
                {**state["readings"], "updatedSecAgo": ago},
            )
        if path == "/api/status":
            cfg = state["config"]
            return json_response(
                self,
                200,
                {
                    "deviceName": cfg["deviceName"],
                    "firmware": "simulador-local",
                    "wifiMode": "sim",
                    "wifiConnected": True,
                    "wifiSsid": "DEV-LOCAL (sem ESP32)",
                    "ip": "127.0.0.1",
                    "mqttConfigured": bool(cfg.get("mqttBroker")),
                    "mqttBroker": cfg.get("mqttBroker", ""),
                    "uptime": format_uptime(),
                    "freeHeapKb": 999,
                    "manualMode": state["manualMode"],
                },
            )
        if path == "/api/history":
            qs = parse_qs(urlparse(self.path).query)
            sensor = (qs.get("sensor") or ["temperature"])[0]
            key = {
                "humidity": "humidity",
                "light": "light",
                "co2": "co2",
            }.get(sensor, "temperature")
            samples = [{"t": h["timestamp"], "v": h[key]} for h in state["history"]]
            return json_response(
                self,
                200,
                {"sensor": sensor, "count": len(samples), "samples": samples},
            )
        if path == "/api/config":
            cfg = state["config"]
            return json_response(
                self,
                200,
                {
                    "deviceName": cfg["deviceName"],
                    "tempMin": cfg["tempMin"],
                    "tempMax": cfg["tempMax"],
                    "humidityMax": cfg["humidityMax"],
                    "mqttBroker": cfg["mqttBroker"],
                    "mqttTopic": cfg["mqttTopic"],
                    "readIntervalSec": cfg["readIntervalSec"],
                    "wifiSsid": cfg["wifiSsid"],
                },
            )
        if path == "/api/actuators":
            return json_response(
                self,
                200,
                {**state["actuators"], "manualMode": state["manualMode"]},
            )

        self.send_error(404)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        try:
            body = read_body(self)
        except json.JSONDecodeError:
            return json_response(self, 400, {"error": "json invalido"})

        if path == "/api/config":
            for key in (
                "deviceName",
                "tempMin",
                "tempMax",
                "humidityMax",
                "mqttBroker",
                "mqttTopic",
                "readIntervalSec",
                "wifiSsid",
                "wifiPassword",
            ):
                if key in body:
                    state["config"][key] = body[key]
            save_state()
            print("[dev] Config salva (arquivo .dev-server-state.json)")
            return json_response(self, 200, {"ok": True})

        if path == "/api/actuators":
            if "manualMode" in body:
                state["manualMode"] = bool(body["manualMode"])
            for key in ("fan", "pump", "led"):
                if key in body:
                    state["actuators"][key] = bool(body[key])
            if not state["manualMode"]:
                state["actuators"] = {"fan": False, "pump": False, "led": False}
            save_state()
            labels = {k: ("LIGADO" if v else "DESLIGADO") for k, v in state["actuators"].items()}
            print(f"[dev] Atuadores: {labels} | manual={state['manualMode']}")
            return json_response(self, 200, {"ok": True})

        if path == "/api/reboot":
            print("[dev] Reinicio simulado — estado mantido em disco")
            return json_response(self, 200, {"ok": True})

        self.send_error(404)

    def _serve_file(self, name: str, content_type: str) -> None:
        file_path = DATA_DIR / name
        if not file_path.is_file():
            self.send_error(404, f"Arquivo ausente: {name}")
            return
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    parser = argparse.ArgumentParser(description="Simulador local da ESP32")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    load_state()
    if not state["history"]:
        push_history()

    host, port = args.host, args.port
    server = ThreadingHTTPServer((host, port), DevHandler)
    print()
    print("  Simulador local da ESP32")
    print(f"  Abra no navegador: http://{host}:{port}")
    print("  Ctrl+C para encerrar")
    print()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrado.")
        save_state()


if __name__ == "__main__":
    main()
