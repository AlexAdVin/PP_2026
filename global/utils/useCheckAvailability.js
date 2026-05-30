/**
 * useCheckAvailability Hook
 * 
 * Utility hook for checking parking lot availability based on booking transactions
 * Compares lot availability against current time and active bookings
 * 
 * @returns {Object} { getAvailabilityStatus }
 *   - getAvailabilityStatus(transactions, preferredTime): string
 *     Returns 'Available' or 'Busy' based on transaction overlap
 */

const useCheckAvailability = () => {

  /**
   * Check if a preferred time overlaps with a booking period
   * @param {string} startBooking - ISO timestamp when booking starts
   * @param {string} endBooking - ISO timestamp when booking ends
   * @param {string} preferredTime - ISO timestamp to check availability
   * @returns {boolean} true if preferredTime falls within booking period
   */
  const isOverlap = (startBooking, endBooking, preferredTime) => {
    const startTime = new Date(startBooking);
    const endTime = new Date(endBooking);
    const preferredTimeDate = new Date(preferredTime);
    
    // Check if preferred time is within the booking window
    return preferredTimeDate > startTime && preferredTimeDate < endTime;
  };

  /**
   * Get availability status for a lot based on its transactions
   * 
   * @param {Array} transactions - Array of transaction objects with startBooking/endBooking
   * @param {string} preferredTime - ISO timestamp to check (defaults to current time)
   * @returns {string} 'Busy' if any active booking exists, 'Available' otherwise
   * 
   * @example
   * const status = getAvailabilityStatus(lot.Transactions?.items, new Date().toISOString());
   * // Returns 'Busy' or 'Available'
   */
  const getAvailabilityStatus = (transactions, preferredTime = new Date().toISOString()) => {
    // Empty transactions mean the lot is available
    if (!transactions || transactions.length === 0) {
      return 'Available';
    }

    // Check recent transactions (max 5) for active bookings
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.startBooking) - new Date(a.startBooking)
    );

    for (let i = 0; i < Math.min(sortedTransactions.length, 5); i++) {
      const { startBooking, endBooking } = sortedTransactions[i];

      // If preferred time overlaps with any booking, lot is busy
      if (isOverlap(startBooking, endBooking, preferredTime)) {
        return 'Busy';
      }
    }

    return 'Available';
  };

  return { getAvailabilityStatus, isOverlap };
};

export default useCheckAvailability;
