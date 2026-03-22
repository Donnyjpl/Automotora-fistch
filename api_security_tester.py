"""
API Security Tester — Concesionaria Django REST Framework + JWT
===============================================================
Prueba autenticación JWT, inputs maliciosos, exposición de datos y comportamiento.

Uso:
    pip install requests
    python api_security_tester_concesionaria.py
"""

import requests
import time
import json

# ─────────────────────────────────────────────
#  CONFIGURACIÓN
# ─────────────────────────────────────────────

BASE_URL     = "http://localhost:8000"
LOGIN_URL    = "/api/token/"
REFRESH_URL  = "/api/token/refresh/"
USERNAME     = "donny"
PASSWORD     = "Palumbo26"
MANUAL_TOKEN = ""          # pega aquí un access token si ya tienes uno
TIMEOUT      = 8

# ─────────────────────────────────────────────
#  ENDPOINTS — Router DRF genera estos automáticamente
#  + acciones custom (historial, etc.)
# ─────────────────────────────────────────────

# ModelViewSet genera: list, create, retrieve, update, partial_update, destroy
ENDPOINTS_VENDEDORES = [
    ("/api/vendedores/",      "GET"),    # list
    ("/api/vendedores/",      "POST"),   # create
    ("/api/vendedores/1/",    "GET"),    # retrieve
    ("/api/vendedores/1/",    "PUT"),    # update
    ("/api/vendedores/1/",    "PATCH"),  # partial_update
    ("/api/vendedores/1/",    "DELETE"), # destroy
]

ENDPOINTS_COMPRADORES = [
    ("/api/compradores/",          "GET"),
    ("/api/compradores/",          "POST"),
    ("/api/compradores/1/",        "GET"),
    ("/api/compradores/1/",        "PUT"),
    ("/api/compradores/1/",        "PATCH"),
    ("/api/compradores/1/",        "DELETE"),
    ("/api/compradores/1/historial/", "GET"),   # @action custom
]

ENDPOINTS_AUTOS = [
    ("/api/autos/",      "GET"),
    ("/api/autos/",      "POST"),
    ("/api/autos/1/",    "GET"),
    ("/api/autos/1/",    "PUT"),
    ("/api/autos/1/",    "PATCH"),
    ("/api/autos/1/",    "DELETE"),
]

ENDPOINTS_VENTAS = [
    ("/api/ventas/",     "GET"),
    ("/api/ventas/",     "POST"),
    ("/api/ventas/1/",   "GET"),
    ("/api/ventas/1/",   "PUT"),
    ("/api/ventas/1/",   "PATCH"),
    ("/api/ventas/1/",   "DELETE"),
]

# Endpoints de autenticación JWT
ENDPOINTS_AUTH = [
    ("/api/token/",          "POST"),
    ("/api/token/refresh/",  "POST"),
]

ALL_ENDPOINTS = (
    ENDPOINTS_VENDEDORES +
    ENDPOINTS_COMPRADORES +
    ENDPOINTS_AUTOS +
    ENDPOINTS_VENTAS
)

# Solo los GET/list para pruebas de volumen
LIST_ENDPOINTS = [
    ("/api/vendedores/",   "GET"),
    ("/api/compradores/",  "GET"),
    ("/api/autos/",        "GET"),
    ("/api/ventas/",       "GET"),
]

# Endpoints que reciben search_fields (SearchFilter activo en CompradorViewSet)
SEARCH_ENDPOINTS = [
    ("/api/compradores/",  "GET"),
]

# ─────────────────────────────────────────────
#  PAYLOADS
# ─────────────────────────────────────────────

SQL_PAYLOADS = [
    "' OR 1=1 --",
    "admin'--",
    "' UNION SELECT null,null,null--",
    "1; DROP TABLE users--",
    "' OR 'a'='a",
]

FUZZING_PAYLOADS = [
    "<script>alert(1)</script>",
    "../../../../etc/passwd",
    "A" * 10_000,
    '{"__proto__":{"admin":true}}',
    "\x00\x01\x02",
    "null",
    "undefined",
    "-1",
    "9999999999",
]

