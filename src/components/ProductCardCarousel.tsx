import { useEffect, useRef, useState } from 'react';

type Props = {
  images: string[];
  /** When false, show first image only (e.g. optimistic posting). */
  interactive: boolean;
};

export default function ProductCardCarousel({ images, interactive }: Props) {
  const [i, setI] = useState(0);
  const n = images.length;
  const touchStart = useRef<number | null>(null);
  const showGallery = n > 1 && interactive;
  const showBadge = n >= 1 && interactive;

  useEffect(() => {
    setI((prev) => (n > 0 ? prev % n : 0));
  }, [n]);

  const go = (dir: -1 | 1) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setI((prev) => (prev + dir + n) % n);
  };

  const pick = (idx: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setI(idx);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null || !showGallery) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 36) {
      e.stopPropagation();
      setI((prev) => (prev + (diff < 0 ? 1 : -1) + n) % n);
    }
    touchStart.current = null;
  };

  if (n === 0) {
    return <div className="product-card__placeholder">No photo</div>;
  }

  return (
    <div className="product-card-carousel">
      <div
        className="product-card-carousel__track"
        onTouchStart={showGallery ? onTouchStart : undefined}
        onTouchEnd={showGallery ? onTouchEnd : undefined}
      >
        <div className="product-card-carousel__slides" style={{ transform: `translateX(-${i * 100}%)` }}>
          {images.map((src, idx) => (
            <div key={idx} className="product-card-carousel__slide">
              <img src={src} alt="" loading={idx === 0 ? 'eager' : 'lazy'} className="product-card-carousel__img" />
            </div>
          ))}
        </div>
      </div>
      {showGallery && (
        <>
          <button
            type="button"
            className="product-card-carousel__arrow product-card-carousel__arrow--prev"
            onClick={go(-1)}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            type="button"
            className="product-card-carousel__arrow product-card-carousel__arrow--next"
            onClick={go(1)}
            aria-label="Next photo"
          >
            ›
          </button>
          <div className="product-card-carousel__thumbs" onClick={(e) => e.stopPropagation()}>
            {images.map((url, idx) => (
              <button
                key={idx}
                type="button"
                className={`product-card-carousel__thumb${idx === i ? ' is-active' : ''}`}
                onClick={pick(idx)}
                aria-label={`Show photo ${idx + 1}`}
              >
                <img src={url} alt="" />
              </button>
            ))}
          </div>
        </>
      )}
      {showBadge && (
        <span className="product-card-carousel__badge" aria-hidden>
          {n > 1 ? `${i + 1}/${n}` : `1/${n}`}
        </span>
      )}
    </div>
  );
}
