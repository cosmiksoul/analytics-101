MONTHS = "январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь".split()
total = sales.groupby("month")["revenue"].sum()  # выручка месяца по всем 10 каналам
by_ch["month_ru"] = [f"{MONTHS[int(m[5:]) - 1]} {m[:4]}" for m in by_ch["month"]]
by_ch["share"] = by_ch["revenue"] / by_ch["month"].map(total)

fig = px.line(by_ch, x="month", y="mln", color="channel", category_orders={"channel": top5},
              custom_data=["month_ru", "share"],  # дополнительные значения для каждой точки
              labels={"month": "месяц", "mln": "млн ₽", "channel": "канал"},
              title="С мая по июль 2025 года выручка приложения почти удвоилась")
fig.update_traces(hovertemplate="<b>%{fullData.name}</b> · %{customdata[0]}<br>"
                                "%{y:.2f} млн ₽ · %{customdata[1]:.0%} выручки месяца"
                                "<extra></extra>")  # пустой extra убирает второй ярлык с именем
fig.update_layout(separators=", ")  # десятичная запятая и пробел между разрядами
fig.update_xaxes(tickformat="%m.%Y")

print(fig.data[2].hovertemplate)
print(fig.data[2].customdata[18])  # приложение, июль 2025
