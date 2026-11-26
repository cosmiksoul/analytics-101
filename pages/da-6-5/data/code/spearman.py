import pandas as pd

df = pd.read_csv("data/clients/clients.csv").head(40)[["income", "spend"]]   # 40 учебных клиентов

def both(d):
    p = d["income"].corr(d["spend"])                       # Пирсон по значениям
    s = d["income"].corr(d["spend"], method="spearman")    # Спирмен по рангам
    return f"Пирсон {p:+.3f}   Спирмен {s:+.3f}"

print("40 клиентов:      ", both(df))

# один оптовый покупатель: доход 30 000 ₽, траты за квартал 1,5 млн ₽
wholesale = pd.DataFrame({"income": [30_000], "spend": [1_500_000]})
out = pd.concat([df, wholesale], ignore_index=True)
print("плюс один выброс: ", both(out))

# По тратам оптовый покупатель занимает 41-е место из 41.
ranks = out.rank()
print(ranks.tail(2))
print(f"Пирсон по рангам: {ranks['income'].corr(ranks['spend']):+.3f}")

# При x от 1 до 20 значения 2**x строго возрастают. Ранги x и y совпадают.
x = pd.Series(range(1, 21))
y = 2.0 ** x
print(f"y = 2^x:          Пирсон {x.corr(y):+.3f}   Спирмен {x.corr(y, method='spearman'):+.3f}")
