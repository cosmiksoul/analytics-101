import numpy as np
import pandas as pd

cl = pd.read_csv("data/unit/clients.csv", parse_dates=["signup_date"])
od = pd.read_csv("data/unit/orders.csv", parse_dates=["order_date"])
sp = pd.read_csv("data/unit/marketing_spend.csv")
od["margin"] = np.where(od["refunded"] == 1, -2 * od["delivery_cost"] - od["payment_fee"],
                        od["revenue"] - od["cogs"] - od["delivery_cost"] - od["payment_fee"])
month = lambda d: d.dt.year * 12 + d.dt.month          # сквозной номер месяца
LAST = 2026 * 12 + 6                                    # июнь 2026 — последний месяц данных
cl["m"] = month(cl["signup_date"])
od = od.merge(cl[["client_id", "channel", "m"]], on="client_id")
od["n"] = month(od["order_date"]) - od["m"]             # месяц жизни клиента, 0 — месяц регистрации

S = sp.pivot(index="month", columns="channel", values="spend")
N = pd.crosstab(cl["signup_date"].dt.strftime("%Y-%m"), cl["channel"])
CAC = S.sum() / N[S.columns].sum()


def increments(ch):
    """Доход за месяц n на клиента тех когорт, для которых этот месяц есть в данных."""
    size = cl[cl["channel"] == ch].groupby("m").size()
    margin = od[od["channel"] == ch].groupby("n")["margin"].sum()
    return np.array([margin.get(n, 0) / size[size.index + n <= LAST].sum() for n in range(24)])


# 1. Убывающая отдача: новые клиенты ∝ расходы^β, предельный CAC ≈ средний / β
beta = {ch: np.polyfit(np.log(S[ch]), np.log(N[ch]), 1)[0] for ch in ["поиск", "соцсети"]}
for ch, b in beta.items():
    print(f"{ch}: эластичность {b:.2f}, средний CAC {CAC[ch]:.0f} ₽, предельный ≈ {CAC[ch] / b:.0f} ₽")
dS, dN = S["соцсети"].diff()["2025-11"], N["соцсети"].diff()["2025-11"]
print(f"реклама в соцсетях, ноябрь 2025 года по сравнению с октябрём: +{dS / 1e6:.2f} млн ₽ и +{dN:.0f} клиентов, по {dS / dN:.0f} ₽ за каждого\n")

# 2. В сценариях для поиска удержание влияет на доход с месяца 1, изменение чека — с месяца 0
inc = increments("поиск")
o = od[od["channel"] == "поиск"]
M, DLV = o["margin"].mean(), o["delivery_cost"].mean()  # маржинальный доход и стоимость доставки на заказ


def scenario(ret=1.0, check=1.0, cac=CAC["поиск"]):
    k_check = (check * (M + DLV) - DLV) / M              # доставка не дешевеет вместе с чеком
    cum = (inc * np.r_[1.0, np.full(23, ret)] * k_check).cumsum()
    hit = np.flatnonzero(cum >= cac)
    return {"LTV 12": round(cum[11]), "LTV 24": round(cum[23]), "LTV 24/CAC": round(cum[23] / cac, 2),
            "окупаемость, n": hit[0] if len(hit) else "нет"}


table = pd.DataFrame.from_dict({"база": scenario(), "удержание +10%": scenario(ret=1.1), "чек −10%": scenario(check=0.9),
                                "удержание +10%, чек −10%": scenario(ret=1.1, check=0.9)}, orient="index")
print(table.to_string(), "\n")

# 3. Эффект эксперимента в деньгах: +2% к удержанию месяцев 1–11 у новичков года, горизонт 12 месяцев
year = cl[cl["signup_date"] >= "2025-07-01"]["channel"].value_counts()
gain = pd.Series({ch: year[ch] * 0.02 * increments(ch)[1:12].sum() for ch in year.index})
print(f"+2% к удержанию: поиск +{0.02 * inc[1:12].sum():.1f} ₽ на клиента, "
      f"для {year.sum()} новых клиентов всех каналов +{gain.sum() / 1e6:.2f} млн ₽ маржинального дохода за их первые 12 месяцев\n")


# 4. Бюджет на поиск растёт 12 месяцев, затем остаётся постоянным. Доход когорт учитываем до n = 23 включительно
def cash(growth, b, s0=1.2e6, months=36):
    s = s0 * (1 + growth) ** np.minimum(np.arange(months), 12)
    new = s0 / CAC["поиск"] * (s / s0) ** b                 # b = 1 — CAC не растёт с бюджетом
    cum = (np.convolve(new, inc)[:months] - s).cumsum()     # накопленный маржинальный доход всех когорт за вычетом расходов на привлечение
    up = [t for t in range(cum.argmin(), months) if cum[t] >= 0]
    return {"расходы с месяца 12, млн ₽": round(s[12] / 1e6, 2), "CAC новичков, ₽": round(s[12] / new[12]),
            "дно, млн ₽": round(cum.min() / 1e6, 1), "месяц дна": cum.argmin(), "в плюсе с месяца": up[0] if up else "нет"}


print(pd.DataFrame.from_dict({"без роста": cash(0, 1), "+10% в месяц, CAC постоянный": cash(0.10, 1),
                              "+10% в месяц, β = 0,78": cash(0.10, beta["поиск"])}, orient="index").to_string())
