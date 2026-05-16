import fs from 'fs'

const path = 'src/app/components/EventActivityPage.tsx'
let c = fs.readFileSync(path, 'utf8')

const start = c.indexOf('                      {/* Image */}')
const end = c.indexOf('                      {/* Info section — gradient background matching gifting */}')
if (start === -1 || end === -1) {
  console.error('markers not found', start, end)
  process.exit(1)
}

const block = `                      <ListingCardImageGallery
                        images={sliderImages}
                        alt={activity.name}
                        activeIndex={activeImageIndex}
                        onPrev={(e) => {
                          e.stopPropagation()
                          goToPrevCardImage(cardId, sliderImages.length)
                        }}
                        onNext={(e) => {
                          e.stopPropagation()
                          goToNextCardImage(cardId, sliderImages.length)
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2.5 left-2.5 z-[3] h-7 px-2.5 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-semibold text-[#334155] hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0] inline-flex items-center"
                        >
                          Compare
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setLikedById((prev) => ({ ...prev, [cardId]: !prev[cardId] })) }}
                          className="absolute top-2.5 right-2.5 z-[3] w-8 h-8 bg-white/95 rounded-full flex items-center justify-center hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0]"
                        >
                          <Heart className={\`h-4 w-4 \${likedById[cardId] ? 'text-red-500 fill-red-500' : 'text-slate-500'}\`} />
                        </button>
                        <motion.div className="absolute bottom-2.5 right-2.5 z-[3] bg-[#16a34a] text-white text-[10px] font-semibold px-2.5 h-6 rounded-full inline-flex items-center gap-1 shadow-md">
                          <span>{activity.rating.toFixed(1)}</span>
                          <Star className="h-3 w-3 fill-white" />
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 z-[3]">
                          <span className={\`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold \${badge.className}\`}>{badge.label}</span>
                        </div>
                      </ListingCardImageGallery>

`.replace(/<motion\.motion.div/g, '<div').replace(/<motion\.motion.div/g, '<div')

const fixed = block
  .replace('<motion.div className="absolute bottom-2.5 right-2.5', '<div className="absolute bottom-2.5 right-2.5')
  .replace('</motion.div>\n                        <div className="absolute bottom-2.5 left-2.5', '</div>\n                        <div className="absolute bottom-2.5 left-2.5')

c = c.slice(0, start) + fixed + c.slice(end)
c = c.replace("import { ImageWithFallback } from './figma/ImageWithFallback'\n", '')
fs.writeFileSync(path, c)
console.log('patched')
