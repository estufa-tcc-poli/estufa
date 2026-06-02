Import("env")
from pathlib import Path

data_dir = Path(env.subst("$PROJECT_DIR")) / "data"
required = ("index.html", "style.css", "app.js")
missing = [name for name in required if not (data_dir / name).is_file()]
if missing:
    raise SystemExit(
        "Pasta data/ incompleta. Arquivos ausentes: "
        + ", ".join(missing)
        + ". Execute o upload do filesystem apos gravar o firmware."
    )
