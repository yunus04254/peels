import { useState, useEffect } from 'react';
import { Carousel, CarouselItem, CarouselContent } from "src/components/ui/carousel";
import {
	Dialog,
	DialogContent, DialogTrigger
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import TemplateSelect from "src/components/custom/templates/TemplateSelect";
import JournalSelect from 'src/components/custom/JournalSelect';
import EntryForm from 'src/components/custom/forms/EntryForm';
import { IoIosArrowBack } from 'react-icons/io';
import EmojiSelect from "src/components/custom/EmojiSelect";
/*
	`NewEntryCarousel` component is a carousel enclosed in a dialog component used to guide
	the user into creating a new journal entry

	It contains a carousel with three pages:
		1. TemplateSelect - A page to select a template for the journal entry (can be skipped if a default template is provided)
		2. JournalSelect - A page to select a journal for the journal entry (can be skipped if a default journal is provided)
		3. EntryForm - A page to create the journal entry

	@param props.defaultJournalID - The default journal ID to use for the journal entry
	@param props.defaultContent - The default content to use for the journal entry (template)
	@param props.onEntryCreate - The callback function to call when the journal entry is created
	@param props.setSelectedTemplate - The callback function to update the current selected template after finished with it
	@param props.disableTrigger - A boolean to disable the trigger button for the dialog

*/
const NewEntryCarousel = (props) => {
	const [currentJournalId, setCurrentJournalId] = useState(0);
	const [currentContent, setContent] = useState("{}");
	const [api, setApi] = useState(null);
	const [mood, setMood] = useState('🙂');
	const [current, setCurrent] = useState(0)
  	const [count, setCount] = useState(0)
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		if (props.defaultJournalID) {
			setCurrentJournalId(props.defaultJournalID);
		}
	}, [props.defaultJournalID]);

	useEffect(() => {
		if (props.defaultContent) {
			setContent(JSON.parse(props.defaultContent));
			setDialogOpenWrapper(true);
		}
	}, [props.defaultContent]);

	useEffect(() => {
		if (!api){
			return;
		}
		if (props.defaultContent) {
			nextPage();
		}
		setCount(api.scrollSnapList().length)
		setCurrent(api.selectedScrollSnap() + 1)
	
		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1)
		})
	}, [api]); 

	const nextPage = () => {
		api.scrollNext();
	}

	const prevPage = () => {
		if (current === 2) {
			setContent("{}");
		}
		api.scrollPrev();
		
	}

	const onJournalClick = (journalID) => {
		setCurrentJournalId(journalID);
		nextPage();
	}

	const onTemplateClick = (content) => {
		setContent(JSON.parse(content));
		nextPage();
	}

	const onEntryCreate = () => {
		setDialogOpenWrapper(false);
		if (props.onEntryCreate){
			props.onEntryCreate();
		}

	}

	const setDialogOpenWrapper = (value) => {
		setDialogOpen(value);
		if (!value) {
			setContent("{}");
			//setCurrentJournalId(0);
			if (props.setSelectedTemplate)
				props.setSelectedTemplate(null)
		}
	}

	return <Dialog className="w-full h-full" open={dialogOpen} onOpenChange={setDialogOpenWrapper}>
		{!props.disableTrigger &&
			<DialogTrigger asChild>
				<Button className="entry-button w-full">
				<span>New entry</span>
				</Button>
			</DialogTrigger>
		}
		<DialogContent className="min-h-[100%] sm:min-h-[50%] min-w-[30%] max-h-[100%]" >
			<div className="min-w-0">
			<Carousel setApi={setApi} opts={{ watchDrag: false }}>
				<IoIosArrowBack data-testid="back-arrow" style={{ color: '#A0522D', cursor: 'pointer', fontSize: '2rem', userSelect: 'none' }} onClick={prevPage} />
				<br />

					<CarouselContent>
						<CarouselItem>
							<TemplateSelect grid={true} nextPage={nextPage} prevPage={prevPage} onTemplateClick={onTemplateClick}/>
						</CarouselItem>
						{!props.defaultJournalID &&
							<CarouselItem>
								<JournalSelect nextPage={nextPage} prevPage={prevPage} onJournalClick={onJournalClick} setDialogOpen={setDialogOpenWrapper} />
							</CarouselItem>
						}

						<CarouselItem>
							<div className="flex flex-col gap-6">
								<div className="flex flex-row justify-between ml-4 mr-4">
									<div>
										<h2 className="text-2xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Create Entry</h2>
										<h1 style={{ fontFamily: 'Arial, sans-serif' }}>Write your amazing thoughts here!</h1>
									</div>
									<EmojiSelect onChange={setMood} />
								</div>

								<EntryForm className="w-full h-full" nextPage={nextPage} prevPage={prevPage}
									journalID={currentJournalId}
									template={currentContent}
									action="create"
									onEntryCreate={onEntryCreate}
									mood={mood}
								/>
							</div>

						</CarouselItem>


					</CarouselContent>


			</Carousel>
		</div>

		</DialogContent>

	</Dialog>


}

export default NewEntryCarousel;
