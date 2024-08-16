const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

// if (!OPENWEATHER_API_KEY) {
//   throw new Error('OPENWEATHER_API_KEY is not set');
// }

const WEATHER_API_URL = `http://pro.openweathermap.org/data/2.5/weather?q=Leeds,uk&APPID=${OPENWEATHER_API_KEY}`;

export const fetchWeatherData = async () => {
  const response = await fetch(WEATHER_API_URL);
  // if (!response.ok) {
  //   throw new Error('Weather data not available');
  // }
  return response.json();
};
