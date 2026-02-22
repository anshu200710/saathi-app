import { useEffect, useState } from 'react';

export const useFunding = () => {
  const [funding, setFunding] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFunding = async () => {
    setLoading(true);
    try {
      // Fetch funding data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunding();
  }, []);

  return { funding, loading, error, refetch: fetchFunding };
};
