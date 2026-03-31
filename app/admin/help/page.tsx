import {
  IconBuildingSkyscraper,
  IconClockHour4,
  IconDeviceLaptop,
  IconHeadset,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRocket,
  IconShieldCheck,
  IconUsersGroup,
} from "@tabler/icons-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const highlights = [
  {
    title: "Founded",
    value: "2019",
    description: "Product and services studio focused on education and business tooling.",
    icon: IconBuildingSkyscraper,
  },
  {
    title: "Team Size",
    value: "45+",
    description: "Designers, engineers, QA specialists, and support teammates.",
    icon: IconUsersGroup,
  },
  {
    title: "Primary Focus",
    value: "Web Platforms",
    description: "Admin dashboards, portals, workflow apps, and automation systems.",
    icon: IconDeviceLaptop,
  },
  {
    title: "Support Window",
    value: "9 AM - 6 PM",
    description: "Monday to Saturday support for onboarding, maintenance, and issue handling.",
    icon: IconClockHour4,
  },
];

const services = [
  "Custom web application development",
  "Admin dashboard design and implementation",
  "LMS and exam-platform workflows",
  "Cloud deployment and maintenance support",
  "UI/UX design systems and frontend modernization",
  "Internal business tools and reporting automation",
];

const contacts = [
  {
    label: "Support Email",
    value: "support@fusioncraft-tech.demo",
    icon: IconMail,
  },
  {
    label: "Sales Desk",
    value: "+91 90000 12345",
    icon: IconPhone,
  },
  {
    label: "Office Address",
    value: "FusionCraft Tech, T Nagar, Chennai, Tamil Nadu",
    icon: IconMapPin,
  },
];

const faqs = [
  {
    question: "What does FusionCraft Tech build?",
    answer:
      "FusionCraft Tech builds dashboards, internal business tools, exam-management systems, content platforms, and support portals for growing teams.",
  },
  {
    question: "Who should contact the company?",
    answer:
      "Schools, coaching centers, admin teams, startups, and service businesses that need custom software or ongoing product support can reach out.",
  },
  {
    question: "What type of support is available?",
    answer:
      "The demo support model includes onboarding help, bug triage, feature discussions, release assistance, and routine maintenance guidance.",
  },
  {
    question: "Is this page using real company data?",
    answer:
      "No. These are placeholder details created for your admin help page preview and can be replaced with the final company profile later.",
  },
];

export default function HelpPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">FusionCraft Tech</h1>
            <p className="max-w-3xl text-muted-foreground">
              Internal help page for the admin dashboard with demo company details,
              support channels, service overview, and quick reference information.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>
              <IconHeadset className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline">
              <IconRocket className="mr-2 h-4 w-4" />
              Request Demo
            </Button>
          </div>
        </div>

        <Alert>
          <IconShieldCheck className="h-4 w-4" />
          <AlertTitle>Demo content only</AlertTitle>
          <AlertDescription>
            This help page uses placeholder company information for FusionCraft Tech.
            You can replace the text later with final business details.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>About The Company</CardTitle>
              <CardDescription>
                Quick summary of FusionCraft Tech for support and admin reference.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                FusionCraft Tech is presented here as a software product and services
                company that helps organizations build modern dashboards, digital
                workflows, internal portals, and content-driven admin systems.
              </p>
              <p>
                The company specializes in practical business software with a strong
                focus on clean UI, reliable engineering, and support-friendly admin
                experiences for day-to-day operations teams.
              </p>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service}
                    className="rounded-xl border bg-muted/30 px-4 py-3 text-foreground"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>
                Dummy company contact information for the help section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.label} className="rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <contact.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{contact.label}</p>
                      <p className="text-sm text-muted-foreground">{contact.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common admin questions about FusionCraft Tech and the demo help page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((item, index) => (
              <div key={item.question} className="space-y-2">
                <p className="font-medium">{item.question}</p>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
                {index < faqs.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
