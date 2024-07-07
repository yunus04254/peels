import {generateEntryRTF, generatePDF} from "src/lib/helpers-export";
import { saveAs } from 'file-saver';
import {toast} from "sonner";


// Export the corresponding entry into pdf
const handleExportEntryPdf = async (data) => {
    try {
        const pdf = await generatePDF(data.current);
        pdf.save("exported_entry.pdf");
        showToast("PDF");
    } catch (error) {
        console.error("Error exporting to PDF:", error);
    }
}

// Export the corresponding entry into rtf
const handleExportEntryRtf = async (data) => {
    try {
        const rtf = await generateEntryRTF(data);
        saveAs(rtf, 'exported_entry.rtf');
        showToast("RTF");
    } catch (error) {
        console.error("Error exporting to RTF:", error);
    }
}

function showToast(format) {
    toast.success("Export successful. ", {
        className: "text-white",
        description: "Your entry has been exported in the format of " + format + ". ",
        action: {
            label: "Okay",
            onClick: () => {},
        },
    });
}

export {
    handleExportEntryRtf, handleExportEntryPdf
}