from datetime import date, datetime
from pydantic import BaseModel, Field


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=128)
    name: str = ""


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    token: str
    name: str
    username: str


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    icon: str = "package"
    color: str = "#34d399"
    kind: str = "want"


class CategoryOut(CategoryIn):
    id: int

    class Config:
        from_attributes = True


class ExpenseIn(BaseModel):
    amount: float = Field(gt=0)
    note: str = ""
    date: date
    category_id: int


class ExpenseOut(ExpenseIn):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecurringIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    amount: float = Field(gt=0)
    day_of_month: int = Field(ge=1, le=28, default=1)
    category_id: int
    active: bool = True


class RecurringOut(RecurringIn):
    id: int

    class Config:
        from_attributes = True


class SettingsIn(BaseModel):
    monthly_salary: float = Field(ge=0)
    savings_pct: float = Field(ge=0, le=100)
    needs_pct: float = Field(ge=0, le=100)
    wants_pct: float = Field(ge=0, le=100)


class SettingsOut(SettingsIn):
    currency: str = "INR"

    class Config:
        from_attributes = True
