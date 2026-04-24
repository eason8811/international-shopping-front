"use client";

import type * as React from "react";
import {Search} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export interface GlobalSearchProps extends React.ComponentProps<"form"> {
    label?: string;
    inputName?: string;
    placeholder?: string;
    submitLabel?: React.ReactNode;
}

export function GlobalSearch({
    label = "Search",
    inputName = "q",
    placeholder = "Search",
    submitLabel = "Search",
    className,
    ...props
}: GlobalSearchProps) {
    return (
        <form aria-label={label} role="search" className={cn("flex w-full items-center gap-2", className)} {...props}>
            <Input name={inputName} placeholder={placeholder} type="search" />
            <Button type="submit" variant="outline">
                <Search data-icon="inline-start" />
                {submitLabel}
            </Button>
        </form>
    );
}
