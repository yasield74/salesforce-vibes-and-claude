# Account Dashboard LWC — Feature Spec

## Overview

A Lightning Web Component that provides an at-a-glance dashboard view of key Account information, surfacing both standard fields and the custom SLA/priority fields on the Account object. The component is intended for placement on the Account record page via App Builder.

---

## Goals

- Display the most operationally relevant Account data in a single, scannable view
- Highlight SLA status and expiration clearly so reps can act on at-risk accounts
- Surface customer priority and upsell opportunity to inform outreach decisions
- Replace manual field-by-field reading with a structured, visual layout

---

## Scope

**In scope:**

- Single LWC (`accountDashboard`) placed on the Account record page
- Read-only display of Account fields (no inline editing)
- Apex controller for data retrieval
- LWC Jest unit tests
- App Builder configuration (flexipage metadata)

**Out of scope:**

- Editing fields from within the dashboard
- Cross-object data (Opportunities, Cases, Contacts)
- Mobile-specific layout optimizations (deferred)

---

## Data Requirements

The component reads from the following Account fields:

### Identity

| Field        | API Name | Type     |
| ------------ | -------- | -------- |
| Account Name | Name     | Text     |
| Industry     | Industry | Picklist |
| Type         | Type     | Picklist |
| Website      | Website  | URL      |
| Phone        | Phone    | Phone    |

### Size & Revenue

| Field               | API Name               | Type     |
| ------------------- | ---------------------- | -------- |
| Annual Revenue      | AnnualRevenue          | Currency |
| Number of Employees | NumberOfEmployees      | Number   |
| Number of Locations | NumberofLocations\_\_c | Number   |

### Status

| Field              | API Name               | Type                           |
| ------------------ | ---------------------- | ------------------------------ |
| Active             | Active\_\_c            | Picklist (Yes / No)            |
| Rating             | Rating                 | Picklist                       |
| Customer Priority  | CustomerPriority\_\_c  | Picklist (High / Low / Medium) |
| Upsell Opportunity | UpsellOpportunity\_\_c | Picklist                       |

### SLA

| Field               | API Name               | Type                                         |
| ------------------- | ---------------------- | -------------------------------------------- |
| SLA Tier            | SLA\_\_c               | Picklist (Gold / Silver / Platinum / Bronze) |
| SLA Serial Number   | SLASerialNumber\_\_c   | Text                                         |
| SLA Expiration Date | SLAExpirationDate\_\_c | Date                                         |

---

## UI Layout

The component renders as a card divided into three sections:

```
┌─────────────────────────────────────────────────────┐
│  Account Overview                                   │
├──────────────────────┬──────────────────────────────┤
│  IDENTITY            │  SIZE & REVENUE               │
│  Name                │  Annual Revenue               │
│  Industry / Type     │  Employees / Locations        │
│  Phone / Website     │                               │
├──────────────────────┴──────────────────────────────┤
│  STATUS              │  SLA                          │
│  Active badge        │  Tier badge (colored)         │
│  Priority badge      │  Serial Number                │
│  Upsell indicator    │  Expiration Date (warn if     │
│                      │  within 30 days)              │
└──────────────────────┴─────────────────────────────-┘
```

### Visual indicators

- **SLA Tier badge colors:** Platinum → blue, Gold → yellow, Silver → gray, Bronze → orange
- **SLA Expiration warning:** if `SLAExpirationDate__c` is within 30 days of today, display the date in red with a warning icon
- **Customer Priority badge colors:** High → red, Medium → yellow, Low → green
- **Active status:** Yes → green badge, No → gray badge

---

## Component Structure

```
force-app/main/default/
├── classes/
│   └── AccountDashboardController.cls       # Apex: getAccount(recordId)
│   └── AccountDashboardController.cls-meta.xml
├── lwc/
│   └── accountDashboard/
│       ├── accountDashboard.html            # Template
│       ├── accountDashboard.js              # Controller (wire + computed props)
│       ├── accountDashboard.css             # Scoped styles / badge colors
│       ├── accountDashboard.js-meta.xml     # targets: lightning__RecordPage
│       └── __tests__/
│           └── accountDashboard.test.js     # Jest unit tests
└── flexipages/
    └── Account_Dashboard_Page.flexipage-meta.xml
```

---

## Apex Controller

```apex
// AccountDashboardController
@AuraEnabled(cacheable=true)
public static Account getAccount(Id recordId) { ... }
```

- Annotated `cacheable=true` for wire service compatibility
- Returns a single `Account` record with all fields listed in the Data Requirements section
- Throws `AuraHandledException` on error

---

## LWC Controller

- Uses `@wire(getAccount, { recordId: '$recordId' })` to reactively fetch data
- `@api recordId` receives the record context from the record page
- Computed getters derive badge variant and warning state from wire data:
  - `get slaTierVariant()` — maps SLA\_\_c value to a CSS class
  - `get slaExpiring()` — returns true if expiration is within 30 days
  - `get priorityVariant()` — maps CustomerPriority\_\_c to a CSS class

---

## Testing Requirements

Jest unit tests must cover:

- [ ] Component renders with valid Account data
- [ ] SLA expiration warning displays when date is within 30 days
- [ ] SLA expiration warning does not display when date is more than 30 days away
- [ ] Correct badge variant applied for each CustomerPriority\_\_c value
- [ ] Correct badge variant applied for each SLA\_\_c tier
- [ ] Active = No renders inactive badge
- [ ] Component handles wire error state gracefully (error message displayed)
- [ ] Component handles empty/null field values without crashing

---

## Acceptance Criteria

1. Component is deployable to a scratch org without errors
2. Component appears in App Builder under "Custom" and can be placed on the Account record page
3. All data fields render correctly when the component is placed on a real Account record
4. SLA expiration warning appears in red for accounts expiring within 30 days
5. All Jest tests pass (`npm run test:unit`)
6. No ESLint errors (`npm run lint`)
7. Code passes Prettier formatting check (`npm run prettier:verify`)
