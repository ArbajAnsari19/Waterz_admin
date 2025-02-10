import React, { useEffect, useState } from "react";
import { adminAPI, CustomerData } from "../../api/admin";
import styles from "../../styles/Customer/Customer.module.css";
import { Search, SlidersHorizontal } from "lucide-react";

interface ComponentFilters {
  type: 'all' | 'withBookings' | 'withoutBookings';
}

const Customer: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ComponentFilters>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getCustomers({
        type: filters.type,
        searchQuery: searchQuery
      });
      setCustomers(response.customers || []);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleRemoveCustomer = async (customerId: string) => {
    // Implement customer removal logic
    console.log('Removing customer:', customerId);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading customers...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.customerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer</h1>
        
        <div className={styles.filterSection}>
          <form onSubmit={handleSearch} className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <Search size={20} />
            </button>
          </form>

          <button 
            className={styles.mobileFilterButton}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className={`${styles.filterTabs} ${showMobileFilters ? styles.showMobile : ''}`}>
        <button 
          className={`${styles.filterTab} ${filters.type === 'all' ? styles.activeFilterTab : ''}`}
          onClick={() => setFilters({ type: 'all' })}
        >
          All
        </button>
        <button 
          className={`${styles.filterTab} ${filters.type === 'withBookings' ? styles.activeFilterTab : ''}`}
          onClick={() => setFilters({ type: 'withBookings' })}
        >
          With Bookings
        </button>
        <button 
          className={`${styles.filterTab} ${filters.type === 'withoutBookings' ? styles.activeFilterTab : ''}`}
          onClick={() => setFilters({ type: 'withoutBookings' })}
        >
          Without Bookings
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.customerTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email Id</th>
              <th>Contact</th>
              <th>Bookings</th>
              <th>Queries</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>
                  {customer.bookings.length > 0 ? (
                    <a href="#" className={styles.viewLink}>
                      {customer.bookings.length} ( view details )
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {customer.bookings.length > 0 ? (
                    <a href="#" className={styles.viewLink}>
                      ( view query )
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleRemoveCustomer(customer._id)}
                  >
                    Remove Customer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customer;