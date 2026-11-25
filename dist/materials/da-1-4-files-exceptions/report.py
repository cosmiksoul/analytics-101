from pathlib import Path

import pandas as pd


class ReportError(Exception):
    """Своё исключение: отчёт собрать нельзя."""


class Report:
    """Отчёт по заказам из одного файла."""

    def __init__(self, path, orders, bad_lines):
        self.path = Path(path)        # атрибуты экземпляра
        self.orders = orders          # [(id, дата, категория, сумма), …]
        self.bad_lines = bad_lines    # номера пропущенных строк

    @classmethod
    def from_csv(cls, path, max_bad=5):
        """Собрать отчёт из файла: сохранить заказы и номера строк с ошибкой кодировки."""
        orders, bad = [], []
        with open(path, "rb") as f:
            for n, raw in enumerate(f, start=1):
                try:
                    line = raw.decode("utf-8")
                except UnicodeDecodeError:
                    bad.append(n)
                    continue
                if n > 1:
                    oid, date, cat, amount = line.rstrip("\n").split(",")
                    orders.append((int(oid), date, cat, int(amount)))
        if len(bad) > max_bad:
            raise ReportError(f"{path}: пропущено {len(bad)} стр., допустимо {max_bad}")
        return cls(path, orders, bad)  # здесь cls — класс Report

    def revenue(self):
        return sum(o[3] for o in self.orders)

    def avg_check(self):
        return self.revenue() / len(self.orders)


report = Report.from_csv(Path("data") / "orders.csv")
print(type(report).__name__, "|", report.path, "|", len(report.orders), "заказов | пропущенные строки:", report.bad_lines)
print("выручка:", report.revenue(), "₽, средний чек:", round(report.avg_check()), "₽")

try:
    Report.from_csv(Path("data") / "orders.csv", max_bad=0)
except ReportError as e:
    print("отчёт не собран:", e)

df = pd.DataFrame(report.orders, columns=["order_id", "date", "category", "amount"])
print(type(df), isinstance(df, pd.DataFrame), df.shape)
