import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_PREDICTHQ_API_KEY;

interface EventsResponse {
  results: any[];
}
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const fetchEvents = async (): Promise<Event[]> => {
  const now = new Date();
  const nowFormatted = formatDate(now);

  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 7);
  const futureFormatted = formatDate(futureDate); // Get the date 7 days from now
  const timestamp = Date.now();

  const params = {
    category:
      'expos,concerts,festivals,performing-arts,community,sports,public-holidays,observances,daylight-savings,airport-delays,severe-weather,disasters,terror,health-warnings',
    'active.gte': nowFormatted,
    'active.lte': futureFormatted,
    state: 'active',
    sort: 'start',
    limit: 5,
    within: '1.5mi@53.7995746,-1.5471022',
    t: timestamp
  };

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  };

  try {
    const response = await axios.get<EventsResponse>(
      'https://api.predicthq.com/v1/events/',
      { params, headers }
    );

    return response.data.results;
  } catch (error) {
    //console.error('Error fetching events:', error);
    throw error;
  }
};

export const useEvents = (): UseQueryResult<Event[], AxiosError> => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false
  });
};
