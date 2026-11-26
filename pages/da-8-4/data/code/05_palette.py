import numpy as np
from itertools import combinations
from matplotlib.colors import to_rgb

# Матрица Machado и др. (2009) для дейтеранопии, применяется к линейному RGB
M = np.array([[0.367322, 0.860646, -0.227968],
              [0.280085, 0.672501, 0.047413],
              [-0.011820, 0.042940, 0.968881]])
XYZ = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])

def lab(hex_, deut=False):
    c = np.array(to_rgb(hex_))
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)  # sRGB → линейный
    if deut:
        c = np.clip(M @ c, 0, 1)
    t = XYZ @ c / np.array([0.95047, 1.0, 1.08883])
    f = np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])

def merged(pal, thr=10):
    """Пары цветов, которые после моделирования дейтеранопии ближе thr по ΔE (CIELAB)."""
    return [f"{a}~{b}" for a, b in combinations(pal, 2)
            if np.linalg.norm(lab(a, True) - lab(b, True)) < thr]

palettes = {
    "tab10 (по умолчанию)": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
                             "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    "цвета интерфейса": ["#2f6db5", "#d27a12", "#17895f", "#c2417a",
                        "#7b5bd6", "#a8860f", "#23919f"],
    "стиль учебника": plt.rcParams["axes.prop_cycle"].by_key()["color"],
    "серый + акцент": [GREY, ACCENT],
}
for name, pal in palettes.items():
    pairs = merged(pal)
    print(f"{name:21} {len(pal):2} цветов, близких пар {len(pairs)}: {' '.join(pairs) or '—'}")
