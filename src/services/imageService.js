// /src/services/imageService.js
// Service untuk menangani loading gambar dengan CORS handling

class ImageService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL
    this.cache = new Map()
  }

  // Method utama untuk mendapatkan image URL yang aman
  getImageUrl(product) {
    if (!product) return this.getPlaceholderUrl()

    // Priority: imageUrl > image > placeholder
    const imageUrl = product.imageUrl || product.image
    if (!imageUrl) return this.getPlaceholderUrl()

    return this.processImageUrl(imageUrl)
  }

  // Process image URL untuk menghindari CORS
  processImageUrl(imageUrl) {
    if (!imageUrl) return this.getPlaceholderUrl()

    // Jika sudah full URL dan dari domain yang sama dengan API
    if (imageUrl.startsWith('http')) {
      if (this.isSameDomain(imageUrl)) {
        // Try multiple approaches untuk same domain
        return this.createCORSSafeUrl(imageUrl)
      }
      // External URL, return as-is
      return imageUrl
    }

    // Relative path, construct dengan base URL
    return this.createCORSSafeUrl(`${this.baseURL}/${imageUrl}`)
  }

  // Check apakah URL dari domain yang sama dengan API
  isSameDomain(imageUrl) {
    try {
      const imageHostname = new URL(imageUrl).hostname
      const apiHostname = new URL(this.baseURL).hostname
      return imageHostname === apiHostname
    } catch {
      return false
    }
  }

  // Create CORS-safe URL dengan berbagai strategi
  createCORSSafeUrl(originalUrl) {
    // Strategy 1: Use data URL dari canvas (untuk same-origin)
    if (this.isSameDomain(originalUrl)) {
      return this.createDataUrl(originalUrl)
    }

    // Strategy 2: Return original URL dengan crossorigin
    return originalUrl
  }

  // Convert image ke data URL untuk menghindari CORS
  async createDataUrl(imageUrl) {
    // Check cache first
    if (this.cache.has(imageUrl)) {
      return this.cache.get(imageUrl)
    }

    try {
      // Fetch image sebagai blob
      const response = await fetch(imageUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'image/*'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const dataUrl = await this.blobToDataUrl(blob)
      
      // Cache result
      this.cache.set(imageUrl, dataUrl)
      return dataUrl

    } catch (error) {
      console.warn('Failed to create data URL for:', imageUrl, error)
      return imageUrl // Fallback to original URL
    }
  }

  // Convert blob to data URL
  blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  }

  // Get placeholder URL
  getPlaceholderUrl(width = 300, height = 200, text = 'No Image') {
    return `https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg`
  }

  // Advanced error handling dengan retry strategies
  async handleImageError(imgElement, product, retryCount = 0) {
    const maxRetries = 3
    
    if (retryCount >= maxRetries) {
      // Final fallback
      imgElement.src = this.getPlaceholderUrl()
      imgElement.classList.add('image-error')
      return
    }

    try {
      const strategies = [
        () => this.tryWithCrossOrigin(imgElement, product),
        () => this.tryWithProxy(imgElement, product), 
        () => this.tryDirectUrl(imgElement, product)
      ]

      const strategy = strategies[retryCount]
      if (strategy) {
        await strategy()
      }
    } catch (error) {
      console.warn(`Image retry ${retryCount + 1} failed:`, error)
      // Retry dengan strategy berikutnya
      setTimeout(() => {
        this.handleImageError(imgElement, product, retryCount + 1)
      }, 100)
    }
  }

  // Strategy 1: Try dengan crossorigin attribute
  async tryWithCrossOrigin(imgElement, product) {
    return new Promise((resolve, reject) => {
      imgElement.crossOrigin = 'anonymous'
      imgElement.onload = resolve
      imgElement.onerror = reject
      
      const originalUrl = this.getOriginalImageUrl(product)
      if (originalUrl) {
        imgElement.src = originalUrl
      } else {
        reject(new Error('No original URL'))
      }
    })
  }

  // Strategy 2: Try dengan proxy endpoint
  async tryWithProxy(imgElement, product) {
    return new Promise((resolve, reject) => {
      imgElement.onload = resolve
      imgElement.onerror = reject
      
      const originalUrl = this.getOriginalImageUrl(product)
      if (originalUrl) {
        const imagePath = originalUrl.replace(this.baseURL, '')
        imgElement.src = `${this.baseURL}/api/v1/proxy/image?path=${encodeURIComponent(imagePath)}`
      } else {
        reject(new Error('No original URL'))
      }
    })
  }

  // Strategy 3: Try direct URL
  async tryDirectUrl(imgElement, product) {
    return new Promise((resolve, reject) => {
      imgElement.crossOrigin = null
      imgElement.onload = resolve
      imgElement.onerror = reject
      
      const originalUrl = this.getOriginalImageUrl(product)
      if (originalUrl) {
        imgElement.src = originalUrl
      } else {
        reject(new Error('No original URL'))
      }
    })
  }

  // Get original image URL dari product
  getOriginalImageUrl(product) {
    if (product.imageUrl) {
      return product.imageUrl.startsWith('http') 
        ? product.imageUrl 
        : `${this.baseURL}/${product.imageUrl}`
    }
    
    if (product.image) {
      return product.image.startsWith('http') 
        ? product.image 
        : `${this.baseURL}/${product.image}`
    }
    
    return null
  }

  // Clear cache untuk memory management
  clearCache() {
    this.cache.clear()
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size
  }
}

// Export singleton instance
export default new ImageService()