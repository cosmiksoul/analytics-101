"""Записывает трассу интерактива страницы 1.3: две версии paid_brands, цикл и comprehension.

Запуск: python trace_paid_brands.py
Скрипт выполняет обе версии под sys.settrace, печатает шаги с пояснениями и сохраняет
их в trace.json — ровно эти данные встроены в страницу. Трассу записал интерпретатор:
в ней нет шагов, придуманных автором.

Скрипт привязан к Python 3.13. Шаги comprehension он узнаёт по именам инструкций байт-кода,
а они меняются от версии к версии: на другой версии скрипт может остановиться на assert.
"""
import sys, json, dis, platform

ROWS = [
    {"brand": " lumo", "amount": 1200, "status": "paid"},
    {"brand": "BRISA", "amount": 850, "status": "cancelled"},
    {"brand": "Lumo ", "amount": 2300, "status": "paid"},
    {"brand": "kedr", "amount": 640, "status": "paid"},
    {"brand": "brisa", "amount": 1750, "status": "paid"},
]
SRC = {
 'loop': '''def clean_brand(name):
    return name.strip().title()

def paid_brands(rows):
    brands = []
    for row in rows:
        if row["status"] == "paid":
            brands.append(clean_brand(row["brand"]))
    return brands

result = paid_brands(rows)
''',
 'comp': '''def clean_brand(name):
    return name.strip().title()

def paid_brands(rows):
    return [clean_brand(row["brand"])
            for row in rows
            if row["status"] == "paid"]

result = paid_brands(rows)
'''}

def rep(v):
    if v is ROWS: return 'список из 5 строк выгрузки'
    if callable(v): return f'функция {v.__name__}'
    return repr(v)

def record(mode):
    code = compile(SRC[mode], '<trace>', 'exec')
    g = {'rows': ROWS, '__name__': '__main__'}
    raw = []
    def tr(frame, ev, arg):
        if frame.f_code.co_filename != '<trace>':
            return None
        fr = []; f = frame
        while f is not None and f.f_code.co_filename == '<trace>':
            fr.append(f); f = f.f_back
        fr.reverse()
        stack = []
        for f in fr:
            if f.f_code.co_name == '<module>':
                loc = [(k, v) for k, v in f.f_globals.items() if k in ('rows', 'clean_brand', 'paid_brands', 'result')]
            else:
                loc = list(f.f_locals.items())
            stack.append({'f': f.f_code.co_name, 'l': f.f_lineno, 'v': [[k, rep(v)] for k, v in loc], 'obj': dict(loc)})
        op = None
        if ev == 'line':
            for ins in dis.get_instructions(frame.f_code):
                if ins.offset == frame.f_lasti: op = ins.opname; break
        raw.append({'e': ev, 'l': frame.f_lineno, 'f': frame.f_code.co_name, 'op': op, 's': stack,
                    'ret': rep(arg) if ev == 'return' else None})
        return tr
    sys.settrace(tr)
    exec(code, g)
    sys.settrace(None)
    return raw, g['result']

def row_of(st):
    for fr in st['s']:
        if fr['f'] == 'paid_brands' and 'row' in fr['obj']:
            return fr['obj']['row']
    return None

def it_of(st):
    r = row_of(st)
    return next((i for i, x in enumerate(ROWS) if x is r), -1)


def vget(st, frame, name):
    for fr in st['s']:
        if fr['f'] == frame:
            for k, v in fr['v']:
                if k == name: return v
    return None

def blen(st):
    for fr in st['s']:
        if fr['f'] == 'paid_brands' and 'brands' in fr['obj']:
            return vget(st, 'paid_brands', 'brands').count("'") // 2
    return -1

