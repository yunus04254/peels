import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";

import EntryForm from "src/components/custom/forms/EntryForm";
import EmojiSelect from "src/components/custom/EmojiSelect";


  function UpdateEntry(props) {
    const [dialogOpen, setDialogChange] = React.useState(false);
    const [entry, setEntry] = React.useState({});
    const [mood, setMood] = React.useState('🙂');

    React.useEffect(() => {
      if (props.entryClicked){
        setEntry(props.entryClicked);
        setDialogChange(true);
        setMood(props.entryClicked.mood);
      }
    },[props.entryClicked]);

  const onEntryCreate = () => {
    props.onEntryCreate();
    setDialogChange(false);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogChange}>
    <DialogContent className="min-h-[100%] sm:min-h-[30%]  min-w-[30%] max-h-[100%]">
      <DialogHeader>
        <div className="flex justify-between px-4">
          <div>
          <DialogTitle className="text-3xl">Update Entry!</DialogTitle>
          <DialogDescription className="mx-auto">
            Write your amazing thoughts here!
          </DialogDescription>
          </div>
          <EmojiSelect initial={mood} onChange={setMood}/>
        </div>
      </DialogHeader>        
      <EntryForm journalID={props.journalID} 
                  action="update" entry={entry} 
                  onEntryCreate={onEntryCreate}
                  mood={mood}/>
    </DialogContent>
    </Dialog>
  )
}

export default UpdateEntry

