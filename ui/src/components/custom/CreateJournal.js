// src/components/CreateJournal.js

import React, {useState, useEffect} from 'react';
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
import { Get, Post } from "src/lib/api";
import { useAuth } from '../../context/AuthContext';



function CreateJournal({ onAddJournal }) {
  const [open, setOpen] = React.useState(false)

  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [reminder, setReminder] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [userID, setUserID] = useState(0); 
  const { user } = useAuth();
  const [ownedThemes, setOwnedThemes] = useState([]);
  

  useEffect(() => {
    if (user) {
      setUserID(user.userID);
    }
  },[]);

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
      const response = await Post("journals", {title, theme, reminder, isPrivate}, null, {user: user});
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newJournal = await response.json();
      onAddJournal(newJournal);
      setTitle("");
      setTheme("");
      setReminder("");
      setIsPrivate(false);
    } catch (error) {
      console.error("Error posting new journal:", error);
      alert("Failed to create journal.");
    }

    setOpen(false);

  };

  const emptyJournalCardStyle = {
    width: '180px',
    height: '270px',
    margin: '10px',
    backgroundColor: '#f0f0f0',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    color: '#aaa',
    border: '2px dashed #ccc', 
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '5px',
    cursor: 'pointer',
    position: 'relative',
    marginLeft: '30px',
    transform: 'translateY(10px)'
  };

  const journalHoverStyle = {
    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)'
  };

  console.log("Rendering with themes:", ownedThemes);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          style={emptyJournalCardStyle}
          onClick={() => setOpen(true)}
          onMouseOver={(e) =>
            (e.currentTarget.style.boxShadow = journalHoverStyle.boxShadow)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.boxShadow = emptyJournalCardStyle.boxShadow)
          }
        >
          Create Journal
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a journal</DialogTitle>
            <DialogDescription>
              Choose your title and theme and start writing! You can buy new
              themes in the Banana Market!
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
              <div className="grid grid-cols-4 items-center gap-4" data-testid="theme-select-container">
                <Select onValueChange={setTheme} value={theme} required name="Select a theme">
                  <SelectTrigger className="w-[180px]">
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
              <div className="grid grid-cols-4 items-center gap-4" data-testid="reminder-select-container">
                <Select onValueChange={setReminder} value={reminder} required>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Set a reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Reminder Frequency</SelectLabel>
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
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateJournal;