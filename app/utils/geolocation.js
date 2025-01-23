const countryToLanguage = {
  // English-speaking countries
  'GB': 'en',
  'US': 'en',
  'AU': 'en',
  
  // Portuguese-speaking countries
  'BR': 'pt',
  'PT': 'pt',
  
  // Spanish-speaking countries
  'ES': 'es',
  'MX': 'es',
  'AR': 'es',
  
  // Dutch-speaking countries
  'NL': 'nl',
  'BE': 'nl',
};

export async function detectUserLanguage() {
  try {
    // Check if we already have a stored language preference
    const storedLang = localStorage.getItem('userLanguage');
    if (storedLang) {
      return storedLang;
    }

    // Using ipapi with your API key
    const response = await fetch('http://api.ipapi.com/api/check?access_key=596da506d34d18fdf9b19253798125a7');
    const data = await response.json();
    
    // Get the country code from the response
    const countryCode = data.country_code;
    
    // Get the corresponding language or default to English
    const detectedLang = countryToLanguage[countryCode] || 'en';
    
    // Store the detected language
    localStorage.setItem('userLanguage', detectedLang);
    
    return detectedLang;
  } catch (error) {
    console.error('Error detecting user location:', error);
    return 'en'; // Default to English if detection fails
  }
}
