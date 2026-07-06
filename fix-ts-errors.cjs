const fs = require('fs');
const path = require('path');

const applyFixes = () => {
  // src/components/layouts/header.tsx
  let file = 'src/components/layouts/header.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Search, /g, '').replace("import { Input } from '@/components/ui/input';\n", '');
  fs.writeFileSync(file, content);

  // src/components/plans/workload-bar.tsx
  file = 'src/components/plans/workload-bar.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const \[open, setOpen\] = useState\(false\);\n?/g, '');
  content = content.replace(/const \[catId, setCatId\] = useState<string>\(categories\[0\]\?\.id \?\? ""\);\n?/g, '');
  content = content.replace(/const \[saving, setSaving\] = useState\(false\);\n?/g, '');
  // for addReq, it's a function block. Just comment it out or delete it.
  content = content.replace(/const addReq = async \(\) => {[\s\S]*?};\n/g, '');
  fs.writeFileSync(file, content);

  // src/components/plans/workload-requirement-card.tsx
  file = 'src/components/plans/workload-requirement-card.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const pct = Math\.min\(100, \(assigned \/ requirement\.needed\) \* 100\);\n?/g, '');
  fs.writeFileSync(file, content);

  // src/components/workload/create-sheet-modal.tsx
  file = 'src/components/workload/create-sheet-modal.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/DialogHeader,\s*/g, '');
  fs.writeFileSync(file, content);

  // src/components/workload/sheets-list.tsx
  file = 'src/components/workload/sheets-list.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { Badge } from "@\/components\/ui\/badge";\n?/g, '');
  fs.writeFileSync(file, content);

  // src/components/workload/workload-details-modal.tsx
  file = 'src/components/workload/workload-details-modal.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/DialogHeader,\s*/g, '');
  content = content.replace(/<React\.Fragment/g, '<Fragment');
  content = content.replace(/<\/React\.Fragment/g, '</Fragment');
  if (!content.includes('import { Fragment')) {
     content = content.replace(/import { useState } from "react";/g, 'import { useState, Fragment } from "react";');
  }
  fs.writeFileSync(file, content);

  // src/features/categories/api/category.service.ts
  file = 'src/features/categories/api/category.service.ts';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { buildQuery } from '@\/types';\n?/g, '');
  fs.writeFileSync(file, content);

  // src/features/categories/components/category-item.tsx
  file = 'src/features/categories/components/category-item.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/, Ban, CheckCircle2 /g, ' ');
  fs.writeFileSync(file, content);

  // src/features/employees/api/employee.service.ts
  file = 'src/features/employees/api/employee.service.ts';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { apiClient } from '@\/lib\/api-client';\n?/g, '');
  fs.writeFileSync(file, content);

  // src/features/reports/api/report.service.ts
  file = 'src/features/reports/api/report.service.ts';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { z } from "zod";\n?/g, '');
  fs.writeFileSync(file, content);

  // src/features/schedule/components/schedule-grid.tsx
  file = 'src/features/schedule/components/schedule-grid.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import React, { useState } from "react";\n?/g, '');
  fs.writeFileSync(file, content);

  // src/features/schedule/components/schedule-modals.tsx
  file = 'src/features/schedule/components/schedule-modals.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import React, /g, 'import ');
  content = content.replace(/CheckCircle2, X /g, 'CheckCircle2 ');
  content = content.replace(/, SheetFooter /g, ' ');
  content = content.replace(/violations,\s*/g, '');
  fs.writeFileSync(file, content);

  // src/features/shifts/hooks/use-shifts.ts
  file = 'src/features/shifts/hooks/use-shifts.ts';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/onSuccess: \(res, { id }\) =>/g, 'onSuccess: (_, { id }) =>');
  content = content.replace(/onSuccess: \(res, { shiftId }\) =>/g, 'onSuccess: (_, { shiftId }) =>');
  fs.writeFileSync(file, content);

  // src/features/workload/hooks/use-workload.ts
  file = 'src/features/workload/hooks/use-workload.ts';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/type BulkCreateDemandInput,\s*/g, '');
  content = content.replace(/onSuccess: \(res, { planId }\) =>/g, 'onSuccess: (_, { planId }) =>');
  content = content.replace(/onSuccess: \(res, planId\) =>/g, 'onSuccess: (_, planId) =>');
  fs.writeFileSync(file, content);

  // src/lib/axios.ts
  file = 'src/lib/axios.ts';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/, type InternalAxiosRequestConfig /g, ' ');
  fs.writeFileSync(file, content);

  // src/lib/plan-data.ts
  file = 'src/lib/plan-data.ts';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\(cat, i\) => \(\{/g, '(cat) => ({');
  fs.writeFileSync(file, content);

  // src/pages/employees-page.tsx
  file = 'src/pages/employees-page.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { toast } from 'sonner';\n?/g, '');
  content = content.replace(/import { Plus, Search } from 'lucide-react';\n?/g, '');
  content = content.replace(/import { Card, CardContent } from '@\/components\/ui\/card';\n?/g, '');
  content = content.replace(/import { Button } from '@\/components\/ui\/button';\n?/g, '');
  content = content.replace(/import { Input } from '@\/components\/ui\/input';\n?/g, '');
  fs.writeFileSync(file, content);

  // src/pages/login.page.tsx
  file = 'src/pages/login.page.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/, type FormEvent /g, ' ');
  content = content.replace(/, dirtyFields /g, ' ');
  fs.writeFileSync(file, content);

  // src/pages/plan-details.page.tsx
  file = 'src/pages/plan-details.page.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/useMemo, /g, '');
  fs.writeFileSync(file, content);

  // src/pages/plans.page.tsx
  file = 'src/pages/plans.page.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/, Loader2 /g, ' ');
  fs.writeFileSync(file, content);

  // src/pages/reports.page.tsx
  file = 'src/pages/reports.page.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { useAuthStore } from "@\/stores\/auth.store";\n?/g, '');
  content = content.replace(/const token = document\.cookie\.split\('; '\)\.find\(row => row\.startsWith\('accessToken='\)\);\n?/g, '');
  fs.writeFileSync(file, content);

  // src/pages/schedule.page.tsx
  file = 'src/pages/schedule.page.tsx';
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import React, {/g, 'import {');
  content = content.replace(/, Plus, Mail/g, '');
  content = content.replace(/isLoading,\s*/g, '');
  fs.writeFileSync(file, content);

  console.log("Fixes applied successfully.");
};

applyFixes();
