export const getWeatherIcon = (iconCode) => {
  const iconMap = {
    '01d': 'sunny',
    '01n': 'moon',
    '02d': 'partly-sunny',
    '02n': 'cloudy-night',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rainy',
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snow',
    '13n': 'snow',
    '50d': 'partly-sunny',
    '50n': 'cloudy-night'
  };
  return iconMap[iconCode] || 'help-circle-outline';
};

export const getWeatherColor = (main) => {
  const colorMap = {
    Clear: '#388E3C',
    Clouds: '#FF9800',
    Rain: '#1565C0',
    Snow: '#B0BEC5',
    Thunderstorm: '#D84315',
    Drizzle: '#0288D1',
    Mist: '#616161'
  };
  return colorMap[main] || '#9E9E9E';
};
