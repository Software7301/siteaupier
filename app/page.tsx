import HomeContent from '@/components/HomeContent'

// Veículos em DESTAQUE para a Home (apenas os 3 marcados)
const featuredCars = [
  {
    id: 'esp-1',
    name: 'BMW X5 M Sport',
    brand: 'BMW',
    model: 'X5',
    year: 2024,
    price: 589000,
    category: 'ESPORTIVO',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    mileage: 0,
    fuel: 'GASOLINA',
    transmission: 'AUTOMATIC',
    featured: true,
  },
  {
    id: 'esp-2',
    name: 'Mercedes-Benz C300',
    brand: 'Mercedes-Benz',
    model: 'C300',
    year: 2023,
    price: 389000,
    category: 'ESPORTIVO',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    mileage: 12000,
    fuel: 'GASOLINA',
    transmission: 'AUTOMATIC',
    featured: true,
  },
  {
    id: 'esp-3',
    name: 'BMW M5 Competition',
    brand: 'BMW',
    model: 'M5',
    year: 2024,
    price: 899000,
    category: 'ESPORTIVO',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    mileage: 0,
    fuel: 'GASOLINA',
    transmission: 'AUTOMATIC',
    featured: true,
  },
]

export default function HomePage() {
  return <HomeContent featuredCars={featuredCars} />
}
