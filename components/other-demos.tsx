'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CupSoda,
  Flower2,
  IceCreamCone,
  MapPin,
  Minus,
  Plus,
  Sandwich,
  Search,
  ShoppingBag,
  Soup,
  Truck,
} from 'lucide-react';
import { photo } from '@avengee/domain';
import { DemoBar } from '@/components/demo-bar';

type Demo = 'massage' | 'delivery' | 'shop';
const treatments = [
  { name: 'The Unwind', detail: 'A slow, full-body reset · 60 min', price: 1200 },
  { name: 'Deep Ease', detail: 'Targeted pressure, lasting relief · 90 min', price: 1750 },
  {
    name: 'Herbal Compress',
    detail: 'Warm botanicals and gentle stretching · 90 min',
    price: 1950,
  },
];
const dishes = [
  { name: 'Crispy pork rice bowl', place: 'Little Wok · Thai', price: 185, icon: Soup },
  { name: 'Miso mushroom toast', place: 'Daybreak Cafe · Brunch', price: 220, icon: Sandwich },
  { name: 'Mango sticky rice', place: 'Soi Sweets · Dessert', price: 95, icon: IceCreamCone },
  { name: 'Iced pandan latte', place: 'Daybreak Cafe · Drinks', price: 110, icon: CupSoda },
];
const products = [
  {
    name: 'Everyday stoneware',
    type: 'Hand-finished · Set of 2',
    price: 890,
    image: 'photo-1578749556568-bc2c40e68b61',
  },
  {
    name: 'Sunday market tote',
    type: 'Natural cotton · One size',
    price: 650,
    image: 'photo-1590874103328-eac38a683ce7',
  },
  {
    name: 'Linen table runner',
    type: 'Soft washed linen · Sand',
    price: 1250,
    image: 'photo-1600210492486-724fe5c67fb0',
  },
];
const brand = {
  massage: {
    name: 'Still House',
    wordmark: 'still house',
    kind: 'Massage booking',
    next: { href: '/delivery', name: 'Good Neighbor' },
  },
  delivery: {
    name: 'Good Neighbor',
    wordmark: 'good neighbor',
    kind: 'Food delivery',
    next: { href: '/shop', name: 'Sunday Goods' },
  },
  shop: {
    name: 'Sunday Goods',
    wordmark: 'sunday goods',
    kind: 'E-commerce',
    next: { href: '/erp', name: 'Sunday Goods ERP' },
  },
} as const;
const baht = (value: number) => `฿${value.toLocaleString('en-US')}`;

