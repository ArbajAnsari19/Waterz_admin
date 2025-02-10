// import { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
import { Analytic, AnalyticsData } from '../../api/admin';
// import { adminAPI } from '../../api/admin';
import styles from '../../styles/Analytics/Analytics.module.css';
import { Calendar } from 'lucide-react';

const AnalyticsBox = ({ data }: { data: AnalyticsData }) => {
  const getPeriodTitle = (period: string) => {
    switch (period) {
      case 'yesterday':
        return "Today's Bookings";
      case 'last_week':
        return 'Bookings This Week';
      case 'last_month':
        return 'Bookings This Month';
      case 'last_year':
        return 'Bookings This Year';
      default:
        return '';
    }
  };

  const getComparisonText = (period: string) => {
    switch (period) {
      case 'yesterday':
        return 'vs yesterday';
      case 'last_week':
        return 'vs last week';
      case 'last_month':
        return 'vs last month';
      case 'last_year':
        return 'vs last year';
      default:
        return '';
    }
  };

  return (
    <div className={styles.analyticsBox}>
      <div className={styles.analyticsContent}>
        <div className={styles.iconWrapper}>
          <Calendar size={20} />
        </div>
        <div className={styles.count}>
          {data.count.toLocaleString()}
        </div>
        <div className={styles.title}>
          {getPeriodTitle(data.period)}
        </div>
      </div>
    <div className={styles.analyticsContent}>
        <div className={styles.changeIndicator} style={{
            color: data.change.startsWith('+') ? '#22c55e' : '#ef4444'
          }}>
            {data.change}
          </div>
          <div className={styles.vsText}>
            {getComparisonText(data.period)}
          </div>
        </div>
    </div>
  );
};

const Analytics = () => {

//   const [analyticsData, setAnalyticsData] = useState<Analytic | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const location = useLocation();

//   const getRouteKey = (pathname: string): string => {
//     // Remove leading slash and get the first segment of the path
//     const route = pathname.substring(1).split('/')[0];
//     return route || 'booking'; // Default to 'booking' if no route
//   };

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const route = getRouteKey(location.pathname);
//         const data = await adminAPI.getAnalytics(route);
//         setAnalyticsData(data);
//       } catch (err) {
//         setError('Failed to fetch analytics data');
//         console.error('Error fetching analytics:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, [location.pathname]);

//   if (isLoading) {
//     return <div className={styles.loading}>Loading analytics...</div>;
//   }

//   if (error) {
//     return <div className={styles.error}>{error}</div>;
//   }

//   if (!analyticsData) {
//     return null;
//   }

//   const routeKey = getRouteKey(location.pathname);
//   const analyticsArray = analyticsData[routeKey] || [];

  const analyticsData: Analytic = {
    booking: [
      {
        period: "yesterday",
        count: 120,
        change: "+10%",
      },
      {
        period: "last_week",
        count: 850,
        change: "-5%",
      },
      {
        period: "last_month",
        count: 3400,
        change: "+15%",
      },
      {
        period: "last_year",
        count: 40200,
        change: "+8%",
      },
    ],
    agent: [],
    customer: [],
    superagent: [],
    yacht: [],
    earnings: []
  };

  const analyticsArray = analyticsData.booking || [];
   

  return (
    <div className={styles.analyticsWrapper}>
      <div className={styles.analyticsContainer}>
        {analyticsArray.map((data, index) => (
          <AnalyticsBox key={data.period} data={data} />
        ))}
      </div>
    </div>
  );
};

export default Analytics;