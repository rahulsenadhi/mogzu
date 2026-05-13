import { useState } from 'react';
import { Product } from '../data/apparelProducts';
import { useNavigate } from 'react-router';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export default function RelatedProducts({ products, title = "Related Products" }: RelatedProductsProps) {
  const navigate = useNavigate();
  const [relatedNotice, setRelatedNotice] = useState<string | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <div>
      {relatedNotice ? (
        <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {relatedNotice}
        </p>
      ) : null}
      <div className="grid grid-cols-4 gap-4">
        {products.map((product: any) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden border border-[#ececec] hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                {product.discount && (
                  <span className="px-1.5 py-0.5 bg-[#ef4444] text-white text-[10px] font-bold rounded">
                    {product.discount}% OFF
                  </span>
                )}
                {product.bestSeller && (
                  <span className="px-1.5 py-0.5 bg-[#8b5cf6] text-white text-[10px] font-bold rounded">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRelatedNotice(`Wishlist for "${product.name}" will be available in a future release.`);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg opacity-0 group-hover:opacity-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Rating */}
              {product.rating && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{product.rating}</span>
                </div>
              )}
            </div>

            <div className="p-3">
              {/* Brand & Category */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-[#878e9e]">{product.brand}</span>
                <span className="text-[10px] text-[#4379ee] bg-[#ebf1ff] px-1.5 py-0.5 rounded-full">
                  {product.category || product.type || product.subcategory}
                </span>
              </div>

              {/* Product Name */}
              <h4 className="text-xs font-semibold text-[#0e1e3f] mb-1.5 line-clamp-2 leading-tight">
                {product.name}
              </h4>

              {/* Product Details (fabric/material/capacity) */}
              {(product.fabric || product.material || product.capacity) && (
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {product.fabric && (
                    <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded">
                      {product.fabric}
                    </span>
                  )}
                  {product.gsm && (
                    <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded">
                      {product.gsm} GSM
                    </span>
                  )}
                  {product.material && (
                    <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded">
                      {product.material}
                    </span>
                  )}
                  {product.capacity && (
                    <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded">
                      {product.capacity}
                    </span>
                  )}
                </div>
              )}

              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-2">
                  <div className="flex gap-1">
                    {product.colors.slice(0, 5).map((color: string, idx: number) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border-2 border-[#e5e7eb]"
                        style={{ 
                          backgroundColor: color === 'Black' ? '#000000' : 
                                         color === 'White' ? '#ffffff' : 
                                         color === 'Navy' ? '#1e3a8a' : 
                                         color === 'Grey' ? '#6b7280' : 
                                         color === 'Blue' ? '#2563eb' : 
                                         color === 'Red' ? '#ef4444' : color 
                        }}
                        title={color}
                      />
                    ))}
                    {product.colors.length > 5 && (
                      <div className="w-4 h-4 rounded-full border-2 border-[#e5e7eb] flex items-center justify-center text-[9px] text-[#64748b] bg-[#f9fafb]">
                        +{product.colors.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price & MOQ */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#e5e7eb]">
                <div>
                  <p className="text-[10px] text-[#878e9e]">Starting at</p>
                  <p className="text-sm font-bold text-[#0e1e3f]">
                    ₹{product.price}
                    <span className="text-[10px] font-normal text-[#878e9e]">/pc</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#878e9e]">MOQ</p>
                  <p className="text-[10px] font-semibold text-[#4379ee]">{product.moq || 25} pcs</p>
                </div>
              </div>

              {/* Delivery */}
              {product.delivery && (
                <div className="flex items-center gap-1 mb-2 text-[10px] text-[#64748b]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <path d="M16 8h5l3 3v5h-2" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>{product.delivery}</span>
                </div>
              )}

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => {
                  const routeCategory = product.routeCategory || 'apparel';
                  navigate(`/product-booking?category=${routeCategory}&id=${product.id}`);
                }}
                className="w-full px-3 py-2 bg-[#4379ee] text-white text-xs font-semibold rounded-lg hover:bg-[#3568dd] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Product Image Gallery Component
export function ProductImageGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-xl border border-[#e5e7eb]">
        <img
          src={images[selectedImage]}
          alt="Product"
          className="w-full h-[500px] object-cover"
        />
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === index
                  ? 'border-[#4379ee] scale-105'
                  : 'border-[#e5e7eb] hover:border-[#94a3b8]'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-20 h-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}