export default function OtherDemo({ kind }: { kind: Demo }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [day, setDay] = useState('Today, 2 Nov');
  const [time, setTime] = useState('2:30 PM');
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState('');

  const massage = kind === 'massage';
  const delivery = kind === 'delivery';
  const site = brand[kind];
  const title = massage
    ? 'A little time, just for you.'
    : delivery
      ? 'Your neighborhood, at your door.'
      : 'Objects for slower living.';
  const subtitle = massage
    ? 'A thoughtful treatment, a time that works, and space to exhale.'
    : delivery
      ? 'Good food from the places around the corner. Delivered while it’s still warm.'
      : 'Small batch pieces made to be used, loved, and kept close.';
  const list = massage ? treatments : delivery ? dishes : products;
  const total = list.reduce((sum, item) => sum + item.price * (cart[item.name] || 0), 0);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const visible = list.filter((item) =>
    `${item.name} ${'place' in item ? item.place : 'detail' in item ? item.detail : 'type' in item ? item.type : ''}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const treatment = picked === null ? null : treatments[picked];
  const reserve = () => setDone(true);

  return (
    <main className={`other-demo ${kind}`} lang="en">
      <DemoBar name={site.name} kind={site.kind} next={site.next} />
      <header className="other-nav">
        <Link href={`/${kind}`} className="other-wordmark">
          {site.wordmark}
        </Link>
        <span>
          {massage
            ? 'STILL HOUSE · BANGKOK'
            : delivery
              ? 'GOOD NEIGHBOR · BANGKOK'
              : 'SUNDAY GOODS · OBJECTS FOR HOME'}
        </span>
        <span aria-live={kind === 'shop' ? 'polite' : undefined}>
          {massage ? (
            'Your quiet place'
          ) : delivery ? (
            'Delivering in 25–35 min'
          ) : (
            <>
              <ShoppingBag size={15} aria-hidden /> Bag · {count}
            </>
          )}
        </span>
      </header>
      {done ? (
        <section className="other-success">
          <div>
            <Check size={28} aria-hidden />
          </div>
          <small>
            {massage ? 'YOUR TIME IS RESERVED' : delivery ? 'ORDER RECEIVED' : 'ORDER CONFIRMED'}
          </small>
          <h1>
            {massage
              ? 'We saved you a little space.'
              : delivery
                ? 'Good things are on the way.'
                : 'A lovely choice.'}
          </h1>
          <p>
            {massage
              ? `${treatment?.name} · ${day} at ${time}`
              : delivery
                ? `Your order is headed to ${address || 'your neighborhood'}. Estimated arrival: 25–35 minutes.`
                : 'Your demo order is confirmed and being wrapped with care.'}
          </p>
          <b>{baht(massage ? (treatment?.price ?? 0) : total)} · Demo only</b>
          <button onClick={() => setDone(false)}>
            Back to {massage ? 'treatments' : 'shopping'}
          </button>
        </section>
      ) : (
        <>
          <section className={`other-hero ${kind}-hero`}>
            <div>
              <small>
                {massage
                  ? 'A STILL HOUSE RITUAL'
                  : delivery
                    ? 'THE GOOD STUFF, CLOSE BY'
                    : 'THOUGHTFUL THINGS, MADE WELL'}
              </small>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <span className="other-hero-symbol" aria-hidden>
              {massage ? <Flower2 /> : delivery ? <Truck /> : <ShoppingBag />}
            </span>
          </section>
          <section className="other-content">
            <header className="other-content-head">
              <div>
                <small>
                  {massage
                    ? 'CHOOSE YOUR RITUAL'
                    : delivery
                      ? 'A FEW LOCAL FAVORITES'
                      : 'THE SUNDAY EDIT'}
                </small>
                <h2>{massage ? 'Treatments' : delivery ? 'Made nearby' : 'Made to last'}</h2>
              </div>
              <label className="other-search">
                <Search size={16} aria-hidden />
                <input
                  aria-label={
                    delivery
                      ? 'Search dishes or places'
                      : massage
                        ? 'Search treatments'
                        : 'Search products'
                  }
                  placeholder={delivery ? 'Search dishes or places' : 'Find something'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </header>
            {visible.length === 0 ? (
              <div className="empty-state other-empty" role="status">
                <Search size={28} aria-hidden />
                <p>Nothing matches “{query}”</p>
                <button className="button secondary button-sm" onClick={() => setQuery('')}>
                  Clear search
                </button>
              </div>
            ) : (
              <div className={`other-items ${massage ? 'massage-items' : ''}`}>
                {visible.map((item) => {
                  const index = treatments.findIndex((t) => t.name === item.name);
                  const chosen = massage && picked === index;
                  const DishIcon = 'icon' in item ? item.icon : null;
                  return (
                    <article
                      className={`other-item ${chosen ? 'is-selected' : ''}`}
                      key={item.name}
                    >
                      {massage ? (
                        <div className="treatment-icon" aria-hidden>
                          <Flower2 />
                        </div>
                      ) : delivery ? (
                        <div className="dish-emoji" aria-hidden>
                          {DishIcon && <DishIcon size={30} strokeWidth={1.4} />}
                        </div>
                      ) : (
                        <img
                          src={photo('image' in item ? item.image : '', 700)}
                          alt={item.name}
                          loading="lazy"
                          className="product-image"
                        />
                      )}
                      <div className="other-item-info">
                        <small>
                          {massage
                            ? 'SIGNATURE TREATMENT'
                            : delivery && 'place' in item
                              ? item.place
                              : 'type' in item
                                ? item.type
                                : ''}
                        </small>
                        <h3>{item.name}</h3>
                        <p>
                          {massage && 'detail' in item
                            ? item.detail
                            : delivery
                              ? 'A local favorite, made fresh today.'
                              : 'Thoughtfully made in small batches.'}
                        </p>
                        <strong>{baht(item.price)}</strong>
                      </div>
                      {massage ? (
                        <button
                          className={`other-select ${chosen ? 'chosen' : ''}`}
                          aria-pressed={chosen}
                          onClick={() => setPicked(index)}
                        >
                          {chosen && <Check size={14} aria-hidden />}
                          {chosen ? 'Selected' : 'Choose'}
                        </button>
                      ) : (
                        <div className="quantity-control">
                          <button
                            aria-label={`Remove ${item.name}`}
                            onClick={() =>
                              setCart({
                                ...cart,
                                [item.name]: Math.max(0, (cart[item.name] || 0) - 1),
                              })
                            }
                          >
                            <Minus size={14} aria-hidden />
                          </button>
                          <span>{cart[item.name] || 0}</span>
                          <button
                            aria-label={`Add ${item.name}`}
                            onClick={() =>
                              setCart({ ...cart, [item.name]: (cart[item.name] || 0) + 1 })
                            }
                          >
                            <Plus size={14} aria-hidden />
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            {massage ? (
              <section className="booking-panel">
                <div>
                  <small>WHEN WORKS FOR YOU?</small>
                  <label>
                    Date
                    <select value={day} onChange={(e) => setDay(e.target.value)}>
                      <option>Today, 2 Nov</option>
                      <option>Tomorrow, 3 Nov</option>
                      <option>Wednesday, 4 Nov</option>
                    </select>
                  </label>
                </div>
                <div>
                  <small>TAKE YOUR TIME</small>
                  <label>
                    Available times
                    <select value={time} onChange={(e) => setTime(e.target.value)}>
                      {['11:00 AM', '2:30 PM', '4:00 PM', '6:30 PM'].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="booking-total">
                  <small>
                    {treatment ? `${treatment.name} · 1 guest` : 'Pick a treatment above'}
                  </small>
                  <strong>{treatment ? baht(treatment.price) : '—'}</strong>
                </div>
                <button className="other-cta" disabled={!treatment} onClick={reserve}>
                  Reserve my time <ArrowRight size={16} aria-hidden />
                </button>
              </section>
            ) : delivery ? (
              <section className="delivery-checkout">
                <label>
                  <MapPin size={16} aria-hidden />
                  Delivery address
                  <input
                    placeholder="Street, building, room"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </label>
                <strong>{baht(total)}</strong>
                <button
                  className="other-cta"
                  disabled={total === 0 || !address.trim()}
                  onClick={reserve}
                >
                  Place demo order <ArrowRight size={16} aria-hidden />
                </button>
              </section>
            ) : (
              <section className="delivery-checkout">
                <span>{count} items in your bag</span>
                <strong>{baht(total)}</strong>
                <button className="other-cta" disabled={total === 0} onClick={reserve}>
                  Checkout <ArrowRight size={16} aria-hidden />
                </button>
              </section>
            )}
            <p className="other-demo-note">
              A fictional {massage ? 'studio' : delivery ? 'delivery service' : 'shop'} for the
              Avengee demo. No real payment is collected.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
