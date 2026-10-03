"""Gera prints fake (demonstração) estilo WhatsApp dark para a seção de prova social.

Uso: python3 scripts/gerar-provas.py
Saída: public/templates/achados/prova-{1,2,3}.png (540x960)

São imagens de placeholder com textos fictícios — troque por prints reais no painel.
"""

from PIL import Image, ImageDraw, ImageFont
from typing import Optional

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

W, H = 540, 960
BG = (11, 20, 26)
HEADER = (31, 44, 52)
INCOMING = (31, 44, 52)
OUTGOING = (0, 92, 75)
TEXT = (233, 237, 239)
MUTED = (134, 150, 160)
CHECK = (83, 189, 235)
NOTICE_BG = (24, 34, 41)
NOTICE_TX = (255, 210, 121)
INPUT_BG = (31, 44, 52)
GREEN = (0, 168, 132)

APPLE_GREEN = (134, 150, 160)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(ARIAL_BOLD if bold else ARIAL, size)


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if draw.textlength(t, font=fnt) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def bubble(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    max_w: int,
    lines: list[str],
    fnt: ImageFont.FreeTypeFont,
    fill: tuple,
    time: str,
    outgoing: bool = False,
    tail: bool = False,
    photo: Optional[Image.Image] = None,
    caption: str = "",
) -> int:
    lh = 22
    pad = 12
    content_w = max_w - 2 * pad
    text_h = len(lines) * lh
    photo_h = 0
    if photo is not None:
        pw = content_w
        ph = int(pw * photo.height / photo.width)
        photo_h = ph + (8 if caption or lines else 0)
    cap_lines = wrap(draw, caption, font(15), content_w) if caption else []
    h = pad + photo_h + text_h + len(cap_lines) * 20 + 22 + pad
    if tail:
        tx = x if not outgoing else x + max_w
        draw.polygon(
            [(tx, y), (tx + (-10 if not outgoing else 10), y + 2), (tx, y + 16)],
            fill=fill,
        )
    draw.rounded_rectangle([x, y, x + max_w, y + h], radius=14, fill=fill)
    cy = y + pad
    if photo is not None:
        ph = photo_h - (8 if caption or lines else 0)
        ph_img = photo.resize((content_w, ph))
        mask = Image.new("L", (content_w, ph), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, content_w, ph], radius=8, fill=255)
        draw._image.paste(ph_img, (x + pad, cy), mask)
        cy += ph + 8
    for ln in lines:
        draw.text((x + pad, cy), ln, font=fnt, fill=TEXT)
        cy += lh
    for ln in cap_lines:
        draw.text((x + pad, cy), ln, font=font(15), fill=TEXT)
        cy += 20
    meta = f"{time}  \u2713\u2713" if outgoing else time
    mw = draw.textlength(meta, font=font(13))
    draw.text((x + max_w - pad - mw, y + h - 20), meta, font=font(13),
              fill=CHECK if outgoing else MUTED)
    return h


