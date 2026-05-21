import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ChevronDown, Gift, MapPin, Package, Search, ShoppingBag, Sparkles, PartyPopper, Star, Truck, X, CreditCard } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import {
  giftingBasketsProducts,
  giftingCelebrationCollections,
  giftingComboProducts,
  giftingEgiftCards,
  giftingGoLocalProducts,
} from '@/app/data/apparelProducts'

type TabKey = 'combo' | 'egift' | 'golocal' | 'baskets' | 'celebrations'
type ChipDef = { id: string; label: string; color: string; matches?: string[] }

const getTabFromPath = (path: string): TabKey => {
  if (path.includes('/gifting/e-gift')) return 'egift'
  if (path.includes('/gifting/go-local')) return 'golocal'
  if (path.includes('/gifting/baskets')) return 'baskets'
  if (path.includes('/gifting/celebrations')) return 'celebrations'
  return 'combo'
}

export default function GiftingSpecialTabsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recommended')
  const [comboDrawer, setComboDrawer] = useState<string | null>(null)
  const [storyModal, setStoryModal] = useState<string | null>(null)
  const [giftModal, setGiftModal] = useState<string | null>(null)
  const [giftStep, setGiftStep] = useState(1)
  const [selectedDenomination, setSelectedDenomination] = useState(1000)
  const [basketBuilderOpen, setBasketBuilderOpen] = useState(false)
  const [basketItems, setBasketItems] = useState<Record<string, number>>({})
  const [customOccasionOpen, setCustomOccasionOpen] = useState(false)
  const [activeSubChip, setActiveSubChip] = useState(0)
  const [comboMainImage, setComboMainImage] = useState<string | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [bulkGiftOpen, setBulkGiftOpen] = useState(false)
  const [giftTemplate, setGiftTemplate] = useState<string>('')
  const [giftRecipient, setGiftRecipient] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [giftSender, setGiftSender] = useState('')
  const [giftEmail, setGiftEmail] = useState('')
  const [giftWhatsapp, setGiftWhatsapp] = useState('')
  const [giftQuantity, setGiftQuantity] = useState(1)
  const [basketDetailOpen, setBasketDetailOpen] = useState<string | null>(null)
  const [customOccasionName, setCustomOccasionName] = useState('')
  const [customOccasionRequirement, setCustomOccasionRequirement] = useState('')
  const [customOccasionBudget, setCustomOccasionBudget] = useState('')
  const [comboPriceMin, setComboPriceMin] = useState('')
  const [comboPriceMax, setComboPriceMax] = useState('')
  const [comboOccasionFilter, setComboOccasionFilter] = useState('all')
  const [comboItemCountMin, setComboItemCountMin] = useState('')
  const [comboBrandingFilter, setComboBrandingFilter] = useState('all')
  const [comboDeliveryDaysMax, setComboDeliveryDaysMax] = useState('all')
  const [celebrationTagFilter, setCelebrationTagFilter] = useState('all')
  const [celebrationMinCurated, setCelebrationMinCurated] = useState('')
  const [egiftTypeFilter, setEgiftTypeFilter] = useState('all')
  const [egiftValidityFilter, setEgiftValidityFilter] = useState('all')
  const [golocalStateFilter, setGolocalStateFilter] = useState('all')
  const [golocalCertificationFilter, setGolocalCertificationFilter] = useState('all')
  const [golocalBrandingFilter, setGolocalBrandingFilter] = useState('all')
  const [golocalDeliveryDaysMax, setGolocalDeliveryDaysMax] = useState('all')
  const [basketCategoryFilter, setBasketCategoryFilter] = useState('all')
  const [basketBrandingFilter, setBasketBrandingFilter] = useState('all')
  const [basketPackagingFilter, setBasketPackagingFilter] = useState('all')
  const [basketDeliveryDaysMax, setBasketDeliveryDaysMax] = useState('all')
  const [comboQuantity, setComboQuantity] = useState(1)
  const [giftSms, setGiftSms] = useState('')
  const [giftScheduleDate, setGiftScheduleDate] = useState('')
  const [giftScheduleTime, setGiftScheduleTime] = useState('')
  const [celebrationFilterOpen, setCelebrationFilterOpen] = useState(true)
  const [celebrationCuratedOpen, setCelebrationCuratedOpen] = useState(true)
  const [showAdvancedTopFilters, setShowAdvancedTopFilters] = useState(true)


  const activeTab = getTabFromPath(location.pathname)
  const getChipIcon = (chipId: string) => {
    if (activeTab === 'combo') {
      if (chipId.includes('welcome')) return Package
      if (chipId.includes('festive')) return Sparkles
      if (chipId.includes('wellness')) return Star
      if (chipId.includes('tech')) return CreditCard
      if (chipId.includes('premium')) return Gift
      if (chipId.includes('custom')) return Gift
      return Package
    }
    if (activeTab === 'egift') {
      if (chipId.includes('gift-cards')) return CreditCard
      if (chipId.includes('experience')) return Star
      if (chipId.includes('food')) return Gift
      if (chipId.includes('shopping')) return CreditCard
      if (chipId.includes('ott')) return Sparkles
      return CreditCard
    }
    if (activeTab === 'golocal') {
      if (chipId.includes('handicrafts')) return Gift
      if (chipId.includes('artisan')) return Star
      if (chipId.includes('handmade')) return Package
      if (chipId.includes('regional')) return MapPin
      if (chipId.includes('natural')) return Sparkles
      if (chipId.includes('cultural')) return MapPin
      return MapPin
    }
    if (activeTab === 'baskets') {
      if (chipId.includes('all-baskets')) return Gift
      if (chipId.includes('budget')) return Package
      if (chipId.includes('premium')) return Star
      if (chipId.includes('gourmet')) return Gift
      if (chipId.includes('wellness')) return Sparkles
      if (chipId.includes('corporate')) return Package
      return Gift
    }
    return Sparkles
  }
  const tabHero = {
    combo: {
      badge: 'Combo Spotlight',
      title: 'High-impact combo kits for teams and events',
      subtitle: 'Pre-bundled gifting sets designed for onboarding, celebrations, and campaign launches.',
      cta: 'Explore combos',
      route: '/gifting/combo',
      image: giftingComboProducts[0]?.images?.[0] ?? '',
    },
    egift: {
      badge: 'E-gift Campaigns',
      title: 'Instant digital gifting with personalization',
      subtitle: 'Launch flexible e-gift campaigns with quick delivery, scheduling, and recipient customization.',
      cta: 'Explore e-gifts',
      route: '/gifting/e-gift',
      image: giftingEgiftCards[0]?.images?.[0] ?? '',
    },
    golocal: {
      badge: 'Go-local Picks',
      title: 'Regional gifting curated from local artisans',
      subtitle: 'Discover authentic local products for meaningful, sustainable corporate gifting programs.',
      cta: 'Explore local picks',
      route: '/gifting/go-local',
      image: giftingGoLocalProducts[0]?.images?.[0] ?? '',
    },
    baskets: {
      badge: 'Basket Collections',
      title: 'Premium ready-to-send gift baskets',
      subtitle: 'Choose elegant basket assortments for clients, leaders, and employee recognition moments.',
      cta: 'Explore baskets',
      route: '/gifting/baskets',
      image: giftingBasketsProducts[0]?.images?.[0] ?? '',
    },
    celebrations: {
      badge: 'Celebration Spotlight',
      title: 'Curated festive gifting moments',
      subtitle: 'Celebrate teams and milestones with curated collections built for corporate occasions.',
      cta: 'Explore celebrations',
      route: '/gifting/celebrations',
      image: giftingCelebrationCollections[0]?.hero_image ?? '',
    },
  }[activeTab]

  const comboById = useMemo(() => Object.fromEntries(giftingComboProducts.map((c) => [c.id, c])), [])
  const localById = useMemo(() => Object.fromEntries(giftingGoLocalProducts.map((p) => [p.id, p])), [])
  const egiftById = useMemo(() => Object.fromEntries(giftingEgiftCards.map((p) => [p.id, p])), [])
  const celebrationTags = useMemo(
    () => Array.from(new Set(giftingCelebrationCollections.flatMap((item) => item.category_tags))).sort(),
    [],
  )
  const egiftTypes = useMemo(() => Array.from(new Set(giftingEgiftCards.map((item) => item.card_type))).sort(), [])
  const egiftValidityOptions = useMemo(
    () => Array.from(new Set(giftingEgiftCards.map((item) => item.validity_months))).sort((a, b) => a - b),
    [],
  )
  const golocalStates = useMemo(() => Array.from(new Set(giftingGoLocalProducts.map((item) => item.state_of_origin))).sort(), [])
  const golocalCertifications = useMemo(
    () => Array.from(new Set(giftingGoLocalProducts.flatMap((item) => item.certifications))).sort(),
    [],
  )
  const golocalSubcategoryOptions = useMemo(
    () => Array.from(new Set(giftingGoLocalProducts.map((item) => item.sub_category))).sort(),
    [],
  )
  const basketSubcategories = useMemo(() => Array.from(new Set(giftingBasketsProducts.map((item) => item.sub_category))).sort(), [])
  const comboOccasionOptions = useMemo(
    () =>
      Array.from(
        new Set(
          giftingComboProducts
            .flatMap((item) => item.occasion)
            .map((value) => value.trim())
            .filter((value) => value.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [],
  )
  const comboDeliveryDayOptions = useMemo(
    () => Array.from(new Set(giftingComboProducts.map((item) => item.delivery_days))).sort((a, b) => a - b),
    [],
  )
  const comboBrandingOptions = useMemo(
    () =>
      Array.from(
        new Set(giftingComboProducts.map((item) => (item.customizable ? 'customizable' : 'standard'))),
      ),
    [],
  )
  const golocalBrandingOptions = useMemo(
    () =>
      Array.from(
        new Set(giftingGoLocalProducts.map((item) => (item.customizable ? 'customizable' : 'standard'))),
      ),
    [],
  )
  const golocalDeliveryDayOptions = useMemo(
    () => Array.from(new Set(giftingGoLocalProducts.map((item) => item.delivery_days))).sort((a, b) => a - b),
    [],
  )
  const basketDeliveryDayOptions = useMemo(
    () => Array.from(new Set(giftingBasketsProducts.map((item) => item.delivery_days))).sort((a, b) => a - b),
    [],
  )
  const basketBrandingOptions = useMemo(
    () =>
      Array.from(
        new Set(giftingBasketsProducts.map((item) => (item.customizable ? 'customizable' : 'standard'))),
      ),
    [],
  )
  const basketPackagingOptions = useMemo(
    () => Array.from(new Set(giftingBasketsProducts.map((item) => item.packaging_type))).sort(),
    [],
  )
  const chipRow: ChipDef[] = {
    combo: [
      { id: 'all-combo', label: 'All Combos', color: '#2563eb' },
      { id: 'welcome-kits', label: 'Welcome Kits', color: '#6366F1', matches: ['Welcome Kits'] },
      { id: 'festive-hampers', label: 'Festive Hampers', color: '#F59E0B', matches: ['Festive Hampers'] },
      { id: 'wellness-bundles', label: 'Wellness Bundles', color: '#14B8A6', matches: ['Wellness Bundles'] },
      { id: 'tech-combos', label: 'Tech Combos', color: '#3B82F6', matches: ['Tech Combos'] },
      { id: 'premium-sets', label: 'Premium Sets', color: '#EAB308', matches: ['Premium Sets'] },
      { id: 'custom-combos', label: 'Custom Combos', color: '#8B5CF6', matches: ['Custom Combos'] },
    ],
    egift: [
      { id: 'all-egift', label: 'All E-Gifts', color: '#2563eb' },
      { id: 'gift-cards', label: 'Gift Cards', color: '#F43F5E', matches: ['Gift Cards'] },
      { id: 'experience-vouchers', label: 'Experience Vouchers', color: '#7C3AED', matches: ['Experience Vouchers'] },
      { id: 'food-dining', label: 'Food & Dining', color: '#F97316', matches: ['Food & Dining'] },
      { id: 'shopping-credits', label: 'Shopping Credits', color: '#3B82F6', matches: ['Shopping Credits'] },
      { id: 'ott-gaming', label: 'OTT & Gaming', color: '#8B5CF6', matches: ['OTT & Gaming'] },
    ],
    golocal: [
      { id: 'all-local', label: 'All Local', color: '#2563eb' },
      { id: 'handicrafts', label: 'Handicrafts', color: '#F59E0B', matches: ['Handicrafts'] },
      { id: 'artisan-food', label: 'Artisan Food', color: '#84CC16', matches: ['Artisan Food'] },
      { id: 'handmade-apparel', label: 'Handmade Apparel', color: '#F43F5E', matches: ['Handmade Apparel'] },
      { id: 'regional-art', label: 'Regional Art', color: '#7C3AED', matches: ['Regional Art'] },
      { id: 'natural-organic', label: 'Natural & Organic', color: '#10B981', matches: ['Natural & Organic'] },
      { id: 'cultural-gifts', label: 'Cultural Gifts', color: '#F97316', matches: ['Cultural Gifts'] },
    ],
    baskets: [
      { id: 'all-baskets', label: 'All Baskets', color: '#2563eb' },
      { id: 'gourmet-food', label: 'Gourmet Food', color: '#F59E0B', matches: ['Gourmet Food'] },
      { id: 'wellness-spa', label: 'Wellness Spa', color: '#14B8A6', matches: ['Wellness Spa'] },
      { id: 'corporate-premium', label: 'Corporate Premium', color: '#6366F1', matches: ['Corporate Premium'] },
      { id: 'festival-special', label: 'Festival Special', color: '#F43F5E', matches: ['Festival Special'] },
      { id: 'dry-fruits', label: 'Dry Fruits & Nuts', color: '#F97316', matches: ['Dry Fruits & Nuts'] },
      { id: 'custom-basket', label: 'Custom Basket', color: '#8B5CF6', matches: ['Custom Basket'] },
    ],
    celebrations: [
      { id: 'all-occasions', label: 'All Occasions', color: '#2563eb' },
      ...celebrationTags.map((tag, index) => ({
        id: `celebration-tag-${index}`,
        label: tag,
        color: ['#6366F1', '#F59E0B', '#14B8A6', '#3B82F6', '#8B5CF6'][index % 5],
        matches: [tag],
      })),
    ],
  }[activeTab]
  const activeChip = chipRow[activeSubChip]

  const filteredCombo = giftingComboProducts
    .filter((item) => {
    if (!item.name.toLowerCase().includes(query.toLowerCase())) return false
    if (comboPriceMin && item.bundle_price < Number(comboPriceMin)) return false
    if (comboPriceMax && item.bundle_price > Number(comboPriceMax)) return false
      if (
        comboOccasionOptions.length > 0 &&
        comboOccasionFilter !== 'all' &&
        !item.occasion.some((occ) => occ.toLowerCase() === comboOccasionFilter.toLowerCase())
      )
        return false
    if (comboItemCountMin && item.included_items.length < Number(comboItemCountMin)) return false
      if (comboBrandingFilter === 'customizable' && !item.customizable) return false
      if (comboBrandingFilter === 'standard' && item.customizable) return false
      if (comboDeliveryDaysMax !== 'all' && item.delivery_days > Number(comboDeliveryDaysMax)) return false
      if (activeChip?.matches && !activeChip.matches.includes(item.sub_category)) return false
    return true
  })
    .sort((a, b) => {
      if (sort === 'price_low') return a.bundle_price - b.bundle_price
      if (sort === 'price_high') return b.bundle_price - a.bundle_price
      return Number(b.featured) - Number(a.featured)
    })

  const filteredEgift = giftingEgiftCards
    .filter((item) => {
      if (!item.name.toLowerCase().includes(query.toLowerCase())) return false
      if (egiftTypeFilter !== 'all' && item.card_type !== egiftTypeFilter) return false
      if (egiftValidityFilter !== 'all' && item.validity_months < Number(egiftValidityFilter)) return false
      if (activeChip?.matches && !activeChip.matches.includes(item.sub_category)) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'price_low') return Math.min(...a.denominations) - Math.min(...b.denominations)
      if (sort === 'price_high') return Math.min(...b.denominations) - Math.min(...a.denominations)
      return Number(b.featured) - Number(a.featured)
    })

  const filteredGoLocal = giftingGoLocalProducts
    .filter((item) => {
      if (!item.name.toLowerCase().includes(query.toLowerCase())) return false
      if (golocalStateFilter !== 'all' && item.state_of_origin !== golocalStateFilter) return false
      if (golocalCertificationFilter !== 'all' && !item.certifications.includes(golocalCertificationFilter)) return false
      if (golocalBrandingFilter === 'customizable' && !item.customizable) return false
      if (golocalBrandingFilter === 'standard' && item.customizable) return false
      if (golocalDeliveryDaysMax !== 'all' && item.delivery_days > Number(golocalDeliveryDaysMax)) return false
      if (activeChip?.matches && !activeChip.matches.includes(item.sub_category)) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'price_low') return a.price - b.price
      if (sort === 'price_high') return b.price - a.price
      return Number(b.featured) - Number(a.featured)
    })

  const filteredBaskets = giftingBasketsProducts
    .filter((item) => {
      if (!item.name.toLowerCase().includes(query.toLowerCase())) return false
      if (basketCategoryFilter !== 'all' && item.sub_category !== basketCategoryFilter) return false
      if (basketBrandingFilter === 'customizable' && !item.customizable) return false
      if (basketBrandingFilter === 'standard' && item.customizable) return false
      if (basketPackagingFilter !== 'all' && item.packaging_type !== basketPackagingFilter) return false
      if (basketDeliveryDaysMax !== 'all' && item.delivery_days > Number(basketDeliveryDaysMax)) return false
      if (activeChip?.matches && !activeChip.matches.includes(item.sub_category)) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'price_low') return a.price - b.price
      if (sort === 'price_high') return b.price - a.price
      return Number(b.featured) - Number(a.featured)
    })
  const filteredCelebrations = giftingCelebrationCollections
    .filter((item) => {
      if (!item.occasion.toLowerCase().includes(query.toLowerCase())) return false
      if (activeChip?.matches && !item.category_tags.some((tag) => activeChip.matches?.includes(tag))) return false
      if (celebrationTagFilter !== 'all' && !item.category_tags.some((tag) => tag.toLowerCase() === celebrationTagFilter.toLowerCase())) return false
      if (celebrationMinCurated && item.curated_count < Number(celebrationMinCurated)) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'curated_low') return a.curated_count - b.curated_count
      if (sort === 'curated_high') return b.curated_count - a.curated_count
      return b.curated_count - a.curated_count
    })

  const handleClearFilters = () => {
    setQuery('')
    setComboPriceMin('')
    setComboPriceMax('')
    setComboOccasionFilter('all')
    setComboItemCountMin('')
    setComboBrandingFilter('all')
    setComboDeliveryDaysMax('all')
    setCelebrationTagFilter('all')
    setCelebrationMinCurated('')
    setEgiftTypeFilter('all')
    setEgiftValidityFilter('all')
    setGolocalStateFilter('all')
    setGolocalCertificationFilter('all')
    setGolocalBrandingFilter('all')
    setGolocalDeliveryDaysMax('all')
    setBasketCategoryFilter('all')
    setBasketBrandingFilter('all')
    setBasketPackagingFilter('all')
    setBasketDeliveryDaysMax('all')
    setActiveSubChip(0)
    setSort('recommended')
  }

  const activeFilterLabels = [
    query.trim() ? `Search: ${query.trim()}` : null,
    activeSubChip > 0 ? `Subcategory: ${activeChip?.label ?? 'Selected'}` : null,
    sort !== 'recommended' ? `Sort: ${sort}` : null,
    activeTab === 'combo' && comboPriceMin ? `Min price: ${comboPriceMin}` : null,
    activeTab === 'combo' && comboPriceMax ? `Max price: ${comboPriceMax}` : null,
    activeTab === 'combo' && comboItemCountMin ? `Min items: ${comboItemCountMin}` : null,
    activeTab === 'combo' && comboOccasionOptions.length > 0 && comboOccasionFilter !== 'all' ? `Occasion: ${comboOccasionFilter}` : null,
    activeTab === 'combo' && comboBrandingFilter !== 'all' ? `Branding: ${comboBrandingFilter === 'customizable' ? 'Customizable' : 'Standard'}` : null,
    activeTab === 'combo' && comboDeliveryDaysMax !== 'all' ? `Max delivery: ${comboDeliveryDaysMax} days` : null,
    activeTab === 'egift' && egiftTypeFilter !== 'all' ? `Type: ${egiftTypeFilter}` : null,
    activeTab === 'egift' && egiftValidityFilter !== 'all' ? `Validity: ${egiftValidityFilter}+ months` : null,
    activeTab === 'golocal' && golocalStateFilter !== 'all' ? `State: ${golocalStateFilter}` : null,
    activeTab === 'golocal' && golocalCertificationFilter !== 'all' ? `Certification: ${golocalCertificationFilter}` : null,
    activeTab === 'golocal' && golocalBrandingFilter !== 'all' ? `Branding: ${golocalBrandingFilter === 'customizable' ? 'Customizable' : 'Standard'}` : null,
    activeTab === 'golocal' && golocalDeliveryDaysMax !== 'all' ? `Max delivery: ${golocalDeliveryDaysMax} days` : null,
    activeTab === 'baskets' && basketCategoryFilter !== 'all' ? `Category: ${basketCategoryFilter}` : null,
    activeTab === 'baskets' && basketBrandingFilter !== 'all' ? `Branding: ${basketBrandingFilter === 'customizable' ? 'Customizable' : 'Standard'}` : null,
    activeTab === 'baskets' && basketPackagingFilter !== 'all' ? `Packaging: ${basketPackagingFilter}` : null,
    activeTab === 'baskets' && basketDeliveryDaysMax !== 'all' ? `Max delivery: ${basketDeliveryDaysMax} days` : null,
    activeTab === 'celebrations' && celebrationTagFilter !== 'all' ? `Tag: ${celebrationTagFilter}` : null,
    activeTab === 'celebrations' && celebrationMinCurated ? `Min curated: ${celebrationMinCurated}` : null,
  ].filter(Boolean) as string[]


  const basketWeight = Object.entries(basketItems).reduce((acc, [id, qty]) => {
    const item = giftingBasketsProducts.find((b) => b.id === id)
    if (!item) return acc
    return acc + item.total_weight_kg * qty
  }, 0)

  const basketTotal = Object.entries(basketItems).reduce((acc, [id, qty]) => {
    const item = giftingBasketsProducts.find((b) => b.id === id)
    if (!item) return acc
    return acc + item.price * qty
  }, 0)

  useEffect(() => {
    setGiftStep(1)
    setGiftSms('')
    setGiftScheduleDate('')
    setGiftScheduleTime('')
  }, [giftModal])

  useEffect(() => {
    setActiveSubChip(0)
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'combo') return
    if (comboOccasionOptions.length === 0) {
      setComboOccasionFilter('all')
      return
    }
    if (comboOccasionFilter !== 'all' && !comboOccasionOptions.includes(comboOccasionFilter)) {
      setComboOccasionFilter('all')
    }
  }, [activeTab, comboOccasionFilter, comboOccasionOptions])

  useEffect(() => {
    if (activeTab !== 'golocal') return
    if (activeSubChip === 0) return
    const chip = chipRow[activeSubChip]
    if (!chip?.matches || chip.matches.length === 0) return
    const hasDataMatch = chip.matches.some((subcategory) => golocalSubcategoryOptions.includes(subcategory))
    if (!hasDataMatch) {
      setActiveSubChip(0)
    }
  }, [activeTab, activeSubChip, chipRow, golocalSubcategoryOptions])

  useEffect(() => {
    if (!comboDrawer) {
      setComboMainImage(null)
      return
    }
    setComboMainImage(comboById[comboDrawer].images[0] ?? null)
  }, [comboById, comboDrawer])

  useEffect(() => {
    const hasOverlayOpen = Boolean(comboDrawer || storyModal || giftModal || basketBuilderOpen || customOccasionOpen || quoteOpen)
    document.body.style.overflow = hasOverlayOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [basketBuilderOpen, comboDrawer, customOccasionOpen, giftModal, quoteOpen, storyModal])

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const handleTrackViewed = (payload: { id: string; name: string; image: string; price: number; tab_type: string }) => {
    const key = 'mogzu_gifting_viewed'
    const parsed = JSON.parse(sessionStorage.getItem(key) || '[]') as Array<{ id: string; name: string; image: string; price: number; tab_type: string }>
    const next = [payload, ...parsed.filter((item) => item.id !== payload.id)].slice(0, 8)
    sessionStorage.setItem(key, JSON.stringify(next))
  }

  const handleStartBooking = (payload: {
    id: string | number
    name: string
    price: number
    image: string
    moq?: number
    description?: string
  }) => {
    navigate(`/product-booking?category=apparel&id=${encodeURIComponent(String(payload.id || 1))}`, {
      state: {
        product: {
          id: payload.id,
          name: payload.name,
          brand: 'Mogzu',
          price: payload.price,
          moq: payload.moq || 25,
          description: payload.description || '',
          image: payload.image,
          colors: ['Blue', 'Black', 'White'],
          features: ['Bulk-ready', 'Corporate gifting'],
        },
      },
    })
  }

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="shop" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search gifting" />
        <MogzuCorporateScrollSurface>
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-2 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button onClick={() => navigate('/dashboard')} className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors">Dashboard</button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <button onClick={() => navigate('/gifting')} className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors">Gifting</button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <span className="text-[#0e1e3f] font-semibold tracking-tight capitalize">{activeTab === 'egift' ? 'E-gift' : activeTab === 'golocal' ? 'Go-local' : activeTab}</span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-[22px] font-bold text-[#0e1e3f] leading-none">Gifting</h1>
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => navigate('/gifting')}
                  className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Home</span>
                </button>
                <button
                  onClick={() => navigate('/gifting/shop')}
                  className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <ShoppingBag className="w-5 h-5 text-[#4f46e5]" />
                  <span>Shop</span>
                </button>
                <button
                  onClick={() => navigate('/gifting/celebrations')}
                  className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] ${
                    activeTab === 'celebrations'
                      ? 'font-semibold border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]'
                      : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5'
                  }`}
                  style={
                    activeTab === 'celebrations'
                      ? {
                          backgroundImage:
                            'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                        }
                      : {}
                  }
                >
                  <PartyPopper className="w-5 h-5 text-[#FF5E00]" />
                  <span>Celebrations</span>
                </button>
                <button
                  onClick={() => navigate('/gifting/combo')}
                  className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] ${
                    activeTab === 'combo'
                      ? 'font-semibold border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]'
                      : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5'
                  }`}
                  style={
                    activeTab === 'combo'
                      ? {
                          backgroundImage:
                            'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                        }
                      : {}
                  }
                >
                  <Package className="w-5 h-5 text-[#0ea5e9]" />
                  <span>Combo</span>
                </button>
                <button
                  onClick={() => navigate('/gifting/e-gift')}
                  className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] ${
                    activeTab === 'egift'
                      ? 'font-semibold border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]'
                      : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5'
                  }`}
                  style={
                    activeTab === 'egift'
                      ? {
                          backgroundImage:
                            'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                        }
                      : {}
                  }
                >
                  <CreditCard className="w-5 h-5 text-[#9B51E0]" />
                  <span>E-gift</span>
                </button>
                <button
                  onClick={() => navigate('/gifting/go-local')}
                  className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] ${
                    activeTab === 'golocal'
                      ? 'font-semibold border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]'
                      : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5'
                  }`}
                  style={
                    activeTab === 'golocal'
                      ? {
                          backgroundImage:
                            'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                        }
                      : {}
                  }
                >
                  <MapPin className="w-5 h-5 text-[#15D39D]" />
                  <span>Go-local</span>
                </button>
                <button
                  onClick={() => navigate('/gifting/baskets')}
                  className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] ${
                    activeTab === 'baskets'
                      ? 'font-semibold border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]'
                      : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5'
                  }`}
                  style={
                    activeTab === 'baskets'
                      ? {
                          backgroundImage:
                            'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                        }
                      : {}
                  }
                >
                  <Gift className="w-5 h-5 text-[#d4a000]" />
                  <span>Baskets</span>
                </button>
              </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pt-6">
            <div className="group relative overflow-hidden rounded-3xl border border-white/60 h-[200px] mb-6 bg-white/45 backdrop-blur-xl shadow-[0_18px_40px_rgba(37,99,235,0.18)]">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
              <div className="relative flex h-[200px]">
                <div className="w-[55%] px-8 py-6 flex flex-col justify-center">
                  <div className="inline-flex items-center rounded-full bg-[#ebf1ff] text-[#475569] px-2.5 py-1 text-[12px] font-medium mb-3 w-fit">
                    ⭐ {tabHero.badge}
                  </div>
                  <h3 className="text-[24px] font-bold text-[#0e1e3f] leading-tight line-clamp-2">{tabHero.title}</h3>
                  <p className="text-[14px] text-[#64748b] leading-[1.6] mt-2 mb-5 max-w-[380px]">{tabHero.subtitle}</p>
                  <button
                    type="button"
                    onClick={() => navigate(tabHero.route)}
                    className="h-11 px-6 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[14px] font-semibold shadow-[0_10px_22px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:scale-[0.98] transition-all w-fit"
                  >
                    {tabHero.cta}
                  </button>
                </div>
                <div className="w-[45%] relative overflow-hidden">
                  {tabHero.image ? (
                    <img src={tabHero.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(160deg,#dbeafe_0%,#eff6ff_100%)]" />
                  )}
                </div>
              </div>
            </div>
            {
              <>
                <div className="mb-5 overflow-x-auto pb-2">
                  <div className="flex items-center gap-2 justify-start min-w-max pr-4">
                    {chipRow.map((chip, index) => {
                      const ChipIcon = getChipIcon(chip.id)
                      return (
                      <button
                        key={chip.id}
                        onClick={() => setActiveSubChip(index)}
                        className={`h-9 px-4 rounded-full text-[14px] transition-all whitespace-nowrap border-[1.5px] shadow-sm inline-flex items-center gap-2 shrink-0 ${
                          activeSubChip === index ? 'text-white font-semibold' : 'font-medium'
                        }`}
                        style={
                          activeSubChip === index
                            ? {
                                backgroundColor: chip.color,
                                borderColor: chip.color,
                              }
                            : { backgroundColor: 'rgba(255,255,255,0.7)', borderColor: '#c8c8c8', color: '#475569' }
                        }
                      >
                        <ChipIcon
                          className="w-4 h-4"
                          style={{ color: activeSubChip === index ? '#ffffff' : chip.color }}
                        />
                        {chip.label}
                      </button>
                    )})}
                  </div>
                </div>
              </>
            }
          </div>

          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pb-6 flex gap-4">
            <aside className="w-[240px] flex-shrink-0">
              <div className="bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
                      <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#0e1e3f]">Filters</h3>
                        <button
                    className="text-[13px] font-medium text-[#4379ee] underline"
                    onClick={handleClearFilters}
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-2 text-[14px] text-[#475569]">
                        {activeTab === 'combo' && (
                          <>
                            <select
                              value={comboOccasionFilter}
                              onChange={(e) => setComboOccasionFilter(e.target.value)}
                        disabled={comboOccasionOptions.length === 0}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">
                          {comboOccasionOptions.length === 0 ? 'No occasion data available' : 'All occasions'}
                        </option>
                        {comboOccasionOptions.map((occasion) => (
                          <option key={occasion} value={occasion}>
                            {occasion}
                          </option>
                        ))}
                            </select>
                            <input
                              value={comboPriceMin}
                              onChange={(e) => setComboPriceMin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 mb-2"
                              placeholder="Min price"
                            />
                            <input
                              value={comboPriceMax}
                              onChange={(e) => setComboPriceMax(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 mb-2"
                              placeholder="Max price"
                            />
                            <input
                              value={comboItemCountMin}
                              onChange={(e) => setComboItemCountMin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 mb-2"
                              placeholder="Min item count"
                            />
                      <select
                        value={comboBrandingFilter}
                        onChange={(e) => setComboBrandingFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Branding</option>
                        {comboBrandingOptions.includes('customizable') && <option value="customizable">Customizable branding</option>}
                        {comboBrandingOptions.includes('standard') && <option value="standard">Standard branding</option>}
                      </select>
                      <select
                        value={comboDeliveryDaysMax}
                        onChange={(e) => setComboDeliveryDaysMax(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Any delivery timeline</option>
                        {comboDeliveryDayOptions.map((days) => (
                          <option key={days} value={String(days)}>
                            Up to {days} days
                          </option>
                        ))}
                      </select>
                          </>
                        )}
                  {activeTab === 'celebrations' && (
                    <>
                      {/* Occasion Tags — collapsible */}
                      <div className="mb-4">
                        <button
                          onClick={() => setCelebrationFilterOpen((v) => !v)}
                          className="w-full flex items-center justify-between text-sm font-semibold text-[#0e1e3f] mb-2"
                        >
                          <span>Occasion Tags</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${celebrationFilterOpen ? '' : '-rotate-90'}`} />
                        </button>
                        {celebrationFilterOpen && (
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="celeb-tag"
                                checked={celebrationTagFilter === 'all'}
                                onChange={() => setCelebrationTagFilter('all')}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-[#475569]">All Occasions</span>
                            </label>
                            {celebrationTags.map((tag) => (
                              <label key={tag} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="celeb-tag"
                                  checked={celebrationTagFilter === tag}
                                  onChange={() => setCelebrationTagFilter(tag)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-[#475569]">{tag}</span>
                              </label>
                            ))}
                      </div>
                        )}
                      </div>

                      {/* Min curated products */}
                      <div className="mb-4">
                        <button
                          onClick={() => setCelebrationCuratedOpen((v) => !v)}
                          className="w-full flex items-center justify-between text-sm font-semibold text-[#0e1e3f] mb-2"
                        >
                          <span>Min Curated Products</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${celebrationCuratedOpen ? '' : '-rotate-90'}`} />
                        </button>
                        {celebrationCuratedOpen && (
                          <input
                            value={celebrationMinCurated}
                            onChange={(e) => setCelebrationMinCurated(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            placeholder="e.g. 20"
                          />
                        )}
                      </div>
                    </>
                  )}
                  {activeTab === 'egift' && (
                    <>
                      <select
                        value={egiftTypeFilter}
                        onChange={(e) => setEgiftTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Card type</option>
                        {egiftTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <select
                        value={egiftValidityFilter}
                        onChange={(e) => setEgiftValidityFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Any validity</option>
                        {egiftValidityOptions.map((months) => (
                          <option key={months} value={String(months)}>
                            {months}+ months
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {activeTab === 'golocal' && (
                    <>
                      <select
                        value={golocalStateFilter}
                        onChange={(e) => setGolocalStateFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">State of origin</option>
                        {golocalStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <select
                        value={golocalCertificationFilter}
                        onChange={(e) => setGolocalCertificationFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Any certification</option>
                        {golocalCertifications.map((certification) => (
                          <option key={certification} value={certification}>
                            {certification}
                          </option>
                        ))}
                      </select>
                      <select
                        value={golocalBrandingFilter}
                        onChange={(e) => setGolocalBrandingFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Branding</option>
                        {golocalBrandingOptions.includes('customizable') && <option value="customizable">Customizable branding</option>}
                        {golocalBrandingOptions.includes('standard') && <option value="standard">Standard branding</option>}
                      </select>
                      <select
                        value={golocalDeliveryDaysMax}
                        onChange={(e) => setGolocalDeliveryDaysMax(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Any delivery timeline</option>
                        {golocalDeliveryDayOptions.map((days) => (
                          <option key={days} value={String(days)}>
                            Up to {days} days
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {activeTab === 'baskets' && (
                    <>
                      <select
                        value={basketCategoryFilter}
                        onChange={(e) => setBasketCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Basket category</option>
                        {basketSubcategories.map((subcategory) => (
                          <option key={subcategory} value={subcategory}>
                            {subcategory}
                          </option>
                        ))}
                      </select>
                      <select
                        value={basketBrandingFilter}
                        onChange={(e) => setBasketBrandingFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Branding</option>
                        {basketBrandingOptions.includes('customizable') && <option value="customizable">Customizable branding</option>}
                        {basketBrandingOptions.includes('standard') && <option value="standard">Standard branding</option>}
                      </select>
                      <select
                        value={basketPackagingFilter}
                        onChange={(e) => setBasketPackagingFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Any packaging</option>
                        {basketPackagingOptions.map((packaging) => (
                          <option key={packaging} value={packaging}>
                            {packaging.charAt(0).toUpperCase() + packaging.slice(1)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={basketDeliveryDaysMax}
                        onChange={(e) => setBasketDeliveryDaysMax(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20 bg-white mb-2"
                      >
                        <option value="all">Any delivery timeline</option>
                        {basketDeliveryDayOptions.map((days) => (
                          <option key={days} value={String(days)}>
                            Up to {days} days
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
                <p className="mt-4 rounded-xl border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] text-[#475569]">
                  Filters apply instantly as you select options
                </p>
                    </div>
                  </aside>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                    type="text"
                    placeholder={activeTab === 'combo' ? 'Search combos, bundles...' : activeTab === 'egift' ? 'Search gift cards, vouchers...' : activeTab === 'golocal' ? 'Search local artisan gifts...' : activeTab === 'baskets' ? 'Search baskets...' : 'Search occasions...'}
                    className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[13px] text-[#878e9e]">Sort by:</span>
                  {(activeTab === 'combo' || activeTab === 'egift' || activeTab === 'golocal' || activeTab === 'baskets') && (
                    <button
                      type="button"
                      onClick={() => setShowAdvancedTopFilters((prev) => !prev)}
                      className="h-10 flex items-center gap-2 px-4 text-sm font-medium text-[#0e1e3f] bg-white/70 border border-[#e5e7eb] rounded-xl hover:border-[#93c5fd] transition-all"
                    >
                      {showAdvancedTopFilters ? 'Compress Filters' : 'Expand Filters'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedTopFilters ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 px-3 rounded-xl border border-[#e5e7eb] bg-white text-[13px] text-[#0e1e3f] font-medium focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20">
                        <option value="recommended">Recommended</option>
                    {activeTab === 'celebrations' ? (
                      <>
                        <option value="curated_low">Curated Count: Low to High</option>
                        <option value="curated_high">Curated Count: High to Low</option>
                      </>
                    ) : (
                      <>
                        <option value="price_low">Price Low to High</option>
                        <option value="price_high">Price High to Low</option>
                      </>
                    )}
                      </select>
                    </div>
              </div>
              {activeTab === 'combo' && (
                <>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    <select
                      value={comboOccasionFilter}
                      onChange={(e) => setComboOccasionFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Occasion: All</option>
                      {comboOccasionOptions.map((occasion) => <option key={occasion} value={occasion}>{occasion}</option>)}
                    </select>
                    <select
                      value={comboBrandingFilter}
                      onChange={(e) => setComboBrandingFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Branding: All</option>
                      {comboBrandingOptions.includes('customizable') && <option value="customizable">Customizable</option>}
                      {comboBrandingOptions.includes('standard') && <option value="standard">Standard</option>}
                    </select>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="recommended">Sort: Recommended</option>
                      <option value="price_low">Sort: Price Low-High</option>
                      <option value="price_high">Sort: Price High-Low</option>
                    </select>
                  </div>
                  {showAdvancedTopFilters && (
                    <>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Commercial filters</div>
                      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        <input
                          value={comboPriceMin}
                          onChange={(e) => setComboPriceMin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Budget min (₹)"
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        />
                        <input
                          value={comboPriceMax}
                          onChange={(e) => setComboPriceMax(e.target.value.replace(/\D/g, ''))}
                          placeholder="Budget max (₹)"
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        />
                        <input
                          value={comboItemCountMin}
                          onChange={(e) => setComboItemCountMin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Min items"
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        />
                        <select
                          value={comboDeliveryDaysMax}
                          onChange={(e) => setComboDeliveryDaysMax(e.target.value)}
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        >
                          <option value="all">Delivery: Any</option>
                          {comboDeliveryDayOptions.map((days) => <option key={days} value={String(days)}>Up to {days} days</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
              {activeTab === 'egift' && (
                <>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    <select
                      value={egiftTypeFilter}
                      onChange={(e) => setEgiftTypeFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Card Type: All</option>
                      {egiftTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="recommended">Sort: Recommended</option>
                      <option value="price_low">Sort: Price Low-High</option>
                      <option value="price_high">Sort: Price High-Low</option>
                    </select>
                    <select
                      value={egiftValidityFilter}
                      onChange={(e) => setEgiftValidityFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Validity: Any</option>
                      {egiftValidityOptions.map((months) => (
                        <option key={months} value={String(months)}>{months}+ months</option>
                      ))}
                    </select>
                  </div>
                  {showAdvancedTopFilters && (
                    <>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Commercial filters</div>
                      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        <input
                          type="number"
                          min={0}
                          value={giftQuantity}
                          onChange={(e) => setGiftQuantity(Math.max(1, Number(e.target.value) || 1))}
                          placeholder="Gift quantity"
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        />
                        <input
                          type="date"
                          value={giftScheduleDate}
                          onChange={(e) => setGiftScheduleDate(e.target.value)}
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        />
                        <input
                          type="time"
                          value={giftScheduleTime}
                          onChange={(e) => setGiftScheduleTime(e.target.value)}
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              {activeTab === 'golocal' && (
                <>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    <select
                      value={golocalStateFilter}
                      onChange={(e) => setGolocalStateFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">State: All</option>
                      {golocalStates.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                    <select
                      value={golocalCertificationFilter}
                      onChange={(e) => setGolocalCertificationFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Certification: All</option>
                      {golocalCertifications.map((certification) => <option key={certification} value={certification}>{certification}</option>)}
                    </select>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="recommended">Sort: Recommended</option>
                      <option value="price_low">Sort: Price Low-High</option>
                      <option value="price_high">Sort: Price High-Low</option>
                    </select>
                  </div>
                  {showAdvancedTopFilters && (
                    <>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Commercial filters</div>
                      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        <select
                          value={golocalBrandingFilter}
                          onChange={(e) => setGolocalBrandingFilter(e.target.value)}
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        >
                          <option value="all">Branding: All</option>
                          {golocalBrandingOptions.includes('customizable') && <option value="customizable">Customizable</option>}
                          {golocalBrandingOptions.includes('standard') && <option value="standard">Standard</option>}
                        </select>
                        <select
                          value={golocalDeliveryDaysMax}
                          onChange={(e) => setGolocalDeliveryDaysMax(e.target.value)}
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        >
                          <option value="all">Delivery: Any</option>
                          {golocalDeliveryDayOptions.map((days) => <option key={days} value={String(days)}>Up to {days} days</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
              {activeTab === 'baskets' && (
                <>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    <select
                      value={basketCategoryFilter}
                      onChange={(e) => setBasketCategoryFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Category: All</option>
                      {basketSubcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
                    </select>
                    <select
                      value={basketBrandingFilter}
                      onChange={(e) => setBasketBrandingFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Branding: All</option>
                      {basketBrandingOptions.includes('customizable') && <option value="customizable">Customizable</option>}
                      {basketBrandingOptions.includes('standard') && <option value="standard">Standard</option>}
                    </select>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="recommended">Sort: Recommended</option>
                      <option value="price_low">Sort: Price Low-High</option>
                      <option value="price_high">Sort: Price High-Low</option>
                    </select>
                  </div>
                  {showAdvancedTopFilters && (
                    <>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Commercial filters</div>
                      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        <select
                          value={basketPackagingFilter}
                          onChange={(e) => setBasketPackagingFilter(e.target.value)}
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        >
                          <option value="all">Packaging: Any</option>
                          {basketPackagingOptions.map((packaging) => (
                            <option key={packaging} value={packaging}>
                              {packaging.charAt(0).toUpperCase() + packaging.slice(1)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={basketDeliveryDaysMax}
                          onChange={(e) => setBasketDeliveryDaysMax(e.target.value)}
                          className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                        >
                          <option value="all">Delivery: Any</option>
                          {basketDeliveryDayOptions.map((days) => <option key={days} value={String(days)}>Up to {days} days</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-7 inline-flex items-center px-3 text-[12px] bg-white border border-[#d1d5db] rounded-md">Module: Gifting</span>
                        <span className="h-7 inline-flex items-center px-3 text-[12px] bg-white border border-[#d1d5db] rounded-md">Category: All</span>
                      </div>
                <p className="text-[13px] text-[#878e9e]">
                  Showing {activeTab === 'combo' ? filteredCombo.length : activeTab === 'egift' ? filteredEgift.length : activeTab === 'golocal' ? filteredGoLocal.length : activeTab === 'baskets' ? filteredBaskets.length : filteredCelebrations.length} results
                </p>
                    </div>
              {activeFilterLabels.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {activeFilterLabels.map((label) => (
                    <span key={label} className="h-7 inline-flex items-center px-3 text-[12px] bg-white border border-[#d1d5db] rounded-md text-[#475569]">
                      {label}
                    </span>
                  ))}
                  <button onClick={handleClearFilters} className="h-7 inline-flex items-center px-3 text-[12px] rounded-md border border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]">
                    Clear filters
                  </button>
                </div>
              )}
              {(activeTab === 'combo' ? filteredCombo.length : activeTab === 'egift' ? filteredEgift.length : activeTab === 'golocal' ? filteredGoLocal.length : activeTab === 'baskets' ? filteredBaskets.length : filteredCelebrations.length) === 0 && (
                <div className="mb-4 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-[13px] text-[#64748b]">
                  No results match the current filters. Adjust filters or clear all to continue.
                </div>
              )}

                    {activeTab === 'combo' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredCombo.map((item) => (
                    <article key={item.id} className="bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition-all group h-full flex flex-col">
                      <div className="h-52 bg-slate-100 relative">
                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover saturate-110" />
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2.5 h-6 rounded-full bg-[#F59E0B] text-white inline-flex items-center shadow-md">COMBO</span>
                        <span className="absolute bottom-2.5 right-2.5 bg-[#16a34a] text-white text-[10px] font-semibold px-2.5 h-6 rounded-full inline-flex items-center gap-1 shadow-md">
                          ★ {item.rating}
                        </span>
                            </div>
                            <div className="bg-[#f8fafc] px-[14px] py-2 border-b border-[#ececec]">
                              <div className="flex items-center">
                                {item.images.slice(0, 3).map((img, idx) => <img key={idx} src={img} alt="" className={`${idx > 0 ? '-ml-2' : ''} w-[22px] h-[22px] rounded-full border-2 border-white object-cover`} />)}
                                {item.included_items.length > 3 && <span className="ml-3 text-[11px] text-[#64748b]">+ {item.included_items.length - 3} more</span>}
                              </div>
                              <p className="text-[11px] text-[#64748b] italic mt-1 truncate">Includes: {item.included_items.slice(0, 2).join(' + ')}</p>
                            </div>
                      <div className="p-3 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">{item.vendor_name}</p>
                        <p className="text-sm font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[36px]">{item.name}</p>
                        <p className="text-xs text-[#878e9e] mb-2 line-clamp-2 min-h-[28px]">
                          Includes {item.included_items.slice(0, 2).join(', ')} and more curated items.
                        </p>
                        <div className="rounded-xl border border-[#bfdbfe] bg-[linear-gradient(90deg,rgba(239,246,255,0.9),rgba(219,234,254,0.85))] p-2 mb-2.5 shadow-[0_4px_14px_rgba(37,99,235,0.10)]">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563eb] mb-1">MOQ</p>
                          <p className="text-[12px] text-[#334155]">
                            Minimum order quantity: <span className="font-bold text-[#0e1e3f]">{item.moq} sets</span>
                          </p>
                              </div>
                        <div className="mt-auto pt-2.5 border-t border-[#ececec] flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-1">Starting at</p>
                            <p className="text-[22px] leading-none font-extrabold tracking-tight text-[#0e1e3f]">Rs {item.bundle_price}</p>
                            <p className="text-[10px] text-[#64748b] mt-1">per set</p>
                          </div>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Save {item.savings_pct}%</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => {
                                    handleTrackViewed({ id: item.id, name: item.name, image: item.images[0], price: item.bundle_price, tab_type: 'combo' })
                                    setComboDrawer(item.id)
                                  }}
                            className="h-11 rounded-lg border border-[#cbd5e1] text-[13px] font-semibold hover:bg-slate-50 transition-colors"
                                >
                                  View Combo
                                </button>
                                <button
                                  onClick={() =>
                                    handleStartBooking({
                                      id: item.id,
                                      name: item.name,
                                      price: item.bundle_price,
                                      image: item.images[0],
                                      moq: item.moq,
                                      description: item.included_items.join(', '),
                                    })
                                  }
                            className="h-11 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[13px] font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.24)]"
                                >
                                  Get Quote
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {activeTab === 'egift' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredEgift.map((item) => (
                    <article key={item.id} className="bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition-all group h-full flex flex-col">
                      <div
                        className="rounded-none p-3 h-32 text-white relative overflow-hidden"
                        style={{ background: item.card_type === 'gift_card' ? 'linear-gradient(135deg,#2563EB,#7C3AED)' : item.card_type === 'experience' ? 'linear-gradient(135deg,#7C3AED,#6366F1)' : item.card_type === 'dining' ? 'linear-gradient(135deg,#F97316,#EF4444)' : item.card_type === 'shopping' ? 'linear-gradient(135deg,#3B82F6,#06B6D4)' : 'linear-gradient(135deg,#1F2937,#111827)' }}
                      >
                        <div className="absolute top-2 left-2 h-6 px-2 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-semibold text-[#334155] inline-flex items-center border border-[#e2e8f0]">
                          DIGITAL GIFT
                            </div>
                        <CreditCard className="w-6 h-6 absolute right-3 top-3" />
                        <p className="absolute left-3 top-[46%] -translate-y-1/2 text-[34px] font-bold">Rs {selectedDenomination}</p>
                        <p className="absolute left-3 top-[63%] text-[12px] opacity-90">{item.sub_category}</p>
                        <p className="absolute left-3 bottom-2.5 text-[10px] opacity-80">Valid {item.validity_months} months</p>
                        <p className="absolute right-3 bottom-2.5 text-[10px] opacity-80">Instant Delivery</p>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">{item.card_type.replace('_', ' ')}</p>
                        <p className="text-[15px] font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[34px]">{item.name}</p>
                        <p className="text-[12px] text-[#878e9e] mb-2 line-clamp-2 min-h-[24px]">
                          Instant digital delivery with configurable value and recipient personalization.
                        </p>
                        <div className="rounded-lg border border-[#bfdbfe] bg-[linear-gradient(90deg,rgba(239,246,255,0.9),rgba(219,234,254,0.85))] p-1.5 mb-2 shadow-[0_4px_14px_rgba(37,99,235,0.10)]">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563eb] mb-1">Denominations</p>
                          <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                              {item.denominations.map((d) => (
                              <button
                                key={d}
                                onClick={() => setSelectedDenomination(d)}
                                className={`h-7 px-2 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 ${selectedDenomination === d ? 'bg-[#2563eb] text-white' : 'border border-[#cbd5e1] bg-white text-[#0f172a]'}`}
                              >
                                Rs {d}
                              </button>
                              ))}
                            </div>
                        </div>
                        <div className="mt-auto pt-2.5 border-t border-[#ececec] flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-1">Starting at</p>
                            <p className="text-[22px] leading-none font-extrabold tracking-tight text-[#0e1e3f]">Rs {Math.min(...item.denominations)}</p>
                            <p className="text-[10px] text-[#64748b] mt-1">digital value</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() => setGiftModal(item.id)}
                            className="h-10 w-full px-2 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[12px] font-semibold leading-none whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.24)]"
                          >
                            Personalise & Send
                          </button>
                          <button
                            onClick={() => setBulkGiftOpen(true)}
                            className="h-10 w-full px-2 rounded-lg border border-[#cbd5e1] text-[12px] font-semibold leading-none whitespace-nowrap hover:bg-slate-50 transition-colors"
                          >
                            Buy in Bulk
                          </button>
                        </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {activeTab === 'golocal' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredGoLocal.map((item) => (
                    <article key={item.id} className="bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition-all group h-full flex flex-col">
                      <div className="h-48 relative">
                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover saturate-110" />
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2.5 h-6 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center border border-emerald-200 shadow-sm">Local Artisan</span>
                        <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2.5 h-6 rounded-full bg-white/95 text-[#0e1e3f] inline-flex items-center border border-[#e2e8f0] shadow-sm">
                          {item.state_of_origin}
                        </span>
                        {item.certifications.includes('GI Tag') && <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold px-2.5 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center border border-blue-200 shadow-sm">GI Tag</span>}
                            </div>
                      <div className="p-3 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">Empowering local makers</p>
                        <p className="text-sm font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[36px]">{item.name}</p>
                        <p className="text-xs text-[#878e9e] mb-2 line-clamp-2 min-h-[28px]">{item.vendor_name}</p>
                        <div className="rounded-xl border border-[#bbf7d0] bg-[linear-gradient(90deg,rgba(236,253,245,0.9),rgba(220,252,231,0.85))] p-2 mb-2.5 shadow-[0_4px_14px_rgba(22,163,74,0.12)]">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 mb-1">Artisan Spotlight</p>
                          <div className="flex items-center gap-2">
                            <img src={item.artisan_image} alt={item.artisan_name} className="w-7 h-7 rounded-full object-cover border border-emerald-200" />
                            <span className="text-[12px] font-semibold text-[#0e1e3f]">{item.artisan_name}</span>
                              </div>
                          <p className="text-[11px] text-[#64748b] mt-1">Made in {item.artisan_city}, {item.state_of_origin}</p>
                        </div>
                        <p className="text-[12px] text-[#64748b] italic mb-2 line-clamp-2">{item.artisan_story}</p>
                        <div className="mt-auto pt-2.5 border-t border-[#ececec] flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-1">Starting at</p>
                            <p className="text-[22px] leading-none font-extrabold tracking-tight text-[#0e1e3f]">Rs {item.price}</p>
                            <p className="text-[10px] text-[#64748b] mt-1">per item</p>
                          </div>
                        </div>
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    handleTrackViewed({ id: item.id, name: item.name, image: item.images[0], price: item.price, tab_type: 'go-local' })
                              handleStartBooking({ id: item.id, name: item.name, price: item.price, image: item.images[0], moq: item.moq, description: item.artisan_story })
                            }}
                            className="h-11 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[13px] font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.24)]"
                          >
                            Support & Order
                                </button>
                          <button onClick={() => setStoryModal(item.id)} className="h-11 rounded-lg border border-[#cbd5e1] text-[13px] font-semibold hover:bg-slate-50 transition-colors">View Story</button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {activeTab === 'baskets' && (
                      <>
                  <div className="mb-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="min-w-max">
                      <button
                        onClick={() => setBasketBuilderOpen(true)}
                        className="h-10 px-5 rounded-full border border-[#cbd5e1] text-[14px] font-semibold inline-flex items-center gap-2 bg-white/80 hover:bg-white transition-colors"
                      >
                        <Gift className="w-4 h-4" /> 🎁 Build Your Own Basket
                      </button>
                    </div>
                  </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {filteredBaskets.map((item) => (
                      <article key={item.id} className="bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition-all group h-full flex flex-col">
                        <div className="h-44 relative">
                          <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover saturate-110" />
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2.5 h-6 rounded-full bg-amber-100 text-amber-700 inline-flex items-center border border-amber-200 shadow-sm">
                            Basket Collection
                          </span>
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2.5 h-6 rounded-full bg-white/95 text-[#0e1e3f] inline-flex items-center border border-[#e2e8f0] shadow-sm">
                            {item.packaging_type}
                          </span>
                        </div>
                        <div className="p-3 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                                <div className="flex -space-x-2 mb-2">
                                  {item.images.slice(0, 3).map((img, idx) => <img key={idx} src={img} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />)}
                                  {item.basket_contents.length > 3 && <span className="ml-3 text-[11px] text-[#64748b]">+ {item.basket_contents.length - 3} more</span>}
                                </div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">Curated gifting basket</p>
                          <p className="text-sm font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[36px]">{item.name}</p>
                          <p className="text-xs text-[#878e9e] mb-2 line-clamp-2 min-h-[28px]">
                            {item.basket_contents.slice(0, 2).join(', ')} and more thoughtfully curated items.
                          </p>
                          <div className="rounded-xl border border-[#bfdbfe] bg-[linear-gradient(90deg,rgba(239,246,255,0.9),rgba(219,234,254,0.85))] p-2 mb-2.5 shadow-[0_4px_14px_rgba(37,99,235,0.10)]">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563eb] mb-1">MOQ</p>
                            <p className="text-[12px] text-[#334155]">
                              Minimum order quantity: <span className="font-bold text-[#0e1e3f]">{item.moq} sets</span>
                            </p>
                          </div>
                          <div className="text-[11px] text-[#64748b] mb-2">
                            <span className="inline-flex items-center gap-1 mr-3"><Star className="w-3 h-3" />~{item.total_weight_kg} kg</span>
                            <span className="inline-flex items-center gap-1 mr-3"><Package className="w-3 h-3" />Premium gift box</span>
                            <span className="inline-flex items-center gap-1"><Truck className="w-3 h-3" />Ships in {item.delivery_days}-{item.delivery_days + 2} days</span>
                          </div>
                          <div className="mt-auto pt-2.5 border-t border-[#ececec] flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-1">Starting at</p>
                              <p className="text-[22px] leading-none font-extrabold tracking-tight text-[#0e1e3f]">Rs {item.price}</p>
                              <p className="text-[10px] text-[#64748b] mt-1">per set</p>
                            </div>
                          </div>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                            <button onClick={() => setBasketDetailOpen(item.id)} className="h-11 rounded-lg border border-[#cbd5e1] text-[13px] font-semibold hover:bg-slate-50 transition-colors">View Basket</button>
                                  <button
                              onClick={() => handleStartBooking({ id: item.id, name: item.name, price: item.price, image: item.images[0], moq: item.moq, description: item.basket_contents.join(', ') })}
                              className="h-11 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[13px] font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.24)]"
                                  >
                                    Get Quote
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </>
                    )}

              {activeTab === 'celebrations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredCelebrations.map((card) => {
                    const isCustom = card.occasion === 'Custom Occasion'
                    return (
                      <article
                        key={card.id}
                        className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm hover:shadow-[0_16px_32px_rgba(37,99,235,0.16)] motion-safe:hover:-translate-y-1 transition-all motion-safe:duration-200 motion-reduce:transform-none flex flex-col"
                      >
                        {/* Card Image Backdrop */}
                        <div
                          className="relative h-[160px] flex flex-col justify-between p-4"
                          style={{ background: `linear-gradient(135deg, ${card.gradient_from}, ${card.gradient_to})` }}
                        >
                          {/* Category Tags */}
                          <div className="flex gap-1.5 flex-wrap">
                            {card.category_tags.map((tag) => (
                              <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                                {tag}
                              </span>
                            ))}
                </div>
                          {/* Occasion name */}
                          <div>
                            <h3 className="text-[22px] font-bold text-white leading-tight drop-shadow-sm">{card.occasion}</h3>
                          </div>
                          {/* Curated count badge */}
                          {!isCustom && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-semibold text-[#0e1e3f] shadow-sm">
                                <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                                {card.curated_count} products
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col">
                          <p className="text-[13px] text-[#64748b] mb-3 leading-relaxed">
                            {isCustom
                              ? 'Tell us about your unique occasion and we\'ll curate the perfect gifting collection for you.'
                              : `Browse ${card.curated_count} curated products carefully selected for ${card.occasion} gifting — from branded apparel to wellness sets.`}
                          </p>
                          <div className="mt-auto grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                                if (isCustom) {
                        setCustomOccasionOpen(true)
                                } else {
                      navigate('/gifting/shop', { state: { occasion: card.occasion, preselectedOccasion: card.occasion } })
                                }
                              }}
                              className="h-10 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
                            >
                              {isCustom ? 'Request Custom' : 'Browse Collection'}
                  </button>
                            <button
                              onClick={() => setCustomOccasionOpen(true)}
                              className="h-10 rounded-full border border-[#cbd5e1] text-[13px] font-semibold hover:bg-slate-50 transition-colors"
                            >
                              Get Quote
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
              </div>
            )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>



      {comboDrawer && (
        <div className="fixed inset-0 z-[80] bg-[rgba(0,0,0,0.4)] backdrop-blur-[4px]" onClick={() => setComboDrawer(null)}>
          <aside
            className="absolute right-0 top-0 h-full w-full sm:w-[380px] bg-white sm:rounded-l-xl border-l border-[#ececec] overflow-hidden transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 px-6 border-b border-[#ececec] flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#0e1e3f]">{comboById[comboDrawer].name}</h3>
              <button onClick={() => setComboDrawer(null)} className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="h-[calc(100%-150px)] overflow-y-auto px-6 py-5">
              <img src={comboMainImage ?? comboById[comboDrawer].images[0]} alt="" className="w-full h-[200px] object-cover rounded-lg" />
              <div className="grid grid-cols-4 gap-2 mt-3">
                {comboById[comboDrawer].images.slice(0, 4).map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setComboMainImage(img)}
                    className={`h-[60px] rounded-lg overflow-hidden border-2 ${comboMainImage === img ? 'border-[#2563eb]' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <h4 className="mt-5 text-[14px] font-semibold text-[#0e1e3f] border-l-4 border-[#2563eb] pl-2">What's included</h4>
              <div className="space-y-2 mt-2">
                {comboById[comboDrawer].included_items.map((it, index) => (
                  <div key={it} className="h-10 flex items-center gap-2 text-[14px]">
                    <img
                      src={comboById[comboDrawer].images[index % comboById[comboDrawer].images.length]}
                      alt={it}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <span className="flex-1">{it}</span>
                    <span className="text-[13px] text-[#878e9e]">Rs {399 + index * 100}</span>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-[#878e9e] mt-3 text-right">Individual total: Rs {comboById[comboDrawer].bundle_price + 500}</p>
              <p className="text-[16px] font-semibold text-[#2563eb] text-right">Bundle price: Rs {comboById[comboDrawer].bundle_price}</p>
              <p className="text-[13px] text-emerald-600 text-right pb-3">You save Rs 500 ({comboById[comboDrawer].savings_pct}%)</p>
              <div className="border-t border-[#ececec] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#0e1e3f]">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setComboQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded border border-[#e5e7eb]">-</button>
                    <span className="min-w-[24px] text-center">{comboQuantity}</span>
                    <button onClick={() => setComboQuantity((q) => q + 1)} className="w-8 h-8 rounded border border-[#e5e7eb]">+</button>
                  </div>
                </div>
                <h4 className="text-[14px] font-semibold text-[#0e1e3f] mb-2">Customisation</h4>
                <div className="space-y-2">
                  <div className="h-11 rounded-lg border border-[#e5e7eb] px-3 flex items-center justify-between">
                    <span className="text-[14px]">Branding on products</span>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                  <div className="h-11 rounded-lg border border-[#e5e7eb] px-3 flex items-center justify-between">
                    <span className="text-[14px]">Add brand message card</span>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[86px] px-6 border-t border-[#ececec] bg-white grid grid-cols-2 gap-2 py-4">
              <button
                onClick={() => {
                  const combo = comboById[comboDrawer]
                  setComboDrawer(null)
                  handleStartBooking({
                    id: combo.id,
                    name: combo.name,
                    price: combo.bundle_price,
                    image: combo.images[0],
                    moq: combo.moq,
                    description: combo.included_items.join(', '),
                  })
                }}
                className="h-11 rounded-full bg-[#2563eb] text-white font-semibold"
              >
                Request Custom Quote
              </button>
              <button
                onClick={() => setToastMessage('Saved to wishlist ♥')}
                className="h-11 rounded-full border border-[#cbd5e1] font-semibold"
              >
                Save to Wishlist
              </button>
            </div>
          </aside>
        </div>
      )}

      {storyModal && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4" onClick={() => setStoryModal(null)}>
          <div className="w-full max-w-[560px] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.22)]" onClick={(e) => e.stopPropagation()}>
            <img src={localById[storyModal].artisan_image} alt="" className="w-full h-[200px] object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between"><h3 className="text-[20px] font-bold">{localById[storyModal].artisan_name}</h3><button onClick={() => setStoryModal(null)}><X /></button></div>
              <p className="text-sm text-[#878e9e]">{localById[storyModal].artisan_city} · {localById[storyModal].craft_type}</p>
              <p className="mt-4 text-[15px] leading-7 text-[#334155]">{localById[storyModal].artisan_story}</p>
              <div className="mt-4">
                <h4 className="text-[14px] font-semibold mb-2">More by this artisan</h4>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {giftingGoLocalProducts
                    .filter((p) => p.id !== storyModal && p.artisan_name === localById[storyModal].artisan_name)
                    .slice(0, 3)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setStoryModal(p.id)}
                        className="w-[140px] shrink-0 text-left border border-[#e2e8f0] rounded-xl overflow-hidden"
                      >
                        <img src={p.images[0]} alt={p.name} className="h-20 w-full object-cover" />
                        <div className="p-2 text-[11px] font-semibold line-clamp-2">{p.name}</div>
                      </button>
                    ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setStoryModal(null)
                  const product = localById[storyModal]
                  handleStartBooking({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    moq: product.moq,
                    description: product.artisan_story,
                  })
                }}
                className="w-full h-11 mt-4 rounded-xl bg-[#2563eb] text-white font-semibold"
              >
                Support this artisan
              </button>
            </div>
          </div>
        </div>
      )}

      {giftModal && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4" onClick={() => setGiftModal(null)}>
          <div className="w-full max-w-[560px] bg-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(15,23,42,0.22)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Personalise & Send</h3><button onClick={() => setGiftModal(null)}><X /></button></div>
            <p className="text-sm text-[#64748b] mt-1">Step {giftStep} of 4</p>
            {giftStep === 1 && (
              <div className="mt-4">
                <h4 className="text-[16px] font-semibold mb-3">Choose a card design</h4>
                <div className="grid grid-cols-3 gap-3">
                  {['Classic', 'Festive', 'Minimal', 'Premium', 'Bold', 'Elegant'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setGiftTemplate(t)}
                      className={`h-24 rounded-lg border-2 ${giftTemplate === t ? 'border-[#2563eb]' : 'border-transparent'} text-white text-[12px] font-semibold`}
                      style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {giftStep === 2 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <input value={giftRecipient} onChange={(e) => setGiftRecipient(e.target.value)} className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Recipient name" />
                  <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value.slice(0, 140))} className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" rows={4} placeholder="Message" />
                  <p className="text-[12px] text-[#878e9e]">{giftMessage.length} / 140</p>
                  <input value={giftSender} onChange={(e) => setGiftSender(e.target.value)} className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Send from" />
                </div>
                <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>
                  <p className="text-[12px] opacity-80 mb-2">Preview</p>
                  <p className="text-[18px] font-semibold">{giftRecipient || 'Recipient'}</p>
                  <p className="text-[13px] mt-2 opacity-90">{giftMessage || 'Your message appears here'}</p>
                  <p className="text-[12px] mt-4 opacity-80">- {giftSender || 'Sender'}</p>
                </div>
              </div>
            )}
            {giftStep === 3 && (
              <div className="mt-4 space-y-2">
                <input value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Recipient email" />
                <div className="flex items-center gap-2">
                  <span className="h-11 px-3 rounded-xl border border-[#e5e7eb] bg-slate-50 inline-flex items-center">+91</span>
                  <input value={giftWhatsapp} onChange={(e) => setGiftWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))} className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="WhatsApp number" />
                </div>
                <input value={giftSms} onChange={(e) => setGiftSms(e.target.value.replace(/\D/g, '').slice(0, 10))} className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="SMS number" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={giftScheduleDate} onChange={(e) => setGiftScheduleDate(e.target.value)} className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" />
                  <input type="time" value={giftScheduleTime} onChange={(e) => setGiftScheduleTime(e.target.value)} className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" />
                </div>
              </div>
            )}
            {giftStep === 4 && (
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {[500, 1000, 2000, 5000].map((d) => (
                    <button key={d} onClick={() => setSelectedDenomination(d)} className={`h-8 px-3 rounded-full text-[13px] ${selectedDenomination === d ? 'bg-[#2563eb] text-white' : 'border border-[#cbd5e1]'}`}>Rs {d}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGiftQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded border">-</button>
                  <span className="min-w-[28px] text-center">{giftQuantity}</span>
                  <button onClick={() => setGiftQuantity((q) => q + 1)} className="w-8 h-8 rounded border">+</button>
                </div>
                <p className="text-[18px] font-bold text-[#2563eb]">Total: Rs {selectedDenomination * giftQuantity}</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setGiftStep((s) => Math.max(1, s - 1))} className="h-11 px-4 rounded-xl border border-[#cbd5e1] font-medium">← Back</button>
              {giftStep < 4 ? (
                <button
                  onClick={() => setGiftStep((s) => Math.min(4, s + 1))}
                  disabled={
                    (giftStep === 1 && !giftTemplate) ||
                    (giftStep === 2 && !giftRecipient.trim()) ||
                    (giftStep === 3 && !giftEmail.trim() && !giftWhatsapp.trim() && !giftSms.trim())
                  }
                  className="h-11 px-4 rounded-xl bg-[#2563eb] text-white font-semibold disabled:opacity-40"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setGiftModal(null)
                    setToastMessage(`🎁 Gift sent to ${giftEmail || '+91 ' + giftWhatsapp}!`)
                  }}
                  className="h-11 px-4 rounded-xl bg-[#2563eb] text-white font-semibold"
                >
                  Confirm & Pay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {bulkGiftOpen && (
        <div className="fixed inset-0 z-[93] bg-black/40 flex items-center justify-center p-4" onClick={() => setBulkGiftOpen(false)}>
          <div className="w-full max-w-[520px] bg-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(15,23,42,0.22)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#0e1e3f]">Bulk E-gift Inquiry</h3>
              <button onClick={() => setBulkGiftOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              <input className="h-11 rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Company name" />
              <input className="h-11 rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Quantity" />
              <input className="h-11 rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Value per gift" />
              <input className="h-11 rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Contact" />
            </div>
            <button
              onClick={() => {
                setBulkGiftOpen(false)
                setToastMessage('Bulk E-gift inquiry submitted')
              }}
              className="w-full h-11 rounded-full bg-[#2563eb] text-white font-semibold mt-4"
            >
              Submit Inquiry
            </button>
          </div>
        </div>
      )}

      {quoteOpen && (
        <div className="fixed inset-0 z-[92] bg-black/40 flex items-center justify-center p-4" onClick={() => setQuoteOpen(false)}>
          <div className="w-full max-w-[520px] bg-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(15,23,42,0.22)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#0e1e3f]">Request Quote</h3>
              <button onClick={() => setQuoteOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              <input className="h-11 rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Company name" />
              <input className="h-11 rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Contact email" />
              <input className="h-11 rounded-xl border border-[#e5e7eb] px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Expected quantity" />
              <textarea className="rounded-xl border border-[#e5e7eb] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" rows={4} placeholder="Requirements" />
            </div>
            <button
              onClick={() => {
                setQuoteOpen(false)
                setToastMessage('Quote request submitted')
              }}
              className="w-full h-11 rounded-full bg-[#2563eb] text-white font-semibold mt-4"
            >
              Submit Quote Request
            </button>
          </div>
        </div>
      )}

      {basketBuilderOpen && (
        <div className="fixed inset-0 z-[95] bg-white overflow-auto">
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            <div className="flex justify-between items-center mb-5"><h2 className="text-2xl font-semibold">🎁 Build Your Own Basket</h2><button onClick={() => setBasketBuilderOpen(false)}><X /></button></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3 space-y-2">
                {giftingBasketsProducts.map((item) => (
                  <div key={item.id} className="h-14 border rounded-lg px-3 flex items-center justify-between">
                    <div className="flex items-center gap-2"><img src={item.images[0]} alt="" className="w-8 h-8 rounded object-cover" /><span>{item.name}</span></div>
                    {basketItems[item.id] ? (
                      <div className="flex items-center gap-2"><button onClick={() => setBasketItems((p) => ({ ...p, [item.id]: Math.max(0, (p[item.id] || 0) - 1) }))}>-</button><span>{basketItems[item.id]}</span><button onClick={() => setBasketItems((p) => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))}>+</button></div>
                    ) : <button onClick={() => setBasketItems((p) => ({ ...p, [item.id]: 1 }))} className="h-8 px-3 rounded border">Add +</button>}
                  </div>
                ))}
              </div>
              <aside className="lg:col-span-2 border rounded-xl p-4 h-fit sticky top-5">
                <h3 className="text-lg font-semibold">Your Basket</h3>
                <p className="text-sm text-[#64748b] mt-2">{Object.values(basketItems).reduce((a, b) => a + b, 0) ? 'Items added' : 'Add items from the left to build your basket'}</p>
                <div className="mt-4 text-sm">Weight: {basketWeight.toFixed(1)} / 3 kg</div>
                <div className="h-2 bg-slate-100 rounded mt-1"><div className="h-2 bg-[#2563eb] rounded" style={{ width: `${Math.min((basketWeight / 3) * 100, 100)}%` }} /></div>
                <div className="mt-4 text-sm">Total: <span className="text-[22px] font-bold text-[#2563eb]">Rs {basketTotal}</span></div>
                <button
                  onClick={() => {
                    setBasketBuilderOpen(false)
                    setToastMessage('Custom basket saved! Quote in 2 hours. 📦')
                  }}
                  className="w-full h-11 mt-4 rounded-lg bg-[#2563eb] text-white font-semibold disabled:opacity-40"
                  disabled={Object.values(basketItems).reduce((a, b) => a + b, 0) < 2}
                >
                  Save & Request Quote
                </button>
              </aside>
            </div>
          </div>
        </div>
      )}

      {basketDetailOpen && (
        <div className="fixed inset-0 z-[96] bg-black/40" onClick={() => setBasketDetailOpen(null)}>
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white border-l border-[#e2e8f0] p-5 overflow-auto shadow-[-12px_0_30px_rgba(15,23,42,0.16)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold">{giftingBasketsProducts.find((b) => b.id === basketDetailOpen)?.name}</h3>
              <button onClick={() => setBasketDetailOpen(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 space-y-2">
              {(giftingBasketsProducts.find((b) => b.id === basketDetailOpen)?.basket_contents || []).map((it) => (
                <div key={it} className="h-10 flex items-center justify-between text-[14px] border-b border-[#f1f5f9]">
                  <span>{it}</span>
                  <span className="text-[#878e9e]">Rs 299</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-[13px] text-[#64748b]">Pricing tiers: 25+ / 100+ / 250+ custom</div>
            <button
              onClick={() => {
                setBasketDetailOpen(null)
                const basket = giftingBasketsProducts.find((b) => b.id === basketDetailOpen)
                if (!basket) return
                handleStartBooking({
                  id: basket.id,
                  name: basket.name,
                  price: basket.price,
                  image: basket.images[0],
                  moq: basket.moq,
                  description: basket.basket_contents.join(', '),
                })
              }}
              className="w-full h-11 mt-4 rounded-full bg-[#2563eb] text-white font-semibold"
            >
              Request Quote
            </button>
          </aside>
        </div>
      )}

      {customOccasionOpen && (
        <div className="fixed inset-0 z-[95] bg-black/40 flex items-center justify-center p-4" onClick={() => setCustomOccasionOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(15,23,42,0.22)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-semibold">Create Your Occasion</h3>
            <p className="text-[14px] text-[#64748b] mt-1">Tell us what you're celebrating</p>
            <input
              value={customOccasionName}
              onChange={(e) => setCustomOccasionName(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 mt-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              placeholder="Occasion Name"
            />
            <textarea
              value={customOccasionRequirement}
              onChange={(e) => setCustomOccasionRequirement(e.target.value)}
              className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2 mt-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              rows={4}
              placeholder="Describe your gifting requirement"
            />
            <input
              value={customOccasionBudget}
              onChange={(e) => setCustomOccasionBudget(e.target.value.replace(/\D/g, ''))}
              className="h-11 w-full rounded-xl border border-[#e5e7eb] px-3 mt-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              placeholder="Approx. budget per person (₹)"
            />
            <button
              onClick={() => {
                setCustomOccasionOpen(false)
                setCustomOccasionName('')
                setCustomOccasionRequirement('')
                setCustomOccasionBudget('')
                setToastMessage("Request received! We'll build your custom collection within 24 hours. ✨")
              }}
              disabled={!customOccasionName.trim() || customOccasionRequirement.trim().length < 30}
              className="w-full h-11 rounded-xl bg-[#2563eb] text-white mt-3 font-semibold disabled:opacity-40"
            >
              Submit Request
            </button>
            <button onClick={() => setCustomOccasionOpen(false)} className="w-full h-11 rounded-xl border border-[#cbd5e1] mt-2 font-medium">Cancel</button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed right-4 bottom-4 z-[120] px-4 py-2 rounded-lg bg-[#0f172a] text-white text-[13px] shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
