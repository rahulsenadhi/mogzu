import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const routesPath = path.join(__dirname, '../src/app/routes.tsx')
let src = fs.readFileSync(routesPath, 'utf8')

const SKIP = new Set([
  '/',
  '/login',
  '/signup',
  '/welcome',
  '/giev',
  '/why-mogzu',
  '/vendor-benefits',
  '/vendor-apply',
  '/admin/login',
  '/shortlist/:token',
])

const SKIP_PREFIX = [
  '/auth/',
  '/signup/',
  '/admin',
  '/vendor',
  '/partner',
  '/am/',
  '/p/',
  '/blog',
  '/quick-share',
  '/field-agent',
  '/agent/',
  '/accept-invite',
  '/booking-tracker',
]

function skip(path) {
  if (SKIP.has(path)) return true
  return SKIP_PREFIX.some((p) => path === p || path.startsWith(p + '/') || path.startsWith(p))
}

const re = /\{\s*\n\s*path:\s*"([^"]+)",\s*\n\s*element:\s*([^,\n]+),\s*\n\s*errorElement:/g
src = src.replace(re, (full, routePath, elementPart) => {
  if (skip(routePath)) return full
  const el = elementPart.trim()
  if (el.startsWith('corp(') || el.startsWith('vend(') || el.startsWith('adminPage(') || el.startsWith('redirectTo('))
    return full
  if (el.startsWith('<Navigate')) return full
  return full.replace(elementPart, `corp(${el})`)
})

// notifications redirect
src = src.replace(
  /path: "\/notifications",\s*\n\s*element: corp\(<NotificationsPage \/>\),\s*\n\s*errorElement:/,
  'path: "/notifications",\n    element: redirectTo("/corporate/notifications"),\n    errorElement:',
)
src = src.replace(
  /path: "\/notifications",\s*\n\s*element: <NotificationsPage \/>,\s*\n\s*errorElement:/,
  'path: "/notifications",\n    element: redirectTo("/corporate/notifications"),\n    errorElement:',
)

fs.writeFileSync(routesPath, src)
console.log('pass2 done')
