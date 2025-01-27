// Ensure all images are displayed correctly by checking for any lazy-loaded images
document.querySelectorAll('img[data-src]').forEach((img) => {
  if (!img.src) {
    img.src = img.getAttribute('data-src');
  }
});

// Additional fix for lazy-loaded images using "srcset"
document.querySelectorAll('img[srcset]').forEach((img) => {
  if (!img.src && img.srcset) {
    img.src = img.srcset.split(",")[0].split(" ")[0];
  }
});
