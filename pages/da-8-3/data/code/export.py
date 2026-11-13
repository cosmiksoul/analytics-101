import os
import re

fig.write_html("channels.html")                              # include_plotlyjs=True — по умолчанию
fig.write_html("channels_cdn.html", include_plotlyjs="cdn")  # библиотеку браузер возьмёт из интернета
with open("channels.json", "w", encoding="utf-8") as f:
    f.write(fig.to_json())                                   # только фигура: данные и оформление
fig.write_image("channels.png", width=900, height=480)       # kaleido рисует через Chrome
fig.write_image("channels.svg", width=900, height=480)

for name in ["channels.html", "channels_cdn.html", "channels.json", "channels.png", "channels.svg"]:
    print(f"{name:<18} {os.path.getsize(name) / 1024:>8.1f} КБ")
print(re.search(r'src="(https://cdn[^"]+)"', open("channels_cdn.html", encoding="utf-8").read()).group(1))
