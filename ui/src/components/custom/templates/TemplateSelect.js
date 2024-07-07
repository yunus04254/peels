import { Get, Post } from 'src/lib/api';
import { useEffect, useState } from 'react';
import {
	Dialog
} from "src/components/ui/dialog";
import EntryPreview from "src/components/custom/entries/EntryPreview";
import { useAuth } from 'src/context/AuthContext';
import TemplateCreate from "src/components/custom/templates/TemplateCreate";
import { Link } from 'react-router-dom';
import "src/styles/components/HomeTemplateSelect.css";
import { Carousel, CarouselContent, CarouselItem } from "src/components/ui/carousel";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useMediaQuery } from "@react-hook/media-query";
import { useTemplate } from "src/context/TemplateContext";
/*
	TemplateSelect component is a generic component used to display a list of templates and allow the user to select one.
	There is a callback function that is called when a template is selected.
	The component uses the EntryPreview component to display each template.
	The component uses the TemplateCreate component to allow the user to create or edit a template.

	@param props.onTemplateClick - The callback function to call when a template is selected.
	@param props.grid - A boolean value to determine if the templates should be displayed in a grid.
	@param props.carousel - A boolean value to determine if the templates should be displayed in a carousel.

*/
const TemplateSelect = (props) => {

	const { user } = useAuth();
	const { templates, setTemplates, refreshTemplates, handleOnDelete } = useTemplate();
	const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
	const [currentTemplate, setCurrentTemplate] = useState(null);
	const [api, setApi] = useState(null);

	
	const nextPage = () => {
		api.scrollNext();
	}

	const prevPage = () => {
		api.scrollPrev();
	}


	const handleSelect = (local) => {
		var content = local.content;
		if (content == null){
			content = "{}";
		}
		var description = local.description;
		props.onTemplateClick(content, description);
	}

	/*
		handleOnEdit function is used to set the current template selected for editting
		and open the TemplateCreate dialog.

		@param data - The template object to edit.
	*/
	const handleOnEdit = (data) => {
		setCurrentTemplate(data);
		setCreateTemplateOpen(true)
	}

	/*
		setCreateTemplateOpenWrapper function is used to set the createTemplateOpen state and clear the
		selected template after we're finished editting it

		@param value - The value to set the createTemplateOpen state to open or close the dialog.
	*/

	const setCreateTemplateOpenWrapper = (value) => {
		setCreateTemplateOpen(value);
		if (!value) {
			setCurrentTemplate(null);
		}
		if (props.createTemplateOpenCallback){
			props.createTemplateOpenCallback(value);
		
		}
	}
	
	const arrowColor = '#A0522D';
	const arrowSize = '2rem';
	const isDesktop = useMediaQuery("(min-width: 769px)");
	var perSlide = isDesktop ? 2 : 2;
	var className = "";
	if (props.grid){
		className = "w-full"
	} else if (props.carousel){
		className = "home-template-section"
	}
	return <div className={className}>
		<h2 className="text-xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Select Template!</h2>
		<Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpenWrapper}>
			Or <Link className="underline" onClick={() => { 
				setCreateTemplateOpenWrapper(true) 
			}}>create</Link> a new one!
				
			<TemplateCreate callback={()=>{
				refreshTemplates(); 
				setCreateTemplateOpenWrapper(false); 

			}} 
			template={currentTemplate}/>
		</Dialog>
		{props.grid &&
		<div className="grid grid-cols-2 gap-7 p-4 overflow-y-auto max-h-[75vh] sm:max-h-[43vh]">
			{templates.map((template, index) => {
				return <EntryPreview key={index} data={template} handleSelect={handleSelect} handleOnEdit={handleOnEdit} handleOnDelete={handleOnDelete} user={user}/>

			})}

		</div>
		}
		{props.carousel &&
			<div className=" flex flex-row justify-between items-center">
			<IoIosArrowBack style={{ color: arrowColor, cursor: 'pointer', fontSize: arrowSize, userSelect: 'none' }} onClick={prevPage} />
			<Carousel data-testid="template-carousel" className="w-full" setApi={setApi} opts={{loop:true}}>
				<CarouselContent>
					{templates.map((template, index) => {
						if (index % perSlide !== 0) return;
						var current = templates.slice(index, index + perSlide);
						return <CarouselItem >
							<div className={"grid gap-4 p-4 max-h-full grid-cols-" + perSlide} key={template.templateID}>
								{current.map((template, index) => {
									return <EntryPreview key={index} data={template} handleSelect={handleSelect} handleOnEdit={handleOnEdit} handleOnDelete={handleOnDelete} user={user} />
								})}
	
							</div>
						</CarouselItem>
					})}
				</CarouselContent>
			</Carousel>
			<IoIosArrowForward style={{ color: arrowColor, cursor: 'pointer', fontSize: arrowSize, userSelect: 'none' }} onClick={nextPage} />
			</div>
		}

	</div>

}

export default TemplateSelect