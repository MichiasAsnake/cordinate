"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ExternalLink } from "lucide-react";

interface ImageData {
  asset_tag: string;
  thumbnail_url: string;
  high_res_url: string;
  thumbnail_base_path: string;
  high_res_base_path: string;
}

interface ImageGalleryProps {
  images: ImageData[];
  maxThumbnails?: number;
}

export function ImageGallery({ images, maxThumbnails = 3 }: ImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Use original images directly - no proxy conversion needed
  const workingImages = images || [];

  // Helper function to identify if an image is a thumbnail
  const isThumbnailImage = (imageUrl: string): boolean => {
    return (
      imageUrl.includes("/thumbnails/") ||
      imageUrl.includes("_50.png") ||
      imageUrl.includes("_50.jpg")
    );
  };

  // Get all available thumbnails for navigation
  const availableThumbnails = React.useMemo(() => {
    if (!workingImages || workingImages.length === 0) return [];
    return workingImages.filter(
      (img) => img.thumbnail_url && img.thumbnail_url.trim() !== ""
    );
  }, [workingImages]);

  // Filter images to only include high-res (non-thumbnail) images for the modal
  const highResImages = React.useMemo(() => {
    if (!workingImages || workingImages.length === 0) return [];

    return workingImages.filter((image) => {
      // A high-res image should have a high_res_url that is not a thumbnail
      const isHighRes =
        image.high_res_url &&
        image.high_res_url.trim() !== "" &&
        !isThumbnailImage(image.high_res_url);

      return isHighRes;
    });
  }, [workingImages]);

  // Smart error handling that tracks failures and can trigger refresh
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const originalUrl = target.src;

    // Don't retry if already using placeholder
    if (target.src.includes("placeholder") || target.src.startsWith("data:")) {
      return;
    }

    console.log(
      "Image failed to load (likely expired SAS token):",
      originalUrl
    );

    // Track this failed image
    setFailedImages((prev) => new Set(prev).add(originalUrl));

    // Try SVG placeholder first
    if (!target.dataset.svgAttempted) {
      target.dataset.svgAttempted = "true";
      target.src = "/placeholder-image.svg";
      return;
    }

    // Ultimate fallback: data URL
    target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBWMTMwTTcwIDEwMEgxMzAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2Zz4K";
    target.alt = "Image expired - refresh needed";
  };

  // Check if many images are failing (could trigger automatic refresh)
  useEffect(() => {
    if (failedImages.size > 0) {
      const totalImages = workingImages.length * 2; // thumbnail + high-res
      const failureRate = failedImages.size / totalImages;

      if (failureRate > 0.5) {
        // If more than 50% of images are failing
        console.warn(
          `High image failure rate (${Math.round(
            failureRate * 100
          )}%) - consider refreshing image URLs`
        );
        // Here you could automatically trigger the refresh API
        // refreshExpiredImages();
      }
    }
  }, [failedImages, workingImages]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // Reset current image index if it's out of bounds after filtering
  useEffect(() => {
    if (currentImageIndex >= highResImages.length && highResImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [highResImages.length, currentImageIndex]);

  // Reset thumbnail index if out of bounds
  useEffect(() => {
    if (
      currentThumbnailIndex >= availableThumbnails.length &&
      availableThumbnails.length > 0
    ) {
      setCurrentThumbnailIndex(0);
    }
  }, [availableThumbnails.length, currentThumbnailIndex]);

  // If no images at all, show no images message
  if (!images || images.length === 0 || availableThumbnails.length === 0) {
    return <span className="text-muted-foreground text-sm">No images</span>;
  }

  const openModal = () => {
    if (highResImages.length > 0) {
      setCurrentImageIndex(0);
      setIsModalOpen(true);
    }
  };

  const nextModalImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % highResImages.length);
  };

  const prevModalImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + highResImages.length) % highResImages.length
    );
  };

  const nextThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    setCurrentThumbnailIndex((prev) => (prev + 1) % availableThumbnails.length);
  };

  const prevThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    setCurrentThumbnailIndex(
      (prev) =>
        (prev - 1 + availableThumbnails.length) % availableThumbnails.length
    );
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const currentThumbnail = availableThumbnails[currentThumbnailIndex];

  return (
    <>
      {/* Thumbnail Display with Navigation */}
      <div className="relative group">
        {/* Main Thumbnail - Larger Size */}
        <div
          className="relative w-20 h-20 rounded-md overflow-hidden border border-border hover:border-accent transition-all duration-200 hover:shadow-md cursor-pointer"
          onClick={openModal}
        >
          <img
            src={currentThumbnail.thumbnail_url}
            alt={`Asset ${currentThumbnail.asset_tag}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />

          {/* Click to view overlay - only if high-res images exist */}
          {highResImages.length > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}

          {/* Navigation buttons - only show if there are multiple thumbnails */}
          {availableThumbnails.length > 1 && (
            <>
              <button
                onClick={prevThumbnail}
                className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous thumbnail"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>

              <button
                onClick={nextThumbnail}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next thumbnail"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Asset Tag Label and Image Counter */}
        <div className="text-xs text-muted-foreground mt-1 text-center">
          <div className="truncate">{currentThumbnail.asset_tag}</div>
          {availableThumbnails.length > 1 && (
            <div className="text-xs text-muted-foreground/70">
              {currentThumbnailIndex + 1} of {availableThumbnails.length}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Only show if there are high-res images */}
      {isModalOpen && highResImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="relative max-w-4xl max-h-full bg-card rounded-lg overflow-hidden shadow-2xl border border-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-muted/50 border-b border-border">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-foreground">
                  Asset: {highResImages[currentImageIndex].asset_tag}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {currentImageIndex + 1} of {highResImages.length} high-res
                  images
                </span>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="relative bg-muted/20">
              <img
                src={highResImages[currentImageIndex].high_res_url}
                alt={`Asset ${highResImages[currentImageIndex].asset_tag}`}
                className="max-w-full max-h-[70vh] object-contain mx-auto block"
                onError={handleImageError}
              />

              {/* Modal Navigation */}
              {highResImages.length > 1 && (
                <>
                  <button
                    onClick={prevModalImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background text-foreground rounded-full p-2 transition-all duration-200 shadow-lg border border-border"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextModalImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background text-foreground rounded-full p-2 transition-all duration-200 shadow-lg border border-border"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer - High-res Thumbnail Strip */}
            {highResImages.length > 1 && (
              <div className="p-4 bg-muted/50 border-t border-border">
                <div className="flex space-x-2 overflow-x-auto">
                  {highResImages.map((image, index) => (
                    <button
                      key={`${image.asset_tag}-${index}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all duration-200 ${
                        index === currentImageIndex
                          ? "border-primary shadow-md ring-2 ring-primary/20"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      <img
                        src={image.thumbnail_url}
                        alt={`Asset ${image.asset_tag}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
