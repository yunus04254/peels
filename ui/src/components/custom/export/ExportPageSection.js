import React from 'react';

import {
    Card,
    CardTitle,
    CardContent,
    CardDescription,
    CardHeader,
} from "src/components/ui/card"

import ExportPageButton from "./ExportPageButton";

// A section includes a button that could export the current
// journal view page into the corresponding formats
function ExportPageSection(props){
    return (
        <Card className="rounded-3xl border-4 shadow-lg">
            <CardHeader>
                <CardTitle>
                    Export Page
                </CardTitle>
                <CardDescription className="italic">
                    Export your page into PDF or RTF files.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ExportPageButton
                    currentPage={props.currentPage}
                    currentJournal={props.currentJournal}
                    journalID={props.journalID}
                    journalTitle={props.journalTitle}
                />
            </CardContent>
        </Card>
    )
}

export default ExportPageSection;