import type * as React from "react";

import {cn} from "@/lib/utils";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {FieldGroup} from "@/components/ui/field";

export interface AuthBlockProps extends Omit<React.ComponentProps<"section">, "title"> {
    title: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    oauth?: React.ReactNode;
    footer?: React.ReactNode;
}

export function AuthBlock({title, description, children, oauth, footer, className, ...props}: AuthBlockProps) {
    return (
        <Card asChild className={cn("mx-auto w-full max-w-md rounded-card-emphasis shadow-dialog", className)}>
            <section {...props}>
                <CardHeader className="text-center">
                    <CardTitle className="font-serif text-2xl text-text-primary">{title}</CardTitle>
                    {description ? <CardDescription>{description}</CardDescription> : null}
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        {oauth}
                        {children}
                    </FieldGroup>
                </CardContent>
                {footer ? <CardFooter className="justify-center text-sm text-muted-foreground">{footer}</CardFooter> : null}
            </section>
        </Card>
    );
}
