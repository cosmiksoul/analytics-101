import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
s = df["last_order_at"]
print("окончания строк:", s.str[19:].value_counts(dropna=False).to_dict())
try:
    pd.to_datetime(s)
except ValueError as e:
    print("ValueError:", e)

utc = pd.to_datetime(s, utc=True)                          # все моменты на одной шкале UTC
local = utc.dt.tz_convert("Europe/Moscow").dt.tz_localize(None)
cut = pd.to_datetime(s.str[:19])                            # ошибка: удалить смещение и считать все отметки местным временем
has = s.notna()                                             # NaT != NaT — сравниваем только заполненные
print("часы разошлись у", (local != cut)[has].sum(), "строк, дата — у", (local.dt.date != cut.dt.date)[has].sum())

d = df["signup_date"]                                       # два формата разбираем по отдельности
signup = pd.to_datetime(d, format="%Y-%m-%d", errors="coerce").fillna(
    pd.to_datetime(d, format="%d.%m.%Y", errors="coerce"))
print("signup_date:", signup.min().date(), "—", signup.max().date())
guess = pd.to_datetime(d, format="mixed", dayfirst=True)    # проверяем, как автоопределение трактует две записи даты
print("с format='mixed':", guess.min().date(), "—", guess.max().date())
