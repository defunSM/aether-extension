// Function to get IP address
export const getIpAddress = async () => {
  const response = await fetch('https://api.ipify.org?format=json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.ip;
}; 