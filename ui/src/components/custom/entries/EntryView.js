import * as React from "react"
import Zoom from 'react-medium-image-zoom'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from 'src/firebase-config';
import 'react-medium-image-zoom/dist/styles.css'
import 'src/styles/components/EntryView.css'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
} from "src/components/ui/card"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "src/components/ui/alert-dialog"

import 'src/styles/Carousel.css';
import Quill from 'src/components/ui/Quill';
import { Avatar, AvatarImage, AvatarFallback } from "src/components/ui/avatar";
import { ItemManager } from "src/components/custom/ItemManager"
import { Button } from "src/components/ui/button"
import { Trash } from "lucide-react"
import { useAuth } from "src/context/AuthContext"
import Bookmarker from "src/components/custom/Bookmarker"
import { Post } from "src/lib/api"
import { getTimeAgo } from "src/lib/helpers-date"

export function EntryView(props) {

	//Creator of the entry/journal
	const creator = props.entry.Journal.User;

	//Logged in user
	const { user } = useAuth();

	const isOwner = user.userID === creator.userID;

	//const journal = props.entry.Journal; -- Uncomment if journal needed
	const entry = props.entry;
	const target = React.useRef(null);
	const [delete_dialog, set_delete_dialog] = React.useState(false);

	const delete_entry = async () => {
		try {
			const response = await Post('entries/delete_entry', { id: entry.entryID }, null, { user: user });
			props.toggleRefresh();
			//try to remove image from firebase if it exists
			if (entry.image) {
				const app = initializeApp(firebaseConfig);
				const storage = getStorage(app);
				const storageRef = ref(storage, entry.path);
				await deleteObject(storageRef);
			}
			if (!response.ok) {
				console.log("Error deleting entry");
			} else {
				console.log("Entry Deleted");
			}
		} catch (error) {
			console.error('Error deleting entry:', error);
		}
	}

	const date_to_display = getTimeAgo(entry.date);
	const quill_id = "quill-" + entry.entryID;
	//check if mp4 string is in the image path
	const isVideo = entry.image && entry.image.includes(".mp4");

	//TODO : Load the avatar of the user
	return (
		<Card className="w-full h-full" ref={target}>
			<CardHeader>
				<div className="flex justify-between overflow-hidden justify-items-center items-center content-center justify-center">
					<h3 className="entry-title sm:text-lg md:text-2xl lg:text-3xl">{props.entry.title}</h3>
					<div className="flex flex-row flex-nowrap items-center gap-0">
						<p className="lg:text-4xl md:text-4xl sm:text-3xl text-2xl">{entry.mood}</p>
						{isOwner &&
							<ItemManager
								onEdit={props.click ? props.click : () => { }}
								onDelete={() => { set_delete_dialog(true) }}
								currentEntry={target}
								entryData={props.entry}
							/>}
					</div>
				</div>
				<CardDescription className="text-sm text-gray-500 italic inline-block p-0 mt-0">{date_to_display}</CardDescription>
			</CardHeader>
			<CardContent>
				<Quill
					readOnly={true}
					onChange={() => { }}
					contents={props.contentjson}
					className={" custom-quill overflow-hidden "}
					hideEnabled={true}
					id={quill_id}
				/>

				{!isVideo && props.entry.image &&  <div>
					<Zoom className="m-0">
						<img src={props.entry.image} alt="Doesn't load" className="entry-image"></img>
					</Zoom>
				</div>}
				{isVideo && 
					<video controls src={props.entry.image} className="entry-image">
						
					</video>}
          
          </CardContent>
          <CardFooter className={`flex ${isOwner? "flex-row-reverse" : "justify-between"}`}>
            {!isOwner &&
              <div className="flex flex-row items-center">
              <Avatar className="w-[50px] h-[50px]">
                <AvatarImage src={"/" + creator.favPfp} />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 ml-1">by - {creator.username}</span>
              {creator.favBadge && 
              <Zoom>
                <img src={creator.favBadge} className="w-[30px] h-[30px] ml-3"/>
              </Zoom>}
            </div>}
            <Bookmarker entry={entry} user={user}/>
       
          </CardFooter>
		  <AlertDialog open={delete_dialog} onOpenChange={set_delete_dialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Entry</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this entry? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button className="delete-entry-button" onClick={delete_entry}>  <Trash className="mr-2 h-4 w-4" />Delete</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);

}

export default EntryView;