# Payloads específicos para crear recursos (POST)
CREATE_PAYLOADS_COMPRADOR = [
    {"nombre": "' OR 1=1 --", "apellido": "Test", "dni_ruc": "12345678"},
    {"nombre": "<script>alert(1)</script>", "apellido": "XSS", "dni_ruc": "00000000"},
    {"nombre": "A" * 500, "apellido": "B" * 500, "dni_ruc": "overflow"},
    {"nombre": None, "apellido": None, "dni_ruc": None},
    {},
]

# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────

RESET  = "\033[0m"
RED    = "\033[91m"
YELLOW = "\033[93m"
GREEN  = "\033[92m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"

findings = []

def log_finding(level, endpoint, description):
    findings.append({"level": level, "endpoint": endpoint, "description": description})

def color_status(code):
    if code is None:       return f"{RED}ERR{RESET}"
    if code >= 500:        return f"{RED}{code}{RESET}"
    if code in (401, 403): return f"{GREEN}{code}{RESET}"
    if code == 200:        return f"{GREEN}{code}{RESET}"
    if code == 201:        return f"{GREEN}{code}{RESET}"
    return f"{YELLOW}{code}{RESET}"

def do_request(method, url, headers=None, json_body=None, params=None):
    try:
        t0 = time.time()
        r = requests.request(
            method, url,
            headers=headers or {},
            json=json_body,
            params=params,
            timeout=TIMEOUT
        )
        ms = round((time.time() - t0) * 1000)
        return r, ms
    except requests.exceptions.ConnectionError:
        print(f"    {RED}❌ Sin conexión — ¿está corriendo el servidor en {BASE_URL}?{RESET}")
        return None, 0
    except requests.exceptions.Timeout:
        print(f"    {RED}❌ Timeout ({TIMEOUT}s){RESET}")
        return None, 0
    except Exception as e:
        print(f"    {RED}❌ Error: {e}{RESET}")
        return None, 0

def snippet(text, max_len=50):
    text = str(text)
    return text[:max_len] + ("…" if len(text) > max_len else "")

def section(title):
    print(f"\n{'='*70}")
    print(f"{BOLD}{CYAN}{title}{RESET}")
    print(f"{'='*70}")

def subsection(title):
    print(f"\n{BOLD}  {title}{RESET}")


# ─────────────────────────────────────────────
#  MÓDULO 1 — AUTENTICACIÓN JWT
# ─────────────────────────────────────────────

