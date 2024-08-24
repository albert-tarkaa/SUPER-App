// Description: This file contains the function that returns the color code and text for the air quality index.

const getAirQualityInfo = (aqi: number) => {
  if (aqi <= 50) return { text: 'Good', color: '#00C853' };
  if (aqi <= 100) return { text: 'Moderate', color: '#FFD600' };
  if (aqi <= 150) return { text: 'Unhealthy for Sensitive Groups', color: '#FF9100' };
  if (aqi <= 200) return { text: 'Unhealthy', color: '#FF3D00' };
  if (aqi <= 300) return { text: 'Very Unhealthy', color: '#8E24AA' };
  return { text: 'Hazardous', color: '#B71C1C' };

  // Green(#00C853): Good air quality, safe for everyone.
  // Yellow(#FFD600): Moderate air quality, some concern for sensitive individuals.
  // Orange(#FF9100): Unhealthy for sensitive groups, others should be aware.
  // Red(#FF3D00): Unhealthy for everyone.
  // Purple(#8E24AA): Very unhealthy, serious health risks.
  // Maroon(#B71C1C): Hazardous, emergency conditions for everyone.
};

export default getAirQualityInfo;
