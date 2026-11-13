/* Страница 6.4 · Какой тест когда: t, Манна — Уитни, хи-квадрат */
(() => {
  // Данные: grid.json (интерактив) и scene.json (сцена) из data/inference/gen_ab.py и data/grid.py, вписаны data/inject.py
  const DATA = /*data:start*/{"meta":{"R":10000,"B":999,"alpha":0.05,"seed":6040,"shapes":["normal","checks","heavy","unequal","sessions"],"ns":[10,30,100,300,1000],"effects":[0.0,0.05,0.1,0.2,0.4],"crit":["student","welch","mw","perm"]},"grid":{"normal":[[[0.0462,0.0453,0.0399,0.0465],[0.055,0.0528,0.0489,0.0547],[0.062,0.0603,0.0542,0.0595],[0.1066,0.1044,0.0935,0.104],[0.2941,0.2883,0.2557,0.2879]],[[0.0507,0.0504,0.0496,0.0491],[0.0658,0.0656,0.0626,0.0655],[0.0967,0.0966,0.0909,0.0958],[0.2468,0.2467,0.2318,0.2428],[0.7175,0.7171,0.6881,0.7135]],[[0.0502,0.0502,0.0501,0.0494],[0.0908,0.0908,0.0896,0.0896],[0.213,0.213,0.2027,0.2098],[0.6456,0.6456,0.6247,0.6417],[0.9974,0.9974,0.9961,0.9972]],[[0.047,0.047,0.0466,0.046],[0.1744,0.1744,0.1687,0.1726],[0.536,0.536,0.5185,0.5323],[0.9824,0.9824,0.9787,0.9824],[1.0,1.0,1.0,1.0]],[[0.0511,0.0511,0.0489,0.049],[0.4674,0.4674,0.4516,0.4622],[0.9597,0.9597,0.9508,0.9586],[1.0,1.0,1.0,1.0],[1.0,1.0,1.0,1.0]]],"checks":[[[0.0274,0.0227,0.0402,0.0446],[0.0315,0.027,0.0455,0.0522],[0.0364,0.0311,0.0552,0.0585],[0.0548,0.0477,0.0836,0.0865],[0.1209,0.1091,0.1815,0.1796]],[[0.0317,0.0298,0.0511,0.0495],[0.0356,0.0334,0.0592,0.0551],[0.0462,0.0434,0.0838,0.0729],[0.0946,0.0898,0.1819,0.1304],[0.2418,0.236,0.495,0.3061]],[[0.0446,0.0436,0.0509,0.0511],[0.0553,0.0547,0.0784,0.0639],[0.0846,0.0834,0.1784,0.0938],[0.1969,0.1962,0.4951,0.2126],[0.5191,0.5181,0.949,0.5392]],[[0.0496,0.0496,0.0467,0.0509],[0.0805,0.0804,0.1472,0.0823],[0.1591,0.159,0.4248,0.1605],[0.4493,0.4493,0.9289,0.452],[0.9162,0.9162,0.9999,0.9175]],[[0.0447,0.0447,0.0519,0.0455],[0.1358,0.1358,0.3797,0.1359],[0.3958,0.3957,0.9045,0.3931],[0.9076,0.9076,1.0,0.9056],[1.0,1.0,1.0,1.0]]],"heavy":[[[0.023,0.016,0.0428,0.05],[0.0255,0.0184,0.044,0.052],[0.0256,0.019,0.0458,0.0505],[0.0247,0.0181,0.0479,0.0537],[0.0362,0.0252,0.0635,0.0702]],[[0.0308,0.0285,0.0488,0.0489],[0.0319,0.0298,0.0506,0.0521],[0.0324,0.0294,0.0549,0.0525],[0.0454,0.0411,0.0683,0.0664],[0.0682,0.0646,0.1264,0.103]],[[0.038,0.0372,0.0495,0.049],[0.045,0.0438,0.0544,0.0567],[0.0475,0.0472,0.0718,0.061],[0.0744,0.0732,0.1356,0.091],[0.1599,0.1585,0.3421,0.1912]],[[0.0453,0.045,0.0523,0.0512],[0.0526,0.0526,0.0641,0.0598],[0.0658,0.0657,0.1171,0.0752],[0.1453,0.1446,0.3107,0.1587],[0.3844,0.3842,0.763,0.4117]],[[0.0454,0.0454,0.0466,0.0485],[0.0659,0.0658,0.1114,0.069],[0.1282,0.1282,0.2814,0.1359],[0.3418,0.3417,0.7517,0.355],[0.79,0.79,0.9987,0.8023]]],"unequal":[[[0.2524,0.0496,0.1295,0.2492],[0.3168,0.0765,0.171,0.3119],[0.4724,0.1551,0.289,0.4701],[0.8264,0.4683,0.6311,0.8236],[0.9986,0.9611,0.9803,0.9986]],[[0.2471,0.0474,0.1387,0.2463],[0.4168,0.1358,0.2576,0.4118],[0.7458,0.414,0.553,0.7424],[0.9916,0.935,0.9535,0.991],[1.0,1.0,1.0,1.0]],[[0.2416,0.0489,0.133,0.2392],[0.6894,0.3719,0.4993,0.6869],[0.9827,0.9071,0.9316,0.9824],[1.0,1.0,1.0,1.0],[1.0,1.0,1.0,1.0]],[[0.2402,0.0486,0.1324,0.2356],[0.955,0.8094,0.8579,0.9539],[1.0,1.0,1.0,1.0],[1.0,1.0,1.0,1.0],[1.0,1.0,1.0,1.0]],[[0.2465,0.0511,0.1373,0.243],[1.0,0.9993,0.999,1.0],[1.0,1.0,1.0,1.0],[1.0,1.0,1.0,1.0],[1.0,1.0,1.0,1.0]]],"sessions":[[[0.3224,0.3004,0.3158,0.3415],[0.3236,0.3053,0.318,0.3431],[0.3231,0.3038,0.3105,0.3408],[0.3377,0.3154,0.3273,0.3607],[0.384,0.3631,0.3739,0.4024]],[[0.2939,0.2905,0.2904,0.3013],[0.302,0.2991,0.2979,0.3098],[0.3015,0.2986,0.306,0.308],[0.3418,0.339,0.35,0.3509],[0.4501,0.4466,0.456,0.4553]],[[0.2692,0.2687,0.2789,0.27],[0.2843,0.284,0.2875,0.2834],[0.3232,0.3225,0.331,0.3239],[0.4083,0.4079,0.4449,0.4096],[0.6769,0.6767,0.7261,0.6778]],[[0.2659,0.2658,0.2831,0.264],[0.2955,0.2953,0.3188,0.2939],[0.3926,0.3924,0.4276,0.3912],[0.6226,0.6226,0.6818,0.6218],[0.9257,0.9257,0.9567,0.9248]],[[0.2712,0.2712,0.2798,0.2678],[0.3667,0.3667,0.4029,0.3656],[0.596,0.596,0.6674,0.5933],[0.9245,0.9245,0.9612,0.9237],[0.9999,0.9999,1.0,0.9999]]]},"hist":{"normal":{"lo":-2000,"hi":8000,"a":[0.0015,0.003,0.0005,0.0025,0.006,0.0105,0.009,0.011,0.0115,0.0155,0.024,0.0325,0.0335,0.0395,0.0365,0.0405,0.053,0.06,0.0575,0.0615,0.055,0.0615,0.052,0.056,0.0415,0.0415,0.0335,0.031,0.027,0.0195,0.014,0.0145,0.011,0.0055,0.007,0.006,0.005,0.0045,0.002,0.0025],"b":[0.005,0.0035,0.003,0.0045,0.0065,0.0055,0.01,0.009,0.0085,0.016,0.0195,0.0285,0.0305,0.039,0.04,0.056,0.0475,0.053,0.0645,0.0515,0.06,0.0495,0.0475,0.0455,0.0335,0.039,0.04,0.0365,0.034,0.0255,0.02,0.0195,0.013,0.0095,0.007,0.006,0.004,0.004,0.0015,0.003],"tailA":0.0025,"tailB":0.002},"checks":{"lo":0,"hi":16000,"a":[0.001,0.0115,0.0505,0.08,0.0885,0.0945,0.1005,0.084,0.0755,0.0595,0.053,0.0535,0.0355,0.0365,0.0275,0.02,0.011,0.0145,0.0095,0.0135,0.009,0.0035,0.007,0.008,0.002,0.003,0.002,0.0025,0.0015,0.0015,0.001,0.0005,0.0035,0.001,0.001,0.002,0.001,0.0,0.0,0.03],"b":[0.0,0.0145,0.0405,0.074,0.098,0.1035,0.097,0.0885,0.0775,0.0615,0.0495,0.0445,0.04,0.0235,0.033,0.022,0.0165,0.0155,0.0095,0.008,0.0075,0.0065,0.0115,0.004,0.004,0.0035,0.0045,0.0015,0.001,0.002,0.0025,0.0,0.0025,0.002,0.0005,0.001,0.0015,0.0,0.0,0.027],"tailA":0.0295,"tailB":0.0265},"heavy":{"lo":0,"hi":8000,"a":[0.137,0.115,0.099,0.0795,0.067,0.0545,0.0415,0.032,0.03,0.0265,0.0255,0.0155,0.013,0.014,0.009,0.0195,0.009,0.012,0.0095,0.008,0.007,0.0065,0.0065,0.0085,0.006,0.0045,0.007,0.0065,0.007,0.0055,0.0025,0.0045,0.005,0.0035,0.0035,0.0035,0.003,0.002,0.0035,0.087],"b":[0.139,0.1205,0.107,0.0745,0.0585,0.045,0.0365,0.036,0.032,0.026,0.0175,0.022,0.0165,0.018,0.0165,0.015,0.01,0.0115,0.012,0.01,0.008,0.0045,0.0065,0.0075,0.0075,0.0055,0.006,0.0055,0.0045,0.003,0.004,0.004,0.0045,0.0045,0.002,0.0015,0.002,0.0015,0.0015,0.092],"tailA":0.084,"tailB":0.0905},"unequal":{"lo":0,"hi":200,"a":[0.001,0.0015,0.001,0.0035,0.003,0.0045,0.0035,0.008,0.0165,0.0165,0.0225,0.026,0.029,0.038,0.0405,0.0475,0.0525,0.063,0.0645,0.0805,0.0625,0.0555,0.0595,0.0575,0.04,0.042,0.0305,0.034,0.0275,0.019,0.0155,0.0095,0.008,0.006,0.0015,0.002,0.0025,0.0015,0.001,0.0015],"b":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0001,0.0002,0.0012,0.0042,0.0164,0.0451,0.091,0.1501,0.1972,0.1855,0.1521,0.0905,0.045,0.0155,0.005,0.0005,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"tailA":0.0005,"tailB":0.0},"sessions":{"lo":0,"hi":12000,"a":[0.003,0.0285,0.0745,0.085,0.0905,0.0775,0.0715,0.058,0.0555,0.0475,0.042,0.037,0.0315,0.0335,0.0205,0.025,0.0155,0.0225,0.0155,0.0175,0.018,0.0085,0.01,0.008,0.006,0.0095,0.0075,0.005,0.005,0.0055,0.0045,0.005,0.0035,0.0055,0.0025,0.004,0.0025,0.006,0.0015,0.03],"b":[0.0005,0.019,0.051,0.0695,0.071,0.0835,0.0765,0.055,0.0655,0.0455,0.051,0.0385,0.0445,0.0365,0.03,0.022,0.02,0.025,0.018,0.0255,0.0145,0.016,0.0145,0.0135,0.0075,0.0055,0.0065,0.0055,0.005,0.007,0.006,0.0025,0.0035,0.0045,0.0035,0.0025,0.0035,0.0015,0.0025,0.0265],"tailA":0.0275,"tailB":0.024,"users":[[2,13,11,6,6,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,2,6,4,2,6,1,5,5,3,3,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,2,3,3,6,11,4,3,1,3,0,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,4,1,3,4,3,3,6,3,5,1,2,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,2,1,2,5,2,0,0,2,2,5,3,2,0,0,2,0,2,1,1,0,1,1,1,0,0,0,2,0,1,1,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,4,1,1,3,3,6,2,0,3,0,0,0,3,3,1,1,1,0,0,0,1,0,1,0,0,0,0,3,0,2]]}},"scene":{"welch_fit":{"alpha":0.047,"h":[1,19,41,27,31,18,14,7,10,8,2,4,3,2,3,1,1,1,0,0,0,1,0,6],"n":200},"welch_bad":{"alpha":0.5781,"alpha_user":0.037,"users":10,"per":20,"hu":[[6,11,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,6,6,3,3,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,6,1,5,3,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,2,4,5,2,4,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,3,6,5,2,2,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,2,5,5,3,2,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,2,3,2,2,1,5,1,2,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,2,3,5,3,2,0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,3,3,2,1,4,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,3,1,4,2,1,3,2,0,0,0,0,1,0,0,0,1,0,0,0,0,1]]},"z_fit":{"alpha":0.0447,"n":2000,"h":[0,0,0,0,0,0,0,1,0,0,1,2,2,4,4,5,9,18,10,23,45,34,75,84,111,144,181,197,258,268,303,335,388,436,475,439,474,507,504,491,484,454,423,373,339,364,330,246,202,194,153,130,92,87,70,59,41,31,22,27,14,15,5,8,2,3,2,1,0,0,1,0,0,0,0,0,0,0,0,0],"lo":30},"z_bad":{"alpha":0.0278,"n":40,"h":[2518,3504,2445,1067,361,78,26],"zero":0.2518},"chi_fit":{"obs":[1307,1172,897],"tot":[55109,29848,15043],"exp":[1860.5,1007.7,507.9],"stat":506.8,"p":9.115191670254401e-111,"minexp":507.9,"alpha":0.0498},"chi_bad":{"obs":[1,2,1],"tot":[28,21,11],"exp":[1.87,1.4,0.73],"p":0.667,"alpha":0.0381,"N":60},"mw_fit":{"power":0.3097,"power_welch":0.1267,"ha":[1,21,35,35,23,24,17,15,6,1,2,2,3,4,0,0,2,0,0,0,0,0,0,9],"hb":[0,8,19,30,29,23,21,20,8,6,11,9,3,2,4,1,0,1,0,0,0,0,0,5]},"mw_bad":{"rej":0.3776,"med_a":3080.0,"med_b":3080.0,"p_sup":0.5475,"mean_a":4334,"mean_b":5332,"ha":[1,21,35,35,23,24,17,15,6,1,2,2,3,4,0,0,2,0,0,0,0,0,0,9],"hb":[0,12,21,37,19,0,20,17,15,14,6,5,9,8,4,0,4,2,1,0,1,0,0,5]},"paired":{"p_welch":0.712,"p_paired":0.1641,"mean_b":3568,"mean_a":3785,"sd":2188,"sd_d":833,"pow_welch":0.0,"pow_paired":0.7207}}}/*data:end*/;
  // Код страницы с настоящим выводом: data/code/*.py, запуск и вставка — data/inject.py
  const CODE = /*code:start*/{"four": {"title": "Четыре критерия на одних чеках: три про средние согласны, Манн — Уитни отвечает на свой вопрос", "badge": "проверено: Python 3.13, SciPy 1.18.1", "lang": "python", "code": "import numpy as np\nimport pandas as pd\nfrom scipy import stats\n\nab = pd.read_csv(\"data/inference/ab.csv\")     # учебный A/B-тест новой корзины, строка — пользователь\na = ab.query(\"group == 'A' and paid == 1\").amount.to_numpy(float)\nb = ab.query(\"group == 'B' and paid == 1\").amount.to_numpy(float)\nprint(f\"чеков:   А {len(a)}, Б {len(b)}\")\nprint(f\"среднее: А {a.mean():.0f}, Б {b.mean():.0f} ₽\")\nprint(f\"медиана: А {np.median(a):.0f}, Б {np.median(b):.0f} ₽\")\n\n\ndef diff_means(x, y, axis):                   # статистика перестановочного теста\n    return x.mean(axis=axis) - y.mean(axis=axis)\n\n\np = {\n    \"t Стьюдента\": stats.ttest_ind(b, a).pvalue,                  # общая дисперсия\n    \"t Уэлча\": stats.ttest_ind(b, a, equal_var=False).pvalue,\n    \"Манн — Уитни\": stats.mannwhitneyu(b, a).pvalue,\n    \"перестановки\": stats.permutation_test(\n        (b, a), diff_means, vectorized=True, n_resamples=9_999, rng=604).pvalue,\n}\nfor name, pv in p.items():\n    print(f\"{name:13s} p = {pv:.3f}\")\n\nu = stats.mannwhitneyu(b, a).statistic\nprint(f\"P(чек Б > чек А) = {u / (len(a) * len(b)):.3f}\")\nprint(f\"чеков дороже 15 000 ₽: А {(a > 15_000).mean():.1%}, Б {(b > 15_000).mean():.1%}\")", "out": "чеков:   А 649, Б 767\nсреднее: А 4562, Б 4647 ₽\nмедиана: А 3200, Б 3400 ₽\nt Стьюдента   p = 0.767\nt Уэлча       p = 0.769\nМанн — Уитни  p = 0.130\nперестановки  p = 0.790\nP(чек Б > чек А) = 0.523\nчеков дороже 15 000 ₽: А 3.4%, Б 2.7%"}, "alpha_sim": {"title": "На логнормальных данных Уэлч не даёт лишних ложных срабатываний, но теряет мощность", "badge": "проверено: Python 3.13, SciPy 1.18.1", "lang": "python", "code": "import numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(604)\nR = 10_000                                    # повторов на строку таблицы\nprint(\"σ      n   ложных:  Уэлч   М — У    мощность при +20%:   Уэлч   М — У\")\nfor sigma in (0.6, 1.5):                      # 0,6 — как розничные чеки, 1,5 — очень тяжёлый хвост\n    for n in (10, 30, 100, 1000):\n        a = rng.lognormal(0, sigma, (R, n))\n        b = rng.lognormal(0, sigma, (R, n))   # та же форма: нулевая гипотеза верна\n        row = []\n        for k in (1.0, 1.2):                  # без эффекта и с ростом на 20%\n            row.append((stats.ttest_ind(a, b * k, axis=1, equal_var=False).pvalue < 0.05).mean())\n            row.append((stats.mannwhitneyu(a, b * k, axis=1).pvalue < 0.05).mean())\n        print(f\"{sigma:.1f} {n:6d}   {row[0]:13.1%} {row[1]:7.1%} {row[2]:26.1%} {row[3]:7.1%}\")", "out": "σ      n   ложных:  Уэлч   М — У    мощность при +20%:   Уэлч   М — У\n0.6     10            3.6%    4.2%                       7.5%    8.4%\n0.6     30            4.6%    4.7%                      18.3%   19.4%\n0.6    100            4.8%    4.8%                      50.8%   55.7%\n0.6   1000            5.1%    5.1%                     100.0%  100.0%\n1.5     10            1.7%    4.3%                       2.0%    4.8%\n1.5     30            3.1%    4.9%                       4.1%    7.1%\n1.5    100            3.6%    5.3%                       7.4%   13.6%\n1.5   1000            4.6%    5.0%                      34.2%   74.5%"}, "chi": {"title": "Источник визита связан с покупкой, а z-тест для долей — это хи-квадрат 2 × 2", "badge": "проверено: Python 3.13, SciPy 1.18.1, statsmodels 0.15.0", "lang": "python", "code": "import pandas as pd\nfrom scipy import stats\nfrom statsmodels.stats.proportion import proportions_ztest\n\n# 1. Источник визита × покупка: 100 000 учебных визитов\nv = pd.read_csv(\"data/probability/visits.csv\")\ntable = pd.crosstab(v.source, v.bought)\nres = stats.chi2_contingency(table)\nprint(table)\nprint(f\"хи-квадрат = {res.statistic:.1f}, степеней свободы {res.dof}, p = {res.pvalue:.1e}\")\nprint(\"ожидаемые покупки без связи:\", res.expected_freq[:, 1].round(1))\nprint(\"доля покупок:\", (table[1] / table.sum(axis=1)).round(3).to_dict())\n\n# 2. Доля оплативших в A/B-тесте: z-тест и хи-квадрат 2 × 2 — один и тот же тест\nab = pd.read_csv(\"data/inference/ab.csv\")\npaid = ab.groupby(\"group\").paid.agg([\"sum\", \"count\"])\nz, p = proportions_ztest(paid[\"sum\"], paid[\"count\"])\nchi2 = stats.chi2_contingency(pd.crosstab(ab.group, ab.paid), correction=False)\nprint(paid.assign(share=paid[\"sum\"] / paid[\"count\"]).round(4))\nprint(f\"z = {z:.3f}, z² = {z ** 2:.2f}, p = {p:.4f}\")\nprint(f\"хи-квадрат = {chi2.statistic:.2f}, p = {chi2.pvalue:.4f}\")", "out": "bought        0     1\nsource               \nорганика  53802  1307\nрассылка  14146   897\nреклама   28676  1172\nхи-квадрат = 506.8, степеней свободы 2, p = 9.1e-111\nожидаемые покупки без связи: [1860.5  507.9 1007.7]\nдоля покупок: {'органика': 0.024, 'рассылка': 0.06, 'реклама': 0.039}\n       sum  count   share\ngroup                    \nA      649  20000  0.0324\nB      767  20000  0.0384\nz = -3.193, z² = 10.19, p = 0.0014\nхи-квадрат = 10.19, p = 0.0014"}, "mw_median": {"title": "Медианы равны, а Манн — Уитни значим: он сравнивает не медианы", "badge": "проверено: Python 3.13, SciPy 1.18.1", "lang": "python", "code": "import numpy as np\nimport pandas as pd\nfrom scipy import stats\n\nchecks = pd.read_csv(\"data/probability/checks.csv\").amount.to_numpy(float)\nmed = np.median(checks)                       # 3 080 ₽\n\n\ndef upsell(x):\n    # вариант Б: заказам дороже медианы предложили допродажу, они выросли на 30%\n    return np.where(x > med, x * 1.3, x)\n\n\nprint(\"медианы совокупностей:\", med, np.median(upsell(checks)))\n\nrng = np.random.default_rng(604)\na = rng.choice(checks, 1000)\nb = upsell(rng.choice(checks, 1000))\nres = stats.mannwhitneyu(b, a)\nprint(f\"медиана выборок: А {np.median(a):.0f}, Б {np.median(b):.0f} ₽\")\nprint(f\"Манн — Уитни: p = {res.pvalue:.1e}, P(Б > А) = {res.statistic / (len(a) * len(b)):.3f}\")\n\n# 10 000 пар групп по 200 чеков: как часто тест значим\npv = stats.mannwhitneyu(upsell(rng.choice(checks, (10_000, 200))), rng.choice(checks, (10_000, 200)), axis=1).pvalue\nprint(f\"значим в {(pv < 0.05).mean():.1%} пар групп, хотя медианы равны\")", "out": "медианы совокупностей: 3080.0 3080.0\nмедиана выборок: А 3175, Б 3075 ₽\nМанн — Уитни: p = 3.8e-04, P(Б > А) = 0.546\nзначим в 37.9% пар групп, хотя медианы равны"}, "pretest": {"title": "Шапиро — Уилк бьёт тревогу там, где t-тест работает", "badge": "проверено: Python 3.13, SciPy 1.18.1", "lang": "python", "code": "import numpy as np\nimport pandas as pd\nfrom scipy import stats\n\nchecks = pd.read_csv(\"data/probability/checks.csv\").amount.to_numpy(float)\nrng = np.random.default_rng(604)\nR = 2_000                                     # пар групп на каждый размер\nprint(\"    n   Шапиро — Уилк отверг нормальность   ложных у Уэлча\")\nfor n in (10, 30, 300, 3000):\n    a = rng.choice(checks, (R, n))\n    b = rng.choice(checks, (R, n))            # эффекта нет\n    sw = (stats.shapiro(a, axis=1).pvalue < 0.05).mean()\n    welch = (stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < 0.05).mean()\n    print(f\"{n:5d}   {sw:20.1%}   {welch:28.1%}\")", "out": "    n   Шапиро — Уилк отверг нормальность   ложных у Уэлча\n   10                  49.0%                           2.6%\n   30                  94.0%                           2.9%\n  300                 100.0%                           5.0%\n 3000                 100.0%                           5.1%"}, "welch_student": {"title": "Стьюдент ошибается в пять раз чаще обещанного, если малая группа шумнее", "badge": "проверено: Python 3.13, SciPy 1.18.1", "lang": "python", "code": "import numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(604)\nR = 10_000\ncases = {                                     # (n, σ) группы А и (n, σ) группы Б; средние равны\n    \"разбросы равны\": ((30, 20), (120, 20)),\n    \"малая группа шумнее\": ((30, 30), (120, 10)),\n    \"большая группа шумнее\": ((30, 10), (120, 30)),\n}\nprint(f\"{'':22s}  ложных: Стьюдент   Уэлч\")\nfor name, ((na, sa), (nb, sb)) in cases.items():\n    a = rng.normal(100, sa, (R, na))\n    b = rng.normal(100, sb, (R, nb))\n    st = (stats.ttest_ind(a, b, axis=1).pvalue < 0.05).mean()\n    we = (stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < 0.05).mean()\n    print(f\"{name:22s}  {st:15.1%} {we:6.1%}\")", "out": "                        ложных: Стьюдент   Уэлч\nразбросы равны                     4.9%   5.0%\nмалая группа шумнее               25.5%   4.7%\nбольшая группа шумнее              0.1%   5.3%"}, "clusters": {"title": "Сессии одного человека раздувают ложные срабатывания впятеро", "badge": "проверено: Python 3.13, SciPy 1.18.1", "lang": "python", "code": "import numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(604)\nR, users, per = 10_000, 60, 5                 # в группе 60 пользователей по 5 сессий\n\n\ndef group():\n    level = rng.lognormal(np.log(3000), 0.6, (R, users))         # у каждого свой уровень чека\n    return np.repeat(level, per, axis=1) * rng.lognormal(-0.125, 0.5, (R, users * per))\n\n\na, b = group(), group()                       # эффекта нет\nwelch = (stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < 0.05).mean()\nmw = (stats.mannwhitneyu(a, b, axis=1).pvalue < 0.05).mean()\nua = a.reshape(R, users, per).mean(axis=2)    # одна строка на пользователя\nub = b.reshape(R, users, per).mean(axis=2)\nuser = (stats.ttest_ind(ua, ub, axis=1, equal_var=False).pvalue < 0.05).mean()\nprint(f\"300 сессий как независимые, Уэлч:        {welch:.1%}\")\nprint(f\"300 сессий как независимые, Манн — Уитни: {mw:.1%}\")\nprint(f\"60 средних по пользователям, Уэлч:       {user:.1%}\")", "out": "300 сессий как независимые, Уэлч:        26.9%\n300 сессий как независимые, Манн — Уитни: 28.3%\n60 средних по пользователям, Уэлч:       4.9%"}}/*code:end*/;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  // число по-русски: пробел между разрядами, десятичная запятая
  const num = (v, d = 0) => { const s = Math.abs(v).toFixed(d).split('.'); return (v < 0 ? '−' : '') + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (s[1] ? ',' + s[1] : ''); };
  const pct = (v, d = 1) => `${num(v * 100, d)}%`;
  const pctT = (v, d = 1) => `${num(v * 100, d)}%`;
  const SD = DATA.scene || {};
  const G = DATA.grid || {}, M = DATA.meta || { ns: [], effects: [], crit: [], R: 0, B: 0, seed: 0 };

  /* ===================== Сцена: три вопроса идут по дереву критериев ===================== */
  const NODES = {
    root: { x: .5, y: .1, l: 'Что сравниваем?', m: 'Что сравниваем?', w: 150, wm: 118 },
    mean: { x: .2, y: .4, l: 'среднее числа', m: 'среднее' },
    sup: { x: .5, y: .4, l: 'чаще ли больше', m: 'чаще?' },
    prop: { x: .7, y: .4, l: 'долю 0/1', m: 'доля' },
    cat: { x: .9, y: .4, l: 'две категории', m: 'категории' },
    same: { x: .2, y: .66, l: 'те же люди?', m: 'те же?' },
    welch: { x: .1, y: .91, l: 't Уэлча', m: 'Уэлч', leaf: 1 },
    paired: { x: .3, y: .91, l: 'парный t', m: 'парный', leaf: 1 },
    mw: { x: .5, y: .91, l: 'Манн — Уитни', m: 'М — У', leaf: 1 },
    z: { x: .7, y: .91, l: 'z для долей', m: 'z-тест', leaf: 1 },
    chi: { x: .9, y: .91, l: 'хи-квадрат', m: 'χ²', leaf: 1 }
  };
  const EDGES = [['root', 'mean'], ['root', 'sup'], ['root', 'prop'], ['root', 'cat'], ['mean', 'same'], ['same', 'welch', 'нет'], ['same', 'paired', 'да'], ['sup', 'mw'], ['prop', 'z'], ['cat', 'chi']];
  const LEVEL = { root: 0, mean: 1, sup: 1, prop: 1, cat: 1, same: 2, welch: 3, paired: 3, mw: 3, z: 3, chi: 3 };
  const PATHS = [['root', 'mean', 'same', 'welch'], ['root', 'prop', 'z'], ['root', 'cat', 'chi'], ['root', 'sup', 'mw']];
  const ASK = [
    ['Вопрос 1', 'Средний чек в варианте Б выше, чем в А?', 'чек каждого покупателя, ₽ · в группах разные люди'],
    ['Вопрос 2', 'Выросла ли доля оплативших?', 'у каждого пользователя 0 или 1 · по 20 000 в группе'],
    ['Вопрос 3', 'Связан ли источник визита с покупкой?', 'у визита две категории: источник и «купил» · visits.csv'],
    ['Ещё вопрос', 'Чаще ли чек из Б больше чека из А?', 'вопрос про сдвиг всей формы, а не про средние']
  ];
  const SC = { acc: '#36b8a6', good: '#43c58b', bad: '#f2756a', yel: '#e3c04d', ink: '#e8ecf4', mut: '#8d95aa', bar: '#3d4a68', node: '#121a2b', line: '#2a3550' };
  const UC = ['#6fa2ea', '#f0a247', '#45c48f', '#f06ba5', '#a48af0', '#e3c04d', '#4fc9dc', '#9aa3b2', '#f2756a', '#36b8a6'];

  // мини-гистограммы: svg без подписей, растягивается по ширине панели
  function bars(h, col, opt = {}) {
    const n = h.length, mx = opt.max || Math.max(...h, 1), bw = 100 / n;
    return h.map((c, i) => c ? `<rect x="${(i * bw + .25).toFixed(2)}" y="${(40 - c / mx * 38).toFixed(2)}" width="${(bw - .5).toFixed(2)}" height="${(c / mx * 38).toFixed(2)}" fill="${col}"${opt.op ? ` fill-opacity="${opt.op}"` : ''}/>` : '').join('');
  }
  function stepLine(h, col, mx) {
    const n = h.length, bw = 100 / n; let d = 'M0,40';
    h.forEach((c, i) => { const y = (40 - c / mx * 38).toFixed(2); d += `L${(i * bw).toFixed(2)},${y}L${((i + 1) * bw).toFixed(2)},${y}`; });
    return `<path d="${d}L100,40" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`;
  }
  function stacked(hs) {
    const n = hs[0].length, bw = 100 / n, tot = hs[0].map((_, i) => hs.reduce((s, h) => s + h[i], 0)), mx = Math.max(...tot);
    let out = '';
    for (let i = 0; i < n; i++) { let y = 40; hs.forEach((h, u) => { if (!h[i]) return; const hh = h[i] / mx * 38; y -= hh; out += `<rect x="${(i * bw + .25).toFixed(2)}" y="${y.toFixed(2)}" width="${(bw - .5).toFixed(2)}" height="${hh.toFixed(2)}" fill="${UC[u % UC.length]}"/>`; }); }
    return out;
  }
  function groups(obs, exp, labels, mx) {
    const n = obs.length, gw = 100 / n;
    return obs.map((o, i) => { const x = i * gw, w = gw * .32; const ho = o / mx * 34, he = exp[i] / mx * 34;
      return `<rect x="${(x + gw * .16).toFixed(2)}" y="${(36 - he).toFixed(2)}" width="${w.toFixed(2)}" height="${he.toFixed(2)}" fill="${SC.bar}"/><rect x="${(x + gw * .52).toFixed(2)}" y="${(36 - ho).toFixed(2)}" width="${w.toFixed(2)}" height="${ho.toFixed(2)}" fill="${SC.acc}"/>`; }).join('');
  }
  const svgBox = (inner, extra = '') => `<svg class="wt-mh" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">${inner}${extra}</svg>`;
  const vline = (x, col) => `<line x1="${x}" y1="0" x2="${x}" y2="40" stroke="${col}" stroke-width="1.4" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>`;

  const sessA = DATA.grid && DATA.grid.sessions ? DATA.grid.sessions[3][0] : [0, 0, 0, 0];
  const LEAF = {
    welch: {
      fit: () => ({ cap: `${SD.welch_fit.n} чеков в группе: хвост длинный, но среднее почти нормально`, mh: svgBox(bars(SD.welch_fit.h, SC.good, { op: .85 })), ax: ['0', '≥ 16 тыс. ₽'], stat: `ложных ${pct(SD.welch_fit.alpha)}` }),
      bad: () => ({ cap: `${SD.welch_bad.users * SD.welch_bad.per} сессий от ${SD.welch_bad.users} пользователей: цвет — человек`, mh: svgBox(stacked(SD.welch_bad.hu)), ax: ['0', '≥ 16 тыс. ₽'], stat: `ложных ${pct(SD.welch_bad.alpha)}`, call: 'кучка — один человек' })
    },
    z: {
      fit: () => ({ cap: `${num(SD.z_fit.n)} визитов: покупок около 68, колокол`, mh: svgBox(bars(SD.z_fit.h.slice(10, 70), SC.good, { op: .85 })), ax: ['40', '99 покупок'], stat: `ложных ${pct(SD.z_fit.alpha)}` }),
      bad: () => ({ cap: `${SD.z_bad.n} визитов: 0–2 покупки, колокола нет`, mh: svgBox(bars(SD.z_bad.h, SC.bad, { op: .85 })), ax: ['0', '6 покупок'], stat: `уровень ${pct(SD.z_bad.alpha)} вместо 5%`, call: `ни одной: ${pctT(SD.z_bad.zero, 0)} групп` })
    },
    chi: {
      fit: () => ({ cap: `${num(SD.chi_fit.tot.reduce((a, b) => a + b, 0))} визитов, хи-квадрат ${num(SD.chi_fit.stat, 1)}: серые — ожидание, бирюзовые — факт`, mh: svgBox(groups(SD.chi_fit.obs, SD.chi_fit.exp, 0, Math.max(...SD.chi_fit.obs, ...SD.chi_fit.exp))), ax: ['органика', 'реклама', 'рассылка'], stat: `ложных ${pct(SD.chi_fit.alpha)}` }),
      bad: () => ({ cap: `первые ${SD.chi_bad.N} визитов: всего ${SD.chi_bad.obs.reduce((a, b) => a + b, 0)} покупки`, mh: svgBox(groups(SD.chi_bad.obs, SD.chi_bad.exp, 0, 2.4)), ax: ['органика', 'реклама', 'рассылка'], stat: `уровень ${pct(SD.chi_bad.alpha)} вместо 5%`, call: `ожидается ${num(Math.min(...SD.chi_bad.exp), 1)}` })
    },
    mw: {
      fit: () => ({ cap: 'все чеки Б выше на 10%: сдвинулась вся форма', mh: svgBox(bars(SD.mw_fit.ha, SC.bar) + stepLine(SD.mw_fit.hb, SC.good, Math.max(...SD.mw_fit.ha, ...SD.mw_fit.hb))), ax: ['0', '≥ 16 тыс. ₽'], stat: `мощность ${pct(SD.mw_fit.power, 0)}, у Уэлча ${pct(SD.mw_fit.power_welch, 0)}` }),
      bad: () => ({ cap: 'выросли только чеки дороже медианы', mh: svgBox(bars(SD.mw_bad.ha, SC.bar) + stepLine(SD.mw_bad.hb, SC.bad, Math.max(...SD.mw_bad.ha, ...SD.mw_bad.hb)), vline(3080 / 16000 * 100, SC.yel)), ax: ['0', '≥ 16 тыс. ₽'], stat: `медианы равны, а значим в ${pct(SD.mw_bad.rej, 0)}`, call: `медиана ${num(SD.mw_bad.med_a)} = ${num(SD.mw_bad.med_b)}` })
    }
  };

  function sceneState(k, p) {
    const s = { grow: 1, done: [], cur: -1, t: 0, card: null, calls: [], hud: ['—', '—', '—', ''] };
    if (k === 0) {
      s.grow = ease(seg(p, 0, .7)); s.card = { mode: 'intro', a: seg(p, .55, .8) };
      if (p > .78) s.calls.push(['node', 'root', 'сначала — какой вопрос']);
      return s;
    }
    if (k <= 3) {
      s.cur = 0; s.t = k === 1 ? ease(seg(p, .05, .6)) : 1; s.hud = ['1/3', s.t >= 1 ? 'Уэлч' : '…', '—', ''];
      if (k === 1) {
        s.card = { mode: 'ask', q: 0, a: 1 };
        if (p > .42 && p < .72) s.calls.push(['node', 'same', 'в А и Б разные люди']);
        if (p >= .72) s.calls.push(['node', 'paired', 'те же до и после — сюда', 'u']);
      } else if (k === 2) {
        s.card = { mode: 'leaf', leaf: 'welch', fit: seg(p, .04, .3), bad: 0 };
        s.hud = ['1/3', 'Уэлч', p > .3 ? pctT(SD.welch_fit.alpha) : '—', p > .3 ? 'норма 5%' : ''];
        if (p > .5) s.calls.push(['fit', 'хвост оптовых заказов']);
      } else {
        s.card = { mode: 'leaf', leaf: 'welch', fit: 1, bad: seg(p, .04, .3) };
        s.hud = ['1/3', 'Уэлч', p > .3 ? pctT(SD.welch_bad.alpha) : pctT(SD.welch_fit.alpha), p > .3 ? 'сессии' : 'норма 5%'];
        if (p > .45) s.calls.push(['bad']);
      }
      return s;
    }
    const route = (q, k0, leafName, hudT, fitA) => {
      s.done = [...Array(q).keys()]; s.cur = q;
      if (k === k0) {
        s.t = ease(seg(p, .03, .42));
        s.card = p < .45 ? { mode: 'ask', q, a: 1 } : { mode: 'leaf', leaf: leafName, fit: seg(p, .45, .65), bad: 0 };
        s.hud = [q < 3 ? `${q + 1}/3` : '+1', s.t >= 1 ? hudT : '…', p > .65 && fitA != null ? pctT(fitA) : '—', p > .65 && fitA != null ? 'норма 5%' : ''];
      } else {
        s.t = 1; s.card = { mode: 'leaf', leaf: leafName, fit: 1, bad: seg(p, .04, .3) };
      }
    };
    if (k === 4 || k === 5) {
      route(1, 4, 'z', 'z-тест', SD.z_fit.alpha);
      if (k === 4 && p > .15 && p < .5) s.calls.push(['node', 'prop', 'покупка — 0 или 1', 'd']);
      if (k === 5) { s.hud = ['2/3', 'z-тест', p > .3 ? pctT(SD.z_bad.alpha) : pctT(SD.z_fit.alpha), p > .3 ? '40 визитов' : 'норма 5%']; if (p > .45) s.calls.push(['bad']); }
      return s;
    }
    if (k === 6 || k === 7) {
      route(2, 6, 'chi', 'хи-квадрат', SD.chi_fit.alpha);
      if (k === 6 && p > .15 && p < .5) s.calls.push(['node', 'cat', 'источник × купил', 'd']);
      if (k === 7) { s.hud = ['3/3', 'хи-квадрат', p > .3 ? pctT(SD.chi_bad.alpha) : pctT(SD.chi_fit.alpha), p > .3 ? '60 визитов' : 'норма 5%']; if (p > .45) s.calls.push(['bad']); }
      return s;
    }
    if (k === 8) {
      s.done = [0, 1, 2]; s.cur = 3; s.t = ease(seg(p, .03, .3));
      s.card = p < .33 ? { mode: 'ask', q: 3, a: 1 } : { mode: 'leaf', leaf: 'mw', fit: seg(p, .33, .48), bad: seg(p, .6, .75) };
      s.hud = ['+1', s.t >= 1 ? 'М — У' : '…', p > .75 ? pctT(SD.mw_bad.rej, 0) : '—', p > .75 ? 'медианы =' : ''];
      if (p > .2 && p < .62) s.calls.push(['node', 'mw', 'оценивает P(Б > А)', 'u']);
      if (p > .8) s.calls.push(['bad']);
      return s;
    }
    s.done = [0, 1, 2, 3]; s.card = { mode: 'final', a: seg(p, .05, .35) };
    const lo = Math.min(...sessA), hi = Math.max(...sessA);
    s.hud = ['итог', 'все', `${num(lo * 100, 0)}–${num(hi * 100, 0)}%`, 'сессии'];
    if (p > .5) s.calls.push(['final']);
    return s;
  }

  function cardHTML(c, mob) {
    if (!c) return '';
    if (c.mode === 'intro') return `<div class="wt-qs" style="opacity:${c.a}">${ASK.slice(0, 3).map((q, i) => `<div class="wt-q"><b>${i + 1}</b><span>${q[1]}</span><small>${q[2]}</small></div>`).join('')}</div>`;
    if (c.mode === 'ask') { const q = ASK[c.q]; return `<div class="wt-ask"><span class="wt-k">${q[0]}</span><p>«${q[1]}»</p><small>${q[2]}</small></div>`; }
    if (c.mode === 'final') {
      const nm = ['Стьюдент', 'Уэлч', 'М — У', 'перест.'];
      return `<div class="wt-fin" style="opacity:${c.a}"><div class="wt-fb"><b>Сомневаетесь в предположениях</b><span>перестановки или бутстрэп: распределение статистики без формул</span></div>
<div class="wt-fb wt-fbad"><b>Независимость нужна всем</b><span>сессии пользователей, n&nbsp;=&nbsp;300: ложных у всех четырёх</span><div class="wt-fbars">${sessA.map((v, i) => `<div><i style="height:${Math.round(v / .35 * 100)}%"></i><em>${num(v * 100, 0)}%</em><small>${nm[i]}</small></div>`).join('')}</div></div></div>`;
    }
    const L = LEAF[c.leaf], f = L.fit(), b = L.bad();
    const pane = (d, cls, title, a, shown) => `<div class="wt-pn ${cls}" style="opacity:${shown ? .25 + .75 * a : .25}"><h4>${title}</h4>${shown ? d.mh : '<div class="wt-mh wt-ph"></div>'}<div class="wt-ax">${d.ax.map(t => `<span>${t}</span>`).join('')}</div><p>${shown ? d.cap : '…'}</p><em>${shown ? d.stat : ''}</em></div>`;
    return `<div class="wt-pair">${pane(f, 'ok', 'Подходит', c.fit, c.fit > 0)}${pane(b, 'no', 'Не подходит', c.bad, c.bad > 0)}</div>`;
  }

  const scene = {
    parts: [{ n: '01', name: 'Дерево', s: [0] }, { n: '02', name: 'Среднее', s: [1, 2, 3] }, { n: '03', name: 'Доля', s: [4, 5] }, { n: '04', name: 'Связь', s: [6, 7] }, { n: '05', name: 'Итог', s: [8, 9] }],
    steps: [
      { title: 'Два вопроса до выбора критерия', dur: 6200, body: '<p>Критерий выбирают, отвечая на&nbsp;два вопроса. Что сравниваем: среднее числа, долю нулей и&nbsp;единиц или&nbsp;связь двух категорий. И&nbsp;кто в&nbsp;группах: разные люди или&nbsp;одни и&nbsp;те&nbsp;же.</p><p>Внизу три вопроса учебного магазина. Проведём каждый по&nbsp;дереву.</p>' },
      { title: 'Средний чек → t-тест Уэлча', dur: 6400, body: '<p>Вопрос 1: средний чек в&nbsp;варианте Б выше, чем в&nbsp;А? Чек — число, сравниваем средние. Покупатели в&nbsp;группах разные, поэтому путь ведёт к&nbsp;<b>t-тесту Уэлча</b>.</p><p>Если&nbsp;бы это были одни и&nbsp;те&nbsp;же клиенты до&nbsp;и&nbsp;после, дорога вела&nbsp;бы к&nbsp;<b>парному t</b>.</p>' },
      { title: 'Кривые чеки Уэлчу не мешают', dur: 6000, body: '<p>Чеки из checks.csv с&nbsp;длинным хвостом оптовых заказов на&nbsp;колокол не&nbsp;похожи. Но&nbsp;t-тест опирается на&nbsp;распределение среднего, а&nbsp;среднее 200&nbsp;чеков почти нормально.</p><p>В&nbsp;10&nbsp;000 симуляций без эффекта тест ошибся в&nbsp;4,7% — как&nbsp;обещано.</p>' },
      { title: 'Сессии одного человека ломают тест', dur: 6600, body: '<p>Те&nbsp;же 200 значений в&nbsp;группе, но&nbsp;это сессии 10&nbsp;пользователей по&nbsp;20. Сессии одного человека похожи: каждый цвет на&nbsp;гистограмме — один пользователь.</p><p>Тест считает их&nbsp;независимыми и&nbsp;ошибается в&nbsp;57,8% случаев вместо 5%. Средние по&nbsp;пользователям возвращают 3,7%.</p>' },
      { title: 'Доля оплативших → z-тест', dur: 6400, body: '<p>Вопрос 2: выросла&nbsp;ли доля оплативших? У&nbsp;каждого пользователя 0 или&nbsp;1, сравниваем доли: <b>z-тест для&nbsp;долей</b>.</p><p>При&nbsp;2&nbsp;000 визитов в&nbsp;группе число покупок ложится колоколом около 68, и&nbsp;тест ошибается в&nbsp;4,5% случаев.</p>' },
      { title: 'Сорок визитов — приближение врёт', dur: 6000, body: '<p>При&nbsp;40 визитах в&nbsp;группе покупок 0, 1 или&nbsp;2, колокола нет, а&nbsp;в&nbsp;четверти групп нет ни&nbsp;одной покупки.</p><p>Реальный уровень — 2,8% вместо 5%. Нормальное приближение работает, когда успехов и&nbsp;неудач в&nbsp;каждой группе хотя&nbsp;бы по&nbsp;десять.</p>' },
      { title: 'Источник × покупка → хи-квадрат', dur: 6600, body: '<p>Вопрос 3: связан&nbsp;ли источник визита с&nbsp;покупкой? Обе переменные — категории, данные — таблица 3 × 2 из&nbsp;visits.csv: <b>хи-квадрат</b>.</p><p>Тест сравнивает фактические покупки с&nbsp;ожидаемыми без&nbsp;связи. В&nbsp;рассылке их&nbsp;897 вместо 508: хи-квадрат 506,8, связь есть.</p>' },
      { title: 'Маленькая таблица — частоты меньше пяти', dur: 6000, body: '<p>Первые 60 визитов того&nbsp;же файла: всего 4 покупки, ожидаемые частоты в&nbsp;клетках «купил» от&nbsp;0,7 до&nbsp;1,9.</p><p>Хи-квадрат здесь приблизителен: реальный уровень 3,8% вместо 5%. Правило — ожидаемая частота не&nbsp;меньше 5 в&nbsp;каждой клетке.</p>' },
      { title: 'Манн — Уитни отвечает на свой вопрос', dur: 8200, body: '<p>Четвёртая ветка — «чаще&nbsp;ли чек из&nbsp;Б больше чека из&nbsp;А?». <b>Манн — Уитни</b> оценивает именно это, P(Б > А). Когда все чеки выросли на&nbsp;10%, он&nbsp;находит эффект в&nbsp;31% выборок, Уэлч — в&nbsp;13%.</p><p>Но&nbsp;это не&nbsp;тест медиан: если выросли только дорогие заказы, медианы равны, а&nbsp;тест значим в&nbsp;38%.</p>' },
      { title: 'Запасной выход и общее условие', dur: 6400, next: 'Читать страницу', body: '<p>Если предположения под&nbsp;вопросом, есть <b>перестановки и&nbsp;бутстрэп</b>: распределение статистики они строят без&nbsp;формул.</p><p>Но&nbsp;независимость нужна всем. На&nbsp;сессиях пользователей все четыре критерия из&nbsp;интерактива ниже ошибаются в&nbsp;26–34% случаев.</p>' }
    ],
    hud: [{ id: 'q', label: 'Вопрос' }, { id: 't', label: 'Критерий' }, { id: 'a', label: 'Ложных' }],
    legend: '<span><i style="background:#e3c04d"></i>путь вопроса</span><span><i style="background:#43c58b"></i>подходит</span><span><i style="background:#f2756a"></i>не подходит</span>',
    info: 'ДЕРЕВО КРИТЕРИЕВ',
    aiNote: 'В анимации дерево решений: «Что сравниваем?» → среднее числа (→ «те же люди?»: нет — t-тест Уэлча, да — парный t), чаще ли больше (Манн — Уитни), долю 0/1 (z-тест для долей), две категории (хи-квадрат). Три вопроса учебного магазина: средний чек в A/B-тесте, доля оплативших, связь источника визита с покупкой. На каждом листе пример данных, где тест подходит и где нет, с долей ложных срабатываний из симуляции на 10 000 повторов.',
    mount(root, api) {
      root.innerHTML = '<div class="wt-sc"><svg class="wt-tree" aria-hidden="true"></svg><div class="wt-card"></div><div class="wt-calls"></div></div>';
      const box = root.firstChild, svg = box.querySelector('.wt-tree'), card = box.querySelector('.wt-card'), callsEl = box.querySelector('.wt-calls');
      let sig = '', sigCard = '';
      return {
        render(k, p) {
          const s = sceneState(k, p);
          api.hud('q', s.hud[0]); api.hud('t', s.hud[1]); api.hud('a', s.hud[2], s.hud[3]);
          const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
          const mob = W < 470, TH = Math.round(H * (mob ? .5 : .5));
          const key = JSON.stringify([W, H, k, Math.round(s.grow * 60), Math.round(s.t * 80), s.done, s.cur, s.calls]);
          const ck = JSON.stringify([W < 470, s.card]);
          if (ck !== sigCard) { sigCard = ck; card.innerHTML = cardHTML(s.card, mob); card.style.top = `${TH + (mob ? 8 : 12)}px`; }
          if (key === sig) return; sig = key;
          // геометрия дерева
          const pos = {}; const lw = Math.min(124, W / 5 - (mob ? 6 : 8)), nh = mob ? 24 : 28;
          Object.entries(NODES).forEach(([id, n]) => { pos[id] = { x: n.x * W, y: 6 + n.y * (TH - 12), w: id === 'root' ? (mob ? n.wm : n.w) : lw, h: nh }; });
          const lvlA = id => clamp(s.grow * 4.2 - LEVEL[id] * 1.05, 0, 1);
          const on = new Set(), dim = new Set(), onE = new Set(), dimE = new Set();
          const mark = (path, S, SE, upto) => { for (let i = 0; i < path.length; i++) { if (i <= upto) S.add(path[i]); if (i > 0 && i <= upto) SE.add(path[i - 1] + '>' + path[i]); } };
          s.done.forEach(q => mark(PATHS[q], dim, dimE, 99));
          let dot = null;
          if (s.cur >= 0) {
            const P = PATHS[s.cur], segs = P.length - 1, f = s.t * segs, i = Math.min(segs - 1, Math.floor(f)), u = f - i;
            mark(P, on, onE, s.t >= 1 ? 99 : i + (u > .98 ? 1 : 0));
            const a = pos[P[i]], b = pos[P[i + 1]];
            const y0 = a.y + a.h / 2, y1 = b.y - b.h / 2, ym = (y0 + y1) / 2, uu = s.t >= 1 ? 1 : u;
            const bx = t => (1 - t) ** 3 * a.x + 3 * (1 - t) ** 2 * t * a.x + 3 * (1 - t) * t * t * b.x + t ** 3 * b.x;
            const by = t => (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * ym + 3 * (1 - t) * t * t * ym + t ** 3 * y1;
            dot = s.t >= 1 ? null : [bx(uu), by(uu)];
          }
          let g = '';
          EDGES.forEach(([a, b, lab]) => {
            const A = pos[a], B = pos[b], al = lvlA(b); if (al <= 0) return;
            const y0 = A.y + A.h / 2, y1 = B.y - B.h / 2, ym = (y0 + y1) / 2, id = a + '>' + b;
            const col = onE.has(id) ? SC.yel : dimE.has(id) ? 'rgba(54,184,166,.55)' : SC.line, sw = onE.has(id) ? 2.4 : dimE.has(id) ? 2 : 1.4;
            g += `<path d="M${A.x},${y0} C${A.x},${ym} ${B.x},${ym} ${B.x},${y1}" fill="none" stroke="${col}" stroke-width="${sw}" opacity="${al}"/>`;
            if (lab) g += `<text x="${(A.x + B.x) / 2 + (B.x < A.x ? -8 : 8)}" y="${ym + 4}" text-anchor="${B.x < A.x ? 'end' : 'start'}" class="wt-el" opacity="${al}">${lab}</text>`;
          });
          Object.entries(NODES).forEach(([id, n]) => {
            const P = pos[id], al = lvlA(id); if (al <= 0) return;
            const isOn = on.has(id), isDim = dim.has(id), leaf = n.leaf;
            const reached = leaf && (isOn && s.t >= 1 || isDim);
            const stroke = isOn ? SC.yel : isDim ? SC.acc : leaf ? '#3a4766' : SC.line;
            const fill = reached ? (isOn ? 'rgba(227,192,77,.16)' : 'rgba(54,184,166,.14)') : SC.node;
            g += `<g opacity="${al}"><rect x="${P.x - P.w / 2}" y="${P.y - P.h / 2}" width="${P.w}" height="${P.h}" rx="${leaf ? 7 : P.h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${isOn || isDim ? 1.6 : 1}"/>`;
            g += `<text x="${P.x}" y="${P.y + (mob ? 3.6 : 4.2)}" text-anchor="middle" class="wt-nt${leaf ? ' lf' : ''}${isOn || reached ? ' on' : ''}">${mob ? n.m : n.l}</text></g>`;
            const qi = PATHS.findIndex(pp => pp[pp.length - 1] === id);
            if (leaf && reached && qi >= 0 && qi < 3) g += `<g><circle cx="${P.x + P.w / 2 - 2}" cy="${P.y - P.h / 2 - 1}" r="${mob ? 7 : 8}" fill="${isOn ? SC.yel : SC.acc}"/><text x="${P.x + P.w / 2 - 2}" y="${P.y - P.h / 2 + (mob ? 2.6 : 3)}" text-anchor="middle" class="wt-badge">${qi + 1}</text></g>`;
          });
          if (dot) g += `<circle cx="${dot[0]}" cy="${dot[1]}" r="9" fill="${SC.yel}" opacity=".25"/><circle cx="${dot[0]}" cy="${dot[1]}" r="5" fill="${SC.yel}"/>`;
          svg.setAttribute('viewBox', `0 0 ${W} ${TH}`); svg.setAttribute('width', W); svg.setAttribute('height', TH);
          svg.innerHTML = g;
          // выноски
          callsEl.innerHTML = s.calls.map(c => {
            if (c[0] !== 'node') return '';
            const P = pos[c[1]], fs = mob ? 10.5 : 12, tw = c[2].length * fs * .56 + 18;
            let dir = c[3] || 'r';
            if (dir === 'r' && P.x + P.w / 2 + 8 + tw > W - 2) dir = 'd';
            let x, y;
            if (dir === 'r') { x = P.x + P.w / 2 + 8; y = P.y - fs; }
            else if (dir === 'u') { x = P.x + 6; y = P.y - P.h / 2 - fs * 2 - 14; }
            else { x = P.x - tw / 2; y = P.y + P.h / 2 + 6; }
            x = clamp(x, 2, W - tw - 2);
            return `<span class="wt-call" style="left:${Math.round(x)}px;top:${Math.round(y)}px">${c[2]}</span>`;
          }).join('');
          // выноски внутри панелей карточки
          card.querySelectorAll('.wt-in').forEach(e => e.remove());
          s.calls.forEach(c => {
            if (c[0] === 'fit' || c[0] === 'bad') {
              const pn = card.querySelector(c[0] === 'fit' ? '.wt-pn.ok' : '.wt-pn.no'); if (!pn) return;
              const L = LEAF[s.card.leaf][c[0]](), txt = c[1] || L.call; if (!txt) return;
              const e = document.createElement('span'); e.className = `wt-call wt-in${L.callL ? ' lft' : ''}`; e.textContent = txt; pn.appendChild(e);
            }
            if (c[0] === 'final') { const fb = card.querySelector('.wt-fb'); if (fb) { const e = document.createElement('span'); e.className = 'wt-call wt-in wt-low'; e.textContent = 'лекарство: строка на пользователя'; fb.appendChild(e); } }
          });
        }
      };
    }
  };

  /* ===================== Интерактив «Тест под данные» ===================== */
  const SH = {
    normal: { name: 'Колокол', d: 'Нормальное распределение с равными разбросами: эталон.' },
    checks: { name: 'Чеки', d: 'Перевыборка из checks.csv с хвостом оптовых заказов; эффект — все чеки Б выше.' },
    heavy: { name: 'Тяжёлый хвост', d: 'Логнормальное с σ = 1,5: изредка значения в десятки раз выше медианы.' },
    unequal: { name: 'Разные разбросы', d: 'Равные средние; в А n наблюдений с разбросом 30, в Б 4n с разбросом 10.' },
    sessions: { name: 'Сессии', d: 'n сессий — это n/5 пользователей по 5 похожих сессий.' }
  };
  const CR = { student: 'Стьюдент', welch: 'Уэлч', mw: 'Манн — Уитни', perm: 'Перестановки' };
  const CRS = { student: 'Стьюдент', welch: 'Уэлч', mw: 'М — У', perm: 'Перест.' };
  const TASKS = ['Найдите форму данных, где Стьюдент даёт больше 20% ложных срабатываний, а Уэлч держит 5%.', 'Найдите форму, на которой ошибаются все четыре критерия.', 'Найдите, где Манн — Уитни вдвое мощнее Уэлча, а ложных у обоих не больше 5,5%.'];

  function buildTester(box, api) {
    const { css, esc } = api;
    const SK = M.shapes || Object.keys(SH), CK = M.crit || Object.keys(CR), NS = M.ns || [], EF = M.effects || [];
    box.innerHTML = `<div class="block-hd"><span class="t">t-тест держится на кривых чеках, но ломается на разных разбросах и сессиях <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="tu-reset">Сбросить</button></div></div>
<p class="hint tu-do">Выберите форму данных, размер групп, критерий и эффект. Вверху — ложные срабатывания без эффекта, внизу — как часто критерий срабатывает с эффектом.</p>
<div class="tu-ctl">
  <span class="tu-grp"><span class="tu-lb">данные</span><span class="seg" role="group" aria-label="Форма данных" id="tu-s">${SK.map(k => `<button type="button" data-v="${k}">${SH[k].name}</button>`).join('')}</span></span>
  <span class="tu-grp"><span class="tu-lb">n в группе</span><span class="seg" role="group" aria-label="Размер группы" id="tu-n">${NS.map((n, i) => `<button type="button" data-v="${i}">${num(n)}</button>`).join('')}</span></span>
  <span class="tu-grp"><span class="tu-lb">критерий</span><span class="seg" role="group" aria-label="Критерий" id="tu-c">${CK.map(k => `<button type="button" data-v="${k}">${CR[k]}</button>`).join('')}</span></span>
  <span class="tu-grp"><span class="tu-lb">эффект</span><span class="seg" role="group" aria-label="Эффект в группе Б" id="tu-e">${EF.map((e, i) => i ? `<button type="button" data-v="${i}">+${num(e * 100)}%</button>` : '').join('')}</span></span>
</div>
<div class="tu-stage">
  <div class="tu-cvw"><canvas id="tu-cv" role="img" aria-label="Форма данных, доля ложных срабатываний четырёх критериев и доля срабатываний в зависимости от эффекта"></canvas></div>
  <div class="tu-side">
    <p class="tu-cap" id="tu-cap" aria-live="polite"></p>
    <div class="readout tu-ro"><div><span class="big" id="tu-a">—</span><span class="lbl">ложных без эффекта, норма 5%</span></div><div><span class="big" id="tu-p">—</span><span class="lbl" id="tu-pl"></span></div></div>
    <p class="tu-txt" id="tu-txt"></p>
    <ol class="tu-tasks" id="tu-tasks"></ol>
  </div>
</div>
<div class="status"><span><span class="dot live"></span>Предрасчитанная симуляция в Python: ${num(M.R)} повторов на клетку, у перестановочного теста ${num(M.B)} перестановок, seed ${M.seed}</span><span class="grow"></span><span id="tu-st"></span></div>`;
    const q = s => box.querySelector(s), cv = q('#tu-cv'), wrap = cv.parentNode;
    let st;
    const fresh = () => ({ s: 'checks', n: 1, c: 'welch', e: 2, done: [false, false, false] });
    const cell = (s, n, e) => G[s][n][e];
    function check() {
      const a = cell(st.s, st.n, 0), pw = cell(st.s, st.n, st.e), ci = k => CK.indexOf(k);
      if (st.c === 'student' && a[ci('student')] > .2 && a[ci('welch')] <= .075) st.done[0] = true;
      if (CK.every(k => a[ci(k)] > .075)) st.done[1] = true;
      if (st.c === 'mw' && pw[ci('mw')] >= 2 * pw[ci('welch')] && a[ci('mw')] <= .055 && a[ci('welch')] <= .055) st.done[2] = true;
    }
    function draw() {
      const ci = CK.indexOf(st.c), a = cell(st.s, st.n, 0), pw = cell(st.s, st.n, st.e);
      [['#tu-s', st.s], ['#tu-n', String(st.n)], ['#tu-c', st.c], ['#tu-e', String(st.e)]].forEach(([id, v]) => q(id).querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v))));
      const al = a[ci], eff = `+${num(EF[st.e] * 100)}%`;
      const verdict = al > .075 ? ['no', `Ломается: без эффекта срабатывает в&nbsp;${pct(al)} случаев — в&nbsp;${num(al / .05, 1)} раза чаще обещанного.`]
        : al < .035 ? ['warn', `Осторожничает: ложных ${pct(al)} вместо 5%, а&nbsp;платит за&nbsp;это мощностью.`]
          : ['ok', `Держится: ложных ${pct(al)}, как&nbsp;обещано.`];
      q('#tu-cap').innerHTML = `<span class="tu-v ${verdict[0]}">${CR[st.c]}</span> ${verdict[1]}`;
      q('#tu-a').innerHTML = pct(al); q('#tu-a').className = `big tu-${verdict[0]}`;
      q('#tu-p').innerHTML = pct(pw[ci]); q('#tu-pl').innerHTML = `находит эффект ${eff}${al > .075 ? ' — но это число завышено ложными срабатываниями' : ' — мощность'}`;
      const fair = CK.map((k, i) => [k, i]).filter(([, i]) => a[i] <= .075);
      const best = fair.length ? fair.reduce((m, x) => (pw[x[1]] > pw[m[1]] ? x : m)) : null;
      q('#tu-txt').innerHTML = `${esc(SH[st.s].d)} ${best ? `Из&nbsp;держащих уровень мощнее всех ${CR[best[0]]}: ${pct(pw[best[1]])}.` : 'Уровень не держит ни один критерий: сравнивать мощность бессмысленно.'}`;
      check();
      q('#tu-tasks').innerHTML = TASKS.map((t, i) => `<li class="${st.done[i] ? 'on' : ''}"><b>${st.done[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('');
      const nb = st.s === 'unequal' ? `${num(NS[st.n])} и ${num(NS[st.n] * 4)}` : num(NS[st.n]);
      q('#tu-st').textContent = `Клетка: ${SH[st.s].name.toLowerCase()} · n = ${nb} · ${CR[st.c]} · эффект +${num(EF[st.e] * 100)}%`;
      drawCanvas();
    }
    function drawCanvas() {
      const C = css(), w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const mob = w < 520, fs = mob ? 10.5 : 11.5, F = `500 ${fs}px "Onest", system-ui, sans-serif`, MONO = `500 ${fs - .5}px "JetBrains Mono", ui-monospace, monospace`;
      const ci = CK.indexOf(st.c), A0 = cell(st.s, st.n, 0);
      // раскладка: три панели
      let P1, P2, P3;
      if (mob) { P1 = [12, 18, w - 24, 92]; P2 = [12, 140, w - 24, 104]; P3 = [12, 286, w - 24, h - 286 - 26]; }
      else { const half = (w - 48) / 2; P1 = [16, 20, half, 118]; P2 = [32 + half, 20, half, 118]; P3 = [16, 176, w - 32, h - 176 - 28]; }
      const title = (P, t) => { g.font = F; g.fillStyle = C.muted; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(t, P[0], P[1] - 4); };
      // 1. форма данных
      const H = DATA.hist[st.s];
      title(P1, st.s === 'sessions' ? 'форма: сессии шести пользователей' : st.s === 'unequal' ? 'форма: А широкая, Б узкая' : 'форма данных: группа А и группа Б');
      g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(P1[0], P1[1] + P1[3] + .5); g.lineTo(P1[0] + P1[2], P1[1] + P1[3] + .5); g.stroke();
      const nb = H.a.length, bw = P1[2] / nb;
      if (st.s === 'sessions') {
        const tot = H.users[0].map((_, i) => H.users.reduce((s, u) => s + u[i], 0)), mx = Math.max(...tot);
        for (let i = 0; i < nb; i++) { let y = P1[1] + P1[3]; H.users.forEach((u, k) => { if (!u[i]) return; const hh = u[i] / mx * P1[3]; y -= hh; g.fillStyle = C.c[k % 8]; g.fillRect(P1[0] + i * bw + .5, y, Math.max(1, bw - 1), hh); }); }
      } else {
        const mx = Math.max(...H.a, ...H.b);
        g.fillStyle = C.c[0]; g.globalAlpha = .45; H.a.forEach((v, i) => { const hh = v / mx * P1[3]; g.fillRect(P1[0] + i * bw + .5, P1[1] + P1[3] - hh, Math.max(1, bw - 1), hh); }); g.globalAlpha = 1;
        g.strokeStyle = C.c[1]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(P1[0], P1[1] + P1[3]);
        H.b.forEach((v, i) => { const y = P1[1] + P1[3] - v / mx * P1[3]; g.lineTo(P1[0] + i * bw, y); g.lineTo(P1[0] + (i + 1) * bw, y); }); g.lineTo(P1[0] + P1[2], P1[1] + P1[3]); g.stroke();
        g.font = F; g.textBaseline = 'top'; g.textAlign = 'right';
        g.fillStyle = C.c[0]; g.fillText('А', P1[0] + P1[2] - 22, P1[1] + 2); g.fillStyle = C.c[1]; g.fillText('Б', P1[0] + P1[2] - 4, P1[1] + 2);
      }
      g.font = MONO; g.fillStyle = C.muted; g.textBaseline = 'top'; g.textAlign = 'left'; g.fillText(num(H.lo), P1[0], P1[1] + P1[3] + 4); g.textAlign = 'right';
      g.fillText(`${H.tailA > .001 ? '≥ ' : ''}${num(H.hi)}`, P1[0] + P1[2], P1[1] + P1[3] + 4);
      // 2. ложные срабатывания четырёх критериев
      const top = Math.max(.1, Math.ceil(Math.max(...A0) * 1.15 * 20) / 20);
      title(P2, mob ? `ложных без эффекта, шкала до ${num(top * 100)}%` : `ложных срабатываний без эффекта, шкала до ${num(top * 100)}%`);
      const rowH = P2[3] / CK.length, lx = mob ? 64 : 92, bx0 = P2[0] + lx, bwid = P2[2] - lx - (mob ? 44 : 50);
      const X2 = v => bx0 + v / top * bwid;
      CK.forEach((k, i) => {
        const y = P2[1] + i * rowH, v = A0[i], sel = i === ci, bad = v > .075;
        g.font = sel ? `700 ${fs}px "Onest", system-ui, sans-serif` : F; g.fillStyle = sel ? C.ink : C.muted; g.textAlign = 'left'; g.textBaseline = 'middle';
        g.fillText(mob ? CRS[k] : CR[k], P2[0], y + rowH / 2);
        g.fillStyle = sel ? (bad ? C.bad : C.accent) : (bad ? C.bad : C.line2); g.globalAlpha = sel ? 1 : .55;
        g.fillRect(bx0, y + rowH * .22, Math.max(1.5, X2(v) - bx0), rowH * .56); g.globalAlpha = 1;
        g.font = MONO; g.fillStyle = sel ? C.ink : C.muted; g.fillText(`${num(v * 100, 1)}%`, X2(v) + 5, y + rowH / 2);
      });
      g.strokeStyle = C.ink; g.globalAlpha = .7; g.setLineDash([4, 3]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(X2(.05), P2[1] - 2); g.lineTo(X2(.05), P2[1] + P2[3] + 2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
      g.font = MONO; g.fillStyle = C.muted; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('5%', X2(.05), P2[1] + P2[3] + 4);
      // 3. доля срабатываний по эффекту
      title(P3, mob ? 'срабатывания: при 0 — ложные, дальше — мощность' : 'как часто критерий срабатывает: при эффекте 0 — ложно, дальше — мощность');
      const padL = mob ? 34 : 40, x0 = P3[0] + padL, x1 = P3[0] + P3[2] - (mob ? 58 : 96), y0 = P3[1] + P3[3], y1 = P3[1] + 6;
      const XE = i => x0 + i / (EF.length - 1) * (x1 - x0), YE = v => y0 - v * (y0 - y1);
      g.font = MONO; g.textBaseline = 'middle'; g.textAlign = 'right';
      [0, .25, .5, .75, 1].forEach(v => { g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, YE(v) + .5); g.lineTo(x1, YE(v) + .5); g.stroke(); g.fillStyle = C.muted; g.fillText(`${num(v * 100)}%`, x0 - 6, YE(v)); });
      g.fillStyle = C.accent; g.globalAlpha = .1; g.fillRect(XE(st.e) - 14, y1 - 4, 28, y0 - y1 + 4); g.globalAlpha = 1;
      g.textAlign = 'center'; g.textBaseline = 'top';
      EF.forEach((e, i) => { g.fillStyle = i === st.e ? C.ink : C.muted; g.fillText(i ? `+${num(e * 100)}%` : '0', XE(i), y0 + 6); });
      g.strokeStyle = C.ink; g.globalAlpha = .6; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x0, YE(.05)); g.lineTo(x1, YE(.05)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
      const order = CK.map((k, i) => i).filter(i => i !== ci).concat([ci]);
      const ends = [];
      order.forEach(i => {
        const sel = i === ci, ys = EF.map((_, e) => cell(st.s, st.n, e)[i]);
        g.strokeStyle = sel ? C.accent : C.line2; g.lineWidth = sel ? 2.6 : 1.4; g.beginPath();
        ys.forEach((v, e) => { e ? g.lineTo(XE(e), YE(v)) : g.moveTo(XE(e), YE(v)); }); g.stroke();
        if (sel) ys.forEach((v, e) => { g.beginPath(); g.arc(XE(e), YE(v), e === st.e ? 5 : 3, 0, 7); g.fillStyle = e === st.e ? C.accent : C.surface; g.fill(); g.strokeStyle = C.accent; g.lineWidth = 2; g.stroke(); });
        ends.push([i, YE(ys[ys.length - 1]), sel]);
      });
      // подписи линий справа без наложения
      ends.sort((p, q2) => p[1] - q2[1]); let last = -1e9;
      ends.forEach(e => { e[3] = Math.max(e[1], last + fs + 3); last = e[3]; });
      ends.forEach(([i, , sel, y]) => { g.font = sel ? `700 ${fs}px "Onest", system-ui, sans-serif` : F; g.fillStyle = sel ? C.accent : C.muted; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(mob ? CRS[CK[i]] : CR[CK[i]], x1 + 8, Math.min(y, y0)); });
      const v = cell(st.s, st.n, st.e)[ci];
      g.font = `700 ${fs}px "JetBrains Mono", ui-monospace, monospace`; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'bottom';
      g.fillText(`${num(v * 100, 1)}%`, clamp(XE(st.e), x0 + 20, x1 - 20), YE(v) - 8 < y1 + 10 ? YE(v) + 22 : YE(v) - 8);
    }
    const on = (id, f) => q(id).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; f(b.dataset.v); draw(); });
    on('#tu-s', v => { st.s = v; }); on('#tu-n', v => { st.n = +v; }); on('#tu-c', v => { st.c = v; }); on('#tu-e', v => { st.e = +v; });
    q('#tu-reset').addEventListener('click', () => { st = fresh(); draw(); });
    st = fresh(); draw();
    if ('ResizeObserver' in window) new ResizeObserver(() => drawCanvas()).observe(wrap);
    return {
      redraw: drawCanvas,
      describe() {
        const ci = CK.indexOf(st.c), a = cell(st.s, st.n, 0)[ci], p = cell(st.s, st.n, st.e)[ci];
        return `форма данных «${SH[st.s].name}», n = ${NS[st.n]}${st.s === 'unequal' ? ` и ${NS[st.n] * 4}` : ''}, критерий ${CR[st.c]}: ложных срабатываний без эффекта ${pctT(a)}, срабатываний при эффекте +${num(EF[st.e] * 100)}% — ${pctT(p)}; у остальных без эффекта: ${CK.filter(k => k !== st.c).map(k => `${CR[k]} ${pctT(cell(st.s, st.n, 0)[CK.indexOf(k)])}`).join(', ')}; заданий выполнено ${st.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Код: примечания к блокам ===================== */
  const NOTE = {
    four: { note: 'Данные — <code>ab.csv</code>, учебный A/B-тест: по&nbsp;20&nbsp;000 пользователей в&nbsp;группе, чеки взяты из <code>checks.csv</code>, в&nbsp;группе Б все чеки умножены на&nbsp;1,08. Перестановочный тест — <code>scipy.stats.permutation_test</code> с&nbsp;9&nbsp;999 перестановками.' },
    alpha_sim: { note: 'Та&nbsp;же логика, что&nbsp;в&nbsp;интерактиве, но&nbsp;с&nbsp;другим seed: числа совпадают с&nbsp;сеткой интерактива в&nbsp;пределах погрешности симуляции, около ±0,4 процентного пункта.' },
    chi: { note: 'В&nbsp;SciPy <code>chi2_contingency</code> для&nbsp;таблицы 2 × 2 по&nbsp;умолчанию вносит поправку Йейтса, поэтому для&nbsp;сравнения с&nbsp;z-тестом стоит <code>correction=False</code>. Порядок строк таблицы — по&nbsp;алфавиту.' },
    mw_median: { note: 'Медианы выборок по&nbsp;1&nbsp;000 чеков отличаются случайно, у&nbsp;Б она даже ниже. Медианы совокупностей равны точно: допродажа не&nbsp;трогает чеки дешевле медианы.' },
    pretest: { note: 'В&nbsp;SciPy 1.18 <code>shapiro</code> принимает <code>axis</code> и&nbsp;проверяет все 2&nbsp;000 выборок одним вызовом. Каждая строка таблицы — 2&nbsp;000 пар групп без&nbsp;эффекта.' },
    clusters: { note: 'Та&nbsp;же форма «Сессии», что&nbsp;в&nbsp;интерактиве при&nbsp;n&nbsp;=&nbsp;300.' }
  };
  Object.entries(NOTE).forEach(([k, v]) => { if (CODE[k]) Object.assign(CODE[k], v); });

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-6-4',
    short: 'DA-06',
    title: 'Какой тест когда: t, Манна — Уитни, хи-квадрат',
    where: 'блок «Дата аналитика», тема 06 «Статистический вывод», страница 6.4',
    aiData: 'учебный A/B-тест новой корзины (ab.csv: доля оплативших и чеки двух групп по 20 000 пользователей), 20 000 учебных чеков с длинным хвостом (checks.csv) и 100 000 визитов «источник × купил» (visits.csv)',
    scene,
    widgets: { tester: buildTester },
    code: CODE,
    questions: {
    q1: { sec: 'tester', title: 'Сначала предскажите', q: 'Чеки из checks.csv с длинным хвостом оптовых заказов, по 30 в группе, эффекта нет. Какую долю ложных срабатываний даст t-тест Уэлча при α = 0,05?', opts: [['Около 30%: на ненормальных данных t-тест ломается'], ['Около 15%'], ['Около 3%: не больше обещанных 5%, зато эффект он находит хуже', 1], ['Ровно 5%: так устроен уровень значимости']],
      why: 'В сетке интерактива Уэлч при n = 30 на чеках ошибается в 3,0% повторов. Тяжёлый хвост делает t-тест осторожным, а не болтливым: редкие оптовые заказы раздувают оценку разброса, и t-статистика реже уходит за порог. Расплата — мощность: при росте чеков на 10% Уэлч находит его в 4,3% повторов, Манн — Уитни в 8,4%. Ровно 5% получилось бы, если бы среднее было точно нормальным, а 15–30% — это уже другие нарушения: разные разбросы или зависимые наблюдения.' },
    q2: { sec: 'idea', q: 'Нужно сравнить долю оплативших в двух группах A/B-теста по 20 000 пользователей. Какой критерий выбрать?', opts: [['Парный t-тест: группы сравниваются попарно'], ['z-тест для долей или хи-квадрат по таблице 2 × 2 — это один и тот же тест', 1], ['Манн — Уитни: данные из нулей и единиц не нормальны'], ['Сначала тест Шапиро — Уилка, а по его ответу — t-тест или Манн — Уитни']],
      why: 'Оплата — 0 или 1, вопрос про доли, пользователи в группах разные: это лист «z для долей» в анимации. Для таблицы 2 × 2 хи-квадрат без поправки даёт ту же статистику, z в квадрате: в коде 3,193² = 10,19. Парный тест нужен, когда в группах одни и те же люди. Манн — Уитни на нулях и единицах превращается в грубое сравнение долей с поправкой на ничьи. Проверять нормальность нулей и единиц бессмысленно: она заведомо не выполняется, а z-тесту нужна нормальность доли, а не данных.' },
    q3: { sec: 'idea', q: 'Медианы чеков в двух группах одинаковы, а Манн — Уитни дал p = 0,0004. Как так?', opts: [['Ошибка расчёта: при равных медианах тест не может быть значим'], ['Тест проверяет, чаще ли значение из одной группы больше значения из другой, а это меняется и при той же медиане', 1], ['Манн — Уитни сравнивает средние, а они разные'], ['Выборка слишком большая: при большом n значимо всё']],
      why: 'Нулевая гипотеза Манна — Уитни — распределения одинаковы, а U-статистика оценивает P(Б > А). В примере допродажа подняла только чеки дороже медианы: медианы остались 3 080 ₽, а P(Б > А) стала 0,548. Тест это и нашёл. Средние Манн — Уитни не сравнивает: он работает с рангами. Большой n повышает мощность, но эффект здесь настоящий: при 200 чеках в группе тест значим в 38% выборок, а не в 5%.' },
    q4: { sec: 'nuances', q: 'В каждой группе 60 пользователей, у каждого по 5 сессий, метрика — чек сессии. Как сравнить группы?', opts: [['t-тест Уэлча по 300 сессиям: больше строк — больше мощность'], ['Манн — Уитни по сессиям: он не требует нормальности'], ['Свернуть данные до строки на пользователя, например среднего по его сессиям, и сравнить 60 против 60', 1], ['Перестановочный тест по сессиям: он не опирается на формулы']],
      why: 'Сессии одного человека похожи, поэтому 300 сессий несут меньше информации, чем 300 независимых наблюдений. Любой тест по сессиям занижает разброс: Уэлч даёт 26,9% ложных, Манн — Уитни 28,3%, перестановки в интерактиве — 26,4%. Перестановочный тест тоже считает строки взаимозаменяемыми, а это неверно, если строки одного пользователя всегда в одной группе. Среднее по пользователю возвращает 4,9%.' },
    q5: { sec: 'code', q: 'Что проверяет эта строка в SciPy 1.18?', code: 'stats.ttest_ind(b, a)', lang: 'python', opts: [['t-тест Уэлча: SciPy по умолчанию не предполагает равных дисперсий'], ['t-тест Стьюдента с общей дисперсией; для Уэлча нужен equal_var=False', 1], ['Парный t-тест, если у a и b одинаковая длина'], ['Манн — Уитни, если данные не нормальны']],
      why: 'У ttest_ind параметр equal_var по умолчанию True: это t-тест Стьюдента с объединённой дисперсией. Для Уэлча нужно явно написать equal_var=False. Парный тест — отдельная функция ttest_rel, а критерий SciPy сам не меняет. В блоке «Четыре критерия» p-value Стьюдента и Уэлча почти совпали, 0,767 и 0,769, потому что группы похожего размера; при разных размерах и разбросах они расходятся.' },
    q6: { sec: 'nuances', q: 'Тест Шапиро — Уилка отверг нормальность чеков в выборке из 3 000. Что делать с t-тестом Уэлча?', opts: [['Отказаться от него: условие t-теста нарушено'], ['Ничего: при n = 3 000 среднее почти нормально, а Шапиро — Уилк на такой выборке отвергает любое отклонение', 1], ['Прологарифмировать чеки и сравнить средние логарифмов: вывод про средние будет тем же'], ['Взять половину выборки, чтобы Шапиро — Уилк перестал отвергать']],
      why: 'Шапиро — Уилк проверяет нормальность данных, а t-тесту при большом n нужна нормальность среднего. В коде нюанса при n = 3 000 тест отверг нормальность в 100% выборок, а Уэлч дал 5,1% ложных — ровно как обещано. Среднее логарифмов — это сравнение средних геометрических, другой вопрос: рубли выручки так не посчитать. Урезать выборку ради ответа теста значит выбросить данные и подогнать процедуру.' },
    q7: { sec: 'tester', q: 'Малая группа (30) втрое шумнее большой (120), средние равны. Какой критерий даёт около 5% ложных срабатываний?', opts: [['t-тест Стьюдента'], ['Перестановочный тест по разнице средних'], ['t-тест Уэлча', 1], ['Манн — Уитни']],
      why: 'Стьюдент объединяет дисперсии с весами по размерам групп: спокойная большая группа занижает оценку шума малой, и тест ошибается в 25% случаев. Перестановки предполагают, что при нулевой гипотезе распределения групп одинаковы целиком, и ошибаются так же, 24–25%. Манн — Уитни при разных разбросах тоже сбивается, 13–14%. Уэлч оценивает дисперсии по отдельности и держит 4,7–5,1%.' }
    },
    glossary: {
      test: { t: 'Статистический критерий', en: 'statistical test', d: 'Правило, которое по данным считает статистику и p-value и решает, отвергнуть ли нулевую гипотезу.' },
      welch: { t: 't-тест Уэлча', en: 'Welch\'s t-test', d: 'Сравнивает средние двух независимых групп, оценивая дисперсию каждой отдельно.' },
      student: { t: 't-тест Стьюдента', en: 'Student\'s t-test', d: 'Сравнивает средние двух групп с общей дисперсией: предполагает, что разбросы равны.' },
      paired: { t: 'Парный t-тест', en: 'paired t-test', d: 't-тест для разниц «после минус до» у одних и тех же объектов.' },
      mw: { t: 'Критерий Манна — Уитни', en: 'Mann–Whitney U test', d: 'Ранговый критерий для двух групп: проверяет, чаще ли значения одной группы больше значений другой.' },
      psup: { t: 'Вероятность превосходства', en: 'probability of superiority', d: 'P(Б > А): вероятность, что случайное значение из Б больше случайного из А.' },
      ztest: { t: 'z-тест для долей', en: 'two-proportion z-test', d: 'Сравнивает доли двух групп через нормальное приближение их разницы.' },
      chi2: { t: 'Хи-квадрат', en: 'chi-squared test', d: 'Критерий связи двух категорий: сумма (факт − ожидание)² / ожидание по клеткам таблицы.' },
      contingency: { t: 'Таблица сопряжённости', en: 'contingency table', d: 'Таблица частот по комбинациям двух категорий, например «источник × купил».' },
      expected: { t: 'Ожидаемая частота', en: 'expected frequency', d: 'Частота клетки, если связи нет: сумма строки × сумма столбца / N.' },
      df: { t: 'Степени свободы', en: 'degrees of freedom', d: 'Параметр t- и хи-квадрат-распределения, задаёт их форму.' },
      assump: { t: 'Предположения критерия', en: 'test assumptions', d: 'Условия, при которых p-value критерия верен.' },
      fp: { t: 'Ложное срабатывание', en: 'false positive, type I error', d: 'Отвергнутая нулевая гипотеза, когда эффекта нет; у честного критерия — в доле α случаев.' },
      power: { t: 'Мощность', en: 'statistical power', d: 'Вероятность, что критерий найдёт эффект, если он есть.' },
      indep: { t: 'Независимость наблюдений', en: 'independence of observations', d: 'Значение одного наблюдения ничего не говорит о другом.' },
      unit: { t: 'Единица анализа', en: 'unit of analysis', d: 'Что считается одним наблюдением, например пользователь.' },
      cluster: { t: 'Кластер наблюдений', en: 'clustered data', d: 'Группа похожих строк одной единицы: сессии пользователя, заказы клиента.' },
      perm: { t: 'Перестановочный тест', en: 'permutation test', d: 'Строит распределение статистики при нулевой гипотезе, перемешивая метки групп.' },
      bootstrap: { t: 'Бутстрэп', en: 'bootstrap', d: 'Перевыборки с возвращением из данных, чтобы оценить разброс любой статистики.' },
      shapiro: { t: 'Тест Шапиро — Уилка', en: 'Shapiro–Wilk test', d: 'Критерий нормальности данных; на больших выборках отвергает её почти всегда.' },
      anova: { t: 'Дисперсионный анализ', en: 'ANOVA', d: 'Обобщение t-теста на три группы и больше: равны ли все средние.' },
      regression: { t: 'Линейная регрессия', en: 'linear regression', d: 'Модель метрики как суммы признаков с коэффициентами.' }
    },
    materials: [
      ['da-6-4-which-test.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/inference/', 'Учебные данные темы 06 — общий набор: здесь нужны ab.csv, paired.csv и их генератор gen_ab.py (зерно 604), он же считает числа сцены'],
      ['data/probability/', 'Учебные данные темы 05 — общий набор: здесь нужны checks.csv и visits.csv'],
      ['which_test.py', 'Семь блоков кода страницы одним скриптом'],
      ['grid.py', 'Сетка интерактива: 125 клеток по 10 000 повторов, зерно 6040, около 10 минут']
    ],
    prompts: [
      ['Выбор критерия', 'Я опишу метрику и вопрос из своей работы. Не называй критерий: веди меня вопросами по дереву из источника, а выбрать и объяснить его предположения попроси меня самого.'],
      ['Проверка понимания', 'Задай мне пять вопросов по источнику о выборе критерия и его предположениях. По одному за раз; после ответа укажи, где я ошибся.'],
      ['Симуляция под мои данные', 'Помоги спланировать симуляцию, как в коде источника: оценить реальный уровень ложных срабатываний критерия на моих данных. Код пиши только после того, как я сам опишу план.']
    ]
  };
})();
