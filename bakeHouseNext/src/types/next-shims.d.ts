declare module 'next/link' {
  import type { ComponentType, AnchorHTMLAttributes, ReactNode } from 'react'
  export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: any
    as?: any
    replace?: boolean
    scroll?: boolean
    shallow?: boolean
    passHref?: boolean
    prefetch?: boolean
    locale?: string | false
    legacyBehavior?: boolean
    children?: ReactNode
  }
  const Link: any
  export default Link
}

declare module 'next/navigation' {
  export const useRouter: any
  export const usePathname: any
  export const useSearchParams: any
  export const useParams: any
  export const redirect: any
  export const notFound: any
}

declare module 'next/image' {
  const Image: any
  export default Image
}

declare module 'lucide-react' {
  export const ArrowRight: any
  export const ShoppingBag: any
  export const ShoppingCart: any
  export const Menu: any
  export const X: any
  export const Plus: any
  export const Minus: any
  export const Trash2: any
  export const Phone: any
  export const MessageCircle: any
  export const MapPin: any
  export const CheckCircle: any
  export const AlertCircle: any
  export const Eye: any
  export const EyeOff: any
  export const Lock: any
  export const Clock: any
  export const Search: any
  export const RefreshCw: any
  export const Edit: any
  export const Trash: any
  export const Check: any
  export const Download: any
  export const Upload: any
  export const Settings: any
  export const Users: any
  export const DollarSign: any
  export const TrendingUp: any
  export const Package: any
  export const Calendar: any
  export const Filter: any
  export const ChevronDown: any
  export const ChevronRight: any
  export const ChevronLeft: any
  export const LogOut: any
  export const ExternalLink: any
  export const HelpCircle: any
  export const Info: any
  export const Globe: any
  export const Camera: any
  const icons: Record<string, any>
  export default icons
}