def module_auth():
    section("🔐  MÓDULO 1 — AUTENTICACIÓN JWT")
    access_token  = None
    refresh_token = None

    # 1a. Login real → obtener par de tokens JWT
    subsection("[1a] Login con usuario/contraseña → POST /api/token/")
    url = BASE_URL + LOGIN_URL
    r, ms = do_request("POST", url,
                       json_body={"username": USERNAME, "password": PASSWORD})
    if r:
        print(f"    Status: {color_status(r.status_code)}  |  {ms}ms")
        if r.status_code == 200:
            try:
                data = r.json()
                access_token  = data.get("access")
                refresh_token = data.get("refresh")
                print(f"    {GREEN}✅ Access token  obtenido ({len(access_token or '')} chars){RESET}")
                print(f"    {GREEN}✅ Refresh token obtenido ({len(refresh_token or '')} chars){RESET}")
                log_finding("OK", LOGIN_URL, "Login JWT exitoso")
            except Exception:
                print(f"    {YELLOW}⚠️  No se pudo parsear la respuesta JWT{RESET}")
        else:
            print(f"    {YELLOW}⚠️  Login devolvió {r.status_code}{RESET}")
            log_finding("ADVERTENCIA", LOGIN_URL, f"Login devolvió {r.status_code}")

    # 1b. Login con credenciales incorrectas
    subsection("[1b] Login con credenciales incorrectas")
    bad_creds = [
        {"username": "admin",        "password": "wrongpassword"},
        {"username": "noexiste",     "password": "123456"},
        {"username": "",             "password": ""},
        {"username": "' OR 1=1 --", "password": "anything"},
    ]
    for creds in bad_creds:
        r, ms = do_request("POST", BASE_URL + LOGIN_URL, json_body=creds)
        if r:
            code = r.status_code
            flag = f"{GREEN}OK: rechazado ({code}){RESET}" if code in (400, 401) \
                   else f"{RED}💣 CRÍTICO: login aceptó credencial inválida{RESET}"
            print(f"    {snippet(str(creds), 55)} → {color_status(code)}  {ms}ms  {flag}")
            if code == 200:
                log_finding("CRÍTICO", LOGIN_URL, f"Login aceptó credenciales inválidas: {creds}")

    # 1c. Refresh token
    subsection("[1c] Refresh token → POST /api/token/refresh/")
    if refresh_token:
        r, ms = do_request("POST", BASE_URL + REFRESH_URL,
                           json_body={"refresh": refresh_token})
        if r:
            code = r.status_code
            if code == 200:
                new_access = r.json().get("access", "")
                print(f"    {GREEN}✅ Nuevo access token obtenido ({len(new_access)} chars){RESET}")
                log_finding("OK", REFRESH_URL, "Refresh funcionando correctamente")
            else:
                print(f"    {YELLOW}⚠️  Refresh devolvió {code}{RESET}")

        # Intentar refresh con token falso
        r2, ms2 = do_request("POST", BASE_URL + REFRESH_URL,
                             json_body={"refresh": "token.falso.xyz"})
        if r2:
            flag = f"{GREEN}rechazado correctamente{RESET}" if r2.status_code in (400, 401) \
                   else f"{RED}💣 acepta refresh token inválido{RESET}"
            print(f"    Refresh token falso → {color_status(r2.status_code)}  {flag}")
            if r2.status_code == 200:
                log_finding("CRÍTICO", REFRESH_URL, "Acepta refresh token inválido")
    else:
        print(f"    {YELLOW}⚠️  Sin refresh token — omitiendo{RESET}")

    # 1d. Sin token — todos los endpoints
    subsection("[1d] Sin token — todos los endpoints")
    print(f"    {'Endpoint':<50} {'Método':<8} {'Status':>6}  {'ms':>5}  Hallazgo")
    print(f"    {'-'*50} {'-'*8} {'------':>6}  {'-----':>5}  --------")
    for path, method in ALL_ENDPOINTS:
        r, ms = do_request(method, BASE_URL + path)
        if r is None:
            continue
        code = r.status_code
        if code == 200:
            hallazgo = f"{RED}💣 CRÍTICO: accede sin autenticación{RESET}"
            log_finding("CRÍTICO", path, f"Acceso sin token ({method})")
        elif code in (401, 403):
            hallazgo = f"{GREEN}OK: requiere auth{RESET}"
        elif code == 404:
            hallazgo = f"{DIM}404 — ID no existe (normal){RESET}"
        elif code == 405:
            hallazgo = f"{DIM}405 — método no permitido{RESET}"
        else:
            hallazgo = f"{YELLOW}⚠️  Status {code}{RESET}"
            log_finding("ADVERTENCIA", path, f"Status inesperado sin token: {code} ({method})")
        print(f"    {path:<50} {method:<8} {color_status(code):>6}  {ms:>5}ms  {hallazgo}")

    # 1e. Token Bearer falso (formato JWT)
    subsection("[1e] Token JWT falso")
    fake_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.fake_signature"
    bad_headers = [
        {"Authorization": f"Bearer {fake_jwt}"},
        {"Authorization": "Bearer "},
        {"Authorization": "Token token_estilo_drf"},   # formato DRF, no JWT
        {"Authorization": f"JWT {fake_jwt}"},
    ]
    sample_paths = [p for p, m in LIST_ENDPOINTS]
    for path in sample_paths:
        for h in bad_headers:
            r, ms = do_request("GET", BASE_URL + path, headers=h)
            if r and r.status_code == 200:
                print(f"    {RED}💣 CRÍTICO: {path} acepta header inválido: {list(h.values())[0][:40]}{RESET}")
                log_finding("CRÍTICO", path, f"Acepta Authorization header inválido")

    # 1f. Con token válido — todos los endpoints
    valid_token = access_token or MANUAL_TOKEN
    if valid_token:
        subsection("[1f] Con token válido — todos los endpoints")
        auth_h = {"Authorization": f"Bearer {valid_token}"}
        print(f"    {'Endpoint':<50} {'Método':<8} {'Status':>6}  {'ms':>5}")
        print(f"    {'-'*50} {'-'*8} {'------':>6}  {'-----':>5}")
        for path, method in ALL_ENDPOINTS:
            r, ms = do_request(method, BASE_URL + path, headers=auth_h)
            if r:
                print(f"    {path:<50} {method:<8} {color_status(r.status_code):>6}  {ms:>5}ms")
    else:
        print(f"\n    {YELLOW}⚠️  Sin token válido — omitiendo prueba 1f{RESET}")

    return valid_token