out = {}
for mode in ('loop', 'comp'):
    raw, res = record(mode)
    steps = []
    calls = 0
    for i, st in enumerate(raw):
        nxt = raw[i + 1] if i + 1 < len(raw) else None
        prv = raw[i - 1] if i else None
        ev, ln, fn, op = st['e'], st['l'], st['f'], st['op']
        if fn == '<module>' and ev == 'call':
            continue                                  # служебный вход в модуль: строка 0
        row = row_of(st); it = it_of(st); n = it + 1
        after_ret = prv is not None and prv['e'] == 'return' and prv['f'] == 'clean_brand'
        ended = not (nxt and nxt['e'] == 'line' and nxt['l'] == 7)
        txt = None; merged = False
        if fn == '<module>':
            if ev == 'line' and ln == 1: txt = 'def создаёт функцию clean_brand, но её тело пока не выполняется: Python только запоминает, что делать при вызове.'
            elif ev == 'line' and ln == 4: txt = 'Второй def — функция paid_brands. В глобальной области теперь три имени: rows и две функции.'
            elif ev == 'line': txt = 'Вызов paid_brands(rows): аргумент — выгрузка из пяти строк. Сейчас в стеке появится новый кадр.'
            elif ev == 'return': txt = f'Программа закончилась: в глобальной области появилось имя result = {vget(st, "<module>", "result")}. Кадров функций в стеке больше нет.'
        elif fn == 'clean_brand':
            arg = st['s'][-1]['obj']['name']
            if ev == 'call':
                calls += 1
                txt = f'Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента {arg!r}. Переменных row и rows в этом кадре нет.'
            elif ev == 'line': txt = f'Строка 2: убрать пробелы по краям и сделать первую букву заглавной: {arg!r} → {arg.strip().title()!r}.'
            elif ev == 'return': txt = f'clean_brand возвращает {st["ret"]}. Её кадр уходит из стека, переменная name исчезает вместе с ним.'
        else:  # paid_brands
            if ev == 'call':
                txt = 'Вход в paid_brands. У функции свой кадр: параметр rows смотрит на ту же выгрузку, что и глобальное имя rows.'
            elif ev == 'return':
                txt = f'paid_brands возвращает {st["ret"]}. Кадр функции уходит из стека вместе с её переменными.'
            elif mode == 'loop':
                if ln == 5: txt = 'Строка 5: заводим пустой список brands. Он будет расти на глазах: следите за таблицей переменных.'
                elif ln == 6:
                    head = f'append дописал {prv["ret"]} в brands. ' if after_ret else ('brands не изменился. ' if row is not None else '')
                    if row is None: txt = 'Строка 6: for берёт первую строку выгрузки и кладёт её в переменную row. Начинается первая итерация.'
                    elif not ended: txt = head + f'Строка 6: for берёт следующую строку, итерация {n + 1}.'
                    else: txt = head + 'Строка 6: строк больше нет, цикл закончен. Переменная row по-прежнему хранит последнюю строку.'
                elif ln == 7:
                    ok = row['status'] == 'paid'
                    txt = f'Строка 7, итерация {n}: {row["status"]!r} == \'paid\' → {ok}. ' + ('Условие истинно, выполняем строку с отступом.' if ok else 'Условие ложно: строка 8 пропускается.')
                elif ln == 8: txt = f'Строка 8: сначала вызывается clean_brand(row["brand"]) с аргументом {row["brand"]!r}, потом append допишет ответ в brands.'
                elif ln == 9: txt = 'Строка 9: return отдаёт список brands тому, кто вызвал функцию.'
            else:  # comp
                if ln == 6 and op == 'LOAD_FAST': txt = 'Comprehension начинается не с первой строки, а с источника: Python берёт rows из строки 6.'
                elif ln == 5 and op == 'LOAD_FAST_AND_CLEAR':
                    txt = 'Строка 5: заводится пустой список для результата. Имени у него нет, поэтому в таблице переменных его не видно.'
                elif ln == 6:
                    head = f'Ответ {prv["ret"]} дописан в скрытый список. ' if after_ret else ''
                    if row is None and not ended: txt = 'Строка 6: for row in rows берёт первую строку выгрузки.'
                    elif not ended: txt = head + f'Строка 6: for row in rows берёт следующую строку, итерация {n + 1}.'
                    else: txt = head + 'Строка 6: строк больше нет, перебор закончен.'
                elif ln == 7:
                    ok = row['status'] == 'paid'
                    txt = f'Строка 7, итерация {n}: {row["status"]!r} == \'paid\' → {ok}. ' + ('Условие истинно, дальше выражение из строки 5.' if ok else 'Условие ложно: выражение из строки 5 для этой строки не вычисляется.')
                elif ln == 5 and op and op.startswith('POP_JUMP'):
                    if nxt and nxt['e'] == 'call':
                        txt = f'Строка 5: выражение слева, clean_brand(row["brand"]), с аргументом {row["brand"]!r}. Ответ уйдёт в скрытый список.'
                    else:
                        merged = True                    # служебный переход после ложного условия
                elif ln == 5 and op == 'SWAP':
                    txt = 'Строка 5: comprehension отдаёт собранный список. Переменная row сейчас исчезнет: за пределы comprehension она не выходит.'
        if merged:
            continue
        assert txt, (mode, ev, ln, op)
        d = {'e': ev[0], 'l': st['l'], 'it': it, 'b': blen(st), 'n': calls,
             's': [[fr['f'], fr['l'], fr['v']] for fr in st['s']], 't': txt}
        if ev == 'return': d['r'] = st['ret']
        steps.append(d)
    out[mode] = {'steps': steps, 'result': res, 'raw': len(raw), 'merged': len(raw) - 1 - len(steps)}
    print(mode, 'событий settrace:', len(raw), 'шагов на странице:', len(steps), 'склеено:', len(raw) - 1 - len(steps), 'результат:', res)
data = {m: out[m]['steps'] for m in ('loop', 'comp')}
js = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
js = js.replace('"список из 5 строк выгрузки"', '"@R"').replace('"функция clean_brand"', '"@C"').replace('"функция paid_brands"', '"@P"')
open('trace.json', 'w', encoding='utf-8').write(js)
print('JSON', len(js.encode()), 'байт; python', platform.python_version())
for m in ('loop', 'comp'):
    print('---', m)
    for i, s in enumerate(out[m]['steps']):
        print(i, s['e'], s['l'], s['it'], s['b'], s['n'], len(s['s']), s['t'])
