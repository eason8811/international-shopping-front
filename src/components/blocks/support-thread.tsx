import type * as React from "react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";

export interface SupportThreadMessage {
    id: string;
    author: React.ReactNode;
    body: React.ReactNode;
    timestamp?: React.ReactNode;
    tone?: "agent" | "user" | "system";
    attachments?: React.ReactNode;
}

export interface SupportThreadProps extends Omit<React.ComponentProps<"section">, "title"> {
    title?: React.ReactNode;
    status?: React.ReactNode;
    messages: SupportThreadMessage[];
    composerLabel?: string;
    composerPlaceholder?: string;
    submitLabel?: React.ReactNode;
}

const messageToneClassName: Record<NonNullable<SupportThreadMessage["tone"]>, string> = {
    agent: "bg-surface-section text-foreground",
    user: "bg-primary text-primary-foreground",
    system: "border border-border bg-background text-muted-foreground",
};

export function SupportThread({
    title = "Support thread",
    status,
    messages,
    composerLabel = "Reply",
    composerPlaceholder = "Write a message",
    submitLabel = "Send",
    className,
    ...props
}: SupportThreadProps) {
    return (
        <Card asChild className={cn("rounded-card shadow-none", className)}>
            <section {...props}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <CardTitle>{title}</CardTitle>
                    {status ? <div>{status}</div> : null}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {messages.map((message) => {
                        const tone = message.tone ?? "agent";
                        const isUser = tone === "user";

                        return (
                            <article key={message.id} className={cn("flex", isUser && "justify-end")}>
                                <div className={cn("max-w-[min(34rem,100%)] rounded-card p-3", messageToneClassName[tone])}>
                                    <div className="mb-1 flex items-center justify-between gap-3 text-xs font-medium">
                                        <span>{message.author}</span>
                                        {message.timestamp ? <time className="text-current/70">{message.timestamp}</time> : null}
                                    </div>
                                    <div className="text-sm leading-6">{message.body}</div>
                                    {message.attachments ? <div className="mt-3">{message.attachments}</div> : null}
                                </div>
                            </article>
                        );
                    })}
                </CardContent>
                <CardFooter>
                    <form className="flex w-full flex-col gap-3">
                        <label className="sr-only" htmlFor="support-thread-composer">
                            {composerLabel}
                        </label>
                        <Textarea id="support-thread-composer" placeholder={composerPlaceholder} />
                        <div className="flex justify-end">
                            <Button type="submit">{submitLabel}</Button>
                        </div>
                    </form>
                </CardFooter>
            </section>
        </Card>
    );
}