# ─────────────────────────────────────────────
#  MÓDULO 2 — INPUTS MALICIOSOS
# ─────────────────────────────────────────────

def module_inputs(token):
    section("💣  MÓDULO 2 — INPUTS MALICIOSOS")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 2a. SQL injection y fuzzing en search_fields de CompradorViewSet
    subsection("[2a] SearchFilter — ?search= con payloads maliciosos")
    print(f"    (CompradorViewSet tiene search_fields=['nombre','apellido','dni_ruc'])")
    all_payloads = SQL_PAYLOADS + FUZZING_PAYLOADS
    for path, _ in SEARCH_ENDPOINTS:
        print(f"\n  {BOLD}{path}{RESET}")
        for payload in all_payloads:
            r, ms = do_request("GET", BASE_URL + path, headers=headers,
                               params={"search": payload})
            if r is None:
                continue
            code = r.status_code
            short = snippet(payload, 45)
            if code >= 500:
                print(f"    {RED}🚨 [{code}] {ms}ms → {short}{RESET}")
                log_finding("CRÍTICO", path, f"Error 500 con search payload: {short}")
            elif code == 200 and any(s in payload for s in ("OR 1=1", "UNION SELECT")):
                try:
                    results = r.json()
                    count = len(results) if isinstance(results, list) else \
                            results.get("count", len(results.get("results", [])))
                    flag = f"{RED}⚠️  posible SQLi ({count} resultados){RESET}" \
                           if count > 0 else f"{GREEN}OK (0 resultados){RESET}"
                except Exception:
                    flag = f"{YELLOW}⚠️  200 a payload SQL{RESET}"
                print(f"    {flag}  [{code}] {ms}ms → {short}")
                log_finding("ADVERTENCIA", path, f"Respondió 200 a payload SQL: {short}")
            else:
                print(f"    {GREEN}✅ [{code}] {ms}ms → {short}{RESET}")

    # 2b. Ordering injection (?ordering=)
    subsection("[2b] OrderingFilter — ?ordering= con payloads maliciosos")
    ordering_payloads = [
        "apellido; DROP TABLE compradores--",
        "' OR 1=1",
        "-apellido",      # válido (descendente)
        "nonexistent_field",
        "../../../../etc/passwd",
        "nombre,apellido,password,secret",  # intento de extraer campos ocultos
    ]
    for path, _ in SEARCH_ENDPOINTS:
        print(f"\n  {BOLD}{path}{RESET}")
        for payload in ordering_payloads:
            r, ms = do_request("GET", BASE_URL + path, headers=headers,
                               params={"ordering": payload})
            if r is None:
                continue
            code = r.status_code
            short = snippet(payload, 45)
            if code >= 500:
                print(f"    {RED}🚨 [{code}] {ms}ms → ordering={short}{RESET}")
                log_finding("CRÍTICO", path, f"Error 500 con ordering payload: {short}")
            else:
                print(f"    {GREEN if code < 400 else YELLOW}[{code}] {ms}ms → ordering={short}{RESET}")

    # 2c. POST con payloads maliciosos en cada modelo
    subsection("[2c] POST con payloads en campos de modelos")
    post_targets = {
        "/api/compradores/": CREATE_PAYLOADS_COMPRADOR,
        "/api/vendedores/": [
            {"nombre": "' OR 1=1 --", "apellido": "Test"},
            {"nombre": "<img src=x onerror=alert(1)>", "apellido": "XSS"},
            {},
            {"nombre": None},
        ],
        "/api/autos/": [
            {"marca": "' OR 1=1 --", "modelo": "Test", "precio": -9999},
            {"marca": "normal", "modelo": "normal", "precio": "precio_invalido"},
            {"marca": "A" * 1000, "modelo": "B" * 1000, "precio": 0},
            {},
        ],
        "/api/ventas/": [
            {"vendedor": "' OR 1=1", "comprador": 1, "auto": 1},
            {"vendedor": 9999999, "comprador": 9999999, "auto": 9999999},  # IDs inexistentes
            {"precio_venta": -99999},
            {},
        ],
    }
    for path, payloads in post_targets.items():
        print(f"\n  {BOLD}POST {path}{RESET}")
        for payload in payloads:
            r, ms = do_request("POST", BASE_URL + path, headers=headers, json_body=payload)
            if r is None:
                continue
            code = r.status_code
            short = snippet(str(payload), 55)
            if code >= 500:
                print(f"    {RED}🚨 [{code}] {ms}ms → {short}{RESET}")
                log_finding("CRÍTICO", path, f"Error 500 con payload POST: {short}")
            elif code == 201:
                print(f"    {YELLOW}⚠️  [{code}] {ms}ms → creó recurso con payload sospechoso: {short}{RESET}")
                log_finding("ADVERTENCIA", path, f"Creó recurso con payload sospechoso: {short}")
            else:
                print(f"    {GREEN}✅ [{code}] {ms}ms → {short}{RESET}")

    # 2d. Enumeración de IDs — todos los modelos
    subsection("[2d] Enumeración de IDs (IDOR)")
    id_targets = [
        "/api/vendedores/{id}/",
        "/api/compradores/{id}/",
        "/api/autos/{id}/",
        "/api/ventas/{id}/",
        "/api/compradores/{id}/historial/",
    ]
    for path_tpl in id_targets:
        print(f"\n  {BOLD}{path_tpl}{RESET}")
        for id_ in [1, 2, 3, 99999, -1, 0, "abc"]:
            path = path_tpl.replace("{id}", str(id_))
            r, ms = do_request("GET", BASE_URL + path, headers=headers)
            if r is None:
                continue
            code = r.status_code
            if code == 200:
                flag = f"{YELLOW}⚠️  accesible — verificar permisos{RESET}"
                log_finding("ADVERTENCIA", path, f"ID {id_} accesible")
            elif code == 404:
                flag = f"{DIM}404 — no existe (normal){RESET}"
            else:
                flag = f"{GREEN}OK ({code}){RESET}"
            print(f"      id={id_!s:<8} → {color_status(code)}  {ms}ms  {flag}")


