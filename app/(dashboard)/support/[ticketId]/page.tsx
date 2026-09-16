"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiGet, apiPatch, apiPost, toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  message: string;
  isAdmin?: boolean;
  createdAt?: string;
};

type Ticket = {
  id: string;
  subject?: string;
  status?: string;
  userId?: string;
  messages?: Message[];
};

export default function TicketPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params?.ticketId || "";
  const router = useRouter();
  const { user } = useAuth();
  const writable = canWrite(user?.role, "support");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function load() {
    try {
      const res = await apiGet<Ticket>(`/api/admin/support/tickets/${ticketId}`);
      setTicket(res.data);
    } catch (error) {
      toastApiError(error);
    }
  }

  useEffect(() => {
    if (!ticketId) return;
    void load();
  }, [ticketId]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={ticket?.subject || "Ticket"}
        description="Admin replies appear on the right."
        action={
          <div className="flex items-center gap-2">
            <StatusBadge value={ticket?.status} />
            <Button variant="outline" onClick={() => router.push("/support")}>
              Back
            </Button>
          </div>
        }
      />
      {writable ? (
        <Select
          value={ticket?.status}
          onValueChange={async (status) => {
            try {
              await apiPatch(`/api/admin/support/tickets/${ticketId}/status`, { status });
              toast.success("Status updated");
              await load();
            } catch (error) {
              toastApiError(error);
            }
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">open</SelectItem>
            <SelectItem value="in-progress">in-progress</SelectItem>
            <SelectItem value="resolved">resolved</SelectItem>
            <SelectItem value="closed">closed</SelectItem>
          </SelectContent>
        </Select>
      ) : null}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {(ticket?.messages || []).map((item) => (
            <div
              key={item.id}
              className={cn("flex", item.isAdmin ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  item.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <p>{item.message}</p>
                <p className={cn("mt-1 text-[11px]", item.isAdmin ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </p>
              </div>
            </div>
          ))}
          {writable ? (
            <div className="space-y-3 pt-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a reply"
              />
              <Button
                disabled={pending || !message.trim()}
                onClick={async () => {
                  setPending(true);
                  try {
                    await apiPost(`/api/admin/support/tickets/${ticketId}/reply`, {
                      message: message.trim(),
                    });
                    setMessage("");
                    toast.success("Reply sent");
                    await load();
                  } catch (error) {
                    toastApiError(error);
                  } finally {
                    setPending(false);
                  }
                }}
              >
                {pending ? "Sending..." : "Send reply"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
