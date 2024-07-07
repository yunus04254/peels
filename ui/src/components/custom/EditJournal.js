// src/components/EditJournal.js

import React, {useState} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Button } from "src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { Switch } from "src/components/ui/switch";
import { Pencil2Icon} from "@radix-ui/react-icons";
import { Put } from "src/lib/api";
import { useAuth } from "src/context/AuthContext";
import { Get } from "src/lib/api";


function EditJournal({journal, onUpdateJournal}) {
  const [open, setOpen] = React.useState(false)
  const { user } = useAuth();
  const [title, setTitle] = useState(journal.title);
  const [theme, setTheme] = useState(journal.theme);
  const [reminder, setReminder] = useState(journal.reminder);
  const [isPrivate, setIsPrivate] = useState(journal.isPrivate);



  const [ownedThemes, setOwnedThemes] = useState([]);
  

  function getItems() {

    Get("style/owned", null, { user: user }).then((res) => res.json()).then((data) => {
        setOwnedThemes(data);
    });
  }

    React.useEffect(() => {
        getItems();
    }, [user]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !theme || !reminder) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await Put(`journals/${journal.journalID}`, {
        title,
        theme,
        reminder,
        isPrivate,
      }, null, { user: user });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedJournal = await response.json();
      onUpdateJournal(updatedJournal);
    } catch (error) {
      console.error("Error updating journal:", error);
      alert("Failed to update journal.");
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Edit" variant="translucent" size="icon" data-testid="edit-journal-trigger">
          <Pencil2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit your journal</DialogTitle>
            <DialogDescription>
              Choose your title and theme and start writing!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Journal Title:
              </Label>
              
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Gym"
                required
              />
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Select onValueChange={setTheme} value={theme} required>
                  <SelectTrigger data-testid="theme-selection" className="w-[180px]">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Your Themes</SelectLabel>
                      {ownedThemes.map((theme) => (
                        <SelectItem key={theme.name} value={theme.description}>
                          {theme.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Theme 1">Ocean Blue</SelectItem>
                      <SelectItem value="Theme 2">Bubblegum Pink</SelectItem>
                      <SelectItem value="Theme 3">Sunshine Yellow</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Select onValueChange={setReminder} value={reminder} required>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Set a reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Reminder Frequencys</SelectLabel>
                      <SelectItem value="Reminder 1">Every day</SelectItem>
                      <SelectItem value="Reminder 2">Every 3 days</SelectItem>
                      <SelectItem value="Reminder 3">Every week</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="journal-privacy">Private</Label>
              <Switch
                id="journal-privacy"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditJournal;

