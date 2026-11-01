export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  stock: number;
  size: number;
  bed: string;
  image: string;
}
export interface Hotel {
  id: string;
  name: string;
  destination: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  rating: number;
  reviews: number;
  category: string;
  amenities: string[];
  rooms: Room[];
}
export interface BookingInput {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  idempotencyKey: string;
}
export interface Booking extends Omit<BookingInput, 'idempotencyKey'> {
  id: string;
  hotelName: string;
  roomName: string;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  token?: string;
}
export const photo = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const coast = photo('photo-1571896349842-33c89424de2d');
const bedroom = photo('photo-1611892440504-42a792e24d32');
const pool = photo('photo-1576013551627-0cc20b96c2a7');
const room = (id: string, name: string, price: number, capacity = 2, stock = 4): Room => ({
  id,
  name,
  price,
  capacity,
  stock,
  size: capacity > 2 ? 64 : 38,
  bed: capacity > 2 ? 'Two king beds' : 'One king bed',
  description:
    'Soft linens, a private terrace, and space to slow down. Breakfast for every guest is included.',
  image: bedroom,
});
export const hotels: Hotel[] = [
  {
    id: 'the-tide',
    name: 'The Tide House',
    destination: 'Phuket',
    region: 'Kata Noi Beach',
    tagline: 'A little closer to the ocean.',
    description:
      'Wake to the Andaman Sea, wander down to a quiet stretch of sand, and let the day unfold at its own pace. The Tide House pairs thoughtful Thai hospitality with sun-filled rooms and an easy, barefoot rhythm.',
    image: coast,
    gallery: [coast, bedroom, pool],
    rating: 4.9,
    reviews: 128,
    category: 'Beachfront',
    amenities: ['Pool', 'Beach access', 'Spa', 'Breakfast', 'Wi-Fi'],
    rooms: [
      room('tide-garden', 'Garden terrace', 4200),
      { ...room('tide-pool', 'Private pool suite', 7800, 2, 1), image: pool, size: 72 },
      room('tide-family', 'Family sea-view suite', 9200, 4, 2),
    ],
  },
  {
    id: 'banyan-retreat',
    name: 'Banyan Retreat',
    destination: 'Chiang Mai',
    region: 'Mae Rim Valley',
    tagline: 'Find your quiet in the green.',
    description:
      'A small hillside sanctuary framed by forest and mountain air. Spend mornings over locally grown coffee, afternoons by the pool, and evenings discovering the flavors of northern Thailand.',
    image: photo('photo-1540541338287-41700207dee6'),
    gallery: [photo('photo-1540541338287-41700207dee6'), bedroom, pool],
    rating: 4.8,
    reviews: 96,
    category: 'Nature retreat',
    amenities: ['Pool', 'Spa', 'Breakfast', 'Wi-Fi'],
    rooms: [
      room('banyan-garden', 'Forest pavilion', 3600),
      room('banyan-family', 'Two-bedroom pavilion', 6400, 4, 2),
    ],
  },
  {
    id: 'baan-samui',
    name: 'Baan Samui',
    destination: 'Koh Samui',
    region: 'Bophut Beach',
    tagline: 'Island days, beautifully unhurried.',
    description:
      'Tucked behind palms on a peaceful bay, Baan Samui is a collection of intimate villas made for long breakfasts and saltwater swims. Fisherman’s Village is a short stroll away.',
    image: photo('photo-1542314831-068cd1dbfeeb'),
    gallery: [photo('photo-1542314831-068cd1dbfeeb'), pool, bedroom],
    rating: 4.9,
    reviews: 84,
    category: 'Island escape',
    amenities: ['Pool', 'Beach access', 'Breakfast', 'Wi-Fi'],
    rooms: [
      room('samui-villa', 'Palm garden villa', 5100),
      room('samui-ocean', 'Ocean family villa', 8900, 4, 2),
    ],
  },
  {
    id: 'river-lane',
    name: 'River Lane',
    destination: 'Bangkok',
    region: 'Charoen Krung',
    tagline: 'A different side of the city.',
    description:
      'A considered city hideaway near the Chao Phraya. Explore creative neighborhoods, return for a rooftop swim, and watch the river lights come alive from your window.',
    image: photo('photo-1566073771259-6a8506099945'),
    gallery: [photo('photo-1566073771259-6a8506099945'), bedroom, pool],
    rating: 4.7,
    reviews: 214,
    category: 'City hideaway',
    amenities: ['Pool', 'Breakfast', 'Wi-Fi', 'Restaurant'],
    rooms: [
      room('river-studio', 'Riverside studio', 2800),
      room('river-suite', 'Corner family suite', 5400, 4),
    ],
  },
  {
    id: 'limestone',
    name: 'Limestone Cove',
    destination: 'Krabi',
    region: 'Railay Bay',
    tagline: 'Somewhere wonderfully tucked away.',
    description:
      'Dramatic limestone cliffs meet a gentle turquoise bay. This intimate beach retreat brings you close to the landscape, with airy suites, kayaking, and dinners inspired by the sea.',
    image: photo('photo-1582719478250-c89cae4dc85b'),
    gallery: [photo('photo-1582719478250-c89cae4dc85b'), coast, bedroom],
    rating: 4.8,
    reviews: 73,
    category: 'Beachfront',
    amenities: ['Beach access', 'Spa', 'Breakfast', 'Wi-Fi'],
    rooms: [
      room('cove-suite', 'Cove suite', 4600),
      room('cove-family', 'Cliffside family suite', 7200, 4),
    ],
  },
  {
    id: 'slow-house',
    name: 'The Slow House',
    destination: 'Chiang Mai',
    region: 'Old City',
    tagline: 'Stay a little, feel at home.',
    description:
      'A welcoming courtyard house in the heart of the old city. Handmade details, a leafy garden, and friendly local hosts make this a natural base for a slower kind of discovery.',
    image: photo('photo-1618773928121-c32242e63f39'),
    gallery: [photo('photo-1618773928121-c32242e63f39'), bedroom, pool],
    rating: 4.9,
    reviews: 61,
    category: 'Design stay',
    amenities: ['Breakfast', 'Wi-Fi', 'Restaurant'],
    rooms: [
      room('slow-courtyard', 'Courtyard room', 2400),
      room('slow-loft', 'Family loft', 4100, 4),
    ],
  },
];
export const destinations = [...new Set(hotels.map((h) => h.destination))];
export function money(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}
export function dateAfter(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}
export function priceFor(room: Room, checkIn: string, checkOut: string) {
  const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
  const subtotal = nights * room.price;
  const tax = Math.round(subtotal * 0.1);
  return { nights, subtotal, tax, total: subtotal + tax };
}
