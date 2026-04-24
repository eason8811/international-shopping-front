"use client";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface LocaleSwitcherOption {
    value: string;
    label: string;
}

export interface LocaleSwitcherProps {
    value?: string;
    options: LocaleSwitcherOption[];
    placeholder?: string;
    label?: string;
    onValueChange?: (value: string) => void;
}

export function LocaleSwitcher({
    value,
    options,
    placeholder = "Language",
    label = "Select language",
    onValueChange,
}: LocaleSwitcherProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger aria-label={label} size="sm">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
