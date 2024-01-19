import { useLocation } from "react-router-dom";
import treehouseLogo from "../images/Treehouse-Logo-New.svg";

const Footer = () => {
  const { pathname } = useLocation();

  if (pathname === "/login") return <></>;

  return (
    <div className='d-flex position-fixed bottom-0 w-100 z-n1'>
      <div className='text-white text-center p-3'>
        <p className='m-0'></p>
      </div>
      <img
        src={treehouseLogo}
        alt='Treehouse Logo'
        className='d-inline-block align-text-top ms-auto p-3'
        style={{ height: 128 }}
      />
    </div>
  );
};

export default Footer;
