import {Get} from "src/lib/api";
import {getTimeAgo} from "src/lib/helpers-date";
import domtoimage from "dom-to-image";
import JsPDF from "jspdf";


const fetchEntriesForJournal = async (journalID, user) => {
    // Fetch the entries list of the corresponding journal

    try {
        const response = await Get(
            'entries/find_entries',
            {journalID: journalID},
            {user: user}
        );
        const data = await response.json();
        return data.map(entry => ({ ...entry, journalId: journalID }));
    } catch (error) {
        console.error(`Error fetching entries for journal ID ${journalID}:`, error);
        return [];
    }
};

const interpretContent = async (content) => {
    // Interpreter for the data content from the database, convert it into a string that
    // satisfying the syntax of RTF file

    let rtfText = ''; // Initialize RTF text

    // Process ops directly
    if (content && content.ops) {
        const ops = Array.isArray(content.ops) ? content.ops : [content.ops]; // Ensure ops is an array
        ops.forEach(op => {
            if (op.insert.includes('\n')) {
                // If the operation includes '\n', replace it with '\\par'
                rtfText += op.insert.replace(/\n/g, '\\par ');
            } else {
                // For other cases, simply append the text
                rtfText += `${op.insert}`;
            }
        });
    }

    return rtfText; // Trim any trailing whitespace and return RTF text
}

// Generate the RTF file of the whole page,
// by iteratively fetch the entry data in this journal
const generateJournalRTF = async (journalID, journalTitle, user) => {
    const entries = await fetchEntriesForJournal(journalID, user);

    // Add the journal data into the RTF content
    let rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033`;
    rtfContent += `\\b ${journalTitle}\\b0 \\line\\line`;

    for (const entry of entries) {
        const textContent = await interpretContent(JSON.parse(entry.content));
        const textTime = getTimeAgo(entry.date);

        rtfContent += `\\par \\b ${entry.title}\\b0`;
        rtfContent += `\\par ${textContent}\\line`;
        rtfContent += `\\par ${textTime}\\line\\line`;
    }

    rtfContent += `}`;

    return new Blob([rtfContent], {type: 'application/rtf'});
}

// Generate the RTF file of the corresponding entry
const generateEntryRTF = async (entry) => {
    // Add the journal data into the RTF content
    let rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033`;

    const textContent = await interpretContent(JSON.parse(entry.content));
    const textTime = getTimeAgo(entry.date);

    rtfContent += `\\par \\b ${entry.title}\\b0`;
    rtfContent += `\\par ${textContent}\\line`;
    rtfContent += `\\par ${textTime}\\line\\line`;

    rtfContent += `}`;

    return new Blob([rtfContent], {type: 'application/rtf'});
}

let generatePDF = async (currentContent) => {
    // Generate a PDF file for the current JournalView section.
    // Convert the html data into canvas then image, and add the image into
    // a PDF file at last.

    // Wait for 750 milliseconds to load the image
    await new Promise(resolve => setTimeout(resolve, 750));

    const scale = 2;
    const pageWidth = currentContent.offsetWidth * scale;
    const pageHeight = currentContent.scrollHeight * scale;

    // Convert HTML to an image using dom-to-image
    const imageData = await domtoimage.toPng(currentContent, {
        width: pageWidth,
        height: pageHeight,
        style: {
            transform: 'scale('+scale+')',
            transformOrigin: 'top left',
        }
    });

    // Create the PDF object
    const pdf = new JsPDF({
        unit: "mm",
        format: [pageWidth, pageHeight]
    });

    // Add the image data to the PDF
    pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight);

    return pdf;
}

export {generatePDF, generateJournalRTF, generateEntryRTF};