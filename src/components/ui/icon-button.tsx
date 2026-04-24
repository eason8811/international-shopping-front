import type * as React from "react";

import {Button} from "@/components/ui/button";

export interface IconButtonProps extends Omit<React.ComponentProps<typeof Button>, "children" | "size"> {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}

export function IconButton({label, icon: Icon, size = "icon", title, ...props}: IconButtonProps) {
    return (
        <Button aria-label={label} size={size} title={title ?? label} {...props}>
            <Icon aria-hidden="true" data-icon="inline-start" />
        </Button>
    );
}
