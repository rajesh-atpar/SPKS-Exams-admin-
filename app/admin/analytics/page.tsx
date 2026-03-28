import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconDownload,
  IconFilter,
  IconEye,
  IconUserPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard
} from "@tabler/icons-react"

export default function AnalyticsPage() {
  const subscriptions = [
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 98765 43210",
      plan: "Premium",
      status: "active",
      subscribedDate: "2024-01-15",
      expiryDate: "2024-12-15",
      amount: "₹999",
      autoRenew: true
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 87654 32109",
      plan: "Basic",
      status: "active",
      subscribedDate: "2024-01-10",
      expiryDate: "2024-06-10",
      amount: "₹499",
      autoRenew: false
    },
    {
      id: 3,
      name: "Mohan Singh",
      email: "mohan.singh@example.com",
      phone: "+91 76543 21098",
      plan: "Premium",
      status: "expired",
      subscribedDate: "2023-02-01",
      expiryDate: "2024-02-01",
      amount: "₹999",
      autoRenew: true
    },
    {
      id: 4,
      name: "Anita Devi",
      email: "anita.devi@example.com",
      phone: "+91 65432 10987",
      plan: "Premium",
      status: "active",
      subscribedDate: "2024-02-20",
      expiryDate: "2025-02-20",
      amount: "₹999",
      autoRenew: true
    },
    {
      id: 5,
      name: "Suresh Babu",
      email: "suresh.babu@example.com",
      phone: "+91 54321 09876",
      plan: "Basic",
      status: "cancelled",
      subscribedDate: "2023-12-01",
      expiryDate: "2024-03-01",
      amount: "₹499",
      autoRenew: false
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case "Basic":
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track student subscriptions and revenue
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <IconUserPlus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Badge variant="secondary">All</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <IconTrendingUp className="inline h-3 w-3 mr-1" />
                +18% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">856</div>
              <p className="text-xs text-muted-foreground">
                <IconTrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Badge className="bg-green-100 text-green-800">Revenue</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹4,28,000</div>
              <p className="text-xs text-muted-foreground">
                <IconTrendingUp className="inline h-3 w-3 mr-1" />
                +25% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <Badge variant="destructive">Alert</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.5%</div>
              <p className="text-xs text-muted-foreground">
                <IconTrendingDown className="inline h-3 w-3 mr-1" />
                -2% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>
              Search and filter subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option value="">All Plans</option>
                  <option value="premium">Premium</option>
                  <option value="basic">Basic</option>
                </select>
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline">
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Analytics</CardTitle>
            <CardDescription>
              Track subscription status and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Phone</th>
                      <th className="text-left p-3 font-medium">Plan</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Subscribed</th>
                      <th className="text-left p-3 font-medium">Expiry</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Auto Renew</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {subscription.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium">{subscription.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{subscription.email}</td>
                        <td className="p-3 text-sm">{subscription.phone}</td>
                        <td className="p-3">
                          {getPlanBadge(subscription.plan)}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="p-3 text-sm">{subscription.subscribedDate}</td>
                        <td className="p-3 text-sm">{subscription.expiryDate}</td>
                        <td className="p-3 font-medium">{subscription.amount}</td>
                        <td className="p-3">
                          <Badge variant={subscription.autoRenew ? "default" : "outline"}>
                            {subscription.autoRenew ? "Enabled" : "Disabled"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing 1-5 of 1,234 subscriptions
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
