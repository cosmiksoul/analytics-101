fig_a = px.bar(by_ch, x="channel", y="mln", color="channel",
               animation_frame="month",           # один кадр на месяц
               category_orders={"channel": top5},
               range_y=[0, 11],                   # одна шкала на все кадры
               labels={"channel": "", "mln": "млн ₽", "month": "месяц"},
               title="Выручка каналов по месяцам")
fig_a.update_layout(showlegend=False, separators=", ")

print("Число кадров:", len(fig_a.frames), "| период:", fig_a.frames[0].name, "…", fig_a.frames[-1].name)
print("Кнопки:", [b.label for b in fig_a.layout.updatemenus[0].buttons])
print("Месяц на 18-м шаге:", fig_a.layout.sliders[0].steps[17].label)
print("Начальная выручка приложения совпадает с первым кадром:",
      list(fig_a.data[2].y) == list(fig_a.frames[0].data[2].y))
print("Диапазон оси Y без range_y:", px.bar(by_ch, x="channel", y="mln", animation_frame="month").layout.yaxis.range)
