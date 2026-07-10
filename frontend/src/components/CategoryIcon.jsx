import {
  Utensils, ShoppingBasket, Home, Car, Plug, HeartPulse,
  GraduationCap, Tv, Clapperboard, ShoppingBag, Plane, Package
} from 'lucide-react'

const MAP = {
  utensils: Utensils,
  'shopping-basket': ShoppingBasket,
  home: Home,
  car: Car,
  plug: Plug,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  tv: Tv,
  clapperboard: Clapperboard,
  'shopping-bag': ShoppingBag,
  plane: Plane,
  package: Package
}

export default function CategoryIcon({ icon, color, size = 16 }) {
  const Ico = MAP[icon] || Package
  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: (color || '#888') + '22', color: color || '#888' }}
    >
      <Ico size={size} />
    </span>
  )
}
