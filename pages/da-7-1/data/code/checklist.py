import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")                           # 1. читаем как есть, без параметров
print(df.shape, f"{df.memory_usage(deep=True).sum() / 1e6:.2f} МБ")       # 2. размер таблицы и расход памяти
print(df.sample(2, random_state=7).T)                                     # 3. смотрим две случайные строки
num = df.select_dtypes("number")
passport = pd.DataFrame({"dtype": df.dtypes,                              # 4. тип, который определил pandas
                         "пропусков": df.isna().sum(),                    # 5. явные пропуски
                         "уникальных": df.nunique(),                      # 6. кардинальность
                         "min": num.min(), "max": num.max()},             # 7. диапазоны чисел
                        index=df.columns)
print(passport)
print("повторов client_id:", df["client_id"].dropna().duplicated().sum())  # 8. ключ уникален?
print(df["channel"].value_counts().to_dict())                              # 9. частоты всех значений канала
iso = pd.to_datetime(df["signup_date"], format="%Y-%m-%d", errors="coerce")
print("дат не в формате ГГГГ-ММ-ДД:", iso.isna().sum())                    # 10. формат дат
