fig.update_layout(legend=dict(orientation="h", y=-0.15),  # легенда под графиком: на узком экране сбоку ей тесно
                  dragmode=False)                           # свайп прокручивает страницу, а не рисует рамку
fig.write_html("mobile.html", include_plotlyjs="cdn", config={"displayModeBar": False})

# текстовая альтернатива из тех же данных: для экранного диктора и для тех, кто не наводит
alt = (f"Линейный график выручки пяти крупнейших каналов, январь 2024 — декабрь 2025. "
       f"Приложение выросло с {ru(app['2025-05'])} млн ₽ в мае до {ru(app['2025-07'])} млн ₽ "
       f"в июле 2025 после релиза и к декабрю дошло до {ru(app['2025-12'])} млн ₽.")
print(alt)
table = by_ch.pivot(index="month", columns="channel", values="mln")[top5]
print(table.loc["2025-04":"2025-08"].round(2).to_string())
