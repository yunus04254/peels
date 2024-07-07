import * as React from "react"
import { MoreHorizontal,Trash,Pencil,FileDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import {
  handleExportEntryPdf,
  handleExportEntryRtf
} from "src/components/custom/export/ExportEntryButton";


export function ItemManager(props) {
  const [open, setOpen] = React.useState(false)
  const variant = props.variant? props.variant : "ghost";

  const is_exportable=!!props.currentEntry; // template cannot be exported
  return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <a aria-label="itemmanager" variant={variant} size="sm" className="px-2 cursor-pointer" onClick={()=>{setOpen(true)}}>
            <MoreHorizontal className={props.className? props.className : "h-full w-full text-black"}/>
          </a>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer bg-white">
              <div onClick={props.onEdit} aria-label="itemmanager-edit" className="flex w-full">
                <Pencil className="mr-2 h-4 w-4"/>
                Edit
              </div>
            </DropdownMenuItem>
            {is_exportable?
                <div>
                  <DropdownMenuItem className="cursor-pointer bg-white">
                    <div onClick={() => handleExportEntryPdf(props.currentEntry)}  aria-label="itemmanager-export-pdf" className="flex">
                      <FileDown className="mr-2 h-4 w-4"/>
                      Export PDF
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer bg-white">
                    <div onClick={() => handleExportEntryRtf(props.entryData)}  aria-label="itemmanager-export-rtf" className="flex">
                      <FileDown className="mr-2 h-4 w-4"/>
                      Export RTF
                    </div>
                  </DropdownMenuItem>
                </div>
                :
                <div/>
            }
            <DropdownMenuItem className="text-red-600 cursor-pointer bg-white">
              <div onClick={props.onDelete}  aria-label="itemmanager-delete" className="flex w-full">
                <Trash className="mr-2 h-4 w-4"/>
                Delete
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}

