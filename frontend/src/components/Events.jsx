import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import About from "./About";
import Booking from "./Booking";
import Contact from "./Contact";
import "./website.css";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Services from "./Services";

const Events = () => {
    const navigate = useNavigate();

    // In a real app, you would check authentication status here
    // For simplicity, we'll just show the events page

    return (
        <>
            <Navbar></Navbar>
            <About></About>
            <Services></Services>
            
            <Contact></Contact>
            <Footer></Footer>
        </>
    );
};

export default Events;