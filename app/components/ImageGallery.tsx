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

  // Helper function to identify if an image is a thumbnail
  const isThumbnailImage = (imageUrl: string): boolean => {
    return (
      imageUrl.includes("/thumbnails/") ||
      imageUrl.includes("_50.png") ||
      imageUrl.includes("_50.jpg")
    );
  };

  // Get the best thumbnail to display in the table (prefer actual thumbnails)
  const displayThumbnail = React.useMemo(() => {
    if (!images || images.length === 0) return null;

    // First, try to find a proper thumbnail
    const actualThumbnail = images.find(
      (img) =>
        isThumbnailImage(img.thumbnail_url) ||
        isThumbnailImage(img.high_res_url)
    );

    if (actualThumbnail) {
      return actualThumbnail;
    }

    // If no thumbnail found, use the first image
    return images[0];
  }, [images]);

  // Filter images to only include high-res (non-thumbnail) images for the modal
  const highResImages = React.useMemo(() => {
    if (!images || images.length === 0) return [];

    return images.filter((image) => {
      // A high-res image should have a high_res_url that is not a thumbnail
      const isHighRes =
        image.high_res_url &&
        image.high_res_url.trim() !== "" &&
        !isThumbnailImage(image.high_res_url);

      if (!isHighRes) {
        console.log(
          `Filtered out image ${image.asset_tag}: high_res_url="${
            image.high_res_url
          }" (is thumbnail: ${isThumbnailImage(image.high_res_url || "")})`
        );
      } else {
        console.log(
          `Including high-res image ${image.asset_tag}: ${image.high_res_url}`
        );
      }

      return isHighRes;
    });
  }, [images]);

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

  // If no images at all, show no images message
  if (!images || images.length === 0 || !displayThumbnail) {
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

  return (
    <>
      {/* Thumbnail Display - Always show the display thumbnail */}
      <div className="relative group cursor-pointer" onClick={openModal}>
        {/* Main Thumbnail - Larger Size */}
        <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
          <img
            src={displayThumbnail.thumbnail_url}
            alt={`Asset ${displayThumbnail.asset_tag}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-image.png";
            }}
          />

          {/* High-res count badge - only show if there are high-res images */}
          {highResImages.length > 0 && (
            <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-sm">
              {highResImages.length} HD
            </div>
          )}

          {/* No high-res indicator */}
          {highResImages.length === 0 && (
            <div className="absolute top-1 right-1 bg-gray-500 bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-sm">
              Thumb
            </div>
          )}

          {/* Click to view overlay - only if high-res images exist */}
          {highResImages.length > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
        </div>

        {/* Asset Tag Label */}
        <div className="text-xs text-gray-500 mt-1 text-center truncate">
          {displayThumbnail.asset_tag}
        </div>
      </div>

      {/* Modal - Only show if there are high-res images */}
      {isModalOpen && highResImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium">
                  Asset: {highResImages[currentImageIndex].asset_tag}
                </h3>
                <span className="text-sm text-gray-500">
                  {currentImageIndex + 1} of {highResImages.length} high-res
                  images
                </span>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="relative">
              <img
                src={highResImages[currentImageIndex].high_res_url}
                alt={`Asset ${highResImages[currentImageIndex].asset_tag}`}
                className="max-w-full max-h-[70vh] object-contain mx-auto block"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = highResImages[currentImageIndex].thumbnail_url;
                }}
              />

              {/* Modal Navigation */}
              {highResImages.length > 1 && (
                <>
                  <button
                    onClick={prevModalImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextModalImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer - High-res Thumbnail Strip */}
            {highResImages.length > 1 && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex space-x-2 overflow-x-auto">
                  {highResImages.map((image, index) => (
                    <button
                      key={`${image.asset_tag}-${index}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all duration-200 ${
                        index === currentImageIndex
                          ? "border-blue-500 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={image.thumbnail_url}
                        alt={`Asset ${image.asset_tag}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-image.png";
                        }}
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
