import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneCountry = {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
  searchText: string;
};

export const countryCodeToFlag = (countryCode: CountryCode) =>
  countryCode
    .toUpperCase()
    .split("")
    .map((character) => String.fromCodePoint(character.charCodeAt(0) + 127397))
    .join("");

export const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

const regionNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });

export const phoneCountries: PhoneCountry[] = getCountries()
  .map((code) => {
    const name = regionNames.of(code) ?? code;
    const callingCode = `+${getCountryCallingCode(code)}`;
    return {
      code,
      name,
      callingCode,
      flag: countryCodeToFlag(code),
      searchText: normalizeSearchText(`${name} ${code} ${callingCode}`),
    };
  })
  .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));

export const isValidInternationalPhone = (value: string) => {
  try {
    return value.startsWith("+") && isValidPhoneNumber(value);
  } catch {
    return false;
  }
};

export const getPhoneCountry = (value: string, fallback: CountryCode = "BR") => {
  const directCountry = parsePhoneNumberFromString(value)?.country;
  if (directCountry) return directCountry;

  const digits = value.replace(/\D/g, "");
  const legacyCountry = digits.length > 11
    ? parsePhoneNumberFromString(`+${digits}`)?.country
    : undefined;
  return legacyCountry ?? fallback;
};
