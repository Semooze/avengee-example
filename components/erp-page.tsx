'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { DemoBar } from '@/components/demo-bar';

const initialOrders = [
  {
    id: 'AV-2048',
    customer: 'Mali House',
    item: 'Linen table runner · Sand',
    amount: 2450,
    status: 'To fulfill',
  },
  {
    id: 'AV-2047',
    customer: 'Niran Studio',
    item: 'Ceramic pour-over set',
    amount: 3890,
    status: 'Processing',
  },
  {
    id: 'AV-2046',
    customer: 'Sunday Supply',
    item: 'Woven market tote',
    amount: 1680,
    status: 'To fulfill',
  },
  {
    id: 'AV-2045',
    customer: 'The Fern Cafe',
    item: 'Stoneware mug · Set of 2',
    amount: 2200,
    status: 'Complete',
  },
];
const inventory = [
  { name: 'Linen table runner', sku: 'LIN-TR-04', count: 8 },
  { name: 'Ceramic pour-over set', sku: 'CER-PO-02', count: 24 },
  { name: 'Woven market tote', sku: 'WOV-MT-01', count: 5 },
  { name: 'Stoneware mug · Set of 2', sku: 'STW-MG-08', count: 42 },
];
const metrics = [
  { title: 'NET REVENUE', value: '฿84,250', change: '↗ 12.8%', icon: CircleDollarSign },
  { title: 'ORDERS', value: '128', change: '↗ 8.2%', icon: ClipboardList },
  { title: 'AVG. ORDER VALUE', value: '฿2,180', change: '↘ 2.4%', icon: CircleDollarSign },
  { title: 'LOW STOCK ITEMS', value: '3', change: 'Needs attention', icon: Warehouse },
];
const statusClass = (status: string) =>
  status === 'Complete' ? 'complete' : status === 'Processing' ? 'processing' : '';

