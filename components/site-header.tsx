import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { IconBell, IconMenu } from "@tabler/icons-react"

export function SiteHeader() {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-6">
        <Button variant="ghost" size="icon">
          <IconMenu className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <Badge variant="secondary">Exams</Badge>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <IconBell className="h-4 w-4" />
          </Button>
          <Button>Create New Exam</Button>
        </div>
      </div>
    </header>
  )
}
