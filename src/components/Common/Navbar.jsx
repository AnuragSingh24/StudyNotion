import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";

import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../services/apiConnector";
import { categories } from "../../services/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../core/Auth/ProfileDropdown";

function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navDropdown, setNavDropdown] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false);
    })();
  }, []);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div className={`flex flex-col border-b-[1px] border-b-richblack-700 ${location.pathname !== "/" ? "bg-richblack-800" : ""} transition-all duration-200`}>
      <div className="flex h-14 items-center justify-between w-11/12 max-w-maxContent mx-auto">
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        <nav className="hidden md:flex gap-x-6 text-richblack-25">
          {NavbarLinks.map((link, index) => (
            <li key={index} className="list-none">
              {link.title === "Catalog" ? (
                <div className={`group relative flex cursor-pointer items-center gap-1 ${matchRoute("/catalog/:catalogName") ? "text-yellow-25" : "text-richblack-25"}`}>
                  <p>{link.title}</p>
                  <BsChevronDown />
                  <div className="auto-w-max invisible absolute left-1/2 top-[50%] z-[1000] translate-x-[-50%] translate-y-[3em] rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100">
                    <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                    {subLinks.length ? (
                      subLinks.map((subLink, i) => (
                        <Link
                          to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                          className="block whitespace-nowrap rounded-lg px-4 py-2 hover:bg-richblack-50"
                          key={i}
                        >
                          {subLink.name}
                        </Link>
                      ))
                    ) : (
                      <p className="text-center">No Courses Found</p>
                    )}
                  </div>
                </div>
              ) : (
                <Link to={link?.path} className={`${matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>
                  {link.title}
                </Link>
              )}
            </li>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-x-4">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-richblack-600 text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null ? (
            <>
              <Link to="/login">
                <button className="border border-richblack-700 bg-richblack-800 px-3 py-2 text-xs text-richblack-100 rounded">Log in</button>
              </Link>
              <Link to="/signup">
                <button className="border border-richblack-700 bg-richblack-800 px-3 py-2 text-xs text-richblack-100 rounded">Sign up</button>
              </Link>
            </>
          ) : (
            <ProfileDropdown />
          )}
        </div>

        <button className="md:hidden" onClick={() => setNavDropdown(!navDropdown)}>
          <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {navDropdown && (
        <div className="md:hidden flex flex-col px-6 pb-4 gap-3 bg-richblack-800 text-richblack-100">
          {NavbarLinks.map((link, index) => (
            <div key={index}>
              {link.title === "Catalog" ? (
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between">Catalog <BsChevronDown /></summary>
                  <ul className="pl-4 mt-2">
                    {subLinks.map((subLink, i) => (
                      <li key={i}>
                        <Link to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}>
                          {subLink.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link to={link?.path}>{link.title}</Link>
              )}
            </div>
          ))}

          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="flex items-center gap-2">
              <AiOutlineShoppingCart />
              Cart ({totalItems})
            </Link>
          )}

          {token === null ? (
            <>
              <Link to="/login">
                <button className="mt-2 border border-richblack-700 bg-richblack-800 px-3 py-2 text-sm text-white rounded">Log in</button>
              </Link>
              <Link to="/signup">
                <button className="border border-richblack-700 bg-richblack-800 px-3 py-2 text-sm text-white rounded">Sign up</button>
              </Link>
            </>
          ) : (
            <ProfileDropdown />
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
