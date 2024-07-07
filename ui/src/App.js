import './styles/App.css';
import React from 'react';
import Router from './components/custom/Router';
import { AuthProvider } from './context/AuthContext.js'; // Import AuthProvider
import { TemplateProvider } from './context/TemplateContext';
import { Toaster } from "./components/ui/sonner"
function App() {
  return (

    <AuthProvider>
        <Toaster richColors/>
            <TemplateProvider>
                <Router />
            </TemplateProvider>
    </AuthProvider>
  );
}

export default App;