import pandas as pd

PATH = "data/orders_crm.csv"     # учебная выгрузка старой CRM: 8 заказов
COLS = ["order_id", "date", "brand", "country", "channel", "amount", "status"]


def read_crm(path=PATH):
    return pd.read_csv(
        path,
        encoding="cp1251",       # CRM сохраняет файл не в UTF-8
        sep=";",
        quotechar="'",           # в CRM комментарии заключены в одинарные кавычки
        decimal=",",             # 1569,80 → 1569.8
        usecols=COLS,            # comment не нужен
        dtype={"order_id": "int64", "brand": "str", "country": "str",
               "channel": "str", "amount": "float64", "status": "str"},
        parse_dates=["date"],
        date_format="%d.%m.%Y",  # день, месяц, год
    )


if __name__ == "__main__":
    crm = read_crm()
    print(crm.head(3))
    print(crm.dtypes)

    # два примера неверных настроек для того же файла
    base = dict(encoding="cp1251", sep=";", quotechar="'", usecols=COLS)
    a = pd.read_csv(PATH, **base, thousands=",")                        # запятая как разделитель тысяч
    b = pd.read_csv(PATH, **base, decimal=",", parse_dates=["date"])    # автоматический выбор формата даты
    print("thousands=',':", a["amount"].head(3).tolist(), a["amount"].dtype)
    print("без date_format:", b["date"].dt.strftime("%Y-%m-%d").head(3).tolist())
