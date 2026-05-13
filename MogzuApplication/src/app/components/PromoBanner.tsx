import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import Slider from 'react-slick';

interface PromoOffer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  bgColor: string;
  vendor?: string;
  buttonText: string;
}

const offers: PromoOffer[] = [
  {
    id: '1',
    title: 'Special offer on Meeting space',
    subtitle: '',
    description: 'Book your next event with us and choose from a variety of tailored event packages, that ensure a seamless process and all-inclusive services.',
    image: 'https://images.unsplash.com/photo-1760611656007-f767a8082758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBtZWV0aW5nJTIwc3BhY2V8ZW58MXx8fHwxNzY5MzY2MDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    bgColor: 'linear-gradient(to right, #5b8def, #a0c4ff)',
    vendor: 'RR group',
    buttonText: 'View offer',
  },
  {
    id: '2',
    title: 'Special offer on Restaurants',
    subtitle: '',
    description: 'Enjoy exclusive dining experiences at premium restaurants. Perfect for corporate events, team dinners, and client entertainment with special corporate rates.',
    image: 'https://images.unsplash.com/photo-1621873495868-6c5774cf6012?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZGluaW5nJTIwbHV4dXJ5fGVufDF8fHx8MTc2OTM2NjM3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    bgColor: 'linear-gradient(to right, #c08552, #d4a574)',
    vendor: 'Top Restaurants',
    buttonText: 'View offer',
  },
  {
    id: '3',
    title: 'Special offer on Mogzu swag gifts',
    subtitle: '',
    description: 'Get premium branded merchandise for your team. Choose from a curated collection of high-quality corporate gifts and promotional items.',
    image: 'https://images.unsplash.com/photo-1763069228076-c7e3995e1769?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwbWVyY2hhbmRpc2UlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjkzNjM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bgColor: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
    vendor: 'Mogzu Store',
    buttonText: 'View offer',
  },
];

/** Dashboard promo click target */
const OFFER_DESTINATION = '/deals';

export default function PromoBanner() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
    arrows: false,
    customPaging: () => (
      <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-all" />
    ),
    appendDots: (dots: React.ReactNode) => (
      <div style={{ bottom: '12px' }}>
        <ul className="flex items-center justify-center gap-2">{dots}</ul>
      </div>
    ),
  };

  return (
    <div className="mb-5 relative">
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <Slider ref={sliderRef} {...settings}>
          {offers.map((offer) => (
            <div key={offer.id}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Open deals for ${offer.title}`}
                onClick={() => navigate(OFFER_DESTINATION)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(OFFER_DESTINATION);
                  }
                }}
                className="relative overflow-hidden p-5 text-white cursor-pointer"
                style={{ background: offer.bgColor, minHeight: '140px' }}
              >
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold">{offer.title}</h3>
                    {offer.vendor && (
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                        <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                          <circle cx="16" cy="16" r="12" fill="white" />
                        </svg>
                        <span className="text-xs">By {offer.vendor}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs opacity-90 mb-3 leading-relaxed">{offer.description}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(OFFER_DESTINATION);
                    }}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {offer.buttonText}
                  </button>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
                  <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Custom Navigation Arrows */}
      <button
        type="button"
        onClick={() => sliderRef.current?.slickPrev()}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center shadow-lg transition-colors"
        aria-label="Previous slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => sliderRef.current?.slickNext()}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center shadow-lg transition-colors"
        aria-label="Next slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Slide Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <span className="text-white text-xs font-medium">{currentSlide + 1} / {offers.length}</span>
      </div>
    </div>
  );
}