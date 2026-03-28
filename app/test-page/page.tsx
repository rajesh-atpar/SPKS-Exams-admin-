import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function TestPage() {
  return (
    <div className="min-h-svh bg-muted/30 p-6 lg:p-10">
      <div className="mx-auto max-w-xl">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit rounded-full">
              shadcn/ui preview
            </Badge>
            <CardTitle className="text-2xl tracking-tight">
              Test page now matches the new design system
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <AlertTitle>Consistent form components</AlertTitle>
              <AlertDescription>
                This page uses the same inputs, cards, buttons, and field
                spacing as the redesigned auth and admin views.
              </AlertDescription>
            </Alert>

            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="test-email">Email</FieldLabel>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="test-password">Password</FieldLabel>
                <Input
                  id="test-password"
                  type="password"
                  placeholder="Enter your password"
                />
              </Field>

              <Field>
                <label className="flex items-center gap-3 rounded-xl border p-4">
                  <Checkbox />
                  <div>
                    <div className="text-sm font-medium">
                      Remember this session
                    </div>
                    <FieldDescription>
                      Example checkbox styling from the shared component library.
                    </FieldDescription>
                  </div>
                </label>
              </Field>

              <Button className="w-full">Submit test form</Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
