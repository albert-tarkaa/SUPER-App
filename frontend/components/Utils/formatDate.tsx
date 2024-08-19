export function formatDateToUK(isoDateStr) {
  // Parse the ISO 8601 string into a Date object
  const dateObj = new Date(isoDateStr);

  // Extract date components
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = dateObj.getUTCFullYear();

  // Extract time components
  const hours24 = dateObj.getUTCHours();
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');

  // Convert 24-hour format to 12-hour format
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 || 12; // Convert 0 hours to 12
  const period = isPM ? 'PM' : 'AM';

  // Construct the formatted string
  return `${day}/${month}/${year} ${String(hours12).padStart(2, '0')}:${minutes}${period}`;
}
