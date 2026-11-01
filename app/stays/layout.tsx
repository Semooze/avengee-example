import { StayFooter, StayHeader } from '@/components/stay-shell';
export default function StayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stay-site">
      <StayHeader />
      {children}
      <StayFooter />
    </div>
  );
}
