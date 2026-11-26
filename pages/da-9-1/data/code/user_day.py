# продолжение: ev — очищенный слой, sessionize — из блока выше
# 3. Склейка: каждому устройству — аккаунт, который на нём входил
dev_user = (ev.dropna(subset=["anonymous_id", "user_id"])
              .groupby("anonymous_id")["user_id"].first())
ev["person"] = (ev["user_id"]
                .fillna(ev["anonymous_id"].map(dev_user))
                .fillna(ev["anonymous_id"]))           # без входа используем идентификатор устройства
print("людей:", ev["person"].nunique())

# 4. Витрина «пользователь — день»: одна строка на человека и минский день
s = sessionize(ev, 30)
paid = ev[ev["event_name"] == "order_paid"]                # заказы — только с сервера
user_day = (
    ev.groupby(["person", "day"]).size().rename("events").to_frame()
      .join(s[s["is_new"]].groupby(["person", "day"]).size().rename("sessions"))
      .join(paid.groupby(["person", "day"])
                .agg(orders=("order_id", "size"), revenue=("revenue", "sum")))
      .fillna(0).astype(int)
      .reset_index()
)
days = user_day["day"].astype(str)
user_day = user_day[(days >= "2026-01-05") & (days <= "2026-06-28")]  # полные дни
print(user_day.shape)
print(user_day.head(3))
print(user_day[user_day["person"] == "u_06883"])

# В дневной витрине у каждого активного пользователя одна строка
dau = user_day.groupby("day").size()
print("DAU в мае:", round(dau[dau.index.astype(str).str[:7] == "2026-05"].mean(), 1))
