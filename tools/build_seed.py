"""Normalize the original Pedidos sheet into src/data/seed.json (lossless: originals kept)."""
import csv, json, re, sys, unicodedata, statistics
from pathlib import Path

SRC = sys.argv[1] if len(sys.argv) > 1 else "tools/pedidos.csv"
OUT = Path("src/data/seed.json")
MONTHS = {m: i + 1 for i, m in enumerate("jan feb mar apr may jun jul aug sep oct nov dec".split())}
MONTHS.update({"fev": 2, "abr": 4, "mai": 5, "ago": 8, "set": 9, "out": 10, "dez": 12})

def key(s):
    s = unicodedata.normalize("NFD", (s or "").strip().lower())
    return re.sub(r"\s+", " ", "".join(c for c in s if unicodedata.category(c) != "Mn"))

STATUS = {
    "pago": "pago", "pago via pix": "pago", "✅": "pago", "ok": "pago", "pg": "pago", "pago!": "pago",
    "pago - confirmado": "pago",
    "pendente": "pendente", "aguardando pix": "pendente", "⏳": "pendente", "falta pagar": "pendente",
    "aguardando": "pendente",
    "enviado": "enviado", "enviado correios": "enviado", "postado": "enviado", "saiu hj": "enviado",
    "cancelado": "cancelado", "cancelou": "cancelado", "desistiu": "cancelado",
    "devolvido": "devolvido",
}
def pgto(s):
    k = key(s)
    if not k: return ""
    if "pix" in k: return "Pix"
    if "cart" in k: return "Cartão"
    if "dinheiro" in k: return "Dinheiro"
    if "transf" in k: return "Transferência"
    return s.strip()

def valor(s):
    s = (s or "").strip()
    if not s: return None, "valor vazio"
    if key(s) in ("gratis",): return 0.0, None
    t = s.replace("R$", "").replace(" ", "")
    if "," in t: t = t.replace(".", "").replace(",", ".")
    try: return round(float(t), 2), None
    except ValueError: return None, f"valor ilegível: {s}"

def data(s):
    s = (s or "").strip()
    if not s: return None, "data vazia"
    m = re.fullmatch(r"(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m: y, mo, d = map(int, m.groups())
    else:
        m = re.fullmatch(r"(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?", s)
        if m:
            d, mo = int(m[1]), int(m[2]); y = int(m[3]) if m[3] else 2025
            if y < 100: y += 2000
        else:
            m = re.fullmatch(r"(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})", s)
            if not m or m[2].lower() not in MONTHS: return None, f"data ilegível: {s}"
            d, mo, y = int(m[1]), MONTHS[m[2].lower()], int(m[3])
    if not (1 <= mo <= 12 and 1 <= d <= 31): return None, f"data inválida: {s}"
    return f"{y:04d}-{mo:02d}-{d:02d}", None

rows = list(csv.DictReader(open(SRC, encoding="utf-8")))
orders, seen, names = [], {}, {}
for i, r in enumerate(rows):
    line = i + 2
    nome_raw = (r["Nome do cliente"] or "").strip()
    flags = []
    v, e = valor(r["VALOR"]);  e and flags.append(e)
    dt, e = data(r["Data"]);   e and flags.append(e)
    st_raw = r["Status do Pedido"] or ""
    st = STATUS.get(key(st_raw))
    if not st: st = "pendente"; flags.append(f"status desconhecido: '{st_raw.strip()}'")
    if not nome_raw: flags.append("pedido sem nome de cliente")
    obs = (r["Observações"] or "").strip()
    if "???" in obs: flags.append("observação '???'")
    if key(r["VALOR"]) == "gratis": flags.append("brinde")
    ck = key(nome_raw) or "(sem nome)"
    names.setdefault(ck, {})
    names[ck][nome_raw or "(sem nome)"] = names[ck].get(nome_raw or "(sem nome)", 0) + 1
    o = dict(id=f"s{line}", clienteKey=ck, cliente=nome_raw or "(sem nome)", produto=(r["produto"] or "").strip(),
             qtd=int(float(r["Qtd"] or 1)), valor=v if v is not None else 0, status=st, data=dt or "2025-01-01",
             pgto=pgto(r["Forma pgto"]), obs=obs, detalhe="", entrega="",
             valorOriginal=r["VALOR"] or "", statusOriginal=st_raw, dataOriginal=r["Data"] or "",
             pgtoOriginal=r["Forma pgto"] or "", clienteOriginal=nome_raw, linhaOrigem=line,
             flags=flags, arquivado=False, motivoArquivo="", excluido=False, historico=[])
    if ck == "teste" or key(o["produto"]) == "teste":
        o["arquivado"] = True; o["motivoArquivo"] = "linha de teste"
    else:
        sig = (ck, key(o["produto"]), o["qtd"], o["valor"], o["data"], o["status"], o["pgto"], key(obs))
        if sig in seen:
            o["arquivado"] = True; o["motivoArquivo"] = f"duplicado da linha {seen[sig]}"
        else: seen[sig] = line
    orders.append(o)

def display(ck):
    vs = names[ck]
    best = max(vs, key=lambda n: (n != n.upper() and n != n.lower(), vs[n]))
    return best
clients = []
for ck, vs in names.items():
    if ck == "teste": continue
    clients.append(dict(key=ck, nome=display(ck), variantes=sorted(vs), whatsapp="", instagram="", enderecos=[], notas=""))
for o in orders:
    if o["clienteKey"] in names: o["cliente"] = display(o["clienteKey"])
    m = re.search(r"instagram:\s*@(\S+)", o["obs"])
    if m:
        for c in clients:
            if c["key"] == o["clienteKey"] and not c["instagram"]: c["instagram"] = m[1]
# catalog: median unit price
prices = {}
for o in orders:
    if not o["arquivado"] and o["qtd"] and o["valor"] and o["produto"]:
        prices.setdefault(o["produto"], []).append(o["valor"] / o["qtd"])
catalog = [dict(nome=p, preco=round(statistics.median(v), 2)) for p, v in sorted(prices.items())]
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(dict(version=1, orders=orders, clients=clients, catalog=catalog), ensure_ascii=False))
a = sum(o["arquivado"] for o in orders)
print(f"{len(orders)} pedidos: {len(orders)-a} ativos, {a} arquivados, {len(clients)} clientes, "
      f"{sum(bool(o['flags']) for o in orders)} com flags, {len(catalog)} produtos")
