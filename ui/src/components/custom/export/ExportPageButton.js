import React from "react";
import { Button } from "src/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";

import { saveAs } from 'file-saver';

import { generatePDF, generateJournalRTF } from "src/lib/helpers-export";
import { useAuth } from "src/context/AuthContext";
import {toast} from "sonner";

// The component that export the journal page into the selected format, i.e., PDF or RTF
function ExportPageButton(props) {
    const [open, setOpen] = React.useState(false)
    const user = useAuth().user;

    const currentJournalID = props.journalID;
    const currentJournalTitle = props.journalTitle;

    // Generate the PDF file of the current journal page and download it
    const handleExportPDF = async () => {
        try {
            const currentPage = props.currentPage.current;
            const pdf = await generatePDF(currentPage);
            pdf.save("exported_document.pdf");
            showToast("PDF");
        } catch (error) {
            console.error("Error exporting to PDF:", error);
        }
    }

    // Generate the RTF file of the current journal page and download it
    const handleExportRTF = async () => {
        try {
            const rtf = await generateJournalRTF(currentJournalID, currentJournalTitle, user);
            saveAs(rtf, 'exported_document.rtf');
            showToast("RTF");
        } catch (error) {
            console.error("Error exporting to RTF:", error);
        }
    }

    // Show a toast to tell the user if the export is successful
    function showToast(format) {
        toast.success("Export successful. ", {
            className: "text-white",
            description: "Your journal page has been exported in the format of " + format + ". ",
            action: {
                label: "Okay",
                onClick: () => {},
            },
        });
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button id="export-button" aria-label="export-button" onClick={()=>{setOpen(true)}}>Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" id="export-list" aria-label="export-list" className="bg-white w-56">
                <DropdownMenuLabel>Select a format to export</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="export-pdf" aria-label="export-pdf" onClick={() => handleExportPDF()}>
                    PDF
                </DropdownMenuItem>
                <DropdownMenuItem id="export-rtf" aria-label="export-rtf" onClick={() => handleExportRTF()}>
                    RTF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ExportPageButton;
