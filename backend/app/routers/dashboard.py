from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_user
from ..services.budget import compute_dashboard

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


@router.get("")
def dashboard(db: Session = Depends(get_db)):
    return compute_dashboard(db)
