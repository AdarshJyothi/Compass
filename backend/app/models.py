from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, default="")
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    icon = Column(String, default="package")
    color = Column(String, default="#34d399")
    kind = Column(String, default="want")
    expenses = relationship("Expense", back_populates="category")


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    amount = Column(Float, nullable=False)
    note = Column(String, default="")
    date = Column(Date, default=date.today, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    category = relationship("Category", back_populates="expenses")


class Recurring(Base):
    __tablename__ = "recurring"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    day_of_month = Column(Integer, default=1)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    active = Column(Boolean, default=True)
    category = relationship("Category")


class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True)
    monthly_salary = Column(Float, default=0.0)
    savings_pct = Column(Float, default=20.0)
    needs_pct = Column(Float, default=50.0)
    wants_pct = Column(Float, default=30.0)
    currency = Column(String, default="INR")
