"""Черновик автоматического отчёта по учебной выгрузке: пакет fg-data-profiling (прежнее имя — ydata-profiling).

Страница 7.1 «Как познакомиться с таблицей» курса «Аналитика 101».
Скрипту нужно отдельное окружение: в примере используется pandas 2.3.3, а остальной код урока рассчитан на pandas 3.

  python -m venv profile-env
  profile-env/bin/pip install "fg-data-profiling==4.20.0"         (в Windows: profile-env\\Scripts\\pip)
  profile-env/bin/python da-7-1-first-look/profile_report.py      (из корня папки материалов)

Нужен общий набор data/eda/ (clients_export.csv). Скрипт сохраняет отчёт clients_profile.html в папку,
из которой запущен, и печатает предупреждения отчёта и значения из сводок по столбцам.
С прежним пакетом ydata-profiling 4.18.4 замените импорт на «from ydata_profiling import ProfileReport»:
вывод тот же, но в чистом окружении Python 3.13 пакету нужен ещё setuptools ниже 81.
"""
import pandas as pd
from data_profiling import ProfileReport     # пакет fg-data-profiling; прежнее имя — ydata-profiling

df = pd.read_csv("data/eda/clients_export.csv")
profile = ProfileReport(df, title="clients_export", progress_bar=False)
profile.to_file("clients_profile.html")        # отчёт по всем столбцам выгрузки

desc = profile.get_description()
print(f"предупреждений: {len(desc.alerts)}")
for alert in desc.alerts:
    print(" ", alert)

v = desc.variables                             # отдельно читаем сводку по каждому столбцу
print("client_id:", v["client_id"]["type"], "| пустых", v["client_id"]["n_missing"],
      "| разных", v["client_id"]["n_distinct"], "на", v["client_id"]["count"])
print("signup_date:", v["signup_date"]["type"], v["signup_date"]["min"].date(), "—", v["signup_date"]["max"].date())
print("age max:", v["age"]["max"], "| orders_q1 < 0:", v["orders_q1"]["n_negative"],
      "| channel «-»:", v["channel"]["value_counts_without_nan"]["-"])
print("tier:", v["tier"]["type"])
