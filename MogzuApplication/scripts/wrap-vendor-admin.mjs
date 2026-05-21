import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const routesPath = path.join(__dirname, '../src/app/routes.tsx')
let src = fs.readFileSync(routesPath, 'utf8')

const VENDOR_PUBLIC = new Set([
  '/vendor/welcome',
  '/vendor/verification-pending',
  '/vendor/registration-complete',
])

const re = /\{\s*\n\s*path:\s*"([^"]+)",\s*\n\s*element:\s*([^,\n]+),\s*\n\s*errorElement:/g
src = src.replace(re, (full, routePath, elementPart) => {
  const el = elementPart.trim()
  if (routePath.startsWith('/vendor/') && !VENDOR_PUBLIC.has(routePath)) {
    if (el.startsWith('vend(') || el.startsWith('corp(')) return full
    if (el.startsWith('<Navigate')) return full
    return full.replace(elementPart, `vend(${el})`)
  }
  if (routePath.startsWith('/admin/') && routePath !== '/admin/login') {
    if (el.startsWith('adminPage(') || el.startsWith('corp(')) return full
    if (el.startsWith('<Navigate')) return full
    return full.replace(elementPart, `adminPage(${el})`)
  }
  if (routePath.startsWith('/partner/')) {
    if (el.includes('PartnerRoute')) return full
    return full.replace(elementPart, `<PartnerRoute>${el}</PartnerRoute>`)
  }
  return full
})

// dashboard had VendorRoute - simplify to vend
src = src.replace(/element: vend\(corp\(<Dashboard \/>\)\)/, 'element: corp(<Dashboard />)')
src = src.replace(/element: <VendorRoute><VendorDashboardPage \/><\/VendorRoute>/, 'element: vend(<VendorDashboardPage />)')

if (!src.includes('PartnerRoute')) {
  src = src.replace(
    "import { corp, vend, adminPage, redirectTo } from '@/app/lib/routeWrappers'",
    "import { corp, vend, adminPage, redirectTo } from '@/app/lib/routeWrappers'\nimport { PartnerRoute } from '@/app/components/auth/PartnerRoute'",
  )
}

fs.writeFileSync(routesPath, src)
console.log('vendor/admin/partner wrap done')
