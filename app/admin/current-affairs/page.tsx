import {
  StructuredUploadPage,
  type StructuredDocumentRecord,
  type StructuredTreeNode,
} from "@/components/admin/StructuredUploadPage";

const defaultUploadTarget = "Test / TNPSC / Date Wise";

const currentAffairsTree: StructuredTreeNode[] = [
  {
    id: "day-wise",
    kind: "branch",
    title: "Day Wise",
    description: "Daily current-affairs content grouped exactly like your sketch.",
    children: [
      {
        id: "day-wise-tamil",
        kind: "leaf",
        title: "Tamil",
        description: "Daily current-affairs uploads in Tamil.",
        documents: 14,
        lastUpdated: "Updated today",
      },
      {
        id: "day-wise-english",
        kind: "leaf",
        title: "English",
        description: "Daily current-affairs uploads in English.",
        documents: 11,
        lastUpdated: "Updated yesterday",
      },
      {
        id: "day-wise-monthly",
        kind: "leaf",
        title: "Monthly",
        description: "Monthly compiled current-affairs documents.",
        documents: 6,
        lastUpdated: "Updated 3 days ago",
      },
    ],
  },
  {
    id: "test",
    kind: "branch",
    title: "Test",
    description: "Date-wise current-affairs test branches for each exam.",
    children: [
      {
        id: "test-tnpsc",
        kind: "branch",
        title: "TNPSC",
        description: "Date-wise test uploads for TNPSC.",
        children: [
          {
            id: "test-tnpsc-date-wise",
            kind: "leaf",
            title: "Date Wise",
            description: "Upload TNPSC current-affairs tests date by date.",
            documents: 12,
            lastUpdated: "Updated this morning",
          },
        ],
      },
      {
        id: "test-rrb",
        kind: "branch",
        title: "RRB",
        description: "Date-wise test uploads for RRB.",
        children: [
          {
            id: "test-rrb-date-wise",
            kind: "leaf",
            title: "Date Wise",
            description: "Upload RRB current-affairs tests date by date.",
            documents: 9,
            lastUpdated: "Updated yesterday",
          },
        ],
      },
      {
        id: "test-tnusrb",
        kind: "branch",
        title: "TNUSRB",
        description: "Date-wise test uploads for TNUSRB.",
        children: [
          {
            id: "test-tnusrb-date-wise",
            kind: "leaf",
            title: "Date Wise",
            description: "Upload TNUSRB current-affairs tests date by date.",
            documents: 7,
            lastUpdated: "Updated 2 days ago",
          },
        ],
      },
    ],
  },
  {
    id: "video-explain",
    kind: "branch",
    title: "Video Explain",
    description: "Direct YouTube-connected explanation section for current affairs.",
    children: [
      {
        id: "video-explain-youtube",
        kind: "leaf",
        title: "Direct Connect With YouTube",
        description: "Upload support notes or save private YouTube explanation links.",
        documents: 5,
        lastUpdated: "Updated yesterday",
      },
    ],
  },
];

const currentAffairsDocuments: StructuredDocumentRecord[] = [
  {
    id: 1,
    title: "TNPSC Date Wise Current Affairs Test - 28 March",
    target: "Test / TNPSC / Date Wise",
    type: "PDF",
    uploadedBy: "Admin",
    uploadDate: "2026-03-28",
    status: "Published",
  },
  {
    id: 2,
    title: "RRB Date Wise Current Affairs Test - 27 March",
    target: "Test / RRB / Date Wise",
    type: "PDF",
    uploadedBy: "Content Team",
    uploadDate: "2026-03-27",
    status: "Draft",
  },
  {
    id: 3,
    title: "Day Wise Tamil Current Affairs Notes",
    target: "Day Wise / Tamil",
    type: "PDF",
    uploadedBy: "Admin",
    uploadDate: "2026-03-26",
    status: "Published",
  },
  {
    id: 4,
    title: "Monthly Current Affairs Compilation",
    target: "Day Wise / Monthly",
    type: "ZIP",
    uploadedBy: "Faculty Team",
    uploadDate: "2026-03-25",
    status: "Published",
  },
  {
    id: 5,
    title: "Current Affairs Video Explain Session",
    target: "Video Explain / Direct Connect With YouTube",
    type: "Link",
    uploadedBy: "Admin",
    uploadDate: "2026-03-24",
    status: "Published",
  },
];

export default function CurrentAffairsPage() {
  return (
    <StructuredUploadPage
      entityName="Current Affairs"
      pageTitle="Current Affairs Content Structure"
      defaultUploadTarget={defaultUploadTarget}
      tree={currentAffairsTree}
      initialDocuments={currentAffairsDocuments}
      searchPlaceholder="Search for Day Wise, Tamil, TNPSC, Date Wise..."
    />
  );
}
