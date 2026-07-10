from sqlalchemy.orm import Session
from . import models

DEFAULT_CATEGORIES = [
    ("Food & dining", "utensils", "#34d399", "need"),
    ("Groceries", "shopping-basket", "#5dcaa5", "need"),
    ("Rent & housing", "home", "#378add", "need"),
    ("Transport", "car", "#7f77dd", "need"),
    ("Utilities", "plug", "#efa227", "need"),
    ("Health", "heart-pulse", "#e24b4a", "need"),
    ("Education", "graduation-cap", "#1d9e75", "need"),
    ("Subscriptions", "tv", "#ed93b1", "want"),
    ("Entertainment", "clapperboard", "#d4537e", "want"),
    ("Shopping", "shopping-bag", "#f0997b", "want"),
    ("Travel", "plane", "#85b7eb", "want"),
    ("Other", "package", "#888780", "want"),
]


def seed_defaults(db: Session):
    if db.query(models.Category).count() == 0:
        for name, icon, color, kind in DEFAULT_CATEGORIES:
            db.add(models.Category(name=name, icon=icon, color=color, kind=kind))
        db.commit()
    if db.query(models.Settings).count() == 0:
        db.add(models.Settings())
        db.commit()
