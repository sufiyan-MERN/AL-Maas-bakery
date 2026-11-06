import Menu from '@/components/Menu'

export const metadata = {
  title: 'Menu | Al Maas Bakery',
  description: 'Explore our full menu of artisanal breads, pastries, cookies, and handcrafted cakes.',
}

export default function MenuPage() {
  return (
    <main style={{ paddingTop: '80px' }}>
      <Menu />
    </main>
  )
}

