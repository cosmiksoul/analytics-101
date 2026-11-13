import pandas as pd
from data_profiling import ProfileReport     # пакет fg-data-profiling; прежнее имя — ydata-profiling

df = pd.read_csv("data/eda/clients_export.csv")
profile = ProfileReport(df, title="clients_export", progress_bar=False)
profile.to_file("clients_profile.html")        # черновик: большой HTML-отчёт

desc = profile.get_description()
print(f"предупреждений: {len(desc.alerts)}")
for alert in desc.alerts:
    print(" ", alert)

v = desc.variables                             # цифры в отчёте есть, предупреждений нет
print("client_id:", v["client_id"]["type"], "| пустых", v["client_id"]["n_missing"],
      "| разных", v["client_id"]["n_distinct"], "на", v["client_id"]["count"])
print("signup_date:", v["signup_date"]["type"], v["signup_date"]["min"].date(), "—", v["signup_date"]["max"].date())
print("age max:", v["age"]["max"], "| orders_q1 < 0:", v["orders_q1"]["n_negative"],
      "| channel «-»:", v["channel"]["value_counts_without_nan"]["-"])
print("tier:", v["tier"]["type"])
