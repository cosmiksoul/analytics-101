import pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"]
print("все чеки:       среднее", round(amount.mean()), "медиана", int(amount.median()))

rest = amount.drop(amount.nlargest(200).index)            # без 1% самых дорогих
print("без 1% дорогих:  среднее", round(rest.mean()), "медиана", int(rest.median()))

plus = pd.concat([amount, pd.Series([1_000_000])])        # плюс один чек на 1 млн ₽
print("плюс чек 1 млн:  среднее", round(plus.mean()), "медиана", int(plus.median()))
print("доля чеков дешевле среднего:", round((amount < amount.mean()).mean(), 3))
