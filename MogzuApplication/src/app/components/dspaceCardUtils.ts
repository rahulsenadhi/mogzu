export const buildUnsplashKeywordImage = (query?: string) => {
  if (!query || !query.trim()) return ''
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(query.trim())}`
}

export const getListingSlideImages = (...sources: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      sources.filter((source): source is string => typeof source === 'string' && source.trim().length > 0),
    ),
  )

export const getListingSlideImagesFromRecord = (item: {
  image?: string | null
  images?: string[] | null
}) => getListingSlideImages(item.image, ...(item.images ?? []))

const UNIT_LABELS: Record<string, string> = {
  hr: '/hour',
  hour: '/hour',
  night: '/night',
  month: '/month',
  mo: '/month',
  show: '/show',
  person: '/person',
  piece: '/piece',
  day: '/day',
}

export const getPriceDisplayParts = (price: string | number | null | undefined, fallbackUnit?: string) => {
  if (typeof price === 'number') {
    const unitLabel = fallbackUnit ? UNIT_LABELS[fallbackUnit.toLowerCase()] ?? `/${fallbackUnit.toLowerCase()}` : ''
    return {
      amount: `₹${price.toLocaleString()}`,
      unit: unitLabel,
    }
  }

  if (typeof price !== 'string' || !price.trim()) {
    return {
      amount: 'On request',
      unit: '',
    }
  }

  const trimmedPrice = price.trim()
  const unitMatch = trimmedPrice.match(/\/\s*([A-Za-z]+)/)
  const rawUnit = unitMatch?.[1]?.toLowerCase() ?? fallbackUnit?.toLowerCase() ?? ''
  const amount = trimmedPrice.replace(/\/\s*[A-Za-z]+/g, '').trim()

  return {
    amount: amount || 'On request',
    unit: rawUnit ? UNIT_LABELS[rawUnit] ?? `/${rawUnit}` : '',
  }
}
