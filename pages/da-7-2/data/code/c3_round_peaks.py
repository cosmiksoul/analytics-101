pos = s[(s > 0) & (s < 1_000_000)]                # покупатели, без пяти ошибок ×1000
cnt = pos.value_counts().reindex(np.arange(10, 105_000, 10), fill_value=0)
near = (cnt.rolling(61, center=True, min_periods=1).sum() - cnt) / 60  # соседи ±300 ₽
ratio = (cnt / near).where((cnt.index % 500 == 0) & (cnt >= 10))  # круглые и не редкие

top = ratio.nlargest(4).index
print(pd.DataFrame({"клиентов": cnt[top], "у соседа": near[top].round(1),
                    "во сколько раз": ratio[top].round(1)}).to_string())
round1000 = pos % 1000 == 0
print(f"кратны 1 000: {round1000.mean():.1%} сумм, без 5 000 ₽: "
      f"{(round1000 & (pos != 5000)).mean():.1%} (случайно ждём около 1%)")