def make_print(path: str, photo_path: str, blocks: list[dict]) -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # status bar
    d.text((18, 8), "21:30", font=font(17, True), fill=TEXT)
    d.text((W - 110, 8), "4G   82%", font=font(15), fill=TEXT)

    # header
    d.rectangle([0, 36, W, 116], fill=HEADER)
    d.ellipse([14, 50, 58, 94], fill=(0, 168, 132))
    d.text((24, 58), "G", font=font(22, True), fill=(255, 255, 255))
    d.text((70, 50), "Grupo VIP de Ofertas", font=font(20, True), fill=TEXT)
    d.text((70, 76), "online", font=font(15), fill=MUTED)
    d.ellipse([W - 96, 56, W - 66, 88], outline=MUTED, width=2)
    d.ellipse([W - 52, 56, W - 22, 88], outline=MUTED, width=2)

    y = 128
    # chip data
    chip = "HOJE"
    cw = d.textlength(chip, font=font(14)) + 28
    d.rounded_rectangle([(W - cw) / 2, y, (W + cw) / 2, y + 28], radius=8, fill=HEADER)
    d.text(((W - d.textlength(chip, font=font(14))) / 2, y + 5), chip, font=font(14), fill=MUTED)
    y += 40

    # aviso criptografia
    notice = "As mensagens são criptografadas de ponta a ponta."
    nw = d.textlength(notice, font=font(13)) + 28
    nw = min(nw, W - 60)
    d.rounded_rectangle([(W - nw) / 2, y, (W + nw) / 2, y + 30], radius=8, fill=NOTICE_BG)
    d.text(((W - d.textlength(notice, font=font(13))) / 2, y + 7), notice,
           font=font(13), fill=NOTICE_TX)
    y += 44

    photo = Image.open(photo_path).convert("RGB")

    for b in blocks:
        fnt = font(17)
        max_w = 400 if not b.get("photo") else 420
        x = W - 14 - max_w if b.get("out") else 14
        all_lines: list[str] = []
        for t in b.get("text", []):
            all_lines.extend(wrap(d, t, fnt, max_w - 24))
        h = bubble(
            d, x, y, max_w, all_lines, fnt,
            OUTGOING if b.get("out") else INCOMING,
            b.get("time", "21:3"),
            outgoing=bool(b.get("out")),
            tail=bool(b.get("tail")),
            photo=photo if b.get("photo") else None,
            caption=b.get("caption", ""),
        )
        y += h + 12
        if y > H - 120:
            break

    # input bar
    d.rounded_rectangle([10, H - 66, W - 70, H - 14], radius=26, fill=INPUT_BG)
    d.text((30, H - 52), "Mensagem", font=font(17), fill=MUTED)
    d.ellipse([W - 58, H - 66, W - 10, H - 14], fill=GREEN)
    d.text((W - 46, H - 54), "+", font=font(24, True), fill=(255, 255, 255))

    img.save(path)
    print("OK", path)


CONVERSAS = [
    {
        "photo": "public/templates/achados/oferta-2.jpg",
        "blocks": [
            {"photo": True, "caption": "Olha o que chegou aqui! Fone top, paguei R$89 com frete grátis", "time": "19:20", "tail": True},
            {"text": ["Meus filhos amaram! Chegou em 3 dias"], "time": "19:22"},
            {"text": ["Oie, que maravilha! Pegou em um preço muito bom"], "time": "19:25", "out": True},
            {"text": ["Me arrependi de não ter comprado 2 logo kkkk"], "time": "19:26"},
            {"text": ["Kkkk aproveita que ainda tem no grupo!"], "time": "19:28", "out": True, "tail": True},
        ],
    },
    {
        "photo": "public/templates/achados/oferta-1.jpg",
        "blocks": [
            {"photo": True, "caption": "Meninas, olhem que perfeição! O tênis chegou hoje", "time": "15:40", "tail": True},
            {"text": ["São macios, já testei e amei. Paguei baratíssimo com o cupom do grupo!"], "time": "15:41"},
            {"text": ["Aê, fico feliz que gostou! O grupo é top!"], "time": "15:48", "out": True},
            {"text": ["Arrependida de não ter pego 2 pares kkk"], "time": "15:49"},
            {"text": ["O grupo é top, recomendo!"], "time": "15:53", "out": True, "tail": True},
        ],
    },
    {
        "photo": "public/templates/achados/oferta-4.jpg",
        "blocks": [
            {"photo": True, "caption": "Olha esse óculos que peguei na promo... paguei super barato!", "time": "20:20", "tail": True},
            {"text": ["Oie! Que maravilha, esse modelo é top! Fico muito feliz que você tenha gostado."], "time": "20:22", "out": True},
            {"text": ["Chegou hoje e já tô amando. Vou indicar pras amigas!"], "time": "20:25"},
            {"text": ["Opa, top! Aproveita que tem mais oferta chegando!"], "time": "20:27", "out": True, "tail": True},
        ],
    },
]

if __name__ == "__main__":
    for i, c in enumerate(CONVERSAS, 1):
        make_print(f"public/templates/achados/prova-{i}.png", c["photo"], c["blocks"])
