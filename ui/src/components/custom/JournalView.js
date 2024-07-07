import { useRef, useState } from "react";

import ListEntries from "src/components/custom/entries/ListEntries";
import UpdateEntry from "src/components/custom/entries/UpdateEntry";
import JournalStats from "./JournalStats";
import NewEntryCarousel from "src/components/custom/entries/NewEntryCarousel";
import ExportPageSection from "./export/ExportPageSection";
import {useMediaQuery} from "@react-hook/media-query";
import { AreaChart } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "src/components/ui/sheet";
import { Button } from "src/components/ui/button";
import { useAuth } from "src/context/AuthContext";


function JournalView({journal}){

    const [entryCreate, setEntryCreate] = useState({});
    const [entryClicked, setEntryClicked] = useState(0);
    const [refresh, setRefresh] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 769px)");
    const { user } = useAuth();

    const journalViewRef = useRef(null);


    const isOwner = journal.UserUserID === user.userID;

    const handleEntryClick = (entry) => {
        setEntryClicked(entry);
        setRefresh(prev => !prev);
    };

    const handleEntryCreate = (entry) => {
        setEntryCreate(entry);
        toggleRefresh();
    };

    const toggleRefresh = () => {
        setRefresh(prev => !prev);
    };

    return (
        <>
            <div className="w-auto flex flex-col overflow-auto content" ref={journalViewRef}>
                <h1 className="text-center lg:text-[50px] md:text-[40px] text-[30px] title pt-5">{journal.title}</h1>
                {isOwner && <NewEntryCarousel onEntryCreate={handleEntryCreate} defaultJournalID={journal.journalID}/>}
                <UpdateEntry journalID={journal.journalID} entryClicked={entryClicked} refresh={refresh} onEntryCreate={handleEntryCreate}/>
                <ListEntries entryCreated={entryCreate}
                            journalID={journal.journalID}
                            onEntryClicked={handleEntryClick}
                            toggleRefresh={toggleRefresh}
                            refresh={refresh}/>
            </div>
            { isDesktop &&
                <div className="md:min-w-[35%] sm:min-w-[35%] lg:min-w-[25%] lg:max-w-[25%] sm:max-w-[25%] md:max-w-[25%] border-l-2 border-solid content flex flex-col gap-5">
                    <JournalStats refresh={refresh} journalID={journal.journalID}/>
                    <ExportPageSection
                        currentPage={journalViewRef}
                        currentJournal={journal}
                        journalID={journal.journalID}
                        journalTitle={journal.title}
                    />
                </div>
            }
            { !isDesktop &&
                <Sheet className="w-full">
                <SheetTrigger asChild>
                <Button variant="outline" className="absolute right-2 top-2 p-1 h-[36px] w-[36px]"><AreaChart className=""/></Button>
                </SheetTrigger>
                <SheetContent className="w-full ">
                    <div className="flex flex-col gap-5">
                        <JournalStats refresh={refresh} journalID={journal.journalID}/>
                        <ExportPageSection
                            currentPage={journalViewRef}
                            currentJournal={journal}
                            journalID={journal.journalID}
                            journalTitle={journal.title}
                        />
                    </div>
                </SheetContent>
                </Sheet>
            }

        </>
    );
}

export default JournalView;