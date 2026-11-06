/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Fallback declarations when node_modules is not yet installed
declare module 'next/link' {
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

declare module 'next/image' {
  const Image: any
  export default Image
}

