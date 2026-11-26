/* Страница 11.2 · Дизайн теста: метрика, рандомизация, MDE, размер выборки */
(() => {
  /* Данные — из data/gen_page.py по учебным данным data/ab: база — группа A checkout_v2 (конверсия пользователя,
     выручка на человека и её σ), Выбор MDE для плана, средний поток новых участников в день, кривая набора людей checkout_v2
     (среднее двух групп к концу каждого дня) и поток последней недели в группу. Код и вывод — data/build_code.py. */
  /*data:start*/const DATA = {"p0": 0.140828, "mu": 998.912, "sd": 6911.72, "mde": 0.0086, "dRev": 61, "flow": 2028.46, "p0aa": 0.1031, "cum": [3960.0, 6951.0, 9193.0, 11073.0, 12651.5, 14298.0, 15680.0, 16726.5, 17683.0, 18582.0, 19396.0, 20158.0, 20959.5, 21709.5, 22297.5, 22850.0, 23383.5, 23913.0, 24389.5, 24917.5, 25444.0, 25889.5, 26306.0, 26736.0, 27153.0, 27533.0, 27947.0, 28398.5], "tail": 422.07};/*data:end*/
  /*code:start*/const CODE = {"manual": {"title": "Параметры из данных, порог окупаемости и расчёт выборки", "badge": "проверено: Python 3.13", "lang": "python", "code": "import numpy as np\nimport pandas as pd\nfrom scipy.stats import norm\n\n# 1. Участники тестов: группа — из журнала показов, боты исключены\nbots = [\"u_025389\", \"u_053191\", \"u_055948\"]\nexp = pd.read_csv(\"data/ab/exposures.csv\", parse_dates=[\"exposed_at\"])\nexp = exp[~exp.user_id.isin(bots)]\nses = pd.read_parquet(\"data/ab/sessions.parquet\")\nusers = (ses.groupby([\"experiment\", \"user_id\"])\n            .agg(conv=(\"converted\", \"max\"), revenue=(\"revenue\", \"sum\"))\n            .reset_index()\n            .merge(exp, on=[\"experiment\", \"user_id\"], how=\"right\", validate=\"one_to_one\")\n            .fillna({\"conv\": 0, \"revenue\": 0}))\n\n# 2. Параметры завершённого checkout_v2 для учебного расчёта. До запуска берут исторические данные.\na = users[(users.experiment == \"checkout_v2\") & (users.group == \"A\")]\np0, mu, sd = a.conv.mean(), a.revenue.mean(), a.revenue.std()\nprint(f\"конверсия A: {p0:.4f}   выручка на человека: {mu:.1f} ₽, σ = {sd:.0f} ₽, σ/среднее = {sd / mu:.2f}\")\n\n# 3. Выбираем целевой MDE на уровне оценённого порога окупаемости\npeople = (users.experiment == \"checkout_v2\").sum()   # участников за 4 недели\nmargin = 783                         # маржинальный доход обычного заказа, ₽ (страница 10.1)\npoint = people * 0.01 * margin * 13  # +1 п. п. за год: 13 окон по 4 недели\ncost = 5_000_000                     # разработка и поддержка за год, ₽ — условная цифра\nmde = round(cost / point / 100, 4)   # в долях, до сотых пункта: 0,0086 = 0,86 п. п.\nprint(f\"пункт конверсии: {point / 1e6:.2f} млн ₽ в год → MDE = {mde * 100:.2f} п. п. = {mde / p0:+.1%}\")\n\n# 4. Формула: n = (z₁₋α/₂ + z₁₋β)² · (σ²_A + σ²_B) / MDE² — людей в КАЖДОЙ группе\nalpha, power = 0.05, 0.80\nz = norm.ppf(1 - alpha / 2) + norm.ppf(power)        # 1,960 + 0,842\np1 = p0 + mde\nn_conv = np.ceil(z**2 * (p0 * (1 - p0) + p1 * (1 - p1)) / mde**2)\nd_rev = round(mu * mde / p0)                         # тот же относительный эффект для выручки, ₽\nn_rev = np.ceil(z**2 * 2 * sd**2 / d_rev**2)\nprint(f\"конверсия: {n_conv:.0f} в группе\")\nprint(f\"выручка (+{d_rev:.0f} ₽): {n_rev:.0f} в группе — в {n_rev / n_conv:.1f} раза больше\")\n\n# 5. Срок: поток новых участников и целые недели\nday = (exp.exposed_at.dt.tz_convert(\"Europe/Minsk\").dt.date)[exp.experiment == \"checkout_v2\"]\nflow = day.value_counts().sort_index()\nprint(\"новых участников в день, первая неделя:\", flow.iloc[:7].tolist())\nprint(\"                         последняя неделя:\", flow.iloc[-7:].tolist())\nfor n in (n_conv, n_rev):\n    days = np.ceil(2 * n / flow.mean())\n    print(f\"{2 * n:.0f} человек при {flow.mean():.0f} в день → {days:.0f} дней → {np.ceil(days / 7):.0f} нед.\")", "out": "конверсия A: 0.1408   выручка на человека: 998.9 ₽, σ = 6912 ₽, σ/среднее = 6.92\nпункт конверсии: 5.78 млн ₽ в год → MDE = 0.86 п. п. = +6.1%\nконверсия: 26329 в группе\nвыручка (+61 ₽): 201535 в группе — в 7.7 раза больше\nновых участников в день, первая неделя: [7920, 5982, 4484, 3760, 3157, 3293, 2764]\n                         последняя неделя: [891, 833, 860, 834, 760, 828, 903]\n52658 человек при 2028 в день → 26 дней → 4 нед.\n403070 человек при 2028 в день → 199 дней → 29 нед.", "note": "Базой служит группа A самого checkout_v2: это и есть «4 недели без изменения». В жизни её берут из исторических данных за сопоставимый период. 783 ₽ — маржинальный доход обычного заказа своего товара из учебной выгрузки темы 10, 5 млн ₽ — условная цена изменения."}, "sm": {"title": "То же в statsmodels: размер выборки и MDE для заданного числа участников", "badge": "проверено: statsmodels 0.15.0", "lang": "python", "code": "from statsmodels.stats.power import NormalIndPower, TTestIndPower\nfrom statsmodels.stats.proportion import proportion_effectsize\n\npw = NormalIndPower()\n# Доля: statsmodels меряет эффект в арксинусах — это h Коэна\nh = proportion_effectsize(p1, p0)\nprint(f\"конверсия, h = {h:.4f}:  {pw.solve_power(h, alpha=0.05, power=0.8):.0f} в группе\")\n# Та же формула, что вручную: эффект в долях σ̄ = √((σ²_A + σ²_B) / 2)\nd_conv = mde / np.sqrt((p0 * (1 - p0) + p1 * (1 - p1)) / 2)\nprint(f\"конверсия, Δ/σ̄ = {d_conv:.4f}: {pw.solve_power(d_conv, alpha=0.05, power=0.8):.0f} в группе\")\n# Среднее: d = Δ / σ; t-тест вместо z почти ничего не меняет\nd = d_rev / sd\nprint(f\"выручка, d = {d:.4f}: z {pw.solve_power(d, alpha=0.05, power=0.8):.0f}, \"\n      f\"t {TTestIndPower().solve_power(d, alpha=0.05, power=0.8):.0f} в группе\")\n\n# Обратная задача: какой эффект видит выборка, которая набралась в checkout_v2\nc = users[users.experiment == \"checkout_v2\"]\nnA, nB = (c.group == \"A\").sum(), (c.group == \"B\").sum()\nes = pw.solve_power(nobs1=nA, ratio=nB / nA, alpha=0.05, power=0.8)    # в стандартных единицах\np_min = np.sin(np.arcsin(np.sqrt(p0)) + es / 2) ** 2                   # из арксинусов обратно в долю\nprint(f\"\\nвыборка {nA} + {nB}: MDE конверсии {(p_min - p0) * 100:.2f} п. п., \"\n      f\"выручки {es * sd:.0f} ₽ ({es * sd / mu:+.1%})\")", "out": "конверсия, h = 0.0244:  26327 в группе\nконверсия, Δ/σ̄ = 0.0244: 26329 в группе\nвыручка, d = 0.0088: z 201534, t 201535 в группе\n\nвыборка 28439 + 28358: MDE конверсии 0.83 п. п., выручки 163 ₽ (+16.3%)", "note": "Ячейка продолжает предыдущую: p0, p1, mde, d_rev, sd, users уже в памяти. solve_power возвращает nobs1 — людей в первой группе; вторая — nobs1 · ratio."}, "sim": {"title": "Проверка мощности симуляцией: тысячи тестов с известным эффектом", "badge": "проверено: NumPy 2.5.3, SciPy 1.18", "lang": "python", "code": "from scipy.stats import ttest_ind\n\nrng = np.random.default_rng(1102)\nR = 2000                                    # тестов в каждой симуляции\n\n\ndef z_share(xa, xb, n):\n    \"\"\"Доля тестов с p < 0,05: z-тест для долей, xa и xb — числа покупателей в группах по n.\"\"\"\n    pa, pb, pp = xa / n, xb / n, (xa + xb) / (2 * n)\n    zz = (pb - pa) / np.sqrt(pp * (1 - pp) * 2 / n)\n    return np.mean(2 * norm.sf(np.abs(zz)) < 0.05)\n\n\n# 1. Конверсия: R тестов по n_conv человек в группе\nn = int(n_conv)\naa = z_share(rng.binomial(n, p0, R), rng.binomial(n, p0, R), n)          # эффекта нет\nab = z_share(rng.binomial(n, p0, R), rng.binomial(n, p0 + mde, R), n)    # эффект = MDE\nprint(f\"конверсия, {n} в группе: A/A значимы {aa:.1%}, A/B с эффектом MDE — {ab:.1%}\")\n\n\n# 2. Выручка: людей берём из группы A с возвращением — хвост настоящий\nrev = a.revenue.to_numpy()\n\n\ndef rev_share(n, lift, reps=R):\n    hits = 0\n    for _ in range(reps):\n        x, y = rng.choice(rev, n), rng.choice(rev, n) * lift\n        hits += ttest_ind(y, x, equal_var=False).pvalue < 0.05\n    return hits / reps\n\n\nb = c[c.group == \"B\"]\nlift = b.revenue.mean() / mu                # +7,8%, как вышло в checkout_v2\nneed = int(np.ceil(z**2 * (1 + lift**2) * sd**2 / (mu * (lift - 1)) ** 2))   # σ_B = lift · σ_A\nprint(f\"выручка, {nA} в группе: A/A значимы {rev_share(nA, 1):.1%}, \"\n      f\"A/B с эффектом {lift - 1:+.1%} — {rev_share(nA, lift):.1%}\")\nprint(f\"выручка, {need} в группе: A/B с эффектом {lift - 1:+.1%} — {rev_share(need, lift):.1%}\")", "out": "конверсия, 26329 в группе: A/A значимы 4.5%, A/B с эффектом MDE — 81.2%\nвыручка, 28439 в группе: A/A значимы 5.9%, A/B с эффектом +7.8% — 25.7%\nвыручка, 133658 в группе: A/B с эффектом +7.8% — 79.7%", "outLabel": "Вывод: доля тестов с p < 0,05", "note": "Ячейка продолжает две предыдущие. Погрешность доли по 2 000 тестов — около 1 п. п. Зерно генератора фиксировано, повторный запуск даёт тот же вывод."}, "doc": {"title": "Шаблон документа дизайна, заполненный для checkout_v2", "badge": "шаблон, не код", "badgeKind": "info", "lang": "text", "code": "ПЛАН ЭКСПЕРИМЕНТА · checkout_v2                    учебный пример\nЧто меняем     новое оформление заказа\n\n1. Гипотеза      Новое оформление увеличит долю покупателей.\n                 Ориентир окупаемости — рост с 14,08% до 14,94%\n                 (+0,86 п. п., или +6,1% относительно базы).\n2. Метрики       целевая:   доля участников с покупкой с первого показа\n                            до общей даты окончания теста\n                 вторичные: доля сессий с покупкой, число заказов на покупателя\n                 защитные:  выручка на участника, ошибки оплаты\n3. MDE           Для плана выбираем 0,86 п. п. — около порога окупаемости.\n                 Затраты — 5 млн ₽ в год, маржа от 1 п. п. — 5,78 млн ₽ в год.\n4. Статистика    двусторонний z-тест для долей, α = 0,05, мощность 80%\n                 при выбранном MDE; оценка разницы и 95%-й интервал\n5. Выборка       26 329 в группе, 52 658 всего\n6. Рандомизация  единица — пользователь, 50/50, весь доступный трафик\n                 группа A, если int(md5(\"chk-0907-3:\" + user_id)[:8], 16) % 100 < 50\n                 первый показ — первая сессия в период теста\n7. Срок          четыре полные недели, с 7 сентября по 4 октября 2026\n                 при среднем притоке около 2 000 участников в день набор займёт 26 дней\n8. Решение       5 октября сравнить интервал прироста с нулём и порогом окупаемости.\n                 Для защитных метрик до запуска согласовать допустимые потери\n                 и указать, какая граница интервала подтвердит приемлемый риск.\n9. Проверки      A/A aa_check за 24 августа — 6 сентября: баланс p = 0,61,\n                 конверсия p = 0,20. Порог проверки пропорции групп: p < 0,001.\n10. После старта сохраняем первоначальный план; отклонения описываем в отчёте."}};/*code:end*/

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const sp = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const dec = (v, d = 1) => v.toFixed(d).replace('.', ',').replace('-', '−');
  const pct = v => (v >= 0.0995 ? String(Math.round(v * 100)) : dec(v * 100, 1)) + '%';
  const PL = { day: ['день', 'дня', 'дней'], wk: ['неделя', 'недели', 'недель'], man: ['человек', 'человека', 'человек'] };

  /* ===================== Нормальное распределение ===================== */
  /* Φ — алгоритм Харта (двойная точность, по Уэсту 2005); сверено со SciPy до 1e-15 в data/check_calc.py */
  function Phi(x) {
    const a = Math.abs(x);
    let c = 0;
    if (a <= 37) {
      const e = Math.exp(-a * a / 2);
      if (a < 7.07106781186547) {
        let b = 3.52624965998911e-2 * a + 0.700383064443688;
        b = b * a + 6.37396220353165; b = b * a + 33.912866078383; b = b * a + 112.079291497871;
        b = b * a + 221.213596169931; b = b * a + 220.206867912376;
        c = e * b;
        b = 8.83883476483184e-2 * a + 1.75566716318264;
        b = b * a + 16.064177579207; b = b * a + 86.7807322029461; b = b * a + 296.564248779674;
        b = b * a + 637.333633378831; b = b * a + 793.826512519948; b = b * a + 440.413735824752;
        c /= b;
      } else {
        let b = a + 0.65; b = a + 4 / b; b = a + 3 / b; b = a + 2 / b; b = a + 1 / b;
        c = e / b / 2.506628274631;
      }
    }
    return x > 0 ? 1 - c : c;
  }
  const dens = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  /* Φ⁻¹ — приближение Экляма и один шаг Галлея по Φ */
  function invPhi(p) {
    const A = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const B = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const C = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const D = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const lo = 0.02425;
    let x;
    if (p < lo) { const q = Math.sqrt(-2 * Math.log(p)); x = (((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) / ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1); }
    else if (p > 1 - lo) { const q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) / ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1); }
    else { const q = p - 0.5, r = q * q; x = (((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q / (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1); }
    const u = (Phi(x) - p) * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }

  /* ===================== План теста ===================== */
  /* n — людей в группе: N = (z₁₋α/₂ + z₁₋β)² · (σ²_A / w + σ²_B / (1 − w)) / MDE² на обе группы, w — доля группы A.
     При 50/50 это n = (z₁₋α/₂ + z₁₋β)² · (σ²_A + σ²_B) / MDE². У доли σ² = p(1 − p) в каждой группе, у среднего σ одна. */
  function plan(s) {
    const za = invPhi(1 - s.alpha / 2), zb = invPhi(s.power), Z = za + zb, w = s.wA;
    let vA, vB;
    if (s.kind === 'conv') { const p1 = s.p0 + s.mde; vA = s.p0 * (1 - s.p0); vB = p1 * (1 - p1); }
    else vA = vB = s.sd * s.sd;
    /* как в statsmodels: в двусторонней мощности учтён и дальний хвост, Φ(t − z) + Φ(−t − z) = мощность; t = MDE / SE */
    let t = Z;
    for (let i = 0; i < 8; i++) { const f = Phi(t - za) + Phi(-t - za) - s.power, d = dens(t - za) - dens(-t - za); t -= f / d; }
    const N = t * t * (vA / w + vB / (1 - w)) / (s.mde * s.mde);
    const nA = Math.ceil(N * w - 1e-7), nB = Math.ceil(N * (1 - w) - 1e-7);
    const se = Math.sqrt(vA / (N * w) + vB / (N * (1 - w)));
    const days = Math.ceil((nA + nB) / (s.flow * s.share) - 1e-9);
    return { za, zb, nA, nB, total: nA + nB, se, c: za * se, days, weeks: Math.ceil(days / 7) };
  }

  /* ===================== Сцена: два колокола ===================== */
  const P0 = DATA.p0, CUM = DATA.cum, TAIL = DATA.tail, LAST = CUM.length;
  const ZA = invPhi(0.975), ZB = invPhi(0.8), ZZ = (ZA + ZB) * (ZA + ZB);
  const vOf = m => P0 * (1 - P0) + (P0 + m) * (1 - P0 - m);             // σ²_A + σ²_B при эффекте m
  const M1 = DATA.mde, M2 = DATA.mde / 2;
  const N1 = ZZ * vOf(M1) / (M1 * M1), N2 = ZZ * vOf(M2) / (M2 * M2);     // план для MDE и для MDE / 2
  const C1 = ZA * Math.sqrt(vOf(M1) / N1), C2 = ZA * Math.sqrt(vOf(M2) / N2);
  /* людей в группе к дню d (дробный день — внутри дня): кривая набора checkout_v2, после 28-го дня — поток последней недели */
  const nOf = d => d <= 1 ? CUM[0] * d : d < LAST ? lerp(CUM[Math.floor(d) - 1], CUM[Math.floor(d)], d - Math.floor(d)) : CUM[LAST - 1] + TAIL * (d - LAST);
  const dayOf = n => { if (n >= CUM[LAST - 1]) return LAST + (n - CUM[LAST - 1]) / TAIL; const i = CUM.findIndex(v => v >= n); return i === 0 ? n / CUM[0] : i + (n - CUM[i - 1]) / (CUM[i] - CUM[i - 1]); };
  const D1 = dayOf(N1), D2 = dayOf(N2);
  /* α — по колоколу «эффекта нет» с дисперсией плана (v0), β — по колоколу «эффект = m»; до шага 9 они совпадают */
  const errs = (n, c, m, v0 = vOf(M1)) => {
    const se = Math.sqrt(v0 / n), se1 = Math.sqrt(vOf(m) / n);
    return { se, a: 2 * (1 - Phi(c / se)), b: Phi((c - m) / se1) - Phi((-c - m) / se1) };
  };
  const E1 = errs(nOf(1), C1, M1), E7 = errs(nOf(7), C1, M1), E14 = errs(nOf(14), C1, M1), E28 = errs(nOf(LAST), C1, M1), E8 = errs(nOf(LAST), C1, M2);
  const ppt = v => dec(v * 100, 2) + '&nbsp;п.&nbsp;п.';
  const SC = { ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#6f7a91', grid: '#1a2236', h0: '#a3acc2', h1: '#36b8a6', a: '#ef6f5e', b: '#e3c04d', plq: '#141b2b' };

  function sstate(k, p) {
    const e = ease(p);
    const S = { k, day: 1, m: M1, x1: M1, c: C1, h0: 1, h1: 1, thr: 1, shade: 1, br: 0, zoom: k >= 6 ? 1 : k === 5 ? e : 0 };
    if (k === 0) { S.h0 = clamp(p / 0.45, 0, 1); S.h1 = 0; S.thr = 0; S.shade = 0; }
    else if (k === 1) { S.h1 = clamp(p / 0.3, 0, 1); S.x1 = M1 * ease(clamp(p / 0.65, 0, 1)); S.thr = 0; S.shade = 0; }
    else if (k === 2) { S.thr = clamp(p / 0.3, 0, 1); S.shade = clamp((p - 0.25) / 0.35, 0, 1); }
    else if (k === 3) S.day = lerp(1, 7, e);
    else if (k === 4) S.day = lerp(7, 14, e);
    else if (k === 5) S.day = lerp(14, D1, e);
    else if (k === 6) { S.day = D1; S.br = clamp(p / 0.35, 0, 1); }
    else if (k === 7) S.day = lerp(D1, LAST, e);
    else if (k === 8) { S.day = LAST; S.m = S.x1 = lerp(M1, M2, ease(clamp(p / 0.6, 0, 1))); }
    else { S.m = S.x1 = M2; S.c = lerp(C1, C2, ease(clamp(p / 0.2, 0, 1))); S.day = lerp(LAST, D2, ease(clamp((p - 0.2) / 0.8, 0, 1))); }
    S.n = nOf(S.day);
    S.v0 = k === 9 ? vOf(M2) : vOf(M1);
    S.se = Math.sqrt(S.v0 / S.n);
    S.se1 = Math.sqrt(vOf(S.m) / S.n);
    return S;
  }
  const t = (x, y, s, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs || 11}" fill="${o.c || SC.mut}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.op != null ? ` opacity="${o.op.toFixed(2)}"` : ''}>${s}</text>`;
  function plaque(L, x, y, s, o = {}) {          // выноска: подпись на тёмной плашке, не выходит за края сцены
    const fs = L.nar ? 10.5 : 11.5, w = s.length * fs * 0.55 + 14, h = fs + 10;
    let x0 = o.a === 'end' ? x - w : o.a === 'middle' ? x - w / 2 : x;
    x0 = clamp(x0, 2, L.W - w - 2);
    const y0 = clamp(y - h / 2, 2, L.H - h - 2);
    return `<g opacity="${(o.op == null ? 1 : o.op).toFixed(2)}"><rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="6" fill="${SC.plq}" stroke="${o.c || SC.h1}"/>${t(x0 + 7, y0 + h / 2 + fs * 0.36, s, { fs, c: SC.ink })}</g>`;
  }
  /* колокол: верхняя кромка от a до b, по желанию — с заливкой до оси */
  function bell(L, mu, se, a, b, fill) {
    const lo = Math.max(a, mu - 4.5 * se, L.x0), hi = Math.min(b, mu + 4.5 * se, L.x1);
    if (hi <= lo) return '';
    const pts = [];
    for (let i = 0; i <= 90; i++) { const x = lo + (hi - lo) * i / 90, z = (x - mu) / se; pts.push(`${L.X(x).toFixed(1)},${(L.yb - L.hb * Math.exp(-z * z / 2)).toFixed(1)}`); }
    return fill ? `M${L.X(lo).toFixed(1)},${L.yb} L${pts.join(' L')} L${L.X(hi).toFixed(1)},${L.yb} Z` : `M${pts.join(' L')}`;
  }
  function drawScene(W, H, S) {
    const nar = W < 480, pl = nar ? 10 : 24, pr = nar ? 10 : 24, pt = nar ? 52 : 46, pb = 34;
    const x0 = lerp(-0.02, -0.012, S.zoom), x1 = lerp(0.03, 0.022, S.zoom);
    const L = { W, H, nar, x0, x1, yb: H - pb, hb: (H - pb - pt) * 0.84, X: x => pl + (x - x0) / (x1 - x0) * (W - pl - pr) };
    let s = '';
    for (let v = Math.ceil(x0 * 100); v <= Math.floor(x1 * 100); v++) {             // оси: целые пункты
      const x = L.X(v / 100);
      s += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${pt - 8}" y2="${L.yb}" stroke="${SC.grid}"/>` + t(x, L.yb + 15, v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v), { a: 'middle', fs: 10.5, c: v === 0 ? SC.ink2 : SC.mut });
    }
    s += `<line x1="${pl}" x2="${W - pr}" y1="${L.yb}" y2="${L.yb}" stroke="${SC.mut}"/>`;
    s += t(W - pr, L.yb + 29, nar ? 'B − A, п. п.' : 'разница конверсий B − A, п. п.', { a: 'end', fs: 10.5 });
    // хвосты: α — у колокола «эффекта нет» за порогом с обеих сторон, β — между двумя границами под кривой «эффект = MDE»
    if (S.shade > 0.01) {
      const op = (0.55 * S.shade).toFixed(2);
      s += `<path d="${bell(L, 0, S.se, S.c, 1, 1)}" fill="${SC.a}" opacity="${op}"/><path d="${bell(L, 0, S.se, -1, -S.c, 1)}" fill="${SC.a}" opacity="${op}"/>`;
      s += `<path d="${bell(L, S.x1, S.se1, -S.c, S.c, 1)}" fill="${SC.b}" opacity="${(0.5 * S.shade).toFixed(2)}"/>`;
    }
    if (S.h0 > 0.01) s += `<path d="${bell(L, 0, S.se, -1, -1 + 2 * S.h0, 0)}" fill="none" stroke="${SC.h0}" stroke-width="2.2"/>`;
    if (S.h1 > 0.01) s += `<path d="${bell(L, S.x1, S.se1, -1, 1, 0)}" fill="none" stroke="${SC.h1}" stroke-width="2.4" opacity="${S.h1.toFixed(2)}"/>`;
    if (S.thr > 0.01) {                                                              // порог решения
      const x = L.X(S.c), neg = L.X(-S.c);
      s += `<line x1="${neg.toFixed(1)}" x2="${neg.toFixed(1)}" y1="${pt - 10}" y2="${L.yb}" stroke="${SC.mut}" stroke-dasharray="4 4" opacity="${S.thr.toFixed(2)}"/>`;
      s += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${pt - 10}" y2="${L.yb}" stroke="${SC.ink}" stroke-width="1.3" stroke-dasharray="4 4" opacity="${S.thr.toFixed(2)}"/>`;
      s += t(x + 5, pt - 1, `порог ${dec(S.c * 100, 2)}`, { fs: nar ? 10.5 : 11.5, c: SC.ink, op: S.thr });
    }
    const top = L.yb - L.hb;
    if (S.br > 0.01) {                                                               // 1,96 SE и 0,84 SE
      const y = top + 16, xa = L.X(0), xc = L.X(S.c), xm = L.X(S.m), o = S.br.toFixed(2);
      s += `<g opacity="${o}" stroke="${SC.ink}" stroke-width="1.4"><line x1="${xa}" x2="${xc}" y1="${y}" y2="${y}"/><line x1="${xa}" x2="${xa}" y1="${y - 5}" y2="${y + 5}"/><line x1="${xc}" x2="${xc}" y1="${y - 5}" y2="${y + 5}"/>`
        + `<line x1="${xc}" x2="${xm}" y1="${y + 14}" y2="${y + 14}"/><line x1="${xm}" x2="${xm}" y1="${y + 9}" y2="${y + 19}"/><line x1="${xc}" x2="${xc}" y1="${y + 9}" y2="${y + 19}"/></g>`;
      s += t((xa + xc) / 2, y - 7, '1,96 · SE', { a: 'middle', fs: 11, c: SC.ink, op: S.br });
      s += t(xm + 7, y + 18, '0,84 · SE', { fs: 11, c: SC.ink, op: S.br });
    }
    const k = S.k, cl = (cond, x, y, str, o) => { if (cond) s += plaque(L, x, y, str, o); };
    const late = from => clamp((S.p - from) / 0.25, 0, 1);
    cl(k === 0 && S.p > 0.5, L.X(0) - 14, top + 30, 'эффекта нет: разница вокруг нуля', { a: 'end', c: SC.h0, op: late(0.5) });
    cl(k === 1 && S.p > 0.6, L.X(S.x1) + 14, top + 30, `эффект = MDE: +${dec(M1 * 100, 2)} п. п.`, { op: late(0.6) });
    cl(k === 2 && S.p > 0.6, L.X(S.c) + 10, L.yb - 18, `α ${pct(errs(S.n, S.c, S.m, S.v0).a)}`, { c: SC.a, op: late(0.6) });
    cl(k === 2 && S.p > 0.6, L.X(S.c) - 10, L.yb - 46, `β ${pct(errs(S.n, S.c, S.m, S.v0).b)}`, { a: 'end', c: SC.b, op: late(0.6) });
    cl(k >= 3 && k <= 4, L.X(-S.se * 2.2), top + 26, `SE ${dec(S.se * 100, 2)} п. п.`, { a: 'end', c: SC.h0 });
    cl(k === 5 && S.p > 0.8, L.X(S.m) + 12, top + 28, nar ? 'план набран' : 'план: α 5%, β 20%', { op: late(0.8) });
    cl(k === 7 && S.p > 0.75, L.X(S.m) + 12, top + 28, 'конец 4-й недели', { op: late(0.75) });
    cl(k === 8 && S.p > 0.6, L.X(S.c) - 10, L.yb - 46, `β ${pct(errs(S.n, S.c, S.m, S.v0).b)}`, { a: 'end', c: SC.b, op: late(0.6) });
    cl(k === 9 && S.p > 0.85, L.X(S.m) + 12, top + 28, nar ? 'людей ×4' : `людей ×4, дней ×${Math.round(Math.ceil(D2) / Math.ceil(D1))}`, { op: late(0.85) });
    return s;
  }
  const SCENE_STEPS = [
    { title: "Если оформление ничего не меняет", dur: 3600, body: `<p>За первый день в группы входит в среднем по ${sp(CUM[0])} человек. Даже без эффекта доли покупателей могут различаться случайно.</p><p>Линия показывает, как распределились бы оценки разности B − A при многократном повторении теста. Центр распределения находится в нуле, стандартная ошибка составляет ${ppt(E1.se)}.</p>` },
    { title: "Если конверсия выросла на 0,86 п. п.", dur: 3600, body: `<p>По нашей оценке, такой прирост позволит окупить новое оформление. Возьмём его за MDE при планировании.</p><p>Если истинный эффект равен ${ppt(M1)}, распределение оценок сместится вправо. После одного дня два распределения ещё сильно перекрываются.</p>` },
    { title: "Два вида ошибки", dur: 4400, body: `<p>На графике заранее закреплены границы в единицах метрики для <em>плановой</em> выборки. Красным показаны ложные тревоги по обе стороны от нуля. Жёлтым — случаи, когда разница при истинном эффекте MDE попадает между границами.</p><p>После одного дня при таких границах вероятности ошибок составили бы ${pct(E1.a)} и ${pct(E1.b)}.</p>` },
    { title: "К концу первой недели", dur: 4200, body: `<p>В каждой группе в среднем по ${sp(CUM[6])} участников. Когда выборка растёт, стандартная ошибка уменьшается примерно пропорционально 1/√n.</p><p>При тех же границах вероятность ложной тревоги теперь равна ${pct(E7.a)}, а вероятность пропустить эффект MDE — ${pct(E7.b)}.</p>` },
    { title: "Почему замедляется набор", dur: 4200, body: `<p>За вторую неделю в каждую группу добавилось ещё около ${sp(CUM[13] - CUM[6])} участников. Один человек входит в тест только один раз, даже если возвращается каждый день.</p><p>При нынешней выборке вероятности двух ошибок равны ${pct(E14.a)} и ${pct(E14.b)}.</p>` },
    { title: "Плановая выборка", dur: 4400, body: `<p>На ${Math.ceil(D1)}-й день набор достигает плановой численности — около ${sp(Math.ceil(N1))} участников в группе.</p><p>При такой выборке двусторонний тест с α = 5% обнаружит заданный прирост примерно в 80% повторений.</p>` },
    { title: "Как получилась формула", dur: 4600, body: `<p>В нормальном приближении критическая граница находится в 1,96 стандартной ошибки от нуля. Для мощности 80% среднее при альтернативе должно быть ещё примерно на 0,84 стандартной ошибки выше.</p><p>Поэтому MDE ≈ 2,8 × SE. Чем меньше эффект, который нужно обнаружить, тем меньше должна быть стандартная ошибка.</p>` },
    { title: "Четыре полные недели", dur: 4200, body: `<p>Нужная выборка набрана в среду. По плану наблюдение продолжается до воскресенья, чтобы каждый день недели встретился четырежды.</p><p>При неизменных границах графика к этому сроку вероятности ошибок равны ${pct(E28.a)} и ${pct(E28.b)}.</p>` },
    { title: "Эффект вдвое меньше", dur: 4000, body: `<p>Пусть теперь нужно обнаружить прирост ${ppt(M2)}. Распределение с таким эффектом ближе к нулю.</p><p>При прежнем размере выборки вероятность пропустить меньший эффект с границами этого сценария составляет ${pct(E8.b)}.</p>` },
    { title: "Как меняется требуемая выборка", dur: 6200, next: 'Читать страницу', body: `<p>Чтобы уверенно различать более близкие значения, нужно уменьшить стандартную ошибку примерно вдвое. Для этого потребуется почти вчетверо больше людей.</p><p>Срок зависит от притока новых участников. Если он замедляется, время набора может увеличиться больше чем вчетверо.</p>` }
  ];
  const scene = {
    parts: [{ n: '01', name: 'Два сценария', s: [0, 1] }, { n: '02', name: 'Порог', s: [2] }, { n: '03', name: 'Выборка растёт', s: [3, 4, 5] }, { n: '04', name: 'Формула и недели', s: [6, 7] }, { n: '05', name: 'Половина MDE', s: [8, 9] }],
    steps: SCENE_STEPS,
    hud: [{ id: 'day', label: 'День теста' }, { id: 'n', label: 'В группе' }, { id: 'a', label: 'Альфа' }, { id: 'b', label: 'Бета' }],
    legend: `<span><i style="background:${SC.h0}"></i>эффекта нет</span><span><i style="background:${SC.h1}"></i>эффект = MDE</span><span><i class="sq" style="background:${SC.a}"></i>α — ложная тревога</span><span><i class="sq" style="background:${SC.b}"></i>β — пропуск</span>`,
    info: 'ДИЗАЙН ТЕСТА',
    aiNote: 'Сцена — модель на учебных данных: база 14,08% (группа A checkout_v2), люди приходят по настоящей кривой набора checkout_v2, после 28-го дня — с потоком последней недели. Колокола — нормальные распределения разницы конверсий с одной стандартной ошибкой √((p₀q₀ + p₁q₁)/n); порог решения записан заранее и стоит на месте, поэтому до плановой выборки α больше 5%.',
    mount(root, api) {
      root.innerHTML = '<svg class="dz-sv" role="img" aria-label="Два колокола распределения разницы конверсий: вокруг нуля и вокруг MDE; с ростом выборки они сужаются, закрашенные хвосты α и β тают до 5 и 20 процентов"></svg>';
      const svg = root.firstChild;
      let sig = '';
      return {
        render(k, p) {
          const W = Math.round(svg.clientWidth || 600), H = Math.round(svg.clientHeight || 360);
          const S = sstate(k, p); S.p = p;
          const show = k >= 2;
          api.hud('day', String(Math.max(1, Math.ceil(S.day - 1e-6))), S.day > LAST + 0.01 ? `${Math.ceil(Math.ceil(S.day - 1e-6) / 7)} нед.` : '');
          api.hud('n', sp(Math.ceil(S.n - 1e-6)));
          const E = errs(S.n, S.c, S.m, S.v0);
          api.hud('a', show ? pct(E.a) : '—');
          api.hud('b', show ? pct(E.b) : '—');
          const key = [k, Math.round(p * 160), W, H].join();
          if (key === sig) return; sig = key;
          svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
          svg.innerHTML = drawScene(W, H, S);
        }
      };
    }
  };

  /* ===================== Интерактив «Калькулятор теста» ===================== */
  const DEF = { kind: 'conv', p0: DATA.p0, sd: DATA.sd, mu: DATA.mu, mdeC: DATA.mde, mdeR: DATA.dRev, alpha: 0.05, power: 0.8, flow: DATA.flow, share: 1, wA: 0.5 };
  function buildCalc(box, api) {
    const { $, esc } = api;
    const seg = (name, label, opts, cur) => `<div class="seg" role="group" aria-label="${label}">${opts.map(([v, s]) => `<button type="button" data-${name}="${v}" aria-pressed="${v === cur}">${s}</button>`).join('')}</div>`;
    box.innerHTML = `<div class="block-hd"><span class="t">Калькулятор теста <i>интерактив</i></span><div class="ctrls">${seg('kind', 'Метрика', [['conv', 'Конверсия'], ['rev', 'Выручка на человека']], 'conv')}<button type="button" class="btn ghost small" id="dz-reset">Сбросить</button></div></div>
<p class="hint dz-do">Двигайте ползунки — выборка, срок и&nbsp;колокола пересчитываются. Переключите метрику на&nbsp;выручку и&nbsp;сравните срок; точно подвести ползунок помогают стрелки ← →.</p>
<div class="dz-main"><p class="dz-cap" id="dz-cap" aria-live="polite"></p>
<div class="readout dz-ro"><div><span class="big" id="dz-n"></span><span class="lbl" id="dz-nl"></span></div><div><span class="big" id="dz-tot"></span><span class="lbl">всего в&nbsp;тесте</span></div><div><span class="big" id="dz-days"></span><span class="lbl" id="dz-dl"></span></div></div>
<div class="dz-chart" id="dz-chart"></div><p class="dz-leg" id="dz-leg"></p>
<div class="dz-wk" id="dz-wk" aria-hidden="true">${'<i></i>'.repeat(52)}</div><p class="dz-wkl" id="dz-wkl"></p>
<p class="dz-cmp" id="dz-cmp"></p></div>
<div class="dz-ctrls">
<div class="dz-c"><label for="dz-base"><span id="dz-base-l"></span><b id="dz-base-v"></b></label><input type="range" id="dz-base"><small id="dz-base-d"></small></div>
<div class="dz-c"><label for="dz-mde">MDE<b id="dz-mde-v"></b></label><input type="range" id="dz-mde"><small id="dz-mde-d"></small></div>
<div class="dz-c"><span class="dz-l">Уровень значимости α</span>${seg('al', 'Уровень значимости', [['0.01', '0,01'], ['0.05', '0,05'], ['0.1', '0,10']], '0.05')}<small>двусторонний тест</small></div>
<div class="dz-c"><span class="dz-l">Мощность</span>${seg('pw', 'Мощность', [['0.7', '70%'], ['0.8', '80%'], ['0.9', '90%'], ['0.95', '95%']], '0.8')}<small>вероятность заметить эффект размером MDE</small></div>
<div class="dz-c"><label for="dz-flow">Новых участников в&nbsp;день<b id="dz-flow-v"></b></label><input type="range" id="dz-flow" min="100" max="10000" step="10"><small>в&nbsp;checkout_v2 в&nbsp;среднем ${sp(DATA.flow)} за&nbsp;4 недели</small></div>
<div class="dz-c"><label for="dz-share">Доля трафика в&nbsp;тесте<b id="dz-share-v"></b></label><input type="range" id="dz-share" min="5" max="100" step="5"><small>остальное — для других экспериментов</small></div>
<div class="dz-c"><span class="dz-l">Разбиение A / B</span>${seg('w', 'Разбиение групп', [['0.5', '50 / 50'], ['0.8', '80 / 20'], ['0.9', '90 / 10']], '0.5')}<small>в&nbsp;новую версию B идёт меньшая часть</small></div>
</div>
<div class="status"><span><span class="dot live"></span><span id="dz-s1"></span></span><span id="dz-s2"></span><span id="dz-s3"></span></div>`;
    let st = Object.assign({}, DEF), last = null;
    const pressed = (name, v) => box.querySelectorAll(`[data-${name}]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset[name] === String(v))));
    const conv = () => st.kind === 'conv';
    const rel = () => conv() ? st.mdeC / st.p0 : st.mdeR / st.mu;
    const spec = s => Object.assign({}, s, { mde: s.kind === 'conv' ? s.mdeC : s.mdeR });
    /* ползунки зависят от метрики: база (конверсия или σ) и MDE (п. п. или ₽) */
    function setSliders() {
      const b = $('dz-base'), m = $('dz-mde');
      if (conv()) { Object.assign(b, { min: 1, max: 50, step: 0.01 }); b.value = st.p0 * 100; Object.assign(m, { min: 0.05, max: 5, step: 0.01 }); m.value = st.mdeC * 100; }
      else { Object.assign(b, { min: 100, max: 12000, step: 1 }); b.value = st.sd; Object.assign(m, { min: 5, max: 600, step: 1 }); m.value = st.mdeR; }
      $('dz-flow').value = st.flow; $('dz-share').value = st.share * 100;
    }
    function chart(P) {
      const el = $('dz-chart'), W = Math.max(260, el.clientWidth), H = W < 520 ? 196 : 228, nar = W < 520;
      const u = conv() ? 100 : 1, m = (conv() ? st.mdeC : st.mdeR) * u, se = P.se * u, c = P.c * u;
      const NICE = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
      const need = Math.max(3.8 * se, (m + 3.8 * se) / 2), ex = Math.pow(10, Math.floor(Math.log10(need)));
      const k = NICE.find(v => v * ex >= need - 1e-12) * ex, x0 = -k, x1 = 2 * k;
      const pl = 12, pr = 12, pt = 40, pb = 26, yb = H - pb, hb = yb - pt;
      const X = x => pl + (x - x0) / (x1 - x0) * (W - pl - pr);
      const path = (mu, a, b, fill) => {
        const lo = Math.max(a, mu - 4.5 * se, x0), hi = Math.min(b, mu + 4.5 * se, x1);
        if (hi <= lo) return '';
        const pts = [];
        for (let i = 0; i <= 80; i++) { const x = lo + (hi - lo) * i / 80, z = (x - mu) / se; pts.push(`${X(x).toFixed(1)},${(yb - hb * Math.exp(-z * z / 2)).toFixed(1)}`); }
        return fill ? `M${X(lo).toFixed(1)},${yb} L${pts.join(' L')} L${X(hi).toFixed(1)},${yb} Z` : `M${pts.join(' L')}`;
      };
      const stp = [1, 2, 2.5, 5].map(v => v * Math.pow(10, Math.floor(Math.log10((x1 - x0) / 6)))).concat([10 * Math.pow(10, Math.floor(Math.log10((x1 - x0) / 6)))]).find(v => (x1 - x0) / v <= 7);
      const dg = stp < 0.1 ? 2 : stp < 1 ? 1 : 0;
      let s = '';
      for (let v = Math.ceil(x0 / stp) * stp; v <= x1 + 1e-9; v += stp) {
        const x = X(v), lab = Math.abs(v) < 1e-9 ? '0' : (v > 0 ? '+' : '−') + (conv() ? dec(Math.abs(v), dg) : sp(Math.abs(v)));
        s += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${pt - 6}" y2="${yb}" class="dz-grid"/><text x="${x.toFixed(1)}" y="${H - 9}" text-anchor="middle" class="dz-ax">${lab}</text>`;
      }
      s += `<line x1="${pl}" x2="${W - pr}" y1="${yb}" y2="${yb}" class="dz-base"/>`;
      s += `<path d="${path(0, c, Infinity, 1)}" class="dz-fa"/><path d="${path(0, -Infinity, -c, 1)}" class="dz-fa"/><path d="${path(m, -c, c, 1)}" class="dz-fb"/>`;
      s += `<path d="${path(0, -Infinity, Infinity, 0)}" class="dz-h0"/><path d="${path(m, -Infinity, Infinity, 0)}" class="dz-h1"/>`;
      const xc = X(c), neg = X(-c);
      s += `<line x1="${neg.toFixed(1)}" x2="${neg.toFixed(1)}" y1="16" y2="${yb}" class="dz-thr"/>`;
      s += `<line x1="${xc.toFixed(1)}" x2="${xc.toFixed(1)}" y1="16" y2="${yb}" class="dz-thr"/>`;
      const unit = conv() ? ' п. п.' : ' ₽';
      s += `<text x="${(xc + 5).toFixed(1)}" y="13" class="dz-lb">порог ${conv() ? dec(c, 2) : sp(c)}${nar ? '' : unit}</text>`;
      s += `<text x="${(xc - 7).toFixed(1)}" y="${pt - 9}" text-anchor="end" class="dz-lb dz-l0">нет эффекта</text>`;
      s += `<text x="${(xc + 7).toFixed(1)}" y="${pt - 9}" class="dz-lb dz-l1">эффект = MDE</text>`;
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`Колокола разницы ${conv() ? 'конверсий' : 'выручки'} при плановой выборке: вокруг нуля и вокруг MDE ${conv() ? dec(m, 2) + ' п. п.' : sp(m) + ' ₽'}; порог ${conv() ? dec(c, 2) : sp(c)}`)}">${s}</svg>`;
    }
    function draw() {
      const P = plan(spec(st)), r = rel(), uneq = st.wA !== 0.5;
      const other = conv() ? plan(Object.assign({}, st, { kind: 'rev', mde: Math.round(r * st.mu) })) : plan(Object.assign({}, st, { kind: 'conv', mde: Math.round(r * st.p0 * 1e4) / 1e4 }));
      // ползунки и подписи
      $('dz-base-l').textContent = conv() ? 'Базовая конверсия' : 'Стандартное отклонение σ';
      $('dz-base-v').textContent = conv() ? dec(st.p0 * 100, 2) + '%' : sp(st.sd) + ' ₽';
      $('dz-base-d').textContent = conv() ? `в данных: ${dec(DATA.p0 * 100, 2)}% за 4 недели (A в checkout_v2), ${dec(DATA.p0aa * 100, 2)}% за 2 недели (aa_check)`
        : `среднее ${sp(st.mu)} ₽, σ больше среднего в ${dec(st.sd / st.mu, 1)} раза; в данных σ = ${sp(DATA.sd)} ₽`;
      $('dz-mde-v').textContent = conv() ? `${dec(st.mdeC * 100, 2)} п. п. · +${dec(r * 100, 1)}%` : `${sp(st.mdeR)} ₽ · +${dec(r * 100, 1)}%`;
      $('dz-mde-d').textContent = conv() ? `${dec(st.p0 * 100, 2)} → ${dec((st.p0 + st.mdeC) * 100, 2)}%; из денег — ${dec(DATA.mde * 100, 2)} п. п.` : `${sp(st.mu)} → ${sp(st.mu + st.mdeR)} ₽ на человека`;
      $('dz-flow-v').textContent = sp(st.flow);
      $('dz-share-v').textContent = Math.round(st.share * 100) + '%';
      // результат
      $('dz-n').textContent = sp(uneq ? P.nB : P.nA);
      $('dz-nl').textContent = uneq ? `человек в B, в A — ${sp(P.nA)}` : 'человек в группе';
      $('dz-tot').textContent = sp(P.total);
      $('dz-days').textContent = `${sp(P.days)} ${api.plural(P.days, PL.day)}`;
      $('dz-dl').textContent = P.weeks > 52 ? 'больше года' : `→ ${P.weeks} ${api.plural(P.weeks, PL.wk)}, ${P.weeks * 7} ${api.plural(P.weeks * 7, PL.day)}`;
      $('dz-cap').textContent = P.weeks > 52 ? `Тест не уложится в год: нужно ${sp(P.total)} человек`
        : `Нужно ${uneq ? `${sp(P.total)} человек` : `${sp(P.nA)} ${api.plural(P.nA, PL.man)} в группе`} — ${P.weeks} ${api.plural(P.weeks, PL.wk)} теста`;
      chart(P);
      $('dz-leg').innerHTML = `<i class="dz-sa"></i>α = ${dec(st.alpha, 2)}: ложные тревоги, по ${pct(st.alpha / 2)} с каждой стороны <i class="dz-sb"></i>β = ${pct(1 - st.power)}: пропуск эффекта MDE`;
      box.querySelectorAll('#dz-wk i').forEach((c, i) => c.classList.toggle('on', i < P.weeks));
      $('dz-wkl').textContent = P.weeks > 52 ? 'год по неделям — не хватает' : `год по неделям: тест займёт ${P.weeks} из 52`;
      const ratio = conv() ? other.total / P.total : P.total / other.total, cnt = o => uneq ? `${sp(o.total)} человек всего` : `${sp(o.nA)} в группе`;
      $('dz-cmp').textContent = conv()
        ? `Выручке на человека с тем же относительным MDE +${dec(r * 100, 1)}% нужно ${cnt(other)} — в ${dec(ratio, 1)} раза больше: её σ в ${dec(st.sd / st.mu, 1)} раза больше среднего.`
        : `Конверсии ${dec(st.p0 * 100, 2)}% с тем же относительным MDE +${dec(r * 100, 1)}% нужно ${cnt(other)}: выручка дороже в ${dec(ratio, 1)} раза.`;
      $('dz-s1').textContent = conv() ? 'Конверсия, z-тест для долей' : 'Выручка на человека, тест для средних';
      $('dz-s2').textContent = `n = ${uneq ? sp(P.nA) + ' / ' + sp(P.nB) : sp(P.nA)} в группе`;
      $('dz-s3').textContent = `${P.days} ${api.plural(P.days, PL.day)} → ${P.weeks > 52 ? 'больше года' : P.weeks + ' нед.'}`;
      last = P;
    }
    const num = (id, f) => $(id).addEventListener('input', e => { f(+e.target.value); draw(); });
    num('dz-base', v => { if (conv()) st.p0 = v / 100; else st.sd = v; });
    num('dz-mde', v => { if (conv()) st.mdeC = v / 100; else st.mdeR = v; });
    num('dz-flow', v => { st.flow = v; });
    num('dz-share', v => { st.share = v / 100; });
    const segs = (name, f) => box.querySelectorAll(`[data-${name}]`).forEach(b => b.addEventListener('click', () => { f(b.dataset[name]); pressed(name, b.dataset[name]); draw(); }));
    segs('kind', v => {                                    // при смене метрики сохраняем относительный MDE
      if (v === st.kind) return;
      const r = rel();
      st.kind = v;
      if (v === 'rev') st.mdeR = clamp(Math.round(r * st.mu), 5, 600); else st.mdeC = clamp(Math.round(r * st.p0 * 1e4) / 1e4, 0.0005, 0.05);
      setSliders();
    });
    segs('al', v => { st.alpha = +v; });
    segs('pw', v => { st.power = +v; });
    segs('w', v => { st.wA = +v; });
    $('dz-reset').addEventListener('click', () => {
      st = Object.assign({}, DEF);
      pressed('kind', 'conv'); pressed('al', '0.05'); pressed('pw', '0.8'); pressed('w', '0.5');
      setSliders(); draw();
    });
    setSliders(); draw();
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const w = box.clientWidth; if (Math.abs(w - lw) > 4) { lw = w; draw(); } }).observe(box); }
    return {
      redraw: draw,
      describe() {
        const P = last, r = rel();
        return `метрика: ${conv() ? `конверсия, база ${dec(st.p0 * 100, 2)}%, MDE ${dec(st.mdeC * 100, 2)} п. п.` : `выручка на человека, среднее ${sp(st.mu)} ₽, σ ${sp(st.sd)} ₽, MDE ${sp(st.mdeR)} ₽`} (+${dec(r * 100, 1)}%); α ${dec(st.alpha, 2)}, мощность ${Math.round(st.power * 100)}%; поток ${sp(st.flow)} в день, доля трафика ${Math.round(st.share * 100)}%, разбиение ${Math.round(st.wA * 100)}/${Math.round((1 - st.wA) * 100)} → в группе A ${P.nA}, в B ${P.nB}, всего ${P.total}, ${P.days} дней, ${P.weeks} недель.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-11-2',
    short: 'DA-11',
    title: 'Как спланировать A/B-тест',
    where: 'блок «Дата аналитика», тема 11 «A/B-тестирование», страница 11.2',
    aiData: 'учебные эксперименты интернет-магазина осенью 2026 года: A/A-тест aa_check (2 недели, 40 079 человек) и тест нового оформления заказа checkout_v2 (4 недели, 56 797 человек); база — конверсия пользователя 14,08% и выручка на человека 999 ₽ при σ 6 912 ₽ в группе A',
    calc: { Phi, invPhi, plan },          // для сверки со SciPy и statsmodels: data/check_calc.py
    scene,
    widgets: { calc: buildCalc },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Для конверсии 14,1% и MDE +6,1% нужно 26 329 человек в группе. Сколько нужно для выручки на человека с тем же MDE +6,1%? Её среднее 999 ₽, стандартное отклонение 6 912 ₽.', opts: [['Столько же: MDE одинаковый'], ['Примерно вдвое больше'], ['Около 200 тысяч в группе, почти в 8 раз больше', 1], ['Меньше: непрерывная метрика чувствительнее доли']],
      why: 'Выборка пропорциональна σ² / MDE². При одинаковом относительном MDE сравнивают квадрат отношения σ к среднему: у конверсии 14,1% это (1 − p) / p ≈ 6,1, у выручки на человека 6,92² ≈ 47,9. Для выручки нужно почти в 8 раз больше участников, точный расчёт даёт 7,7 — 201 535 человек в группе. MDE одинаковый только в процентах, а разброс разный. Непрерывная метрика чувствительнее, только если её разброс мал по сравнению со средним; у выручки с оптовиками он огромен. Проверьте в калькуляторе.' },
    q2: { sec: 'idea', q: 'В сцене MDE уменьшили вдвое, с 0,86 до 0,43 п. п. Во сколько раз больше людей нужно при тех же α и мощности?', opts: [['Вдвое: эффект вдвое меньше'], ['Вчетверо: SE падает как 1/√n, а стандартная ошибка должна уменьшиться вдвое', 1], ['В √2 раза'], ['Столько же, только смотреть дольше']],
      why: 'Чтобы порог стоял в 1,96 стандартной ошибки от нуля и в 0,84 от MDE, нужно MDE = 2,8 · SE. Вдвое меньший MDE требует вдвое меньшей SE, а SE падает как 1/√n — значит, людей нужно вчетверо больше: в сцене 104 027 вместо 26 329 в группе. Вдвое больше людей сузят колокола только в √2 раза. Дней при этом может понадобиться больше, чем вчетверо: поток новых людей со временем падает, в сцене — 30 недель вместо четырёх.' },
    q3: { sec: 'idea', q: 'План наберётся за 10 дней. Почему тест всё равно стоит вести две полные недели?', opts: [['Чтобы все дни недели вошли поровну: в выходные люди ведут себя иначе', 1], ['p-value надёжен только после 14 дней'], ['Чтобы точно получить значимый результат'], ['Незачем: тест можно остановить на десятом дне']],
      why: 'В учебном магазине в выходные сессий на 21% больше, чем в будни той же недели, а конверсия сессии на 2,5% ниже. Тест из 10 дней содержит одни дни недели дважды, а другие один раз, и эффект меряется на перекошенной «неделе». При таком плане каждый день недели встречается одинаковое число раз. Порога «14 дней для p-value» нет, а продлевать тест ради значимости — подглядывание из страницы 11.4. Лишние дни дают запас мощности, но главная причина — недельный цикл.' },
    q4: { sec: 'idea', q: "Что ожидается от серии A/A-тестов при корректной проверке и уровне значимости 5%?", opts: [["В каждой паре групп доли строго одинаковы"], ["Примерно 5% проверок покажут значимую разницу при одинаковых вариантах", 1], ["Каждый тест обнаружит разницу"], ["В исправной системе значимых результатов никогда не будет"]],
      why: "Участники видят одинаковые варианты, но группы различаются случайно. Уровень значимости задаёт частоту ложных тревог в серии корректных проверок. Один значимый результат сам по себе не доказывает ошибку системы." },
    q5: { sec: 'idea', q: "Годовые расходы на изменение составят 5 млн ₽. Один пункт прироста конверсии даст по расчёту 5,78 млн ₽ маржи в год. Как использовать эти числа при планировании?", opts: [["Они гарантируют наблюдаемый прирост 0,86 п. п."], ["Они задают порог окупаемости около 0,86 п. п. Под него можно спланировать мощность и выборку", 1], ["Они определяют требуемую выборку без данных о базовой конверсии"]],
      why: "Делим 5 на 5,78 и получаем экономически значимый прирост при принятых предположениях. Затем отдельно рассчитываем, сколько людей потребуется, чтобы обнаружить такой эффект при заданных α и мощности." },
    q6: { sec: 'code', q: 'Что вернёт эта строка из блока statsmodels?', code: 'pw.solve_power(h, alpha=0.05, power=0.8)', lang: 'python', opts: [['Число людей в обеих группах вместе'], ['Число людей в первой группе; во второй — столько же, умноженное на ratio', 1], ['Число дней теста'], ['Мощность теста при эффекте h']],
      why: 'solve_power решает уравнение относительно параметра, который не передан. Здесь не передан nobs1 — людей в первой группе, а ratio по умолчанию 1, значит, во второй столько же: 26 327 и 26 327, всего вдвое больше. Дни statsmodels не считает: их дают поток и доля трафика. Мощность вернулась бы, если бы передали nobs1 и не передали power — так проверяют мощность для заранее заданного эффекта.' },
    q7: { sec: 'method', q: "Оценка изменения выручки составила +78 ₽ на участника. Её 95%-й интервал — от −37 до +193 ₽. Какой вывод можно сделать?", opts: [["Средняя выручка не изменилась"], ["Данные совместимы как с небольшой потерей, так и с ростом выручки", 1], ["Рост выручки составил как минимум 78 ₽"]],
      why: "Интервал включает ноль и отрицательные значения. Для решения о допустимом риске нижнюю границу интервала сравнивают с заранее согласованной границей потерь. Одного p = 0,18 для такого решения недостаточно." }
    },
    glossary: {
      target: { t: 'Целевая метрика', en: 'primary metric, OEC', d: 'Одна заранее названная метрика, по которой решают и считают выборку.' },
      secondary: { t: 'Вторичная метрика', en: 'secondary metric', d: 'Объясняет, откуда взялся эффект, но решения не определяет.' },
      guardrail: { t: 'Защитная метрика', en: 'guardrail metric', d: "Метрика, по которой проверяют, допустимы ли возможные потери при внедрении изменения." },
      mde: { t: 'MDE', en: 'minimum detectable effect', d: "Минимальная величина истинного эффекта, при которой тест заданного размера с выбранным уровнем значимости достигает требуемой мощности." },
      size: { t: 'Размер выборки', en: 'sample size', d: 'Сколько людей нужно в каждой группе для заданных α и мощности.' },
      alpha: { t: 'Уровень значимости α', en: 'significance level', d: 'Допустимая доля ложных тревог, когда эффекта нет.' },
      power: { t: 'Мощность', en: 'statistical power', d: "Вероятность отвергнуть нулевую гипотезу при заданном истинном эффекте. Для альтернативы, по которой планируют тест, она равна 1 − β." },
      variance: { t: 'Дисперсия метрики', en: 'variance', d: 'Средний квадрат отклонения от среднего; у доли p — p(1 − p).' },
      pp: { t: 'Процентный пункт', en: 'percentage point', d: "Единица разности двух долей, выраженных в процентах. Рост с 14,08% до 14,94% равен 0,86 п. п., или примерно 6,1% относительно базы." },
      se: { t: 'Стандартная ошибка', en: 'standard error', d: 'Разброс оценки по повторениям эксперимента; у разницы — √(σ²_A/n_A + σ²_B/n_B).' },
      duration: { t: 'Длительность теста', en: 'test duration', d: "Период от начала распределения участников до заранее выбранной даты завершения теста." },
      share: { t: 'Доля трафика в тесте', en: 'traffic allocation', d: 'Какая часть посетителей попадает в эксперимент.' },
      weekly: { t: 'Недельный цикл', en: 'day-of-week effect', d: 'В выходные люди заходят и покупают иначе, чем в будни.' },
      rand: { t: 'Рандомизация', en: 'randomization', d: 'Случайное деление людей на группы, здесь — по хешу id с солью.' },
      aa: { t: 'A/A-тест', en: 'A/A test', d: 'Тест, где обе группы видят одно и то же: проверка самой системы.' },
      srm: { t: 'Дисбаланс групп', en: 'sample ratio mismatch, SRM', d: "Статистически значимое расхождение между фактической и запланированной пропорцией участников в группах." },
      prereg: { t: 'Предрегистрация', en: 'preregistration', d: 'Дизайн, записанный до запуска и не меняющийся после.' },
      cv: { t: 'Коэффициент вариации', en: 'coefficient of variation', d: 'Стандартное отклонение, делённое на среднее.' },
      tail: { t: 'Тяжёлый хвост', en: 'heavy tail', d: 'Редкие огромные значения, которые дают большую часть дисперсии.' },
      onesided: { t: 'Односторонний тест', en: 'one-sided test', d: 'Ищет эффект только в одну заранее выбранную сторону.' },
      cohenh: { t: 'h Коэна', en: "Cohen's h", d: 'Размер эффекта для долей: разница 2·arcsin√p двух групп.' },
      bandit: { t: 'Многорукий бандит', en: 'multi-armed bandit', d: 'Схема, где трафик по ходу теста перетекает к лучшему пока варианту.' }
    },
    materials: [
      ['da-11-2-test-design.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/ab/', 'Учебные данные темы 11 — общий набор: пользователи, показы, сессии трёх экспериментов, предпериод; загрузка в PostgreSQL 16, генераторы'],
      ['test_design_template.md', 'Шаблон документа дизайна теста: пустой и заполненный для checkout_v2'],
      ['sample_size.ipynb', 'Расчёт выборки вручную и в statsmodels, выбор MDE, проверка мощности моделированием']
    ],
    prompts: [
      ['Дизайн моего теста', 'Я опишу изменение в продукте. Задавай вопросы по пунктам документа дизайна, готовых формулировок не давай.'],
      ['Выбор MDE для плана', 'Дай три изменения с ценой и трафиком. Я выведу MDE и выборку, а ты проверишь меня вопросами.'],
      ['A/A-тест', 'Покажи три A/A-теста, один со сломанной системой. Я найду поломку, а ты наводи вопросами.']
    ]
  };
})();
