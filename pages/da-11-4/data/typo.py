"""Типографика статьи: неразрывные пробелы после коротких слов, перед тире, в числах и между числом и единицей.
Работает только с текстом между тегами и не трогает уже расставленные &nbsp; — повторный запуск ничего не меняет."""
import re

SHORT = r"(?:в|во|и|к|ко|с|со|у|о|об|а|но|на|по|за|не|ни|до|от|из|для|без|при|про|под|над|или|то|же|ли|бы)"
NB = "&nbsp;"


def _text(t):
    t = re.sub(rf"(?<![\w-])({SHORT}) (?=\S)", rf"\1{NB}", t, flags=re.I)
    t = re.sub(r" (—)", rf"{NB}\1", t)                                        # тире не уходит в начало строки
    t = re.sub(r"(\d) (?=\d{3}(?!\d))", rf"\1{NB}", t)                        # 20 000
    t = re.sub(r"(\d) (?=[%₽×]|п\. п\.|[а-яё])", rf"\1{NB}", t)                  # число и слово после него: 28 дней
    t = t.replace("п. п.", f"п.{NB}п.")
    return t


def typo(html):
    out = []
    for k, chunk in enumerate(re.split(r'(<img [^>]*?src="[^"]*"[^>]*>)', html)):      # рисунок, вшитый в страницу, не трогаем
        if k % 2:
            out.append(chunk)
            continue
        parts = re.split(r"(<[^>]+>)", chunk)
        out.append("".join(p if i % 2 else _text(p) for i, p in enumerate(parts)))
    return "".join(out)
