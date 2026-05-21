import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const routesPath = path.join(__dirname, '../src/app/routes.tsx')
let src = fs.readFileSync(routesPath, 'utf8')

const ORPHAN_RE =
  /\{\s*\n\s*path: "\/admin\/([^"]+)",\s*\n\s*element: adminPage\(([^)]+(?:\([^)]*\))?)\),\s*\n\s*errorElement: <ErrorPage \/>,\s*\n\s*\}/g

const children = []
const toRemove = []
let m
while ((m = ORPHAN_RE.exec(src))) {
  const rel = m[1]
  const el = m[2]
  children.push(`      { path: "${rel}", element: ${el} },`)
  toRemove.push(m[0])
}

if (children.length === 0) {
  console.log('No orphan admin routes found')
  process.exit(0)
}

src = src.replace(
  /(\{ path: "mogzu-orders", element: <AdminMogzuOrdersPage \/> \},)\s*\n(\s*]\,)/,
  `$1\n${children.join('\n')}\n$2`,
)

for (const block of toRemove) {
  src = src.replace(block, '')
}

fs.writeFileSync(routesPath, src)
console.log('Moved', children.length, 'admin routes into layout children')
