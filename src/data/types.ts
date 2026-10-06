export type Category =
  | 'artisan-breads'
  | 'bun'
  | 'puff'
  | 'viennoiserie'
  | 'spreads'
  | 'muffin'
  | 'tea-cake'
  | 'cookie'
  | 'cupcake'
  | 'macaron'
  | 'soaked-cake'
  | 'pastry'
  | 'brownie'
  | 'fermented-drink'
  | 'cheese-cake'
  | 'celebration-cakes'

export interface Product {
  id: string
  name: string
  category: Category
  description: string
  price: number
  weight?: string
  image: string
}

export interface CartItem extends Product {
  quantity: number
}
