// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Get, Post } from "src/lib/api";
import { useAuth } from "src/context/AuthContext";
const TemplateContext = createContext();

/*
	TemplateProvider is a context provider for the templates in the application.
	It provides a list of templates and functions to manipulate them.
	These include:
	- refreshTemplates: A function to fetch the templates from the server.
	- handleOnDelete: A function to delete a template using the id.
	- templates: A list of templates.

	@param children - The children components to render.

*/

export const TemplateProvider = ({ children }) => {
	const [templates, setTemplates] = useState([]);
	const { user } = useAuth();

	/*
		A function to fetch the templates from the server.
	*/

	const refreshTemplates = () => {
		Get("templates", null, { user: user }).then((response) => {
			if (response.ok) {
				response.json().then((data) => {
					console.log("Setting templates to ", data);
					setTemplates([...data]);
				})
			}
		})
	}

	/*
		A function to delete a template using the id.
		
		@param templateID - The id of the template to delete.
	
	*/

	const handleOnDelete = (templateID) => {
		Post("templates/delete", { id: templateID }, null, { user: user }).then((response) => {
			if (response.ok) {
				refreshTemplates();
			}
		})
	}

	useEffect(() => {
		if (user){
			refreshTemplates();
		}
		
	}, [user])

	return (
		<TemplateContext.Provider value={{ templates, setTemplates, refreshTemplates, handleOnDelete }}>
			{children}
		</TemplateContext.Provider>
	);

};

export const useTemplate = () => useContext(TemplateContext);
