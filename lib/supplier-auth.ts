// Helper utility for supplier authentication
export function getSellerId(): string {
  if (typeof window === 'undefined') {
    return 'temp-seller-id'; // Server-side fallback
  }
  
  const sellerInfo = localStorage.getItem('sellerInfo');
  if (sellerInfo) {
    try {
      const seller = JSON.parse(sellerInfo);
      return seller.id || seller._id || 'temp-seller-id';
    } catch (err) {
      console.error('Error parsing seller info:', err);
    }
  }
  return 'temp-seller-id';
}

export function getAuthHeaders(): Record<string, string> {
  return {
    'x-seller-id': getSellerId()
  };
}
