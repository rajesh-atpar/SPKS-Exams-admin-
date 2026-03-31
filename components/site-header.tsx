import { IconBell, IconMenu } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function SiteHeader({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void
}) {
  return (
    <header className="h-24 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-6">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
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
