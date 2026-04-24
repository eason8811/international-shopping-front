import type * as React from "react";
import {History} from "lucide-react";

import {Button} from "@/components/ui/button";

export type OrderHistoryButtonProps = React.ComponentProps<typeof Button>;

export function OrderHistoryButton({children = "Order history", ...props}: OrderHistoryButtonProps) {
    return (
        <Button variant="outline" {...props}>
            <History data-icon="inline-start" />
            {children}
        </Button>
    );
}
