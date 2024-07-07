import { useEffect, useState } from 'react';
import { Button } from "src/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "src/components/ui/dialog";

import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import Quill from 'src/components/ui/Quill';
import { Post } from "src/lib/api";
import { useAuth } from "src/context/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form"
/*
    TemplateCreate component is used to create a new template or edit an existing template.
    It uses the Quill component to create a rich text editor for the template content.
    The component uses the useForm hook from react-hook-form to handle form validation and submission.
    The component uses the Post function from src/lib/api to send a POST request to the server to create or update a template.

    @param props.template - The template object to edit. If null, a new template will be created.
    @param props.callback - A callback function to call after the template is created or updated.

*/
const TemplateCreate = (props) => {
    const [content, setContent] = useState(null);
    
    const { register, handleSubmit, setValue, formState:{errors, ...formState} } = useForm();
    
    const { user } = useAuth();
    /*
        useEffect hook is used to set the title, description and content of the template if the template prop is provided.
    */
    useEffect(() => {
        if (props.template) {
            console.log(props.template);
            setValue("title", props.template.name)
            setValue("description", props.template.description)
            setContent(JSON.parse(props.template.content));
        } else {
            setValue("title", "")
            setValue("description", "")
            setContent(null);
        }
    }, [props.template])
    
    /*
        saveQuill function is used to send a POST request to the server to create or update a template.
    */

    const saveQuill = (title, description) => {
        const newContent = JSON.stringify(content);
        if (props.template){
            Post("templates/update", {id: props.template.templateID, name: title, description: description, content: newContent}, null, {user: user}).then((response) => {
                if (response.ok){
                    toast.success("Template update!");
                    props.callback()
                } else {
                    response.text().then((data) => {
                        toast.error("Template update failed!", {description: data});
                    })
                    
                    
                }
            })
        } else {
            Post("templates/create", {name: title, description: description, content: newContent}, null, {user: user}).then((response) => {
                if (response.ok){
                    toast.success("Template created!");
                    props.callback()
                } else {
                    response.text().then((data) => {
                        toast.error("Template update failed!", {description: data});
                    })
                }
                
            })
        }
    }

    const setContentJSON = (props) => {
        setContent(props);
    }
    const onSubmit = (data) => saveQuill(data.title, data.description)
    return <DialogContent className="sm:min-h-[40%] min-h-full">
                <DialogHeader>
                    <DialogTitle>Create a new template</DialogTitle>
                    <DialogDescription>
                        Create a new template to use for your journal entries
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" data-testid="template-form">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-left">Title</Label>
                        {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
                        <Input data-testid="template-title-box" {...register("title", {
                            required: "Title is required",
                            maxLength: {value: 18, message: "Title must not be more than 18 characters"},
                            minLength: {value: 3, message: "Title must be at least 3 characters"}
                        })}/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-left">Description</Label>
                        {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
                        <Input data-testid="template-desc-box" {...register("description", {
                            maxLength: {value: 70, message: "Description must be under 70 characters"}
                        })}/>
                    </div>
                    <div className="grid gap-2">
                        <Quill onChange={setContentJSON} contents={content} />
                    </div>
                    <div className="grid gap-2">
                        <Button type="submit">Save changes</Button>
                    </div>
                </form>
                
                
            </DialogContent>
    
    
}

export default TemplateCreate