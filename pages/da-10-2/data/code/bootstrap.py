# продолжение предыдущей ячейки: size, act, marg, power, pick, grp, orders уже в памяти
S, A, M = size.to_numpy(), act.to_numpy(), marg.to_numpy()   # 12 когорт × месяцы 0–12


def ltv12_24(i):
    """LTV12 по данным и LTV24 со степенным хвостом для набора когорт i."""
    s = S[i].sum()
    (a, b), _ = curve_fit(power, np.arange(1, 13), A[i, 1:].sum(0) / s, p0=(0.4, 0.5))
    m_tail = M[i, 10:].sum() / A[i, 10:].sum()
    return M[i, :12].sum() / s, M[i].sum() / s + (power(np.arange(13, 24), a, b) * m_tail).sum()


rng = np.random.default_rng(10)
boot = np.array([ltv12_24(rng.integers(0, 12, size=12)) for _ in range(2000)])   # 12 когорт с возвращением
point = ltv12_24(np.arange(12))
for j, name in enumerate(["LTV12", "LTV24, степенной хвост"]):
    lo, hi = np.percentile(boot[:, j], [2.5, 97.5])
    print(f"{name}: {point[j]:.0f} ₽, 95% интервал {lo:.0f}–{hi:.0f} ₽")

# LTV12 по каналам с тем же бутстрэпом по когортам; CAC — расходы тех же 12 месяцев на новичка канала
spend = pd.read_csv("data/unit/marketing_spend.csv").query("'2024-07' <= month <= '2025-06'").groupby("channel").spend.sum()
o12 = pick(orders).query("n < 12").merge(clients[["client_id", "channel"]], on="client_id")
mar_ch = o12.pivot_table(index="cohort", columns="channel", values="margin", aggfunc="sum")
cnt_ch = grp.pivot_table(index="cohort", columns="channel", values="client_id", aggfunc="count")
idx = rng.integers(0, 12, size=(2000, 12))
rows = {}
for ch in cnt_ch.columns:
    b = mar_ch[ch].to_numpy()[idx].sum(1) / cnt_ch[ch].to_numpy()[idx].sum(1)
    rows[ch] = [cnt_ch[ch].sum(), mar_ch[ch].sum() / cnt_ch[ch].sum(), *np.percentile(b, [2.5, 97.5]),
                spend.get(ch, np.nan) / cnt_ch[ch].sum()]
print(pd.DataFrame(rows, index=["клиентов", "LTV12", "от", "до", "CAC"]).T.round(0).astype("Int64"))
