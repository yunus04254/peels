import * as React from "react";
import { useState } from "react";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import Quill from '../../ui/Quill';
import { Button } from "src/components/ui/button";
import { cn } from "src/lib/utils";
import "src/styles/components/EntryForm.css";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import firebaseConfig from 'src/firebase-config';
import UploadImageButton from "src/components/custom/UploadImage";
import { Loader2 } from "lucide-react"
import { toast } from "sonner";
import { Post } from "src/lib/api";
import { useMediaQuery } from "@react-hook/media-query";
import { useBanana } from 'src/context/BananaContext';
import { useAuth } from "src/context/AuthContext";

function EntryForm(props) {
	const { updateBananas, bananas } = useBanana();
	const [title, setTitle] = useState('');
	const [quillContent, setQuillContent] = useState(null);
	const [imageData, setImageData] = useState({});
	const [oldImagePath, setOldImagePath] = useState("");
	const [mood, setMood] = useState('🙂');
	const isDesktop = useMediaQuery("(min-width: 1300px)");
	const [titleError, setTitleError] = useState("");
	const [premium, setPremium] = useState(false);
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();
	const app = initializeApp(firebaseConfig);
	const storage = getStorage(app);
	const hash = require('object-hash');
	const randomstring = require('randomstring');

	React.useEffect(() => {
		if (props.action === "update") {
			setTitle(props.entry.title);
			setQuillContent(JSON.parse(props.entry.content));
			setOldImagePath(props.entry.path);
		} else if (props.action === "create") {
			setQuillContent(props.template);
		}
	}, [props.entry, props.action, props.template, props.journalID]);

	React.useEffect(() => {
		if (props.mood) {
			setMood(props.mood);
		}
	}, [props.mood]);


	function handleTitleChange(event) {
		setTitle(event.target.value);
	}

	async function handleFileSelect(file) {
		if (!file) {
			return;
		}
		setPremium(false);
		const canAfford = user.bananas >= 50;
		if ((file.size / (1024 * 1024) > 1 && !canAfford) || (file.size / (1024 * 1024) > 10 && canAfford)){
			toast.error("Error", {
				variant: "destructive",
				className: "text-white",
				description: `File size is too large, please choose a smaller file less than ${canAfford? "5" : "1"}MB.`,
			});
			return;
		}
		const fileNameParts = file.name.split('.');
		const fileType = fileNameParts[fileNameParts.length - 1];
		var allowedTypes = ['jpeg', 'jpg', 'png', 'webp'];
		if (canAfford){
			allowedTypes.push('gif');
			allowedTypes.push('mp4'); 
		}
		if (!allowedTypes.includes(fileType)) {
			toast.error("Error", {
				variant: "destructive",
				className: "text-white",
				description: `Unsupported file type. Please choose an image file (JPEG, JPG, PNG,${canAfford? " MP4, GIF" : ""} or WEBP).`,
			});
			return;
		}
		if (fileType === 'mp4' || fileType === 'gif' || (file.size / (1024 * 1024)>1) ) {
			setPremium(true);
		}
		setImageData({file: file, fileType: fileType, name: file.name});
	}

	function setContentJSON(content) {
		setQuillContent(content);
	}

	function validateForm() {
		if (title === "") {
			setTitleError("Title is required");
			setLoading(false); 
			return false;
		}
		setTitleError("");
		return true;
	}

	const buyEntry = async () => {
		const response = await Post('users/updateBananas', {bananas: -50}, null, { user: user });
		if (!response.ok) {
			throw new Error('Failed to update user bananas');
		}
	}

	const printSuccessToast = (xp, bananas) => {
		toast.success(props.action === "create"? `Entry Created +${xp}XP` : `Entry Updated +${xp}XP`, {
			className: "background-white",
			description: premium? "You have spent 50 bananas!" : `Keep up the good work!${bananas? " +" + bananas + " Bananas!":""}`,
			action: {
				label: "Okay!",
				onClick: () => { },
			},
		})
	}

	const handleSuccess = async (data) => {
		if (premium) {
			await buyEntry();
		}
		var bananasToAdd = 0;
		if (props.action === "create") {
			bananasToAdd = 1 + Math.round(0.2 * user.level);
			const response = await Post('users/updateBananas', {bananas:bananasToAdd }, null, { user: user });
			if (!response.ok) {
				throw new Error('Failed to update user bananas');
			}
		}
		printSuccessToast(data.xp, bananasToAdd);
		updateBananas();
	}


	async function saveQuill(e) {
		setLoading(true);
		e.preventDefault();
		if (!validateForm()) {
			return;
		}

		//save this content string to the database
		var quillStringToSave = JSON.stringify(quillContent);
		var entryData = {
			title: title,
			content: quillStringToSave,
			mood: mood,
			isDraft: false,
			uid: user.uid,
		}

		const createEntry = async (entryData) => {
			try {
				const { file, fileType, name } = imageData;
				if (file) {
					const randomString = randomstring.generate({length: 15, charset: 'alphanumeric'});
					const newPath = `users/${user.username}/entries/media/${randomString}/${hash(file)}.${fileType}`;
					const storageRef = ref(storage, newPath);
					const snapshot = await uploadBytes(storageRef, file);
					const downloadURL = await getDownloadURL(storageRef);
					entryData.image = downloadURL;
					entryData.path = newPath; 
				}
				entryData.date = new Date().toISOString();
				entryData.JournalJournalID = props.journalID;
				const response = await Post('entries/create_entry', entryData, null, { user: user });
				const data = await response.json();
				if (!response.ok) {
					throw new Error('Response was not ok');
				}
				await handleSuccess(data);

			} catch (error) {
				console.error('Error creating entry:', error);
				setImageData({});
				toast.error("Error", {
					variant: "destructive",
					className: "text-white",
					description: "Failed to create entry...",
				})
			}
		};

		const updateEntry = async (entryData) => {
			try {
				const { file, fileType, name } = imageData;
				var np ="";
				var img_url = "";
				//has a file been chosen by the user? 
				if (file) {
					//upload the new image to firebase storage
					const randomString = randomstring.generate({length: 15, charset: 'alphanumeric'});
					const newPath = `users/${user.username}/entries/media/${randomString}/${hash(file)}.${fileType}`;
					const storageRef = ref(storage, newPath);
					const snapshot = await uploadBytes(storageRef, file);
					const downloadURL = await getDownloadURL(storageRef);
					entryData.image = downloadURL;
					entryData.path = newPath; 
					np = newPath;
					img_url = downloadURL;

					//delete the old image from firebase storage if there is one 
					if (oldImagePath) {
						const oldPath = oldImagePath;	
						const oldStorageRef = ref(storage, oldPath);
						await deleteObject(oldStorageRef);
					}
				}

				//update entry in the database with all data 
				const response = await Post('entries/update_entry', {
					title: title,
					content: quillStringToSave,
					mood: mood,
					isDraft: false,
					uid: user.uid,
					date: props.entry.date,
					JournalJournalID: props.journalID,
					path: np? np : props.entry.path,
					image: img_url? img_url : props.entry.image,
				}, { id: props.entry.entryID }, { user: user });

				if (!response.ok) {
					throw new Error('Failed to update entry');
				}
				const data = await response.json();
				await handleSuccess(data);
			} catch (error) {
				console.error('Error updating entry:', error);
				toast.error("Error", {
					variant: "destructive",
					className: "text-white",
					description: "Failed to update entry...",
				})
			}
		};

		if (props.action === "create") {
			await createEntry(entryData);
		} else if (props.action === "update") {
			await updateEntry(entryData, props.entry.entryID);
		}
		setLoading(false);
		setPremium(false);
		if (props.onEntryCreate) {
			props.onEntryCreate({});
		}

	}

	var quill_vh = "40vh";
	if (!isDesktop) {
		quill_vh = "30vh";
	}

	return (

		<form className={cn("grid items-start gap-4 px-4")}>
			<div className="grid gap-2">
				<Label htmlFor="title" className="text-left">Title</Label>
				<Input type="title" id="title" value={title} onChange={handleTitleChange} data-testid="title" />
				{titleError && <div className="text-red-500">{titleError}</div>}
			</div>
			<div className="grid gap-2">
				<Quill onChange={setContentJSON}
					contents={quillContent}
					style={`.entry-form-quill .ql-editor {max-height:${quill_vh};}`}
					id="entry-form-quill"
				/>
			</div>
			<div className="text-md text-gray-500">
				<p>{!premium && "Spend 50 bananas to upload your favourite videos and gifs!"}</p>
				<p>{premium && "You are about to spend 50 bananas"}</p>
				<p>{imageData.name ? "Image Selected: " + imageData.name : "No Image Selected"}</p>
			</div>
			<div className="grid gap-2">
				<div className="flex flex-row justify-between">
					<UploadImageButton onFileSelect={handleFileSelect} className="mr-1 border" />
					{loading && <Button type="submit" className="flex" disabled>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Save changes
					</Button>}
					{!loading && <Button type="submit" className="flex" onClick={saveQuill}>Save changes</Button>}
				</div>
			</div>
		</form>
	)
}

export default EntryForm;