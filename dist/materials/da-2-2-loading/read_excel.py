import pandas as pd

PATH = "data/crm_by_month.xlsx"          # те же заказы CRM, по листу на месяц

sheets = pd.read_excel(PATH, sheet_name=None)            # None — все листы сразу
print({name: len(df) for name, df in sheets.items()})    # словарь «имя листа → таблица»

march = pd.read_excel(PATH, sheet_name="Март")           # один лист по имени
print(march[["order_id", "date", "amount"]])

crm = pd.concat(sheets.values(), ignore_index=True)
print(crm.shape, crm["date"].dtype, crm["amount"].dtype)
