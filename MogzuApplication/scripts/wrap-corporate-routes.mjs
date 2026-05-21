import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const routesPath = path.join(__dirname, '../src/app/routes.tsx')
let src = fs.readFileSync(routesPath, 'utf8')

if (!src.includes('routeWrappers')) {
  src = src.replace(
    "import { CorporateRoute, VendorRoute, AdminRoute } from '@/app/components/auth/ProtectedRoute'",
    "import { CorporateRoute, VendorRoute, AdminRoute } from '@/app/components/auth/ProtectedRoute'\nimport { corp, vend, adminPage, redirectTo } from '@/app/lib/routeWrappers'",
  )
}

// CorporateModuleRouteGuard -> corp()
src = src.replace(
  /<CorporateModuleRouteGuard moduleKey="([^"]+)">\s*\n\s*(<[^/][^>]*\s*\/>|(?:<[\w]+[^>]*>[\s\S]*?<\/[\w]+>))\s*\n\s*<\/CorporateModuleRouteGuard>/g,
  (_, key, inner) => `corp(${inner.trim()}, '${key}')`,
)

// <CorporateRoute><X /></CorporateRoute> -> corp(<X />)
src = src.replace(/<CorporateRoute>([\s\S]*?)<\/CorporateRoute>/g, (_, inner) => `corp(${inner.trim()})`)

const PUBLIC_PREFIXES = [
  '/',
  '/login',
  '/signup',
  '/welcome',
  '/auth/',
  '/admin',
  '/vendor',
  '/partner',
  '/am/',
  '/p/',
  '/blog',
  '/vendor-apply',
  '/vendor-benefits',
  '/why-mogzu',
  '/giev',
  '/quick-share',
  '/field-agent',
  '/agent/',
  '/accept-invite',
  '/booking-tracker',
  '/vendor-passport',
  '/public/',
]

function isCorporatePath(p) {
  if (p === '*' || p.includes(':') && p.startsWith('/shortlist')) return p === '/shortlist/:token' ? false : false
  if (PUBLIC_PREFIXES.some((pre) => p === pre || (pre.endsWith('/') ? p.startsWith(pre) : p.startsWith(pre + '/') || p === pre)))
    return false
  if (p.startsWith('/signup/')) return false
  if (p === '/shortlist/:token') return false
  return true
}

// Wrap simple element: <Component /> for corporate paths
src = src.replace(
  /path:\s*"([^"]+)",\s*\n\s*element:\s*(<(?:Navigate|corp|vend|adminPage)[^>]*\/?>[\s\S]*?),\s*\n\s*errorElement:/g,
  (block, routePath) => block,
)

// Simpler: only wrap `element: <Foo />` lines where path is corporate
const routeBlockRe = /\{\s*\n\s*path:\s*"([^"]+)",\s*\n\s*element:\s*([^,]+),\s*\n\s*errorElement:/g
src = src.replace(routeBlockRe, (full, routePath, elementPart) => {
  const el = elementPart.trim()
  if (!isCorporatePath(routePath)) return full
  if (el.startsWith('corp(') || el.startsWith('vend(') || el.startsWith('adminPage(') || el.startsWith('redirectTo('))
    return full
  if (el.startsWith('<Navigate')) return full
  if (el.includes('CorporateModuleRouteGuard')) return full
  return full.replace(elementPart, `corp(${el})`)
})

fs.writeFileSync(routesPath, src)
console.log('Updated routes.tsx')
