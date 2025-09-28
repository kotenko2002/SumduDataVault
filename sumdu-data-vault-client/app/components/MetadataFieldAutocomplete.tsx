import { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import GetMetadataFieldsService from "~/services/api/metadata/GetMetadataFieldsService";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce функція для затримки запитів
  const debounce = (func: () => void, delay: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(func, delay);
  };

  // Функція для отримання пропозицій
  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await GetMetadataFieldsService.getMetadataFields({
        search: searchTerm
      });
      setSuggestions(response.fields);
    } catch (error) {
      console.error('Помилка отримання пропозицій:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обробка зміни введеного тексту
  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue);
    onChange(inputValue);

    // Debounce запит на 300ms
    debounce(() => {
      fetchSuggestions(inputValue);
    }, 300);
  };

  // Обробка вибору пропозиції
  const handleSelect = (selectedValue: string) => {
    setSearchValue(selectedValue);
    onChange(selectedValue);
    setOpen(false);
  };

  // Синхронізація зовнішнього значення
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Очищення таймауту при розмонтуванні
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (searchValue.length >= 1) {
                fetchSuggestions(searchValue);
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
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Завантаження...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>
                {searchValue.length < 1 
                  ? "Пошук від 1 символа" 
                  : "Пропозиції не знайдено"
                }
              </CommandEmpty>
            ) : (
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
