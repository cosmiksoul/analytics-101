from dataclasses import dataclass
from pathlib import Path


@dataclass
class LogLine:
    """Одна запись журнала ошибок."""
    line_no: int     # номер строки в файле
    error: str       # тип ошибки
    raw: bytes       # что лежало в строке

    def to_tsv(self):
        return f"{self.line_no}\t{self.error}\t{self.raw!r}\n"


raw = Path("data/orders.csv").read_bytes().splitlines()[999]   # строка 1 000
entry = LogLine(1000, "UnicodeDecodeError", raw)
print(entry)
print(entry == LogLine(1000, "UnicodeDecodeError", raw))

with open("errors.log", "w", encoding="utf-8") as log:   # "w" — записать заново
    log.write(entry.to_tsv())

print(Path("errors.log").read_text(encoding="utf-8"), end="")
print("в cp1251 это:", entry.raw.decode("cp1251"))
