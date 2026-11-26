from pathlib import Path

fig.update_layout(legend=dict(orientation="h", y=-0.15), dragmode=False)
alt = (f"График показывает выручку пяти каналов с января 2024 по декабрь 2025 года. "
       f"Выручка приложения выросла с {ru(app['2025-05'])} млн ₽ в мае до {ru(app['2025-07'])} млн ₽ "
       f"в июле 2025 года. В декабре она достигла {ru(app['2025-12'])} млн ₽.")
table = by_ch.pivot(index="month", columns="channel", values="mln")[top5]
print(alt)
print(table.loc["2025-04":"2025-08"].round(2).to_string())

# Добавляем в тот же файл краткое описание и доступную без JavaScript таблицу за все 24 месяца.
chart_html = fig.to_html(full_html=False, include_plotlyjs="cdn", config={"displayModeBar": False})
table_html = table.round(2).rename_axis("Месяц").rename_axis(None, axis=1).to_html(
    float_format=lambda value: ru(value, 2))
page = ('<!doctype html><html lang="ru"><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Выручка по каналам продаж</title><main><h1>Выручка по каналам продаж</h1>'
        f"<p>{alt}</p>{chart_html}<h2>Выручка по месяцам, млн ₽</h2>{table_html}</main></html>")
Path("mobile.html").write_text(page, encoding="utf-8")
