from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import hash_password, verify_password, make_token, get_current_user
from ..seed import seed_defaults

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/status")
def status(db: Session = Depends(get_db)):
    return {"setup_complete": db.query(models.User).count() > 0}


@router.post("/register", response_model=schemas.TokenOut)
def register(body: schemas.RegisterIn, db: Session = Depends(get_db)):
    if db.query(models.User).count() > 0:
        raise HTTPException(403, "Account already exists. Please log in.")
    user = models.User(
        username=body.username.strip().lower(),
        name=body.name.strip(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    seed_defaults(db)
    return {"token": make_token(user.id), "name": user.name, "username": user.username}


@router.post("/login", response_model=schemas.TokenOut)
def login(body: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == body.username.strip().lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Wrong username or password")
    return {"token": make_token(user.id), "name": user.name, "username": user.username}


@router.get("/me")
def me(user: models.User = Depends(get_current_user)):
    return {"username": user.username, "name": user.name}
