import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'FUXION — Nutrición en movimiento', description: 'Descubre THERMO T3, NOCARB-T y BEAUTY-IN en una experiencia visual de Fuxion.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
