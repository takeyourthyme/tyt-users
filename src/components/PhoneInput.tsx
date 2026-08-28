import { forwardRef, useMemo, useRef, useState } from "react";
import { AsYouType, parsePhoneNumberFromString, validatePhoneNumberLength, type CountryCode } from "libphonenumber-js";
import { Check, ChevronsUpDown } from "lucide-react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getPhoneCountry, normalizeSearchText, phoneCountries } from "@/lib/phone";

type PhoneInputProps = {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

const getNationalDigits = (value: string, country: CountryCode) => {
  const parsed = parsePhoneNumberFromString(value);
  if (parsed?.country === country) return parsed.nationalNumber;

  const callingCode = phoneCountries.find((item) => item.code === country)?.callingCode.slice(1) ?? "";
  const digits = value.replace(/\D/g, "");
  const legacyInternational = digits.length > 11 && parsePhoneNumberFromString(`+${digits}`)?.country === country;
  return (value.startsWith("+") || legacyInternational) && digits.startsWith(callingCode)
    ? digits.slice(callingCode.length)
    : digits;
};

const toInternationalValue = (nationalDigits: string, country: CountryCode) => {
  if (!nationalDigits) return "";
  const callingCode = phoneCountries.find((item) => item.code === country)?.callingCode ?? "";
  const candidate = `${callingCode}${nationalDigits}`;
  return parsePhoneNumberFromString(candidate)?.number ?? candidate;
};

const getMaximumNationalLength = (country: CountryCode) => {
  let maximumLength = 15;
  for (let length = 1; length <= 15; length += 1) {
    if (validatePhoneNumberLength("9".repeat(length), country) === undefined) {
      maximumLength = length;
    }
  }
  return maximumLength;
};

export const PhoneInput = forwardRef<HTMLDivElement, PhoneInputProps>(({
  value = "",
  onChange,
  onBlur,
  name,
  disabled,
  className,
  placeholder = "Número do WhatsApp",
  ...accessibilityProps
}, ref) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => getPhoneCountry(value));
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const focusPhoneAfterCloseRef = useRef(false);

  const valueCountry = value ? getPhoneCountry(value, selectedCountry) : selectedCountry;
  const country = phoneCountries.find((item) => item.code === valueCountry) ?? phoneCountries.find((item) => item.code === "BR")!;
  const maximumNationalLength = getMaximumNationalLength(country.code);
  const maximumFormattedLength = new AsYouType(country.code).input("9".repeat(maximumNationalLength)).length;
  const nationalDigits = getNationalDigits(value, country.code);
  const formattedValue = nationalDigits ? new AsYouType(country.code).input(nationalDigits) : "";

  const filteredCountries = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return phoneCountries;
    return phoneCountries.filter((item) => item.searchText.includes(normalizedQuery));
  }, [query]);

  const selectCountry = (countryCode: CountryCode) => {
    focusPhoneAfterCloseRef.current = true;
    setSelectedCountry(countryCode);
    setOpen(false);
    setQuery("");
    onChange(toInternationalValue(nationalDigits, countryCode));
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...accessibilityProps}
    >
      <Popover open={open} onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Selecionar país e DDI"
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex shrink-0 items-center gap-1.5 rounded-l-md border-r border-input px-3 text-sm outline-none hover:bg-accent disabled:cursor-not-allowed"
          >
            <span aria-hidden="true">{country.flag}</span>
            <span>{country.callingCode}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[100] w-[min(22rem,calc(100vw-2rem))] p-0"
          align="start"
          side="bottom"
          avoidCollisions
          onCloseAutoFocus={(event) => {
            if (!focusPhoneAfterCloseRef.current) return;
            event.preventDefault();
            focusPhoneAfterCloseRef.current = false;
            phoneInputRef.current?.focus();
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar país ou DDI"
              aria-label="Buscar país ou DDI"
            />
            <CommandList className="max-h-72">
              <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((item) => (
                  <CommandItem
                    key={item.code}
                    value={item.code}
                    onSelect={() => selectCountry(item.code)}
                    className="gap-2"
                  >
                    <Check className={cn("h-4 w-4", item.code === country.code ? "opacity-100" : "opacity-0")} />
                    <span aria-hidden="true">{item.flag}</span>
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className="text-muted-foreground">{item.callingCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input
        ref={phoneInputRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        name={name}
        disabled={disabled}
        maxLength={maximumFormattedLength}
        value={formattedValue}
        onBlur={onBlur}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, maximumNationalLength);
          onChange(toInternationalValue(digits, country.code));
        }}
        placeholder={placeholder}
        aria-label="Número do WhatsApp"
        className="min-w-0 flex-1 rounded-r-md bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
      />
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";
