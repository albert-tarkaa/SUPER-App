const AQIColorCode = (aqi: number) => {
  if (aqi <= 50) return '#00E400'; // Good (Green)
  if (aqi <= 100) return '#FFFF00'; // Moderate (Yellow)
  if (aqi <= 150) return '#FF7E00'; // Unhealthy for Sensitive Groups (Orange)
  if (aqi <= 200) return '#FF0000'; // Unhealthy (Red)
  if (aqi <= 300) return '#8F3F3F'; // Very Unhealthy (Purple)
  return '#7E0023'; // Hazardous (Maroon)
};

export default AQIColorCode;