export default function ErpPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [section, setSection] = useState('Overview');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const nav = [
    ['Overview', LayoutDashboard],
    ['Orders', ClipboardList],
    ['Inventory', Boxes],
    ['Customers', Users],
    ['Finance', CircleDollarSign],
  ] as const;
  const filtered = orders.filter((order) =>
    `${order.id} ${order.customer} ${order.item}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <DemoBar
        name="Sunday Goods ERP"
        kind="Operations workspace"
        next={{ href: '/stays', name: 'Serein' }}
      />
      <main className="erp-app" lang="en">
        <aside className="erp-sidebar">
          <div className="erp-workspace">
            <span className="erp-mark" aria-hidden>
              S
            </span>
            <span>
              <b>Sunday Goods</b>
              <small>Workspace</small>
            </span>
            <ChevronDown size={15} aria-hidden />
          </div>
          <span className="erp-nav-label">WORKSPACE</span>
          <nav aria-label="Workspace sections">
            {nav.map(([label, Icon]) => (
              <button
                key={label}
                className={section === label ? 'active' : ''}
                aria-current={section === label ? 'page' : undefined}
                onClick={() => setSection(label)}
              >
                <Icon size={17} aria-hidden />
                {label}
                {label === 'Orders' && <i>4</i>}
              </button>
            ))}
          </nav>
          <div className="erp-sidebar-bottom">
            <button onClick={() => setNotice('Settings are ready to configure in this demo.')}>
              <Settings size={16} aria-hidden />
              Settings
            </button>
            <div className="erp-profile">
              <span aria-hidden>PK</span>
              <b>
                Pim K.<small>Owner</small>
              </b>
              <ChevronDown size={14} aria-hidden />
            </div>
          </div>
        </aside>
        <section className="erp-main">
          <header className="erp-topbar">
            <span className="erp-breadcrumb">
              <span>Sunday Goods</span>
              <ChevronRight size={14} aria-hidden />
              <b>{section}</b>
            </span>
            <div>
              <span className="erp-live">
                <i aria-hidden />
                All systems operational
              </span>
              <button
                className="erp-icon-button"
                aria-label="Notifications"
                onClick={() => setNotice('You’re all caught up.')}
              >
                <Bell size={18} aria-hidden />
              </button>
              <span className="erp-avatar" aria-hidden>
                PK
              </span>
            </div>
          </header>
          <div className="erp-content">
            <div className="erp-welcome">
              <div>
                <small>MONDAY, 2 NOVEMBER 2026</small>
                <h1>{section === 'Overview' ? 'A good morning, Pim.' : section}</h1>
                <p>Here’s what’s happening with your shop today.</p>
              </div>
              <button
                className="button secondary button-sm"
                onClick={() => setNotice('Your report is ready to export.')}
              >
                Export report <ArrowUpRight size={15} aria-hidden />
              </button>
            </div>
            {notice && (
              <div className="erp-notice" role="status">
                <Check size={15} aria-hidden />
                <span>{notice}</span>
                <button aria-label="Dismiss" onClick={() => setNotice('')}>
                  <X size={14} aria-hidden />
                </button>
              </div>
            )}
            <div className="erp-metrics">
              {metrics.map(({ title, value, change, icon: Icon }, index) => (
                <article key={title}>
                  <span>
                    {title}
                    <Icon size={16} aria-hidden />
                  </span>
                  <strong>{value}</strong>
                  <small
                    className={
                      index === 3 ? 'erp-warning' : change.startsWith('↘') ? 'erp-down' : 'erp-up'
                    }
                  >
                    {change} {index === 3 ? 'across 2 locations' : 'vs last month'}
                  </small>
                  <div className={`erp-spark spark-${index}`} aria-hidden>
                    {[28, 40, 34, 56, 45, 66, 52, 74, 60, 80, 68, 94].map((height, i) => (
                      <i style={{ height: `${height}%` }} key={i} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="erp-columns">
              <section className="erp-panel erp-orders">
                <header>
                  <div>
                    <h2>Recent orders</h2>
                    <p>Stay on top of what needs to go out.</p>
                  </div>
                  <button onClick={() => setSection('Orders')}>
                    All orders <ArrowUpRight size={14} aria-hidden />
                  </button>
                </header>
                <label className="erp-search">
                  <Search size={14} aria-hidden />
                  <input
                    placeholder="Search orders"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <div className="erp-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ORDER</th>
                        <th>CUSTOMER</th>
                        <th>ITEM</th>
                        <th className="num">TOTAL</th>
                        <th>STATUS</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <b>{order.id}</b>
                            <small>Today</small>
                          </td>
                          <td>{order.customer}</td>
                          <td>{order.item}</td>
                          <td className="num">฿{order.amount.toLocaleString()}</td>
                          <td>
                            <span className={`erp-status ${statusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button
                              aria-label={`Mark ${order.id} complete`}
                              onClick={() => {
                                setOrders(
                                  orders.map((item) =>
                                    item.id === order.id ? { ...item, status: 'Complete' } : item,
                                  ),
                                );
                                setNotice(`${order.id} marked complete.`);
                              }}
                            >
                              <Check size={14} aria-hidden />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="erp-empty" role="status">
                      <Search size={20} aria-hidden />
                      <p>No orders match your search.</p>
                      <button onClick={() => setQuery('')}>Clear search</button>
                    </div>
                  )}
                </div>
              </section>
              <section className="erp-panel erp-inventory">
                <header>
                  <div>
                    <h2>Stock watch</h2>
                    <p>A little attention goes a long way.</p>
                  </div>
                  <button onClick={() => setSection('Inventory')}>
                    Inventory <ArrowUpRight size={14} aria-hidden />
                  </button>
                </header>
                {inventory.map((item) => (
                  <article className="erp-stock-row" key={item.sku}>
                    <span className="erp-product-icon" aria-hidden>
                      <Package size={16} />
                    </span>
                    <span>
                      <b>{item.name}</b>
                      <small>{item.sku}</small>
                    </span>
                    <strong className={item.count < 10 ? 'low' : ''}>
                      {item.count}
                      <small>units</small>
                    </strong>
                  </article>
                ))}
                <button
                  className="erp-restock"
                  onClick={() => setNotice('Restock reminders added to your task list.')}
                >
                  Review restock list <ArrowUpRight size={14} aria-hidden />
                </button>
              </section>
            </div>
            <footer className="erp-footer">
              Sunday Goods workspace · An Avengee demo
              <span>Demo data · Last synced just now</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
