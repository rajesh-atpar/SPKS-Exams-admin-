"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiGet, apiPatch, toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type LegalDoc = {
  title?: string;
  content?: string;
  updatedAt?: string;
};

const docs = [
  { key: "terms", label: "Terms", publicPath: "/api/legal/terms", adminPath: "/api/admin/legal/terms" },
  {
    key: "privacy",
    label: "Privacy policy",
    publicPath: "/api/legal/privacy-policy",
    adminPath: "/api/admin/legal/privacy-policy",
  },
  {
    key: "refund",
    label: "Refund policy",
    publicPath: "/api/legal/refund-policy",
    adminPath: "/api/admin/legal/refund-policy",
  },
] as const;

export default function LegalPage() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "legal");
  const [active, setActive] = useState<(typeof docs)[number]["key"]>("terms");
  const [values, setValues] = useState<Record<string, LegalDoc>>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.all(docs.map((doc) => apiGet<LegalDoc>(doc.publicPath)));
        const next: Record<string, LegalDoc> = {};
        docs.forEach((doc, index) => {
          next[doc.key] = results[index].data || { title: doc.label, content: "" };
        });
        setValues(next);
      } catch (error) {
        toastApiError(error);
      }
    }
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Legal"
        description="Markdown or plain text. Only admins can save. Public preview uses /api/legal/*."
      />
      <Tabs value={active} onValueChange={(value) => setActive(value as typeof active)}>
        <TabsList>
          {docs.map((doc) => (
            <TabsTrigger key={doc.key} value={doc.key}>
              {doc.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {docs.map((doc) => (
          <TabsContent key={doc.key} value={doc.key}>
            <Card>
              <CardHeader>
                <CardTitle>{doc.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={values[doc.key]?.title || ""}
                    disabled={!writable}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [doc.key]: { ...prev[doc.key], title: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Content</Label>
                  <Textarea
                    className="min-h-80"
                    value={values[doc.key]?.content || ""}
                    disabled={!writable}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [doc.key]: { ...prev[doc.key], content: e.target.value },
                      }))
                    }
                  />
                </div>
                {writable ? (
                  <Button
                    disabled={pending}
                    onClick={async () => {
                      setPending(true);
                      try {
                        await apiPatch(doc.adminPath, {
                          title: values[doc.key]?.title,
                          content: values[doc.key]?.content,
                        });
                        toast.success("Saved");
                      } catch (error) {
                        toastApiError(error);
                      } finally {
                        setPending(false);
                      }
                    }}
                  >
                    {pending ? "Saving..." : "Save"}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">Only admins can edit legal documents.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
