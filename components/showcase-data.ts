export type Showcase = {
  id: string;
  href: string;
  name: string;
  category: string;
  kind: string;
  title: string;
  text: string;
  cta: string;
  ctaEn: string;
  alt: string;
};

/** The six live demos, in the order the carousel and the demo bar chain them. */
export const showcases: Showcase[] = [
  {
    id: 'serein',
    href: '/stays',
    name: 'Serein',
    category: 'ท่องเที่ยวและการบริการ',
    kind: 'Hotel booking',
    title: 'พักผ่อนในแบบที่เป็นคุณ',
    text: 'ค้นหาที่พักที่คัดสรรมาแล้ว จอง และจัดการการเดินทางได้ครบทุกขั้นตอน',
    cta: 'ลองใช้ Serein',
    ctaEn: 'Explore hotel demo',
    alt: 'Serein hotel booking home page with a resort pool hero and a stay search form',
  },
  {
    id: 'goodtime',
    href: '/tickets',
    name: 'Goodtime',
    category: 'ระบบจำหน่ายบัตร',
    kind: 'Ticketing',
    title: 'เลือกอีเวนต์ จองบัตรได้ในไม่กี่ขั้น',
    text: 'ตั้งแต่ค้นหาอีเวนต์ เลือกจำนวนบัตร ไปจนถึงรับบัตรดิจิทัล',
    cta: 'ดูอีเวนต์',
    ctaEn: 'Explore events',
    alt: 'Goodtime ticketing home page with a sage hero and upcoming event cards',
  },
  {
    id: 'still-house',
    href: '/massage',
    name: 'Still House',
    category: 'ระบบจองบริการนวด',
    kind: 'Massage booking',
    title: 'เลือกบริการและเวลาที่สะดวก',
    text: 'เลือกทรีตเมนต์ วัน และเวลาที่ว่าง แล้วจองได้ในหน้าเดียว',
    cta: 'จองบริการ',
    ctaEn: 'Book a treatment',
    alt: 'Still House massage booking page with a treatment list and booking panel',
  },
  {
    id: 'good-neighbor',
    href: '/delivery',
    name: 'Good Neighbor',
    category: 'แพลตฟอร์มเดลิเวอรี',
    kind: 'Food delivery',
    title: 'สั่งร้านโปรด ส่งตรงถึงบ้าน',
    text: 'ค้นหาเมนูจากร้านใกล้บ้าน ใส่ตะกร้า และสั่งพร้อมที่อยู่จัดส่ง',
    cta: 'สั่งอาหาร',
    ctaEn: 'Browse local food',
    alt: 'Good Neighbor food delivery page with a warm hero and a menu of local dishes',
  },
  {
    id: 'sunday-goods',
    href: '/shop',
    name: 'Sunday Goods',
    category: 'อีคอมเมิร์ซ',
    kind: 'E-commerce',
    title: 'เลือกซื้อสินค้าดีไซน์เรียบง่าย',
    text: 'หน้าร้านที่เรียบง่าย ปรับจำนวนสินค้า และชำระเงินได้ลื่นไหล',
    cta: 'เลือกซื้อ',
    ctaEn: 'Explore the shop',
    alt: 'Sunday Goods shop page with product photos and a cart summary',
  },
  {
    id: 'sunday-goods-erp',
    href: '/erp',
    name: 'Sunday Goods ERP',
    category: 'ระบบจัดการธุรกิจ (ERP)',
    kind: 'Operations workspace',
    title: 'เห็นภาพรวมธุรกิจในที่เดียว',
    text: 'ติดตามยอดขาย คำสั่งซื้อ และสต็อกสินค้าในแดชบอร์ดเดียว',
    cta: 'เปิดระบบ',
    ctaEn: 'Open workspace',
    alt: 'Sunday Goods ERP dashboard with revenue metrics, recent orders and stock watch',
  },
];
