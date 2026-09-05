/**
 * Region (continent / bucket) → countries for Q4 manufacturing sites.
 * Country dropdowns filtered by the selected Region use this map.
 * Middle East countries are only under "Middle East" (not Asia).
 * "Global / Rest of World" gets any country not assigned elsewhere.
 */

export const REGION_COUNTRIES: Record<string, string[]> = {
  Africa: [
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
    "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Djibouti",
    "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia",
    "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya",
    "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique",
    "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal",
    "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan",
    "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
  ],
  Asia: [
    "Afghanistan", "Armenia", "Azerbaijan", "Bangladesh", "Bhutan", "Brunei", "Cambodia",
    "China", "Georgia", "India", "Indonesia", "Japan", "Kazakhstan", "Kyrgyzstan", "Laos",
    "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Pakistan",
    "Philippines", "Singapore", "South Korea", "Sri Lanka", "Taiwan", "Tajikistan",
    "Thailand", "Timor-Leste", "Turkmenistan", "Uzbekistan", "Vietnam",
  ],
  Europe: [
    "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
    "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland",
    "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia",
    "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro",
    "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia",
    "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland",
    "Ukraine", "United Kingdom", "Vatican City",
  ],
  "North America": [
    "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica", "Cuba",
    "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala", "Haiti",
    "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago",
    "United States",
  ],
  "South America": [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay",
    "Peru", "Suriname", "Uruguay", "Venezuela",
  ],
  "Oceania / Australia": [
    "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru",
    "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga",
    "Tuvalu", "Vanuatu",
  ],
  "Middle East": [
    "Bahrain", "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman",
    "Palestine", "Qatar", "Saudi Arabia", "Syria", "Turkey", "United Arab Emirates",
    "Yemen",
  ],
};

/** All countries assigned to a named region (excludes Global leftovers until computed). */
const ASSIGNED = new Set(
  Object.values(REGION_COUNTRIES).flatMap((list) => list)
);

export function getCountriesForRegion(
  region: string | undefined | null,
  allCountries: string[]
): string[] {
  const r = (region || "").trim();
  if (!r) return [];
  if (r === "Global / Rest of World") {
    const leftovers = allCountries.filter((c) => !ASSIGNED.has(c));
    return leftovers.length > 0 ? leftovers : [...allCountries];
  }
  const mapped = REGION_COUNTRIES[r];
  if (mapped?.length) return [...mapped].sort((a, b) => a.localeCompare(b));
  return [];
}