# ─────────────────────────────────────────────
#  MÓDULO 3 — EXPOSICIÓN DE DATOS
# ─────────────────────────────────────────────

def module_data(token):
    section("📦  MÓDULO 3 — EXPOSICIÓN DE DATOS")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    SENSITIVE_FIELDS = (
        "password", "passwd", "secret", "token", "key",
        "credit", "ssn", "pin", "cvv", "rut", "contrasena",
        "hash", "salt", "private",
    )

    # 3a. Volumen de registros sin filtro
    subsection("[3a] Volumen de registros sin filtro")
    print(f"    {'Endpoint':<45} {'Status':>6}  {'Registros':>10}  Hallazgo")
    print(f"    {'-'*45} {'------':>6}  {'---------':>10}  --------")

    for path, method in LIST_ENDPOINTS:
        r, ms = do_request(method, BASE_URL + path, headers=headers)
        if r is None:
            continue
        code = r.status_code
        count_str = "-"
        hallazgo  = ""
        if code == 200:
            try:
                data = r.json()
                if isinstance(data, list):
                    count = len(data)
                elif isinstance(data, dict):
                    count = data.get("count",
                            len(data.get("results",
                            data.get("data", []))))
                else:
                    count = 0
                count_str = str(count)

                if count > 500:
                    hallazgo = f"{RED}💣 CRÍTICO: {count} registros sin filtro{RESET}"
                    log_finding("CRÍTICO", path, f"Devuelve {count} registros sin filtro/paginación")
                elif count > 100:
                    hallazgo = f"{YELLOW}⚠️  {count} registros — revisar paginación{RESET}"
                    log_finding("ADVERTENCIA", path, f"Devuelve {count} registros sin filtro")
                else:
                    hallazgo = f"{GREEN}OK ({count} registros){RESET}"

                # Checar campos sensibles en primer registro
                sample = {}
                if isinstance(data, list) and data and isinstance(data[0], dict):
                    sample = data[0]
                elif isinstance(data, dict):
                    results = data.get("results") or data.get("data") or []
                    if results and isinstance(results[0], dict):
                        sample = results[0]

                sensitive = [k for k in sample
                             if any(s in k.lower() for s in SENSITIVE_FIELDS)]
                if sensitive:
                    log_finding("CRÍTICO", path, f"Campos sensibles expuestos: {sensitive}")
                    print(f"    {path:<45} {color_status(code):>6}  {count_str:>10}  {hallazgo}")
                    print(f"    {RED}    💣 CRÍTICO: campos sensibles → {sensitive}{RESET}")
                    continue

            except Exception:
                count_str = "no-JSON"

        print(f"    {path:<45} {color_status(code):>6}  {count_str:>10}  {hallazgo}")

    # 3b. Historial de comprador — ¿expone datos de otros?
    subsection("[3b] @action historial — exposición cruzada de datos")
    for id_ in range(1, 5):
        path = f"/api/compradores/{id_}/historial/"
        r, ms = do_request("GET", BASE_URL + path, headers=headers)
        if r is None:
            continue
        code = r.status_code
        if code == 200:
            try:
                data = r.json()
                total = data.get("total_compras", "?")
                print(f"    comprador id={id_} → {color_status(code)}  {ms}ms  "
                      f"{YELLOW}⚠️  total_compras={total} — verificar que sea solo su historial{RESET}")
                log_finding("ADVERTENCIA", path, f"Historial accesible para id={id_}")
            except Exception:
                print(f"    comprador id={id_} → {color_status(code)}  {ms}ms")
        elif code == 404:
            print(f"    comprador id={id_} → {color_status(code)}  {DIM}no existe{RESET}")
        else:
            print(f"    comprador id={id_} → {color_status(code)}  {ms}ms  {GREEN}OK{RESET}")

    # 3c. Paginación descontrolada
    subsection("[3c] Paginación — limit/page_size excesivo")
    for path, _ in LIST_ENDPOINTS:
        r, ms = do_request("GET", BASE_URL + path, headers=headers,
                           params={"limit": 99999, "offset": 0, "page_size": 99999})
        if r and r.status_code == 200:
            try:
                data = r.json()
                count = len(data) if isinstance(data, list) else \
                        data.get("count", len(data.get("results", [])))
                if count > 1000:
                    print(f"    {RED}💣 {path} → {count} registros con limit=99999{RESET}")
                    log_finding("CRÍTICO", path, f"Sin límite de paginación: {count} registros")
                else:
                    print(f"    {GREEN}✅ {path} → {count} registros (paginación OK){RESET}")
            except Exception:
                pass

    # 3d. Headers del servidor
    subsection("[3d] Headers que exponen info del servidor")
    r, ms = do_request("OPTIONS", BASE_URL + "/api/compradores/", headers=headers)
    if r:
        for h in ("server", "x-powered-by", "x-django-version",
                  "allow", "x-frame-options", "content-security-policy",
                  "strict-transport-security", "x-content-type-options"):
            val = r.headers.get(h, "")
            if val:
                risky = h in ("server", "x-powered-by", "x-django-version")
                flag  = f"{YELLOW}⚠️ {RESET}" if risky else f"{GREEN}✅{RESET}"
                print(f"    {flag} {h}: {val}")
                if risky:
                    log_finding("ADVERTENCIA", "headers", f"'{h}' expuesto: {val}")
        # Verificar ausencia de headers de seguridad importantes
        missing = []
        for security_header in ("x-frame-options", "x-content-type-options",
                                "strict-transport-security", "content-security-policy"):
            if not r.headers.get(security_header):
                missing.append(security_header)
        if missing:
            print(f"    {YELLOW}⚠️  Headers de seguridad ausentes: {missing}{RESET}")
            log_finding("ADVERTENCIA", "headers", f"Headers de seguridad ausentes: {missing}")

    # 3e. Formato de error — info leakage
    subsection("[3e] Info leakage en respuestas de error")
    error_tests = [
        ("/api/compradores/99999/",   "GET"),
        ("/api/ventas/abc/",          "GET"),
        ("/api/noexiste/",            "GET"),
    ]
    for path, method in error_tests:
        r, ms = do_request(method, BASE_URL + path, headers=headers)
        if r:
            body = r.text[:200]
            if any(kw in body.lower() for kw in ("traceback", "exception", "django", "line ")):
                print(f"    {RED}💣 {path} → expone traceback/debug info{RESET}")
                log_finding("CRÍTICO", path, "Expone traceback o info de debug en errores")
            else:
                print(f"    {GREEN}✅ {path} → {r.status_code} sin info sensible{RESET}")


