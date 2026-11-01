import { hotels } from '@avengee/domain';
import { notFound } from 'next/navigation';
import HotelDetail from '@/components/hotel-detail';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: hotels.find((h) => h.id === id)?.name || 'Stay not found' };
}
export default async function HotelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const hotel = hotels.find((h) => h.id === id);
  if (!hotel) notFound();
  const entries = Object.entries(query).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return <HotelDetail hotel={hotel} query={new URLSearchParams(entries).toString()} />;
}
