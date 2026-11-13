"""Материалы страницы 7.3: ноутбук с шестью блоками кода и шаблон ноутбука разведочного анализа.
Данные — общий набор data/eda (тема 07)."""
import re


def template_notebook(src):
    """Блок «template» страницы записан ячейками «# %%»: превращаем его в ноутбук, не выполняя."""
    import nbformat
    from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook
    nb = new_notebook()
    nb.metadata["kernelspec"] = {"display_name": "Python 3", "language": "python", "name": "python3"}
    nb.metadata["language_info"] = {"name": "python"}
    for i, chunk in enumerate(re.split(r"^# %%", src, flags=re.M)[1:], start=1):
        head, _, body = chunk.partition("\n")
        body = body.strip("\n")
        if head.strip() == "[markdown]":
            lines = [l[2:] if l.startswith("# ") else l.lstrip("#") for l in body.split("\n")]
            # в блоке страницы строки идут подряд; в Markdown абзацам нужна пустая строка между ними,
            # а таблице — строка-разделитель после заголовка
            out = []
            for j, l in enumerate(lines):
                table, prev = l.startswith("|"), j > 0 and lines[j - 1].startswith("|")
                if j > 0 and not (table and prev):
                    out.append("")
                out.append(l)
                if table and not prev:
                    out.append("|" + "---|" * (l.count("|") - 1))
            cell = new_markdown_cell("\n".join(out))
        else:
            cell = new_code_cell(body)
        cell["id"] = f"t{i:02d}"
        nb.cells.append(cell)
    nbformat.validate(nb)
    return nb


def build(m):
    m.use_data("eda")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18, seaborn 0.13 и matplotlib 3.10."

    m.notebook("relationships.ipynb", "relationships.nb.py", "main")
    m.from_reader_folder("relationships.ipynb")
    m.check("ноутбук не оставил clients_clean.parquet и рисунки в материалах страницы",
            not any((m.out / n).exists() for n in ("clients_clean.parquet", "pairplot.svg", "corr.svg")))

    import nbformat
    nb = template_notebook(m.page_code("template"))
    nbformat.write(nb, m.out / "eda_template.ipynb")
    kinds = [c.cell_type for c in nb.cells]
    m.check("eda_template.ipynb: семь ячеек шаблона — шесть текстовых и одна с кодом, как в блоке страницы",
            kinds.count("markdown") == 6 and kinds.count("code") == 1, str(kinds))
    text = "\n".join(c.source for c in nb.cells)
    m.check("eda_template.ipynb: есть вопрос, вывод, следующий вопрос, дневник и список гипотез",
            all(k in text for k in ("## Вопрос 1", "**Вывод.**", "**Следующий вопрос.**", "## Дневник", "## Гипотезы на проверку")))
