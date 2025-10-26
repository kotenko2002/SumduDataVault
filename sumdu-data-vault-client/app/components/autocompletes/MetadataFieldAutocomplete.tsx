import { useState, useEffect } from "react";
import useDebounce from 'react-use/lib/useDebounce';
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import GetMetadataFieldsService from "~/services/api/metadata/GetMetadataFieldsService";
import { METADATA_FIELDS } from "~/lib/queryKeys";

interface MetadataFieldAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MetadataFieldAutocomplete({
  value,
  onChange,
  placeholder = "Назва поля",
  className,
  disabled = false
}: MetadataFieldAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  useDebounce(
    () => setDebouncedSearchValue(searchValue),
    800,
    [searchValue]
  );

  // Визначаємо чи відбувається дебаунс
  const isDebouncing = searchValue !== debouncedSearchValue;

  // Синхронізація зовнішнього значення
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // React Query для отримання пропозицій
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: [METADATA_FIELDS, debouncedSearchValue],
    queryFn: async () => {
      const response = await GetMetadataFieldsService.getMetadataFields({
        search: debouncedSearchValue
      });
      return response.fields;
    },
    enabled: debouncedSearchValue.length > 0,
  });

  // Обробка зміни введеного тексту
  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue);
    onChange(inputValue);
  };

  // Обробка вибору пропозиції
  const handleSelect = (selectedValue: string) => {
    setSearchValue(selectedValue);
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (searchValue.length >= 1) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className={cn("h-9", className)}
            disabled={disabled}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Пошук полів..." value={searchValue} onValueChange={handleInputChange} />
          <CommandList>
            {isLoading || isDebouncing ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Завантаження...</span>
              </div>
            ) : suggestions.length === 0 && !isLoading && !isDebouncing ? (
              <CommandEmpty>
                {searchValue.length < 1 
                  ? "Пошук від 1 символа" 
                  : "Пропозиції не знайдено"
                }
              </CommandEmpty>
            ) : suggestions.length > 0 ? (
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        searchValue === suggestion ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
