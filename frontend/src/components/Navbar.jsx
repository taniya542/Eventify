import React, { useState } from "react";
import { Link } from "react-scroll";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Navbar = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate(); // Use navigate function

  const handleLogout = () => {
    // Clear user session or token if needed
    // Then navigate to the home or login page
    navigate("/"); // Redirect to home or login page after logout
  };

  return (
    <nav>
      <div className="logo">EVENTIFY</div>
      <div className={show ? "navLinks showmenu" : "navLinks"}>
        <div className="links">
          
          
          <Link to="about" spy={true} smooth={true} duration={500}>
            ABOUT
          </Link>
          <Link to="services" spy={true} smooth={true} duration={500}>
            EVENTS
          </Link>
          <Link to="contact" spy={true} smooth={true} duration={500}>
            CONTACT
          </Link  >
          <Link 
  to="#" 
  spy={true} 
  smooth={true} 
  duration={500} 
  onClick={handleLogout}
  className="nav-link" // Add any classes you need
>
  LOGOUT
</Link>
        </div>
      </div>
      <div className="hamburger" onClick={() => setShow(!show)}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default Navbar;