# ─────────────────────────────────────────────
#  MÓDULO 4 — COMPORTAMIENTO
# ─────────────────────────────────────────────

def module_behavior(token):
    section("⚡  MÓDULO 4 — COMPORTAMIENTO")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 4a. Rate limiting en login
    subsection("[4a] Rate limiting en /api/token/ (brute force protection)")
    statuses = []
    t0 = time.time()
    for i in range(15):
        r, _ = do_request("POST", BASE_URL + LOGIN_URL,
                          json_body={"username": "admin", "password": f"wrong{i}"})
        if r:
            statuses.append(r.status_code)
    elapsed = round(time.time() - t0, 2)
    has_429  = 429 in statuses
    has_lock = any(c in statuses for c in (423, 429, 403))
    flag = f"{GREEN}✅ protección detectada (429/423/403 tras intentos){RESET}" if has_lock \
           else f"{RED}💣 CRÍTICO: sin protección brute-force en login{RESET}"
    print(f"    15 intentos fallidos en {elapsed}s  →  {flag}")
    if not has_lock:
        log_finding("CRÍTICO", LOGIN_URL, "Sin protección brute-force en endpoint de login")

    # 4b. Rate limiting en endpoints de datos
    subsection("[4b] Rate limiting — endpoints de datos (10 requests rápidos)")
    for path, method in LIST_ENDPOINTS:
        statuses = []
        t0 = time.time()
        for _ in range(10):
            r, _ = do_request(method, BASE_URL + path, headers=headers)
            if r:
                statuses.append(r.status_code)
        elapsed = round(time.time() - t0, 2)
        has_429 = 429 in statuses
        flag = f"{GREEN}✅ rate limit activo{RESET}" if has_429 \
               else f"{YELLOW}⚠️  sin rate limiting{RESET}"
        print(f"    {path:<45}  {elapsed}s  {flag}")
        if not has_429:
            log_finding("ADVERTENCIA", path, "Sin rate limiting detectado")

    # 4c. Tiempos de respuesta
    subsection("[4c] Tiempos de respuesta — todos los endpoints GET/list")
    print(f"    {'Endpoint':<45} {'ms':>6}  Alerta")
    print(f"    {'-'*45} {'------':>6}  ------")
    for path, method in LIST_ENDPOINTS:
        r, ms = do_request(method, BASE_URL + path, headers=headers)
        if r is None:
            continue
        flag = f"{RED}🐢 MUY LENTO{RESET}" if ms > 3000 \
               else f"{YELLOW}⚠️  lento{RESET}" if ms > 1500 else f"{GREEN}OK{RESET}"
        print(f"    {path:<45} {ms:>6}ms  {flag}")
        if ms > 3000:
            log_finding("ADVERTENCIA", path, f"Tiempo de respuesta alto: {ms}ms")

    # 4d. Métodos HTTP no permitidos
    subsection("[4d] Métodos HTTP en endpoints que deberían ser read-only")
    # Si algún ViewSet tiene permission_classes u override de métodos, esto lo detecta
    readonly_check = [
        ("/api/ventas/",       ["DELETE"]),
        ("/api/autos/1/",      ["DELETE"]),
        ("/api/vendedores/1/", ["DELETE"]),
    ]
    for path, methods in readonly_check:
        for m in methods:
            r, ms = do_request(m, BASE_URL + path, headers=headers)
            if r and r.status_code not in (405, 403, 401, 404):
                print(f"    {YELLOW}⚠️  {m} {path} → {r.status_code} — aceptado{RESET}")
                log_finding("ADVERTENCIA", path, f"Método {m} aceptado — revisar permisos")
            elif r:
                print(f"    {GREEN}✅ {m} {path} → {r.status_code} (controlado){RESET}")

    # 4e. Prototype pollution en POST
    subsection("[4e] Prototype pollution en endpoints POST")
    post_endpoints = [
        "/api/compradores/",
        "/api/vendedores/",
        "/api/autos/",
        "/api/ventas/",
    ]
    for path in post_endpoints:
        r, ms = do_request("POST", BASE_URL + path, headers=headers,
                           json_body={"__proto__": {"admin": True},
                                      "constructor": {"prototype": {"admin": True}}})
        if r:
            code = r.status_code
            flag = f"{RED}💣 CRÍTICO: 500 con prototype pollution{RESET}" if code >= 500 \
                   else f"{GREEN}OK ({code}){RESET}"
            print(f"    {path:<45} {color_status(code)}  {flag}")
            if code >= 500:
                log_finding("CRÍTICO", path, "Error 500 con prototype pollution")

    # 4f. JWT token expirado (si tienes un token viejo lo puedes pegar aquí)
    subsection("[4f] Token expirado — verificación")
    expired_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjAwMDAwMDAwLCJ1c2VyX2lkIjoxfQ.fake"
    r, ms = do_request("GET", BASE_URL + "/api/compradores/",
                       headers={"Authorization": f"Bearer {expired_jwt}"})
    if r:
        flag = f"{GREEN}rechaza token expirado correctamente{RESET}" if r.status_code in (401, 403) \
               else f"{RED}💣 acepta token expirado{RESET}"
        print(f"    Token expirado → {color_status(r.status_code)}  {flag}")
        if r.status_code == 200:
            log_finding("CRÍTICO", "/api/compradores/", "Acepta token JWT expirado")


