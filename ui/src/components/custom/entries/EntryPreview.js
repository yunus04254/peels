import {React} from 'react'
import { Separator } from "src/components/ui/separator"
import { ItemManager } from 'src/components/custom/ItemManager';
import { useMediaQuery } from "@react-hook/media-query";
const EntryPreview = (props) => {
    const handleSelectWrapper = () => {
        props.handleSelect(props.data);
    }

    var isDesktop = useMediaQuery("(min-width: 769px)");
    if (props.desktop){
        isDesktop = props.desktop;
    }
   if (isDesktop){
        return <button data-testid="entry-preview" onClick={handleSelectWrapper} className="flex flex-col p-1 h-40 w-full relative hover:-translate-y-0.5 transition ease-in-out hover:from-green-500 hover:to-yellow-500 shadow-lg hover:shadow-xl rounded-3xl bg-gradient-to-r from-green-400 to-pink-300 ">
            {props.data.UserUserID === props.user.userID &&
                 <div className="px-0.5 absolute bottom-36 left-[85%] w-10 z-10 h-5 bg-gray-300 rounded-xl ">
                 <ItemManager className="w-full h-full" onDelete={(e)=>{e.stopPropagation(); props.handleOnDelete(props.data.templateID)}} onEdit={(e)=>{e.stopPropagation();props.handleOnEdit(props.data)}} /> 
             </div>
            }
            <h2 className="flex flex-col grow w-full p-1 sm:p-2 py-3 px-3 text-white font-bold overflow-hidden text-middle text-sm sm:text-lg ">{props.data.name}</h2>
            <p className="flex grow flex-col w-full text-white overflow-hidden text-md text-middle h-[50%]">{props.data.description}</p>
        
       
        </button>
    } else {
        // show name only in the centre of button
        return <button data-testid="entry-preview" onClick={handleSelectWrapper} className="relative p-1 h-40 w-full hover:-translate-y-0.5 transition ease-in-out hover:from-green-500 hover:to-yellow-500 shadow-lg hover:shadow-xl rounded-3xl bg-gradient-to-r from-green-400 to-pink-300">
        {props.data.UserUserID === props.user.userID &&
                <div className="px-0.5 absolute bottom-36 left-[70%] w-10 z-10 h-5 bg-gray-300 rounded-xl ">
                    <ItemManager className="w-full h-full" onDelete={(e)=>{e.stopPropagation(); props.handleOnDelete(props.data.templateID)}} onEdit={(e)=>{e.stopPropagation();props.handleOnEdit(props.data)}} /> 
                </div>
            }
            <h2 className="align-middle w-full px-3 h-36 text-white font-bold text-lg overflow-hidden">{props.data.name}</h2>
            
            
        </button>
    }
    
}

export default EntryPreview