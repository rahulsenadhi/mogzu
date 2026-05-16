import { useCallback, useState } from 'react'

export const useListingCardImageScroller = () => {
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({})

  const goToPrevCardImage = useCallback((cardId: string, total: number) => {
    if (total <= 1) return
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      return { ...prev, [cardId]: (current - 1 + total) % total }
    })
  }, [])

  const goToNextCardImage = useCallback((cardId: string, total: number) => {
    if (total <= 1) return
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      return { ...prev, [cardId]: (current + 1) % total }
    })
  }, [])

  const getActiveIndex = (cardId: string) => cardImageIndexById[cardId] ?? 0

  return { goToPrevCardImage, goToNextCardImage, getActiveIndex }
}