# ─────────────────────────────────────────────
#  RESUMEN FINAL
# ─────────────────────────────────────────────

def print_summary():
    section("📋  RESUMEN DE HALLAZGOS")

    criticos     = [f for f in findings if f["level"] == "CRÍTICO"]
    advertencias = [f for f in findings if f["level"] == "ADVERTENCIA"]
    ok_list      = [f for f in findings if f["level"] == "OK"]

    print(f"\n  {RED}{BOLD}💣 Críticos:     {len(criticos)}{RESET}")
    print(f"  {YELLOW}⚠️  Advertencias: {len(advertencias)}{RESET}")
    print(f"  {GREEN}✅ OK:           {len(ok_list)}{RESET}")
    print(f"  Total hallazgos: {len(findings)}\n")

    if criticos:
        print(f"{BOLD}{RED}  ─── HALLAZGOS CRÍTICOS ───{RESET}")
        for f in criticos:
            print(f"  {RED}  • [{f['endpoint']}]{RESET}")
            print(f"        {f['description']}")

    if advertencias:
        print(f"\n{BOLD}{YELLOW}  ─── ADVERTENCIAS ───{RESET}")
        for f in advertencias:
            print(f"  {YELLOW}  • [{f['endpoint']}] {f['description']}{RESET}")

    print(f"\n{'='*70}\n")


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print(f"\n{BOLD}{'='*70}")
    print(f"  API Security Tester — Concesionaria DRF + JWT")
    print(f"  Target:    {BASE_URL}")
    print(f"  Endpoints: {len(ALL_ENDPOINTS)} rutas generadas por DefaultRouter")
    print(f"  Auth:      JWT (SimpleJWT) — Bearer token")
    print(f"{'='*70}{RESET}")

    valid_token = module_auth()
    module_inputs(valid_token)
    module_data(valid_token)
    module_behavior(valid_token)
    print_summary()