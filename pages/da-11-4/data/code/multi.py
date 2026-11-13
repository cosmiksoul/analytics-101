import pandas as pd
from scipy import stats
from statsmodels.stats.multitest import multipletests
from statsmodels.stats.proportion import proportions_ztest

ex = pd.read_csv("data/ab/exposures.csv")
users = pd.read_csv("data/ab/users.csv", dtype={"app_version": str})
ses = pd.read_parquet("data/ab/sessions.parquet")
BOTS = ["u_025389", "u_053191", "u_055948"]


def per_user(exp):
    """Строка на участника: группа из exposures, сегмент «платформа · страна», метрики за тест; без ботов."""
    m = ses[ses.experiment == exp].groupby("user_id").agg(conv=("converted", "max"), orders=("orders", "sum"),
                                                          revenue=("revenue", "sum"), sessions=("session_id", "size"))
    u = ex[(ex.experiment == exp) & ~ex.user_id.isin(BOTS)].merge(m, on="user_id").merge(users, on="user_id")
    u["segment"] = u.platform + " · " + u.country
    return u


def conv_p(g):                                        # z-тест для долей: конверсия B против A
    t = g.groupby("group").conv.agg(["sum", "size"])
    return proportions_ztest(t["sum"], t["size"])[1]


def correct(p):
    t = pd.DataFrame({"p": p})
    for method in ("bonferroni", "holm", "fdr_bh"):  # FWER, FWER, FDR
        t[method] = multipletests(t.p, alpha=0.05, method=method)[1]   # скорректированные p
    return t.sort_values("p")


# 1. A/A-тест, 12 сегментов: эффекта нет нигде
aa = correct({s: conv_p(g) for s, g in per_user("aa_check").groupby("segment")})
print(aa.head(3).round(4).to_string(), "\n")
print("A/A, значимых при 0,05:", (aa < 0.05).sum().to_dict(), "\n")

# 2. checkout_v2: 4 метрики на человека и конверсия в 12 сегментах — 16 гипотез одного отчёта
u = per_user("checkout_v2")
hyp = {"конверсия": conv_p(u)}
for met, name in (("orders", "заказы"), ("revenue", "выручка"), ("sessions", "сессии")):   # t-тест Уэлча
    hyp[name] = stats.ttest_ind(u[u.group == "B"][met], u[u.group == "A"][met], equal_var=False).pvalue
hyp |= {"сегмент " + s: conv_p(g) for s, g in u.groupby("segment")}
chk = correct(hyp)
print(chk.head(6).round(4).to_string(), "\n")
print("checkout_v2, значимых при 0,05:", (chk < 0.05).sum().to_dict())
